---
title: "Team Topologies - a book review"
labels:
  - book review
  - team organization
description: |
  I read through the book Team Topologies by Matthew Skelton and Manuel Pais. It is about how team structures affect software organizations. Here are a few thoughts about it.
---


Team Topologies is about a conceptual model for software teams and how they interact—a great idea if you ask me. Everyone has an opinion about how to setup and structure teams but few have a coherent model that is easy to communicate and adapt to different situations. That's why I decided to read it.

## A conceptual model for software teams and their interactions

Behind the book is a simple but powerful idea: A software-driven organization is a socio-technical system where social organization and software architecture are deeply intermingled. Teams, not software architecture, is the fundamental unit that one should think about when setting up an organization. In fact, the team structure of an organization will _determine_ the software architecture: Naturally, teams will set up software components in a way that corresponds to their capacity, with interfaces to other software components owned by teams they interact with most. This old observation, called [Conways law](https://en.wikipedia.org/wiki/Conway%27s_law), assumes that social constraints are stronger and more important than software requirements. A whole lot of implications follow from this: E.g. whoever designs the org-chart of an organization also designs the software, and that person should better have some knowledge about the technical implications of this.

Team Topologies also believes that _teams_, not individuals, are the right unit for humans to work efficiently together. This is based on believes about human psychology, where people organize naturally in small trusted units, ideally of around 5 people (see [Dunbar's number](https://en.wikipedia.org/wiki/Dunbar%27s_number)).

Instead of splitting software into components based on pure software arguments, one should therefore ask what appropriate components can be handled by which type of team.

But main part, and really the _new_ contribution of Team Topologies, is to introduce a conceptual model that allows to reason about teams. In this model, the basic team type in a value-producing organization is called “stream-aligned” team. These teams are optimized for rapid end-to-end delivery (“fast flow”) of something that the organization produces. Any team hand-overs in these business-relevant delivery processes, considered extremely costly for multiple reasons, are to be avoided. Team Topologies advises thus strongly against having separate Development and Operations teams for software, and advocates generalist teams that can handle the whole process end-to-end, including even product design. Other team types exist only to support the stream aligned teams, reducing their cognitive load by providing a X-as-a-service platform (“platform team”), working together with them to speed up learning of new techniques (“enabling team”), or helping out with particularly complex components (“complex component team”). Team interactions in this model resemble the team types. Facilitation is mostly used by enabling teams, X-as-a-service by platform teams, and close collaboration, for short times because it is costly, by all to tackle specific problems.

One consequence of this idea is that building working software solutions really means shaping the social structures behind. Team Topologies goes to great lengths how this can be done—even advocating to relocate teams to different buildings so that they would interact less resulting in better separation of concerns and a cleaner API in the software they are building together. There are many similar ideas in Team Topologies all based on the fundamental idea behind Conway's law.

## Some critique

The book was written decently well although not great. There was a lot of unnecessary repetition, sometimes with overly structured summary sections and too many headers breaking the text into lots of small subsections. Another thing that annoyed me was typical marketing and business lingo where everything gets “enabled”. Illustrations how this method was applied in various companies were nice to make things more concrete but the exclusively positive way—everything was bad before and great after—that they were written in made me a bit sceptical. Together with the sometimes almost authoritative style of knowing the truth, it felt a bit like someone wanting to sell you something here—a pity because I do believe that especially the fundamental ideas in the book are genuinely useful. Every model is a simplification of the truth and us such there are usually situations where it applies less well. Discussing the downsides and problematic situations would have been useful.

The conceptual model that Team Topologies introduces feels to me like a good start but not the end of it. I think putting stream-aligned teams in the focus is a good idea, but the other team types, and how they interact, seemed sometimes a bit ad-hoc with other setups possible as well. But then, it feels it's better to have _any_ conceptual model of something than none, even if it is not perfect, as long as it's understood that a model is not the ultimate truth.

## Conclusions

Team Topologies was the first book I read about this topic and it's ideas, especially the team-first approach and a little less the conceptual model, resonated with me. I think it's a good read therefore, but I am sure a better book could be written about this subject-or maybe it already exists and I just didn't hear about it.
