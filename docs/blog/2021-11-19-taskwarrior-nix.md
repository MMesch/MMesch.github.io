---
title: "My Nix Taskwarrior Configuration"
labels:
  - Nix
  - task management
  - little trick
description: "This is a quick post about my battle tested task management setup that handled thousands of tasks by now after about two years. I had to seriously ramp up my personal organization while moving into positions with more responsibility at work and without a super efficient and fast task management system it wouldn't have been possible to succeed."
---

## The user perspective

Before describing the technical setup, here is an example how I use my task management system. If I have a meeting

## Features

This is mostly about _reducing_ features. We want a minimal set so that we can speed up time and reduce any extra thought to get a minimal and efficient system instead of a complex one.

- command line interface
- tasks, should come with tags, a note file and opening date
- no prioritization, all tasks are the same. Essentially I use the task system only as a must-do list. Nice-to-have's go somewhere else or under a special "idea" tag.
- tasks are done after concrete outcome. Notes vanish once a task is done.

## The technical perspective 

Let's start with a basic overview of the components that make up this system. Over time I developed this technical setup:

- [taskwarrior](https://taskwarrior.org/) maintains a database of tasks. Taskwarrior provides a bunch of nice features and utilities but I only use very few of them. For my purpose I store tasks via the command line interface with a one line description, attached labels, a unique id and a status field that says whether the task is done or not.
- [hasknote](https://github.com/robwhitaker/hasknote) adds note-taking functionality to taskwarrior. It's a very simple but useful tool that opens neovim to edit a markdown note that is stored under the unique id of the task in some folder.
- To rapidly take notes in neovim, I use the plugin `coc-snippets` and maintain a database of templates for different opportunities such as a default meeting template, one for requirement gathering and so on.
- I then added a set of bash aliases and functions that wrap the usual `taskwarrior` commands with even shorter key combinations.
- Finally a custom `.taskrc` file specifies reports such as `today` or `week` that automatically filter and sort tasks that I have done over the respective period.

This setup might seem brittle. All those custom files and commands put together, `hasknote` not being very actively maintained and so on. The secret sauce here is **Nix**, and anyone who has experience using it might understand that this can nevertheless be very stable, with all dependencies pinned to specific versions. I thus have only very minor update anxiety.

## What is unsolved

Right now, there is no simple way for prioritization. I'd like to simply have an ordered list and a super quick method of moving tasks up or down (e.g. with arrow keys). Taskwarrior provides basically two ways of prioritization, due dates and special tags (`priority:H/M/L` and `next`), from which priority is automatically computed. I found this cumbersome from the user perspective.

## Alternatives

Components

- I have considered the zettelkasten system for note taking, e.g. exchanging hasknote with [neuron](https://neuron.zettel.page/). The upside would be that notes could be cross-linked, however, I kind of like that notes that are taken while working through tasks can _not_ be easily reused. Notes are something like an ephemeral cache for me that I use to help thinking or store data over a medium period of time. If I really want to _do_ something with this information, I would typically share or publish it - or put it into a separate permanent Zettelkasten system that is well maintained and curated.
- I have considered exchanging the database component that is currently handled by `taskwarrior` with [visidata](https://www.visidata.org/) or [tasklite](https://tasklite.org/). However, several things made me move back: (a) visidata had some small bugs, tasklite had a slightly more difficult interface for adding tasks.
