---
title: "Nix and Conda: Part 2 — Snapshots vs. Solvers"
labels:
  - comparison
  - package-management
description: |
    Part two of the Nix and Conda series. Explores the tradeoff between curated snapshots and version-resolution solvers across ecosystems.
---

# Introduction

[Part 1](/posts/2026-06-15-conda-nix-1-design-philosophy/) outlined the
architectural choices that shape both systems: Nix as an input-addressed
**distribution** with no semantic version layer, Conda as a federated
**catalogue** where a solver assembles compatible environments from version
constraints. But this isn't just a Nix-versus-Conda story. The same tradeoff
appears across the packaging landscape — from Linux distributions to language
ecosystems — and it's worth understanding on its own terms.

This post explores the snapshot-versus-solver spectrum: what each approach
buys you, what it costs, where hybrid models live in between, and why curated
distributions remain valuable enough that people pay for them.

## The snapshot model: one consistent set, tested together

A snapshot (or distribution) pins every package to an exact version. The
entire set is built and tested as a unit before an update ships. If a package
doesn't build against the snapshot's current versions, it doesn't make the cut
— you wait for a fix, or you patch it. Users get a guarantee: every package in
this set was tested together and is known to work.

**Nixpkgs** is the canonical open-source example — a monorepo of tens of
thousands of packages versioned by a single Git commit. When you pull
`nixpkgs` at commit `abc123`, you get one specific, fully-consistent
dependency tree. There are no version ranges, no solver, and no ambiguity
about what you'll get. And nixpkgs moves fast: it's one of the most actively
contributed-to repositories on GitHub, with hundreds of commits per day. Each
package update is a small PR that increments the global snapshot version.
A package can land within hours of its upstream release.

But the model predates Nix by decades. **Debian stable** works the same way:
a release is a point-in-time snapshot of the entire distribution, version-locked
for its support lifetime. During the freeze period leading up to a release,
Debian maintainers manually resolve conflicts between packages' declared
dependencies, producing a single coherent set through human labor rather than
algorithmic solving. `apt` technically has a solver (libapt-pkg), but in
stable it's mostly trivial — there's one version of each package and nothing
meaningful to resolve.

**Red Hat Enterprise Linux (RHEL)** and **SUSE Linux Enterprise Server (SLES)**
take this further as commercial products. Every package in a RHEL major release
is version-pinned and supported for roughly ten years. Backports provide
security and bug fixes without version bumps. The curation — the rigorous
testing and the guarantee that these versions work together — is what customers
pay for.

The snapshot model also appears in language ecosystems. **Stackage**, for
Haskell, takes nightly snapshots of Hackage packages that build together,
shipping them as curated LTS releases. The bar for inclusion is straightforward:
a package must build against the current snapshot. If it doesn't, it's excluded
until it does. Haskell developers can stay on Stackage for stability, or fall
back to raw Hackage + Cabal's solver when they need a package or version not
yet in the snapshot. The tradeoff is explicit: Stackage trades package
availability for global consistency.

**PureScript** package sets follow the same pattern — a curated set of packages
that are known to compile together, avoiding version-resolution entirely.
[Harry Garrood's 2019
post](https://harry.garrood.me/blog/purescript-package-management-in-2019/)
frames this explicitly as a package-sets-vs-solver spectrum.

**Anaconda Distribution**, built by Anaconda Inc., applies the snapshot idea to
scientific Python — a curated bundle of roughly 600 pre-tested, mutually
compatible packages built with known compiler versions and library ABIs. The
curation is the commercial value-add, much like RHEL or SLES. Other commercial
examples include **Intel oneAPI** (curated toolkits for HPC, AI, and rendering)
and **ActiveState** (curated, pre-built language distributions for Python, Perl,
and Tcl).

**Snapshot pros:**

- Every package in the set was tested together — no untested combinations.
  This is the core value proposition.
- Deterministic and reproducible: the same snapshot reference always gives the
  same environment, today and ten years from now.
- Atomic updates: move from one snapshot to the next as a single unit.
- Clean rollbacks: the old snapshot is still there.
- No solver needed at install time — dependencies are already pinned.
- Known-good state for compliance, auditing, and security patching.

**Snapshot cons:**

- Updates are serialized through a single repository. In nixpkgs this is fast
  in practice — packages can land within hours, helped by automation like the
  `nixpkgs-update` bot that opens version-bump PRs automatically — but
  fundamentally every update goes through one merge queue, and there is a
  review step that doesn't exist when a maintainer pushes directly to their
  own feedstock.
- Overriding a package version means rebuilding everything above it in the
  dependency tree. The override itself is trivial to express — change one
  function argument in the Nix language — but realizing it is explosive
  because every package above the changed one gets a new input hash and must
  be rebuilt. In a constraint-based model, if a new version is compatible,
  it can be swapped in without a rebuild; the binary is independent of which
  dependency version it's paired with. It also means that pre-building all
  possible combinations is infeasible in that snapshot model — the
  cross-product is combinatorially explosive — so in practice, you either
  accept the rebuild or stay with the snapshot as-is.
- "One version per snapshot" creates friction when different applications
  genuinely need different versions of the same library. A single Python
  installation requires one consistent set of libraries, so mixing `python311`
  and `python312` packages in the same process isn't meaningful — but if
  you're running multiple separate applications (each with its own Python),
  each may want a different version. Nixpkgs handles this by maintaining
  parallel version trees (as discussed below), but the user still has to
  select and thread them together.
- Distributing merge rights on a monorepo is coarser-grained than distributing
  ownership of individual feedstock repositories. Nixpkgs has thousands of
  committers, so in practice this works, and tools like GitHub CODEOWNERS allow
  finer-grained ownership within the monorepo — designating specific maintainers
  for specific package directories — but the permission model is naturally more
  centralized than per-package repositories.
- Maintaining global consistency has a structural upkeep cost: when a base
  dependency bumps, every downstream package must follow or be removed. The
  snapshot either forces mass updates or maintains parallel versions of the
  same library, multiplying maintenance work. (This is explored in detail
  [below](#the-hidden-cost-of-global-consistency).)

## The solver model: version constraints, resolved on demand

A solver-based system lets each package declare what versions of its
dependencies it's compatible with — `numpy >=1.20,<2.0` and the like.
Packages live independently in a registry; they don't need to be part of a
single coordinated snapshot. When a user requests a set of packages, a solver
searches for a combination that satisfies all constraints simultaneously,
producing an environment on demand.

Because packages are independent, the dependency graph is more flexible than
in a snapshot: a package's binary exists independently of the exact versions
of its dependencies. Within declared version bounds, dependencies can be
exchanged without rebuilding the package itself.

**Conda** (via `mamba` or the classic `conda` client) uses a SAT solver to
pick compatible versions from the conda-forge index. As we discussed in
Part 1, Conda was built for a fast-moving, decentralized scientific Python
community. The solver is central to the design.

This is the dominant model in language ecosystems:

- **Cargo** (Rust) resolves `Cargo.toml` semver ranges, producing `Cargo.lock`.
  Cargo tries to unify to single versions of each crate, which can fail with
  diamond-dependency conflicts when two crates require incompatible versions of
  the same dependency. There is no curated snapshot for crates.io.
- **npm** takes a different approach — when packages need incompatible versions
  of a shared dependency, npm installs nested copies rather than failing. This
  makes resolution almost never break, at the cost of duplication. There is no
  curated snapshot for the npm registry.
- **pip**, **poetry**, and **uv** all follow the same pattern: version
  constraints in a manifest, resolution at install time, a lock file to freeze
  the result.

**Solver pros:**

- Decentralized: maintainers release directly to the registry on their own
  schedule. No merge queue, no review bottleneck.
- Users can get the latest versions as soon as they're published.
- Flexible composition: the solver searches the space of compatible
  combinations rather than requiring the user to pick one snapshot.
- Scales naturally to ecosystems with thousands of independent contributors.
- No central gatekeeper for package releases.

**Solver cons:**

- Non-deterministic in principle: the same install command can produce
  different results depending on when it runs and what's in the registry.
  In practice this is rare when using lock files or well-maintained
  distributions, but it's a property of the model — a solver operating on a
  moving index can settle on different solutions at different times.
- Resolver performance degrades with complexity. SAT solving is NP-hard, and
  worst cases have caused multi-hour solves in conda.
- Version bounds are a social contract, not a technical guarantee. Semver
  promises are routinely broken in practice, and maintainers cannot feasibly
  test against all allowed combinations of their dependency ranges — there are
  simply too many, in particular when lower level dependencies are included.
- Dependency conflicts can produce unsatisfiable constraints and cryptic
  errors. This can happen in snapshots too when a specific version combination
  is broken, but the solver model surfaces conflicts at every install rather
  than once at integration time.

### Source vs. binary: what is the solver actually selecting?

There's an unspoken assumption in the solver model that's worth surfacing:
the packages already exist. A Conda solver searches an index of pre-built
binaries. When it selects `numpy=1.26` and `scipy=1.11`, those packages are
ready to download — the build happened earlier, on dedicated infrastructure.
Resolution is a filtering problem over a known, finite set.

A source-based distribution has to be more careful about what it puts in that
set. Nix could, in principle, expose a subspace of known-working derivations —
for instance, `python311Packages.numpy` and `python312Packages.numpy` are
already distinct package trees embedded at different points in the snapshot,
and a solver could reason over them without building anything new. But the
space is still much smaller than a binary index. In Conda's solver model, a
package binary stands on its own — it declares version bounds for dependencies
but doesn't carry them; the solver picks compatible ones from the index. In
Nix, the opposite is true: every derivation pulls its full transitive
dependency tree with it, hashed into its identity. The combination *is* the
package, and it only exists if someone built it. (FlakeHub's [semantic
versioning experiment](https://docs.determinate.systems/flakehub/concepts/semver/)
takes a different approach — resolving version constraints at the *flake*
level to pick which snapshot revision to use, then pinning everything inside
it by hash as usual. It's semver on the snapshot, not on the packages within
it.)

The identity model amplifies this. In Conda, swapping `libB=1.0` for
`libB=1.1` doesn't change `libA`'s identity — `libA` is still the same
binary, and the solver just pairs it with the new dependency. In Nix,
changing `libB` changes `libA`'s input hash, which makes it a different
derivation, which changes the hash of everything that depends on `libA`,
cascading through the entire transitive dependency tree. Even if a solver
found a compatible set of versions, realizing it in Nix would mean rebuilding
the entire cone — not just the changed package, but everything above it.
In a binary model, you swap one package and download nothing else. That cost
difference is structural, not tooling.

This is part of why solvers pair naturally with binary-first systems (Conda,
Cargo, npm) and snapshots pair naturally with source-first ones (Nix, Gentoo,
FreeBSD ports). Debian bridges the gap: `apt` resolves from pre-built
binaries, but the integration work — the testing of combinations — happens at
the distribution level, before packages land in the repository. The solver
only sees combinations that Debian maintainers already tested.

## The hidden cost of global consistency

One consequence of the snapshot model rarely discussed is the *maintenance
burden* of keeping everything consistent. When a base dependency like OpenSSL
or Python gets a major version bump, every package that depends on it has to
follow — or break. In the solver model, this is fine: old versions stay in
the index, packages declare their version bounds, and the solver picks
compatible combinations. The old library version imposes no maintenance cost
on anyone.

In a snapshot, you have two options, both expensive. Either every downstream
maintainer updates their package for the new version — time they may not have,
and which may not even be possible if they rely on removed functionality. Or
you maintain multiple major versions of the same library side-by-side in the
snapshot.

Nixpkgs does the latter extensively. There are currently separate top-level
attributes for `nodejs_18`, `nodejs_20`, `nodejs_22`; `python3`, `python311`,
`python312`, `python313`; `llvmPackages_16`, `llvmPackages_17`,
`llvmPackages_18`; multiple OpenSSL versions; and so on. Each of these is a
parallel dependency tree that must itself be kept consistent and up to date.
Packages declare which version they need by selecting the appropriate
attribute, and the choice is essentially hard-coded — there's no solver to
rediscover compatibility if a package could in principle work with a newer
version.

This multiplies maintenance work: maintaining four Python versions means
four times the packages to test during a snapshot update. In the solver
model, you maintain one version of each package and let version bounds do
the routing. The snapshot's guarantee — "everything was tested together" —
is genuine, but you pay for it not just at integration time but continuously,
in duplicated maintenance effort. Michael Snoyman's [write-up of Stackage's
design choices](https://www.snoyman.com/blog/2017/01/stackage-design-choices/)
explores this tradeoff in depth, noting that Stackage dropped support for
parallel GHC version lines specifically because the curator and author burden
was too high.

This isn't a symmetric tradeoff. In the solver model, resolution might fail —
or it might just work, and users never think about it. The cost is intermittent
and unpredictable. In the snapshot model, every major version bump of a core
library *always* forces maintenance work on every downstream maintainer. The
cost is structural and guaranteed. Both models externalize a cost, but the
snapshot model's cost is deterministic — you know exactly how much work you're
signing up for — while the solver model's cost is probabilistic. Harry
Garrood's [PureScript package management
write-up](https://harry.garrood.me/blog/purescript-package-management-in-2019/)
frames the same idea: curators do the compatibility work once, so users don't
have to — but that curator work is real and ongoing. Which cost is more
acceptable depends on who your community is and what they value.

## The repo structure feeds the model (and vice versa)

The snapshot-versus-solver choice is closely tied to how the code is organized.
A **monorepo** makes a snapshot natural: everything lives together, can be
tested atomically, and the snapshot version is just the monorepo's commit hash.
A **federated repo** structure (one repository per package) makes a solver
natural: packages land independently, maintainers own their own repos, and
version constraints are how composition happens across repo boundaries.

Nixpkgs and Conda-forge sit squarely on opposite sides of this divide.
Nixpkgs is a single monorepo — all packages are defined in one Git repository,
and a commit represents the entire distribution at a point in time. Pull
requests update individual packages but merge into the shared tree, and CI
tests the package against the current snapshot. Conda-forge is federated
across thousands of feedstock repositories, each maintained independently.
A package ships when its maintainer merges a PR in their own feedstock —
no central merge queue, no dependency on the state of any other feedstock.

This isn't cosmetic. The repo structure shapes what kind of coordination is
possible, and therefore what kind of guarantees the system can offer:

- **Monorepo → global consistency, serialized updates.** Everything in one
  place means you can test the entire set before a change lands. But every
  change must pass through one review process, and broad permissions are
  needed to give contributors access.
- **Federated → independent cadence, local testing.** Each maintainer ships
  on their own schedule with no central bottleneck. But testing is local
  to the package — nobody tests the full cross-product of all packages at
  every release.

The interesting case is when the repo structure doesn't match the model.
**Stackage** builds curated snapshots from a federated ecosystem (Hackage):
packages live independently, but Stackage's CI periodically tests them all
together and publishes a snapshot of what passes. **Conda-forge** maintains a
rolling baseline — not a full snapshot, but a set of core packages that act as
a foundation for resolution. Both are hybrids, shifting some of the cost
across the boundary between the two worlds.

## The spectrum, not a binary

Pure snapshots and pure solvers are endpoints on a spectrum. Most real systems
fall somewhere in between.

**Conda's rolling baseline** is a hybrid. A snapshot of core packages
(compilers, BLAS, Python itself) provides a stable foundation that everything
else builds and tests against. The rest of the ecosystem declares version
constraints, and the solver assembles compatible environments around that
baseline. The core snapshot gives consistency guarantees; the solver gives
flexibility for the packages built on top.

**Stackage** enriches Hackage's solver model with curated snapshots. Hackage
hosts packages with version bounds like any language registry; Stackage
periodically snapshots those that build together. Developers can stay on
Stackage and get a tested set, or fall back to Hackage + Cabal's solver for
packages or versions not yet in the snapshot — typically when they need a
newer version than what the LTS provides, or a package that hasn't yet been
added to Stackage.

**Lock files** are the solver camp's pragmatic answer to reproducibility:
solve once, freeze every exact version in a lock file, check it into version
control. From that point forward, anyone using the lock file gets the same
environment. Nix flakes provide the same guarantee from the snapshot side:
the flake lock pins nixpkgs and all external inputs to exact revisions,
evaluating deterministically every time.

**Nix flakes + semver experiments** like [FlakeHub's semantic versioning
layer](https://docs.determinate.systems/flakehub/concepts/semver/) are
attempting the Conda hybrid in reverse — a snapshot as foundation, with semver
resolution as an opt-in layer on top.

**Debian unstable/testing** sits in between stable (frozen snapshot) and a
pure solver model. Multiple package versions coexist, and `apt`'s solver must
pick among them. Unlike Conda or Cargo, the repository is maintained so that
the default resolution path is what Debian maintainers expect — a human-curated
resolution rather than a fully automated search.

## Are snapshots "better"?

Neither model is strictly better. The right question is: *what problem are you
solving?*

If you need to guarantee that an environment from three years ago can still be
reproduced today, or you're running production infrastructure that requires
auditability, the snapshot model is hard to beat. The testing and integration
work that goes into a RHEL release or a Debian stable is expensive, but it
produces a known-good state that a pure solver model struggles to match.

If you need the latest version of a library that was released yesterday, or
you're composing packages from many independent sources that move at different
speeds, the solver model wins. You don't want to wait for integration into a
snapshot, and you're willing to trade some reproducibility guarantees for speed.

What makes Conda interesting is that it tries to serve both — a rolling
baseline for stability, a resolver for flexibility. What makes Nix interesting
is that it pushes the snapshot model to its extreme — input-addressed,
immutable, sandbox-built — and then layers tooling on top (flakes, 2nix tools)
to recover the flexibility it gave up. Both are trying, from opposite
directions, to span the spectrum.

## Intrinsic vs. accidental complexity

Some of the friction in each model is *accidental* — tooling or workflow
problems that can be and are being improved. Some is *intrinsic* — baked
into the architecture and inescapable without changing the model.

### Intrinsic tradeoffs

| | Snapshot | Solver |
|---|---|---|
| **Consistency** | Every package was tested together — no untested combinations | The resolver picks from a space of combinations never all tested together |
| **Flexibility** | Users can't freely compose from independent packages — packages drag their entire dependency tree with them and overriding anything cascades a rebuild | Packages are independent of their dependency trees; a compatible dependency can be swapped in without touching anything else |
| **Maintenance burden** | Maintainers carry the cost: when a base dependency bumps, every downstream package must follow or be removed. Everyone must work at the same cadence. Parallel version trees multiply the work. | Maintainers declare bounds; old versions stay in the index indefinitely at no cost to anyone and can still be used with newer dependencies if compatible combinations exist (which often is the case) |
| **Reproducibility** | Deterministic — the same snapshot reference always produces the same environment | Non-deterministic in principle — a solver on a moving index can settle on different solutions at different times. Remedied by lock files. |
| **Global reasoning** | The entire dependency graph is explicit and in one place. You can use the Nix language to apply an overlay across all packages at once — swap a library, add a patch, change compiler flags globally. | Packages are independent; there is no single graph to operate on. Conda has no configuration language for global modifications, but even if it did, packages don't share a dependency structure in the same way. |
| **Who pays?** | The maintainer pays upfront to find a consistent set; the user gets a guarantee but loses flexibility | The user gains in flexibility but pays at install time if resolution fails or surfaces an untested combination |

### Accidental friction

| | Snapshot | Solver |
|---|---|---|
| **Update latency** | Updates are serialized through a merge queue; in practice nixpkgs is fast, helped by update bots | Maintainers push directly to registries with no central bottleneck |
| **Permissions** | Merge rights on a monorepo are coarser-grained, though CODEOWNERS and large committer bases mitigate this | Per-package repository ownership gives natural isolation |
| **Tooling** | Override expressiveness is strong (the Nix language) but the rebuild cost is steep | Solver performance keeps improving (`mamba` vs `conda`); lock file workflows are getting seamless (`pixi`, `uv`) |
| **Error handling** | Build failures surface at integration time, during snapshot updates | Resolution failures surface at install time, and cryptic conflict errors are an active area of improvement |

The accidental problems are shrinking on both sides. The intrinsic ones
reflect the architectural bet: the snapshot model decides that the maintainer
should pay the cost of finding a consistent set upfront; the solver model
decides the user should pay it on demand. Neither is wrong — it's about who
in your community is better positioned to carry that cost.

## Further Reading

- [Nix and Conda: Part 1 — History and Design Philosophy](/posts/2026-06-15-conda-nix-1-design-philosophy/)
- [Stackage design choices: making Haskell curated package sets](https://www.snoyman.com/blog/2017/01/stackage-design-choices/) — Michael Snoyman
- [Thoughts on PureScript package management in 2019](https://harry.garrood.me/blog/purescript-package-management-in-2019/) — Harry Garrood
- [Semantic versioning for Nix — FlakeHub](https://docs.determinate.systems/flakehub/concepts/semver/)
- [Cargo's dependency resolver documentation](https://doc.rust-lang.org/cargo/reference/resolver.html)
- [Software Identification Ecosystem Option Analysis](https://www.cisa.gov/sites/default/files/2023-10/Software-Identification-Ecosystem-Option-Analysis-508c.pdf) — CISA, 2023
- [Nixing technological lock-in](https://economicsfromthetopdown.com/2024/02/17/nixing-technological-lock-in/) — Blair Fix
