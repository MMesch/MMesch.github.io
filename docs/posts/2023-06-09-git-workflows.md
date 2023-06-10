---
title: "Git workflows"
labels:
  - thoughts
description: |
    Thoughts about different Git workflows and associated tooling. Distributed, collaborative development faces the same coordination and synchronization challenges as any distributed system.
---


A variety of workflows exist with which teams can use Git.
Atlassian has a nice overview [on their blog](https://www.atlassian.com/git/tutorials/comparing-workflows#:~:text=A%20Git%20workflow%20is%20a,in%20how%20users%20manage%20changes.).
The general challenge that all these workflows are facing is—similar to any distributed system—synchronization.

Whereas a single developer can, in principle, just work on a single main branch, this becomes untenable as soon as several developers are working on features with potentially conflicting changes. I found the following named workflows, spanning a range of possibilities:

- no-branching: everyone pushes to "main" directly;
- short-lived-branching: keep branches as short-lived as possible. Don't wait until a feature has been finished to push required changes to the main branch.
- complete-branching: work on separate branch until a feature has been fully implemented and tested;
- multi-branching: in addition to feature branches, add release, hotfix and develop branches and define a synchronization flow between them;

Roughly, they are sorted by the amount of divergence and variation of the current versions that are allowed in the system.
Two main characteristics we would like to optimize for is to stay maximally synchronized, and to protect the main branch from erroneous or unrequired changes.
Both characteristics are in a tension too each other:

- short lived branches lower desynchronization and thus the work required to handle merges. However, unnecessary changes may be merged that need to be reverted later.
- long lived branches allow pushing the quality of changes up before merging. However, significant desynchronization may occur while doing this and additional work is required for merges.

The additional work caused by descynchronization should not be underestimated.
It can increase implementation time by factors, cause additional quality issues and sometimes make merges impossible.

Choosing whether to lean more to one or to the other is a question of tooling and team maturity: more mature and advanced teams should probably opt to lean to short-lived branches and reduce synchronization, whereas teams that have quality issues or higher requirements may want to lean towards longer lived feature branches. A well-configured CI/CD that handles quality requirements automatically and reliably on the main branch makes it more easily possible to opt for short-lived branches as well.

Additional constraints may also play a role, for example, if features are paid for by external customers it's easier to define acceptance criteria and measure time etc if they are developed from a static base version, even though this ultimately may cause a loss in speed.
