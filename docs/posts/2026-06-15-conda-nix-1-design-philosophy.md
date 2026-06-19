---
title: "Nix and Conda: Part 1 — History and Design Philosophy"
labels:
  - comparison
  - package-management
description: |
    Part one of a series comparing Nix and Conda side-by-side. Examines their contrasting design philosophies and architectural foundations.
---

# Introduction

This article is an attempt to put two interesting package management systems, Conda and Nix, side-by-side, going through high level history and design choices in this first article, and through individual technical aspects in follow up posts. Whether you're trying to decide which tool to invest in, or you already use one and are curious about the other, I hope this post helps a bit. I work with both extensively and this post reflects my evolving state of understanding the key tradeoffs made.

Another motivation for writing this post is that both ecosystems maintain extensive metadata about packages — dependencies, build instructions, licenses, platform specifics and more. Some of this information is stored nowhere else, not even in the upstream repositories and it is partially overlapping between Nix and Conda. This makes one wonder how such information can be shared, whether any integration is possible and makes sense.

## Nix

Nix grew out of Eelco Dolstra's PhD work at Utrecht University, formalized in his 2006 thesis "[The Purely Functional Software Deployment Model.](https://edolstra.github.io/pubs/phd-thesis.pdf)" Much inspiration came from a tool he had built called Maak, which extended the Unix `make` build system with a purely functional language for describing build targets. It's worth keeping this lineage in mind: a lot of Nix's behavior can still be seen as `make` taken (very) seriously.

Expressing package build graphs with pure functions is one of Nix's central insights. A *pure* function depends only on its declared inputs and has no side effects — given the same inputs, it always produces the same output because it doesn't quietly access the internet, depend on system state, or use anything else beyond what is explicitly declared. Purity thus leads to reproducibility, and reproducibility means we only need to compute once and can cache the output for any future invocations. If building and installing a package is expressed as such a function — with source code, dependencies, and build instructions as inputs — then the same inputs should also always produce the same installed result, and caching is the equivalent of simply retrieving / downloading the package that somebody else has already built. A full software environments, even a full operating system, is just those functions composed into a large graph, producing many outputs.

Making this work end-to-end takes a few coordinated mechanisms, which together define Nix as a system:

- An expressive configuration **language** (the "Nix" language) with variables, functions, imports, and small libraries — rather than flat YAML like Conda recipes or Makefile-style rules. This is how you use the pure-function paradigm in practice: functions compose, and can be shared across packages. We'll come back to the language in detail in later posts.
- **Intrinsic identifiers** for software components — hashes of a package's raw build recipe, recursively including all its dependencies. This follows directly from the pure-function model: if the output is fully determined by the inputs, then the inputs themselves are the natural identity. In the vocabulary of [CISA's software-identifier  analysis](https://www.cisa.gov/sites/default/files/2023-10/Software-Identification-Ecosystem-Option-Analysis-508c.pdf), Nix's hashes are *inherent identifiers*, and sometimes *input* addressed is used as well — anyone holding the recipe can derive them mechanically.
- Strict **build isolation** — environment variables are cleared, network access is blocked, and only declared dependencies are visible during a build. On Linux this is enforced through kernel-level sandboxing, and is what makes the "pure function" guarantee hold at build time rather than only on paper.
- One immutable, replicated **database**, the Nix store, that holds every built component locally and remotely. Every component lives at its own identifier path under `/nix/store`, a prefix `/nix/store` that is the effective default : you can build Nix with a different prefix, but this changes identifiers meaning you can't use the global remote store and have to rebuild from source. Installing means simply linking store paths together on the fly which is a deep break with the Linux Filesystem Hierarchy Standard where software is installed into shared locations like `/usr/lib` and `/usr/bin` ([more on this viewpoint here](https://economicsfromthetopdown.com/2024/02/17/nixing-technological-lock-in/)). A direct consequence is that many versions or variants of the same package can sit side-by-side without conflict, each at its own location. Another consequence is that Nix requires workarounds to use binaries looking for libraries in the standard locations.

Together these pieces give Nix a striking conceptual shape, which the thesis frames, aside of seeing it as a highly elaborate `make`, as **deployment as memory management**. If traditional deployment tools treat software installation like an assembler programmer treats raw memory — no structure, no guarantees — then Nix is a modern garbage-collected take on it. Packages live at known addresses (the recipe hash identifiers) in the store, nothing mutates in place, and nothing references undeclared dependencies. A package with a different dependency, a different compiler flag, even a different patch automatically becomes a *different package* at a different address.

This academic origin explains a lot about Nix's character: the design is driven by conceptual clarity — purity, referential transparency, content-addressability — pursued to its logical conclusion, even when it conflicts with existing standards and established ecosystems. The first public papers appeared in 2004, and the system was adopted first by the programming-languages and wider Linux communities before eventually growing into NixOS — an entire Linux operating system defined with this model.

But for all the conceptual cleanliness, one thing Nix conspicuously lacks which many other packaging ecosystem (Conda, pip, cargo, npm) have: a semantic version layer over its packages. In those ecosystems, instead of explicitly fixing dependencies, maintainers declare what dependency version ranges a package is compatible with (`numpy >=1.20,<2.0` and the like), and a resolver searches for a set of package versions that satisfies all such version constraints, producing a coherent environment on demand. The result is usually some sort of lock file — the explicit snapshot of one possible resolution. This semantic layer is messy but doing real work. While there are many situations where it is not crucial to have, there are many others where it can't be missed. Nix's approach is to drop the semantic layer entirely. There is no version resolution happening, and version resolution is even largely incompatible, or at least orthogonal, to the whole Nix model outlined above. The need is there, as the proliferation of "2nix" tools shows that essentially outsource version resolution to other package managers, and feed Nix with a fully resolved lock file. We will explore this interesting topic in a dedicated post. 

Fundamentally, this makes Nix a **distribution**, an open, coherent, community-curated set of package versions that work well together — a single, huge dependency tree assembled with the Nix configuration language in one monorepo versioned by its Git commit, and realized in the Nix store which can also be seen as a graph database containing all the individual software components. Users build off this tree by selecting, tweaking, and augmenting parts as they need, all within one coherent .nix configuration that versions one individual realization. Nix gives you surgical precision and customizability, you can override any package's dependency, modify sources and basically any aspect of the build graph on the fly via the Nix language.

And Nix reaches well beyond packages, into territory other package managers usually don't cover. The same configuration language used to describe packages can describe an entire system, including services (nginx, PostgreSQL, SSH), kernel parameters, users, and more which translate into configuration files that are linked from the store into the right places on the system as needed. Once you have a configuration, Nix can flexibly deploy it as local or remote system, containers, and virtual machines. The reproducibility guarantees mean that you can easily reset your servers, roll configurations back and forth and a lot more.

Today the Nix ecosystem is driven by the NixOS Foundation and a large community of contributors maintaining `nixpkgs`, a single monorepo containing tens of thousands of packages and [ranked among the most active repositories on GitHub](https://github.com/NixOS/nixpkgs). The DevOps and sys-admin community is naturally attracted by the precise and reproducible deployments that it enables. A commercial ecosystem is also slowly growing around it but the core remains community-governed open source.

## Conda

In contrast to Nix's academic origins, Conda was born from a very concrete, urgent problem: distributing scientific Python packages with compiled C and Fortran extensions. In the early 2010s, `pip` and Python wheels could handle pure Python code, but packages like NumPy, SciPy, and scikit-learn linked against native libraries (BLAS, LAPACK, HDF5, and others). Pip had no mechanism to declare, resolve, or install those system-level dependencies. Scientists and data engineers spent hours wrestling with compilers and missing dependencies to install the tools they needed.

Two people deeply involved in this problem created Conda: Travis Oliphant — who unified the Numeric and Numarray projects into NumPy — and Peter Wang. Both came from Enthought, where they had experienced the practicalities of distributing scientific Python through the company's Python distribution (EPD, later succeeded by Canopy), before co-founding Continuum Analytics and releasing Conda in 2012.

Peter and Travis, under Continuum Analytics (renamed to Anaconda Inc. in 2017),
built the core pieces: the conda package format, the conda client, conda-build,
and the Anaconda Distribution. A fifth component, `conda-forge`, grew up around
them in the community. All five are worth untangling, since much of the
confusion around Conda comes from conflating them:

- The **conda package format** is an open specification for how a software
  component is bundled. A conda package is a single compressed file (`.conda`
  or the older `.tar.bz2` format) containing both the files to install (the
  build output) and a metadata directory (`info/`) with the package name,
  version, build number, dependencies, and — crucially — the version
  constraints attached to each dependency, which feed the resolver. The
  installed files are the *diff* of what changed in a build prefix before and
  after compilation: not just new files, but also modified and removed ones.
  This means a package can be applied to any directory — it doesn't need a
  pre-existing filesystem layout the way Nix store paths assume `/nix/store`.
  The result is **relocatable** packages that work from user home directories,
  CI runners, or anywhere else without root access. The format was designed as
  an alternative to Python wheels (which lack a dependency model for
  system-level libraries), but conda packages carry any software, not just
  Python.
- **`conda-build`** is the tool that turns a recipe (a `meta.yaml` file with
  build scripts) into a conda package. It runs on maintainer machines or CI
  infrastructure, not on end-user machines — the build and install stages are
  separate. Increasingly, the community-developed `rattler-build` is replacing
  it with a faster Rust implementation. Once built, packages are added to a
  channel's index (`repodata.json`), which is what the resolver reads at
  install time to discover available packages and their version constraints.
- The **`conda` tool**, today often replaced by its community-driven
  alternative `mamba`, a much faster C++ reimplementation, is the client that
  downloads packages, resolves dependencies, and manages environments — the
  part most users interact with.
- The **Anaconda Distribution** is a curated bundle of scientific Python
  packages, much in the lineage of EPD, built on top of the format and the
  tool. It is proprietary and was the company's commercial offering.
- Finally, **`conda-forge`** is the open, community-maintained channel
  ecosystem that grew up around the open format and tool. It wasn't built by
  Peter and Travis; it emerged as a federated alternative to Anaconda's own
  channel, hosting thousands of feedstocks contributed by domain experts. For
  many users today, "the conda packages" effectively means "what's on
  `conda-forge`" — which makes it the most direct analog to Nix's `nixpkgs`: an
  open, community-curated index that the ecosystem actually runs on.

Conda's in-the-trenches origin explains why it embraces what core Nix avoids: compromise. Conda was driven by solving immediate problems, prioritizing that scientists can install today what they need over what would require huge effort to make perfectly reproducible.

In that spirit, Conda tackles the semantic version layer head on, making version resolution central, accepting that version constraints are imperfect but important flexibility in several ways as we will explore in the next post. This was a non-negotiable from the start in a federated, fast-moving scientific Python ecosystem. But it comes with a cost as well in terms of robustness and reproducibility.

Another compromise is to accept impurities in builds making it much easier to package lots of packages with install-stage side effects. Enforcing Nix-style sandboxing — no network, no ambient environment, only declared dependencies — would have required repackaging or rejecting much of the existing scientific Python ecosystem, which routinely fetches dependencies at build time and links against whatever's installed. In practice, conda builds happen on dedicated maintainer infrastructure, which bounds the impurity even though it doesn't eliminate it. Conda also tried from the beginning to reach Windows and make builds relocatable despite the difficulties that this brings.

Together these pieces make Conda fundamentally a **catalogue** rather than a distribution: a federated index of pre-built, relocatable artefacts that maintainers contribute on their own cadence, and that users assemble into environments as they go. If Nix's thesis frames deployment as memory management, Conda's framing is closer to deployment as **inventory and assembly**: a warehouse of standardized parts (the catalogue) plus an assembler (the resolver) that pulls a compatible set for each new order, with the warehouse itself a moving target as maintainers ship updates.

In day-to-day use, Conda gives you accessibility and flexibility: install or update a single package and the resolver figures out the consequences for the rest. Compared to Nix, the cost is less future-proofing due to the various compromises made on build purity, less customizability due to a strict, flat recipe schema and due to breaking apart the deployment process into separate stages. Conda's ecosystem is also markedly richer than Nix's in fast-moving fields like machine learning and data science, but that's only partly a technical story. Conda was built for the scientific Python community with its heavy system-dependency needs (BLAS, CUDA, HDF5), and once that community adopted Conda, network effects compounded more packages.

Today the Conda ecosystem is driven to the largest extent by `conda-forge` and its volunteer maintainers than by Anaconda Inc. itself. The open format has enabled community-developed clients to thrive alongside `conda`: `mamba` is a fast C++ reimplementation of the resolver and tool, and `pixi` (from prefix.dev) is a Rust-based project manager that unifies conda packages and PyPI under one workflow with a project-level lock file — together they demonstrate that what carries the ecosystem is the format, not any one tool or vendor.

## Summary

The difference between Nix and Conda reflects the communities they came from and the tradeoffs they chose.

**Conda** was built inside a fast-moving, running ecosystem to solve a concrete, immediate problem: distributing compiled scientific Python packages across Linux, macOS, and Windows without making scientists wrestle with toolchains. The result is a federated **catalogue** of pre-built, relocatable binaries that a resolver assembles into environments on demand.

**Nix** was designed from first principles in an academic setting, pursuing purity, content-addressability, and sandboxed builds to their logical conclusion. It dropped semantic versions entirely, pins every dependency by hash, and ships one consistent tested **distribution** (`nixpkgs`). The system doesn't silently drift, and binary distribution reduces to just a cache of reproducible source builds. Nix also extends beyond packages into system services and whole machines (NixOS) — territory Conda leaves to other tools.

With this in mind, the two ecosystems are naturally complementary, in the same way that tools like `uv2nix`, `cabal2nix`, and `npm2nix` outsource semantic versions and constraint resolution to language-specific package managers that already carry semver semantics and feed exact pins back into Nix derivations. Semantic reasoning on one side, content-addressed reproducibility on the other.

Underneath these design differences is a deeper tradeoff: the snapshot model and the solver model make opposite bets on who should pay for consistency. A curated snapshot guarantees that everything was tested together, but maintainers carry the cost of keeping it that way — every base dependency bump forces downstream updates. A solver gives users flexible composition from independent packages, but shifts the risk of untested combinations to install time. We'll explore this tension and where it shows up across ecosystems in the next post.

Differences in ecosystem coverage, Conda's dominance in machine learning and data science, Nix's in DevOps and infrastructure, are also stories of social adoption and network effects.

In the next post, we'll dig into specific aspects of both systems in detail.

## Further Reading

- [The Purely Functional Software Deployment Model](https://edolstra.github.io/pubs/phd-thesis.pdf) — Eelco Dolstra's 2006 PhD thesis introducing Nix
- [Flight aware blog post](https://flightaware.engineering/taking-off-with-nix-at-flightaware/) on Nix
- [Economics Nix](https://economicsfromthetopdown.com/2024/02/17/nixing-technological-lock-in/) another perspective on Nix
- [Nix Architecture](https://nix.dev/manual/nix/2.30/architecture/architecture.html)
- [Conda Documentation](https://docs.conda.io/projects/conda/en/stable/user-guide/concepts/pkg-specs.html#package-match-specifications)
- [Conda package format specification](https://docs.conda.io/projects/conda-build/en/stable/resources/package-spec.html)
- [Continuum Analytics becomes Anaconda](https://www.anaconda.com/blog/continuum-analytics-officially-becomes-anaconda) — June 2017 rebrand
- [Stackage design choices: making Haskell curated package sets](https://www.snoyman.com/blog/2017/01/stackage-design-choices/) — Michael Snoyman, on the snapshot-over-solver tradeoff in Haskell
- [Thoughts on PureScript package management in 2019](https://harry.garrood.me/blog/purescript-package-management-in-2019/) — Harry Garrood, framing the design space as a package-sets-vs-solver spectrum
- [Semantic versioning for Nix — FlakeHub](https://docs.determinate.systems/flakehub/concepts/semver/) — a recent attempt to add a semver layer on top of Nix flakes
- [Software Identification Ecosystem Option Analysis](https://www.cisa.gov/sites/default/files/2023-10/Software-Identification-Ecosystem-Option-Analysis-508c.pdf) — CISA, 2023 (taxonomy of inherent vs defined software identifiers)
