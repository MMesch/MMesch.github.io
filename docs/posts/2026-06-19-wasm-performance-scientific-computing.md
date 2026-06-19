---
title: "Understanding WebAssembly Performance for Scientific Computing"
labels:
  - webassembly
  - performance
  - scientific-computing
  - pyodide
  - emscripten-forge
  - python
description: |
    An analysis of the compilation pipeline, design constraints, and benchmark data shaping WebAssembly performance for scientific Python — covering Pyodide, emscripten-forge, and the Wasm feature proposals that affect numerical workloads.
---

No systematic, regularly published benchmarks compare Pyodide or emscripten-forge performance against native for scientific workloads seems to exist. What does exist is scattered across GitHub issues, Wasm specification proposals, and release notes. This post gathers those data points and contextualizes them with the architectural constraints of running numerical code inside a browser sandbox. 

While the focus is Python (Pyodide and emscripten-forge), the same underlying Wasm engine and compilation pipeline applies to other scientific computing projects such as [webR](https://docs.r-wasm.org/webr/latest/) (R in the browser), [xeus-cpp](https://github.com/jupyter-xeus/xeus-cpp) (C++ Jupyter kernel for JupyterLite), and [Observable](https://observablehq.com/) (JavaScript-based reactive notebooks that interoperate with Wasm modules).

*A note on provenance: this post was researched by compiling secondary sources — specification documents, GitHub issues, blog posts, and release notes — with the help of AI-assisted analysis. I am not directly involved in WebAssembly or Pyodide development; this is an effort to understand the performance landscape from the outside and gather what's publicly known in one place. Corrections and additions are welcome.*

## How WebAssembly Executes Code: The Compilation Pipeline

To understand where performance is lost, it helps to trace the path from source to execution.

**Native CPython** involves two distinct compilation stages. First, CPython's C source is compiled by GCC or Clang directly to x86-64 machine code (`-O3 -march=native`) — this produces the CPython interpreter binary. Second, when a user runs a Python script, that binary reads the Python source and compiles it to *Python bytecode* — a sequence of instructions for CPython's virtual machine. The interpreter then executes those bytecode instructions sequentially, one after the other, in a dispatch loop. Numerical libraries like NumPy and SciPy are compiled C/Fortran extensions producing native machine code in the first stage.

Python bytecode consists of *opcodes* (operation codes): compact numeric identifiers like `LOAD_FAST` (push a local variable onto the stack), `BINARY_ADD` (pop two values, add them, push the result), or `CALL_FUNCTION` (call a function with arguments from the stack). A line like `x = a + b` might compile to four bytecode instructions: load `a`, load `b`, add, store to `x`. The CPython virtual machine is *stack-based*: operands are pushed onto and popped from a value stack, as opposed to a *register-based* VM (like Lua's or Dalvik's) where instructions name virtual registers directly. Stack-based VMs produce more compact bytecode but execute more instructions per operation, since every value must be explicitly pushed and popped. The CPython interpreter reads these opcodes one by one in a loop — a `while` loop that fetches the next opcode, dispatches to the C code that implements it, then fetches the next — and runs the corresponding C code for each. CPython also applies some bytecode-level optimizations during compilation: peephole optimization (removing redundant loads/stores), constant folding (evaluating `2 + 3` at compile time), and in Python 3.11+, adaptive specialization where frequently-executed opcodes self-modify to use type-specific fast paths.

**Wasm CPython** adds a third stage between the first two: CPython's C source is compiled by Emscripten (Clang targeting Wasm) to Wasm bytecode, and then at page load the browser's Wasm engine compiles that Wasm bytecode to native machine code using a two-tier optimization system. The Python-source-to-Python-bytecode stage is unchanged — the same CPython compilation logic runs, just now inside the Wasm-compiled interpreter rather than a natively compiled one.

The two-tier Wasm optimization works as follows:

1. **Liftoff** (V8) / **Baseline** (SpiderMonkey): A fast, single-pass compiler that produces unoptimized native code. Completes in milliseconds.
2. **TurboFan** (V8) / **IonMonkey** (SpiderMonkey): A slower, optimizing compiler that recompiles *hot* functions — those that are called frequently and whose execution time dominates. Unlike JavaScript engines, which use profiling feedback (collected by instrumenting the running code) to guide speculative recompilation, Wasm engines decide which functions to recompile using simpler heuristics such as a call-count threshold: when a function is invoked more than some fixed number of times, it is queued for TurboFan compilation. The optimizing compiler does not receive type feedback or branch probability data from actual execution.

The net effect: the machine code produced by Clang→Wasm→TurboFan is less optimized than the code produced by Clang→native-x86-64 directly. Two independent factors contribute. First, Emscripten/Clang cannot apply all of LLVM's optimization passes because Wasm as a target does not support the code patterns those passes produce. Second, TurboFan performs far fewer optimizations than an offline compiler: it does not do profile-guided optimization, speculative devirtualization (replacing indirect calls with direct calls based on observed types), aggressive inlining across module boundaries, or loop interchange/tiling for cache optimization. It is a fast optimizing compiler designed to complete during page load, not an offline super-optimizer.

These constraints are not accidental — they are a direct consequence of Wasm's design goal: safely executing untrusted code across platforms inside a browser process:

- **Structured control flow**. Wasm has no arbitrary `goto` or computed jump. All control flow must be expressed as structured blocks, loops, and `br_table` indirect branches. This is a security feature: the engine can verify at load time — before any code executes — that every branch targets a valid block boundary. This makes it impossible to construct [return-oriented programming](https://en.wikipedia.org/wiki/Return-oriented_programming) (ROP) attacks, where an attacker chains together fragments of existing code ("gadgets") ending in return instructions to execute arbitrary logic, a class of exploit that relies on the ability to jump into the middle of instructions. The trade-off is that optimizations depending on free-form code layout — including CPython's *computed goto* dispatch (where each opcode handler jumps directly to the next handler via an indirect jump through a table of code addresses, built on GCC/Clang's labels-as-values extension) — are unavailable.
- **No alias analysis across the heap**. *Aliasing* occurs when two pointers reference the same memory location — so that a store through one pointer changes the value that would be read through the other. The compiler must prove that two pointers do *not* alias before it can reorder their loads and stores (rearranging the sequence of memory operations so that reads can be batched, writes deferred and combined, and contiguous data loaded into SIMD registers). A native compiler has several tools for this: **type-based alias analysis** (a `float*` and an `int*` can never overlap unless one is `char*`, per C strict aliasing rules), **allocation-site tracking** (two `malloc` calls return non-overlapping blocks), the **`restrict` keyword** (the programmer guarantees that a pointer is the only way to access its pointee — pervasive in numerical code), and **address-space knowledge** (stack, heap, and globals live at disjoint ranges laid out by the linker). In Wasm, all of this information is lost. The linear memory is one flat, undifferentiated byte array — "undifferentiated" meaning there are no segments, no typed regions, no allocation metadata visible to the compiler. All pointers are `i32` values; all memory operations are `i32.load` and `i32.store` with no type annotation on the address. The Wasm engine cannot distinguish a stack access from a heap access, nor a `float` from an `int` in memory, nor two separate `malloc` results. This is a security feature — a single flat address space with bounds-checked access is the sandbox — but the trade-off is conservative code generation: stores cannot be reordered past potentially-aliasing loads, and the autovectorizer must emit runtime overlap checks before vectorizing loops over pointer arguments. In principle, LLVM could emit alias-analysis metadata into the Wasm module (it already knows which pointers do not alias from the C/C++ source), but Wasm currently has no annotation mechanism for this. Adding one would require a spec proposal, and would need to handle edge cases like `memory.grow` shifting the address space and `memory.copy` overwriting annotated regions.
- **Bounded SIMD**. The Wasm SIMD instruction set is a fixed 128-bit subset. Even if the host CPU has AVX-512, the Wasm compiler cannot emit it. Code optimized for specific SIMD widths on native must be expressed through the portable subset or rely on the autovectorizer (see below).
- **No inline assembly**. Libraries that use handwritten assembly for performance-critical kernels (common in BLAS, FFT, and video codecs) must either fall back to C implementations or be rewritten using Wasm SIMD intrinsics.

### Why the Python Interpreter Loop Suffers Disproportionately

CPython's bytecode interpreter is a large C loop containing a `switch` statement. The loop reads the next opcode from the bytecode stream, jumps to the corresponding `case` label, executes the C code for that opcode (which might manipulate Python objects, call functions, or push/pop the value stack), then loops back to read the next opcode. For a typical Python program, this loop executes millions of times per second. The implementation lives in [`Python/ceval.c`](https://github.com/python/cpython/blob/main/Python/ceval.c) in the CPython source — the macro `USE_COMPUTED_GOTOS` controls whether the dispatch uses the optimized path described below.

A native C compiler can optimize this dispatch with *computed goto* — a GCC/Clang extension (exposed as the [labels-as-values](https://gcc.gnu.org/onlinedocs/gcc/Labels-as-Values.html) feature) that compiles the `switch` into an **indirect jump** through a table of code addresses. A direct jump names its target statically (`jmp .L123`); an indirect jump reads the target address from a register or memory location at runtime (`jmp *%rax`). In the computed goto pattern, each opcode's handler code ends by loading the address of the *next* opcode's handler from the table (using the opcode number as the index), then jumping to it. This avoids the overhead of returning to a central dispatcher on every iteration. On modern CPUs, this pattern benefits from the **indirect branch predictor** — a microarchitectural component that observes the history of taken branch targets and learns correlations, so that after seeing `LOAD_FAST → BINARY_ADD` many times, the CPU can speculatively fetch and decode the `BINARY_ADD` handler before the jump target is even computed. Intel's IT-TAGE predictor and AMD's perceptron-based predictor are examples of this class of hardware; Agner Fog's [microarchitecture guide](https://www.agner.org/optimize/microarchitecture.pdf) documents their behavior in detail.

When compiled to Wasm, the dispatch loop maps onto `br_table` — WebAssembly's indirect branch instruction. In Wasm's [structured control flow model](https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions), code is organized into nested **blocks** delimited by `block ... end` and `loop ... end` pairs. A `br_table` is an instruction that takes a numeric index operand and a list of branch target labels; it jumps to the label at that index position in the list. Unlike a native indirect jump, `br_table` can only target the *beginning* of an enclosing block or loop — it cannot jump to an arbitrary instruction offset. This is why the validator enforces that every label in the table refers to a valid "block boundary": the instruction immediately following a `block`, `loop`, or `if` marker. This is semantically similar to computed goto, but the implementation in Wasm engines is less efficient for two reasons. First, `br_table` must validate that every branch target is a block boundary in the structured control flow, which constrains how the engine can lay out the generated native code — handler blocks may end up at non-adjacent addresses, defeating instruction cache locality. Second, the Wasm engine's optimizing compiler (TurboFan/IonMonkey) does not model indirect branch prediction — it cannot learn that `LOAD_FAST` is frequently followed by `BINARY_ADD` and co-locate those handler blocks or emit conditional direct jumps for the common case.

The result is that each Python bytecode takes more cycles to dispatch in Wasm than natively. For a workload dominated by Python-level logic — string processing, object allocation, module imports — these per-bytecode overheads accumulate linearly. A program that executes 50 million bytecodes on native CPython in 1 second might take 60 seconds under Pyodide because each of those 50 million dispatches costs more. This is why [mypy in Pyodide takes ~60 seconds vs. < 1 second natively](https://github.com/pyodide/pyodide/issues/3497).

Python 3.14's tail-call interpreter addresses this by replacing the switch loop with tail-call dispatch: each opcode handler is a separate function that tail-calls the handler for the next opcode. Wasm's [tail-call extension](https://github.com/WebAssembly/tail-call) (shipped in all browsers) can compile these tail-calls into direct jumps, avoiding the `br_table` overhead entirely. The dispatch becomes a chain of `call_indirect` → handler code → `return_call_indirect` → next handler, which the engine maps to register-indirect jumps. [Pyodide #6102](https://github.com/pyodide/pyodide/issues/6102) tracks enabling and benchmarking this in Pyodide.

### Why Numerical Kernels Are Less Affected

A matrix multiplication in NumPy spends nearly all of its time in compiled C/Fortran loops — the Python interpreter is invoked once to call `numpy.dot()`, and then the C extension runs uninterrupted. In a 1000×1000 double-precision matrix multiply, the Python interpreter executes perhaps a dozen opcodes (load `numpy`, lookup `dot`, push the arrays, call), while the C extension executes on the order of 10^9 floating-point operations. The interpreter overhead is amortized to insignificance.

The compiled numerical code itself does incur some Wasm overhead, but this overhead is much smaller because numerical kernels consist of tight, predictable loops over arrays — exactly the pattern that both LLVM's autovectorizer and the Wasm engine's optimizing compiler handle well. LLVM can unroll loops, schedule instructions, and emit Wasm SIMD instructions for the vectorizable portions. The Wasm engine's optimizing compiler can then further improve instruction selection, register allocation, and cache-friendly code layout for the host CPU. The relative slowdown vs. native for such kernels is typically in the range of 1.2–2× rather than the 10–60× seen for bytecode-heavy workloads.

## Why Wasm Is Designed With These Constraints

WebAssembly was designed to run untrusted code from the web safely, cross-platform inside a browser process. Many performance trade-off stem from this intrinsic choice.

### Linear Memory Sandbox (No Virtual Memory Tricks)

WebAssembly programs see a single contiguous block of linear memory, starting at address zero. By contrast, a native program sees a rich virtual address space managed by the operating system: the stack, heap (`brk`/`mmap` regions), executable code (`.text`), global data (`.data`/`.bss`), and memory-mapped files each occupy independent address ranges at locations chosen by the OS kernel and the dynamic linker. The OS can grow, shrink, and change permissions on these regions independently.

In Wasm, every load and store is bounds-checked against the current memory size. This is a security feature: the check guarantees that a Wasm module can never read or write memory outside the linear region allocated to it, even if a bug or malicious code computes an out-of-bounds address. The engine can grow this memory (`memory.grow`) but cannot shrink it, remap it, or create disjoint regions.

This eliminates several memory-management techniques that native runtimes depend on for performance and resource control:

- **Guard pages for stack overflow detection**. In a native program, the OS reserves a large virtual address range for the thread's stack and marks the last page (the "guard page") as inaccessible. When a deeply recursive function causes the stack pointer to cross into the guard page, the CPU triggers a page fault, the OS delivers a `SIGSEGV` signal, and the runtime can handle the overflow or terminate gracefully. No explicit check is needed on every function call — the hardware does it. In Wasm there is no OS-level virtual memory within the sandbox; every byte of linear memory is equally accessible. The compiler must instead insert an explicit comparison (`if sp < stack_limit`) at the entry of every function that allocates stack space.

- **`mmap` / `madvise` for memory management**. A native C allocator (glibc malloc, jemalloc) can release unused pages back to the operating system via `madvise(MADV_DONTNEED)` or unmap them with `munmap`, reducing the process's physical memory footprint. It can also *remap* pages — changing their size (`mremap`), permissions (read/write/execute), or the file they are backed by — without copying the data. Wasm memory can only grow, never shrink or change permissions: once pages are allocated via `memory.grow`, they remain part of the module's footprint for its lifetime. Memory-mapped file I/O (where the OS loads file contents directly into a process's address space on demand, without an explicit read call) also does not exist in Wasm — all file data must be read into linear memory explicitly via the Emscripten virtual filesystem or JavaScript interop.

- **`fork` with copy-on-write**. A native runtime can fork a process, creating a child that shares all memory pages with the parent. The OS marks pages as copy-on-write: neither process pays for a physical copy until one of them modifies a page. This is how Python's `multiprocessing` efficiently shares large arrays between worker processes. Wasm has no concept of process forking — there is no `fork` syscall and no mechanism to share memory pages between independent module instances.

- **Address Space Layout Randomization (ASLR)**. A native OS randomizes the base addresses of the stack, heap, and shared libraries at process startup to make memory-corruption exploits harder to write. Wasm does not need ASLR because the sandbox already guarantees that a Wasm module cannot address memory outside its linear region — there is no way to compute the address of another process or the host's internal data structures. This absence of randomization is also what enables memory snapshots in Pyodide: since the address space is deterministic, a saved heap image can be restored identically across page loads.

### Portable SIMD, Not Hardware SIMD

The [Wasm SIMD proposal](https://github.com/WebAssembly/simd) is finalized (Phase 4) and shipped in all modern browsers since 2021. It defines a fixed set of 128-bit vector operations — a portable subset drawn from what is efficient across x86-64 SSE/AVX, ARM NEON, and other ISAs. There is no way to emit an AVX-512 instruction directly from Wasm, even if the host CPU supports it; the Wasm compiler is limited to this portable subset.

Hand-tuned assembly kernels targeting specific instruction sets (common in BLAS libraries, FFT libraries, and video codecs) cannot be used in Wasm — as noted in the constraints section above — without rewriting them using the portable intrinsics or relying on compiler autovectorization. The [Relaxed SIMD proposal](https://github.com/WebAssembly/relaxed-simd) (Phase 3 — implementation in progress, not yet shipped in stable browsers) addresses this by adding non-deterministic instructions (FMA, swizzle) that map more directly to hardware without breaking determinism guarantees.

### Threads Require SharedArrayBuffer and Cross-Origin Isolation

Shared-memory threads in Wasm need `SharedArrayBuffer`, which browsers restrict to pages that opt into cross-origin isolation via COOP and COEP headers. "Cross-origin isolation" means the page declares that it does *not* interact with cross-origin content: it cannot be embedded as an iframe by a page from a different origin, and it cannot load cross-origin resources without explicit opt-in. This is a direct consequence of [Spectre](https://spectreattack.com/) mitigations: `SharedArrayBuffer` provides a high-resolution timer (shared memory acts as a side channel between threads), which is a building block for speculative-execution attacks. Without cross-origin isolation, an attacker could embed the victim page inside an invisible iframe on `evil.com` and use the high-resolution timer to leak secrets from the victim's memory. Cross-origin isolation prevents this by ensuring the page runs in a context where no cross-origin code shares its process.

In practice, threaded Wasm requires the server to send these HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Both Pyodide and JupyterLite *can* serve these headers — GitHub Pages supports them, and JupyterLite's documentation covers COOP/COEP configuration. The friction is that many existing deployments (CDNs, static site hosts) do not set them by default, and enabling cross-origin isolation imposes restrictions on loading cross-origin images, fonts, and scripts. As a result, most scientific computing deployments that target the browser currently run single-threaded to avoid the configuration burden.

## Accidental Constraints Actively Being Addressed

These are not mandated by Wasm's security model — they are gaps in the current toolchain and packaging:

- **Missing optimization flags at build time**. The SciPy regression in [Pyodide #4486](https://github.com/pyodide/pyodide/issues/4486) — where SciPy in v0.24.0 was observably slower than in v0.23.4 — was traced to build configuration changes, not any fundamental Wasm limitation. When Emscripten compiles C/C++ to Wasm, flags like `-O3` enable LLVM's optimization passes before Wasm bytecode emission. Passing `-msimd128` additionally enables the autovectorizer, which transforms scalar loops into SIMD loops. If either flag is omitted, the Wasm bytecode is structurally worse — and the engine's optimizing compiler has less to work with. Native builds are more forgiving because the CPU can absorb some inefficiency; Wasm's narrower optimization headroom makes build configuration more impactful.

- **Suboptimal BLAS backend**. Pyodide currently ships CLAPACK (unoptimized reference BLAS) with NumPy. [Issue #3763](https://github.com/pyodide/pyodide/issues/3763) tracks the integration of OpenBLAS, and [issue #5948](https://github.com/pyodide/pyodide/issues/5948) landed a SIMD-enabled OpenBLAS build for Wasm. Once wired into NumPy, linear algebra performance should improve significantly.

- **Python↔JS call overhead**. The foreign function interface in Pyodide proxies Python objects across the Wasm boundary. Every attribute access, method call, and type conversion crosses between JavaScript and Wasm. [Issue #4015](https://github.com/pyodide/pyodide/issues/4015) and [#6278](https://github.com/pyodide/pyodide/issues/6278) track efforts to statically analyze and optimize these call patterns.

- **Startup time**. Pyodide's initialization — CPython startup, stdlib import, FFI setup — is identical on every page load. Memory snapshots (described in the [0.26 release notes](https://blog.pyodide.org/posts/0.26-release/)) capture the post-initialization heap and restore it, aiming to reduce startup from seconds to tens of milliseconds. This is possible in Wasm specifically because of the absence of ASLR (see above).

## What Benchmarks Actually Show

### mypy: 60× Slowdown, Two Compounding Factors

The most severe slowdown documented in the Pyodide issue tracker is [mypy taking ~60 seconds in Pyodide](https://github.com/pyodide/pyodide/issues/3497) vs. < 1 second natively for a trivial one-line file. With bytecode caching, the second run drops to ~5 seconds (still ~5× slower). The [fix](https://github.com/pyodide/pyodide/pull/3504) was to ship mypy with its **mypyc-compiled** C extensions rather than running it as pure Python. This reveals that the 60× slowdown was not solely the interpreter dispatch overhead — it was two factors compounding:

1. **Missing mypyc compilation (dominant)**. mypy runs dramatically faster when compiled to C extensions via mypyc. The Wasm build was running mypy as pure interpreted Python bytecode, while the native comparison was almost certainly using a compiled mypy.
2. **Wasm dispatch overhead (contributing)**. Even with mypyc compilation, the remaining Python-level code (imports, glue logic, non-compiled modules) still pays the per-bytecode dispatch cost described above.

The dispatch overhead is real but a better illustration of its magnitude is the cached run: ~5 seconds in Pyodide vs. < 1 second natively, after the heavy lifting of module import and initial type-checking infrastructure setup is done. This ~5× gap is closer to what you should expect for Python-bytecode-dominated workloads in Wasm, while the full 60× gap conflates dispatch overhead with an entirely avoidable build configuration issue — running pure Python instead of compiled extensions.

### SIMD OpenBLAS: Measurable Improvement, No Full Integration Yet

Issue [#5948](https://github.com/pyodide/pyodide/issues/5948) benchmarks `cblas_sdot` (vector dot product) and `cblas_sgemm` (matrix multiplication) comparing scalar vs. SIMD OpenBLAS builds at both `-O2` and `-O3` optimization levels. The SIMD build shows measurable improvement, confirming that LLVM's autovectorizer (enabled by `-msimd128` and `-O2`/`-O3`) can generate efficient SIMD Wasm for BLAS kernels. This partially mitigates the constraint noted earlier — that Wasm cannot use hand-tuned assembly kernels written for SSE/AVX/NEON — by relying on the compiler to produce vector code automatically. The SIMD OpenBLAS build is available but not yet integrated into NumPy's default linkage in Pyodide.

### SciPy: Performance Regression From Build Configuration

[Issue #4486](https://github.com/pyodide/pyodide/issues/4486) reported that `scipy.optimize.shgo` combined with `scipy.stats.gaussian_kde` was observably slower in Pyodide v0.24.0 and v0.25.0 compared to v0.23.4 — severe enough to freeze the browser. The root cause was a build configuration change between versions, not any change in the Wasm engine or Python version. This illustrates the sensitivity of Wasm performance to compiler flags: a missing `-O3` or omitting LTO (link-time optimization) has a larger relative impact than on native builds.

### Obspy: Overhead Is "Mostly Negligible"

The [Obspy-in-the-browser project](https://github.com/MMesch/pyjs-obspy) (presented at EGU 2026) reported that interactive seismic analysis latency through emscripten-forge and Pyjs is "mostly negligible" for their tested workflows. Bottlenecks appeared in specific NumPy functions not optimized for Wasm execution, not in the overall architecture.

## Pyodide vs. emscripten-forge

Both compile Python packages to `wasm32-unknown-emscripten`, but they differ in ecosystem and distribution:

- **Pyodide** builds packages as Python wheels (`.whl`) with a platform tag defined by [PEP 783](https://peps.python.org/pep-0783/). Packages are published to PyPI and installed at runtime via `micropip`. The ABI (Application Binary Interface — the set of conventions governing how compiled code interacts: calling conventions, data layout, symbol naming, and the set of available system libraries) is versioned per Python release (`pyemscripten_2025_0` for Python 3.13, `pyemscripten_2026_0` for Python 3.14). Pyodide ships a complete Python distribution for the browser, including a patched CPython, the standard library, and the foreign function interface. Compiled C/Fortran extensions like BLAS libraries are bundled directly into the wheel as Wasm binaries.

- **emscripten-forge** builds packages as conda packages (`.conda` format) served from a conda channel at [prefix.dev](https://prefix.dev/channels/emscripten-forge-4x). Packages are installed with `micromamba` or `pixi` rather than loaded at runtime. The key advantage over Pyodide wheels is that conda is a general-purpose package manager: recipes can declare dependencies on non-Python libraries (BLAS, FFTW, HDF5, etc.) as separate packages, and the solver resolves the full dependency graph across languages. A recipe for NumPy can declare `openblas` as a dependency, and the solver ensures a consistent BLAS across all packages (NumPy, SciPy, Scikit-learn) using the same build. In contrast, Pyodide wheels are Python-specific — each wheel bundles its own copy of BLAS statically, and there is no cross-package dependency solver ensuring all wheels use the same BLAS version. Build configuration — compiler flags, link flags, test commands — is specified in `recipe.yaml` using `rattler-build`, making it explicit and reproducible. This matters for performance: the SciPy regression (#4486) was a build configuration issue that a reproducible recipe system with dependency tracking helps prevent.

## Beyond Python: Other Scientific Wasm Runtimes

The Wasm performance model applies across languages. Brief notes on other projects:

- **[webR](https://docs.r-wasm.org/webr/latest/)** — R compiled to Wasm via Emscripten. Provides R's full statistical computing environment in the browser, including package installation via `webr::install()`. Faces the same constraints: single-threaded, memory-limited, interpreter dispatch overhead. The [webR REPL](https://webr.sh) is available for testing.

- **[xeus-cpp](https://github.com/jupyter-xeus/xeus-cpp)** — A C++ Jupyter kernel that runs in JupyterLite. Uses xeus's implementation compiled to Wasm. Relevant for scientific computing because it provides native C++ execution in the browser without a Python interpreter layer.

- **[Observable](https://observablehq.com/)** — JavaScript-based reactive notebooks. Not Wasm, but the baseline comparison for interactive scientific computing in the browser. Observable runs JavaScript natively in the browser's JS engine (which benefits from the full JIT compilation pipeline that Wasm does not). It can also load Wasm modules, so performance comparisons between pure JS and Wasm implementations of the same algorithm are possible.

## Wasm Feature Proposals Affecting Numerical Workloads

| Proposal | Stage | Impact |
|---|---|---|
| [SIMD](https://github.com/WebAssembly/simd) | Phase 4 (shipped) | 128-bit fixed-width vector ops; 2–3× on autovectorized kernels |
| [Relaxed SIMD](https://github.com/WebAssembly/relaxed-simd) | Phase 3 | Non-deterministic ops (FMA, swizzle) mapping more efficiently to hardware |
| [Threads](https://github.com/WebAssembly/threads) | Phase 4 (shipped) | Shared memory + atomics; requires `SharedArrayBuffer` and COOP/COEP |
| [JSPI](https://github.com/WebAssembly/js-promise-integration) | Phase 3 | Stack switching for sync-over-async; enables `asyncio.run()` in browser |
| [Tail-call](https://github.com/WebAssembly/tail-call) | Phase 4 (shipped) | Enables CPython 3.14's tail-call interpreter in Wasm |
| [Memory64](https://github.com/WebAssembly/memory64) | Phase 3 | Lifts the 4 GB linear memory limit |
| [Exception handling](https://github.com/WebAssembly/exception-handling) | Phase 4 (shipped) | Zero-cost exceptions; reduces overhead of Python exception handling |
| [Garbage collection](https://github.com/WebAssembly/gc) | Phase 4 (shipped) | Managed objects; relevant for language runtimes that need GC interop with JS |

SIMD, tail-call, threads, exception handling, and GC are all shipped. The remaining gaps for scientific Python are primarily the 4 GB memory ceiling (Memory64) and the deployment friction of threaded Wasm (COOP/COEP headers).

## Where the Data Is Gaps

1. **No published Pyodide vs. native comparison**. Pyodide has a `make benchmark` target ([docs](https://pyodide.org/en/stable/development/testing.html#benchmarking)) but no regularly published dashboard.

2. **No emscripten-forge benchmarks**. The `pyjs-code-runner` executes Wasm packages in a headless browser during CI but has not been used for performance regression tracking.

3. **SIMD OpenBLAS not benchmarked in NumPy context**. Issue #5948 benchmarked BLAS primitives in isolation. The effect on end-to-end NumPy/SciPy operations once integrated is unknown.

4. **No browser engine comparisons**. No published data compares V8 vs. SpiderMonkey vs. JavaScriptCore for the same scientific Wasm workload.

5. **No cross-language comparisons**. No published data compares Python (Pyodide), R (webR), and C++ (xeus-cpp) on the same numerical workload under Wasm.

## Sources to Monitor

- [Pyodide issue tracker — `performance` label](https://github.com/pyodide/pyodide/issues?q=is%3Aissue+label%3Aperformance)
- [WebAssembly proposals repository](https://github.com/WebAssembly/proposals)
- [emscripten-forge blog](https://emscripten-forge.org/blog/)
- [Pyodide blog — release notes](https://blog.pyodide.org/)
- [V8 blog — WebAssembly tag](https://v8.dev/blog/tags/webassembly)
- [cibuildwheel changelog](https://cibuildwheel.pypa.io/en/stable/changelog/) (tracks PyEmscripten ABI support)
- [webR documentation](https://docs.r-wasm.org/webr/latest/)
- [Pyodide #6102](https://github.com/pyodide/pyodide/issues/6102) — CPython 3.14 tail-call interpreter benchmarks
- [Pyodide #3763](https://github.com/pyodide/pyodide/issues/3763) — OpenBLAS integration
- [Pyodide #4015](https://github.com/pyodide/pyodide/issues/4015) — FFI benchmarks
