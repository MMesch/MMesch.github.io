---
title: "Reading Team Topologies"
labels:
  - book review
  - team organization
description: |
  I read through the book Team Topologies by Matthew Skelton and Manuel Pais. These are my  notes.
---

## Chapter 1: Communication channels vs org charts

I took out communication structures as a key parameter that describes how an organization functions much better than the official org chart. There is communication for different purposes and some of it happens along vertical hierarchical lines for legal/compliance reasons. But most of what is important to create value happens horizontally, within teams or across teams.

An organization should be seen as a complex system that adapts itself to challenges and goals. Top-down shaping and big reorganization can be harmful.

Conway's law describes that team structure influences software structure. To get good results, both have to be shaped together, taking into account teams and it's limitations such as cognitive load.

## Chapter 2: Conways law

chapter2: Style seems a bit repetitive, not super dense.

Communication paths restrict or encourage certain designs. Use this to your advantage (reverse Conway manoeuvre)!

Danger: no stable teams, all changes are made via temporary projects and outsourced teams. => applications become deeply coupled at the database level with shared data and procedures (why that?). This impeded adoption of commodity systems for other parts of the business. Accruing technical debt like this blocks organization to evolve faster.

Conways law is actually something that is really natural in other projects: model teams by task and not the other way around assign tasks to teams. "Team assignments are the first draft of the architecture" (Michael Nygard)

"design flows on top of a platform instead of a series of interconnected components".

"keep things team-sized to achieve an architecture for participation"

"Architecture should be an enabler. Team-first approach informed by Conway's law"

"if managers decide which teams build which architecture, managers are the software architects". Shape, responsibilities and boundaries of teams should be determined by technical leaders.

Organization design and software design are two sides of the same medal and need to be undertaken by the same informed group of people.

Not all communication and collaboration is good. Team interfaces should be set. More communication is not always better. Even moving teams to different offices, floors, buildings (channels?) can be beneficial.

Highly entangled team communication leads to highly entangled software.

Danger: common pitfall is to design complex component teams although the teams are really fast-flow teams.

Tools drive communication paths and are therefore crucial to shape software architecture as well.

Reorganizations for management reasons should be a thing of the past.

## Chapter 3: Team-first thinking

The team, not an individual should be considered the smallest unit of delivery in an organization.

Trust is hugely important for a team to work efficiently. There are natural limits to how many people we can trust. Therefore small teams are needed to be efficient.

Good numbers are: a team with 5 (low trust) - 8 (15 in high trust) people, a tribe with up to fifty, a division groupings of 150 (low trust org) - 500 (high trust org) people.

"Scaling by Dunbar" means splitting out groupings.

Team-first software architecture is driven by Dunbar's number.

Teams take time to form. From two weeks to three months or more to become a cohesive unit. Stability is needed to reach the state of cohesion.

Team duration. 9 months (high trust) - 18 months (low trust).

Tuckman model for teams: forming, storming (work through initial differences), norming (evolving standard ways of working together), performing (reaching state of high effectiveness). In real life these phases happen continuously.

Team should own the software: team ownership brings continuity of care that modern systems need to retain operability. It shouldn't be owned by several teams.

Team-first mindset for team members.

Reward the whole team not individuals.

Boundaries minimize cognitive load by, (a) restricting responsibilities too match CL (b) impeding software systems to grow beyond the CL of a team (c) reduce intrinsic CL through training, choice of tech, hiring, pair programming, can reduce intrinsic (d) eliminate external CL (e) limit the number of domains for each team to reduce context switching

Germaine CL is what is used to actually think about adding value.

Measure cognitive load: "do you feel like you are able to respond in a timely fashion to the work you are asked to do?"

Domains: simple (clear path to action, max 2-3), complex (lots of discovery) not more than one not even simple to avoid solving only the simple problems.

Management style: "Eyes on, hands off"

## Chapter 4: Static Team Topologies

Anti patterns:

- ad-hoc team design forced by splitting big team, or due to a crash at some point (e.g. database team).
- shuffling team members, extremely volatile teams assembled uniquely on project basis disassembled directly afterwards leaving one or two engineers behind. The cost of reassembling teams is overlooked while the additional flexibility is much more visible.

Teams in companies that run and build software should optimize teams to handle the flow from concept to running system. Not for isolated parts. Older systems have silos with vertical separation.

Spotify model:

5-9 ppl squads with mixed skills with a long term mission each. Squads in similar area are collected in tribes. Engineers within a tribe with similar skills,competencies and orientation share practices through a chapter (e.g. all testers together). Line management happens via chapters by an engineer who is participating in the day-to-day work (chapter lead). Then there are diffuse "guilds", communities of practice that include people from multiple tribes, chapters and squads. Chapters and guilds are the glue that keeps the company together without sacrificing autonomy of the squads that are setup for fast delivery.

Linear step-wise sequence is bad bc teams aren't exposed to the live running software systems - they have bad forward sensing. That's why you need cross-functional teams to basically have one full feedback loop in a single team.

devops teams are exactly taking away the boundary between dev and ops, a classic anti pattern from 2009.

One of the biggest factors for team success is not the team alone with its skills but how it fits into the environment.

A feature team can take a customer facing feature all the way from idea to production, making them available and ideally monitor usage and performance. This can be a pattern or antipattern depending on the situation. Needs to be absolutely independent of other teams.

multi-component teams make their own changes on independent components and synchronize into single release.

feature team touches many different code bases and therefore might "destroy" code along the way if they aren't mature-enough engineers. Technical debt can increase and slow down delivery more and more. Lack of ownership over shared code may result in this.

Ericsson model: feature teams working on independent subsystems that integrate into something bigger. Someone has to keep oversight of the system as a whole and see that systems integrate well. Roles such as system architect, system owner, integration lead were created. These people work across the whole organization as communication conduits and interact with all feature teams.

Product teams are identical to feature teams but building only one big thing. They might still be dependent on external help but this should be non-blocking (!). The reason is that it is very difficult to coordinate multiple software teams since software is a high uncertainty task. We thus want non-blocking dependencies. This could be other teams providing self-service capabilities to them.

E.g. at Microsoft, teams can automatically get infrastructure through their own internal Azure platform. A cloud infrastructure team should focus on such solutions. It could be as simple as designing the cloud infrastructure process instead of provisioning the machines themselves.

SRE, pioneered by Google is and approach to ops and improvement. SRE is focused on "error budget" which defines the acceptable downtime. They can also push back on poor software. Service Level Objectives are balancing speed of features with work that is needed to make them reliable.

Cultural and technical maturity plays a role which team topologies work well. Bringing in experienced team _can_ help but it can also just create another silo of knowledge.

small, mature -> end-to-end ownership teams with regular collaboration
large, mature -> end-to-end teams + reliability teams
small, immature -> specialized teams with strong collaboration
large, immature -> specialized teams with "X as a service" platforms

detect and track dependencies between teams is important.

dependency tracking: knowledge, task, resource

## The Four Team Topologies

Reduce teams to 4 basic setups: stream-aligned team, enabling team, complicated-subsystem team, platform team. The idea is to compose everything with these 4 teams, in addition adding clear software and team interaction boundaries.

Reducing to just these 4 team types removes a lot of ambiguity in terms of responsibilities.Reduced role ambiguity is a key indicator for organizational success.

Stream-aligned teams have clarity of purpose to treat one specific, valuable work stream that is aligned to a business domain or organizational capability. This might be a single product or service, a single set of features, a single user journey, or a single user persona. The team is empowered to deliver customer or user value as quickly, safely and independently as possible without hand-offs to other teams. This is the primary type in an organization and the other fundamental teams are there to reduce the burden on stream-aligned teams. Enabling teams give them specific capabilities, doing research and trials. Platform teams reduce the cognitive load of stream-aligned teams by giving them capacities to offload work. Stream-aligned teams work closely to the customer and should be able to quickly incorporate feedback from them while monitoring their software in production. They can react to system problems in near real-time. Stream-aligned teams are funded in a long-term way, not project-wise. Flow of work should be clear, steady and expectable. Traditionally the opposite approach is taken: when a project comes in a number of teams gets involved to work on it (dev, ops, devops, ...). A stream aligned team should have full capacities including security, metrics, QA, UX, commercial and viability. Not all capabilities map to individuals. The team simply needs to be able to understand and act on the capabilities, e.g. with a mix of generalists and specialists. Flow is better than product or feature team.


