---
title: "Modeling a Software Consultancy"
labels:
  - software consultancy
  - business
description: |
    I am currently reading the book business dynamics and I thought I'd try to model a software consultancy with the systems thinking approach that is described in it.
---

## Some basic information

- Our time granularity will be on the order of months here. Significant delays will only be indicated if they go above that.
- granularity of causal chains will be decided on the fly. The purpose of this model is to show the interaction of different feedback loops more than details about each one of them.
- we are running open modelica with the command `nix-shell -I nixpkgs=channel:nixos-21.11 -p openmodelica.combined --command "OMEdit"`

## The basic work loop

The first loop we will talk about is the basic work loop.
Here is a graphical representation of it:

```text
┌──────────────────┐  (+)  ┌──────────────────┐  (+)  ┌──────────────────┐
│   Inbound        │──────▶│   Opportunity     │──────▶│  Closed Deal     │
│   Demand         │       │   Rate            │       │  Rate            │
└────────▲─────────┘       └───────────────────┘       └────────┬─────────┘
         │                                                      │
         │                                               [delay]│  (+)
         │                                                      ▼
         │                                          ┌───────────────────────┐
         │                                          │  Accomplished         │
         │                                          │  Project Rate         │
         │                                          └───────────┬───────────┘
         │                                                      │
         │                                                  (+) │
         │                                                      ▼
         └──────────────────────────────────────────────────────────┐
                                    (+)                ┌────────────┴───────────┐
                                                       │  Customer              │
                                                       │  Satisfaction          │
                                                       └────────────────────────┘
```

We can translate this loop to modelica fairly easily:

```
```


## Adding finances

```text
                     ┌───────────────┐
      (+)            │  Team Size    │             (+)
    ┌────────────────┤               ├──────────────────┐
    │                └───────────────┘                  │
    ▼                                                   ▼
┌───────────────┐                             ┌───────────────┐
│ Team          │                             │               │
│ Availability  │                             │    Cost       │
└───────┬───────┘                             └───────┬───────┘
        │                                             │
  (+)   │                                      (-)    │
        ▼                                             ▼
┌──────────────┐         (+)            ┌────────────────┐
│ Closed Deal  ├───────────────────────▶│   Revenue      │
│ Rate         │                        └───────┬────────┘
└──────┬───────┘                                │
       │                                 (+)    │
       │                                        ▼
       │ [delay](+)                    ┌────────────────┐
       ▼                               │   Profit       │
┌──────────────────┐                   └────────────────┘
│ Accomplished     │
│ Project Rate     │
└────────┬─────────┘
         │
   (+)   │
         ▼
┌──────────────────┐         (+)         ┌──────────────────┐
│ Customer         ├────────────────────▶│ Inbound          │
│ Satisfaction     │                     │ Demand           │
└──────────────────┘                     └────────┬─────────┘
                                                  │
                                           (+)    │
                                                  ▼
                                         ┌──────────────────┐
                                         │ Opportunity      │
                                         │ Rate             │
                                         └──────────────────┘
```

# The full picture

```text
                           ┌─────────────────────┐
                           │                     │
                           │   Inbound Demand    │◀─────────┐
                           │                     │          │
                           └──────────┬──────────┘          │
                                      │ (+)                 │
                                      ▼                     │ (+)
                           ┌─────────────────────┐          │
                           │                     │    ┌─────┴──────────┐
                    ┌──────│  Project Offerings  │    │  Reputation    │
                    │      │                     │    │                │
                    │      └──────────┬──────────┘    └────────────────┘
                    │                 │                        ▲
          (+)       │        (+)      │        (+)             │
   ┌────────────────┴──┐    ┌────────┴──────────┐             │ (+)
   │  Bench Engineers  │    │  Hiring Target    │      ┌──────┴───────────┐
   └────────────────┬──┘    └────────┬──────────┘      │ Customer         │
                    │                │                  │ Satisfaction     │
        (+)        │        (+)     │     (-)          └──────────────────┘
   ┌────────────────┴──┐    ┌───────┴───────┐                   ▲
   │  Hiring Number    │    │Hiring Quality │                   │ (+)
   └────────┬──────────┘    └───────┬───────┘                   │
            │                       │                   ┌───────┴──────────┐
      (+)   │                (+)    │                   │  Team Quality    │
   ┌────────┴─────┐          ┌──────┴───────┐           └───────┬──────────┘
   │ Candidate    │          │   Salary     │                   │
   │ Number       │          └──────┬───────┘           (+)     │    (+)
   └────────┬─────┘                 │              ┌────────────┴──────┐
            │                (+)    │              │  Accomplished     │
      (+)   │              ┌────────┴───┐          │  Project Rate     │
   ┌────────┴─────┐        │   Price     │          └────────┬─────────┘
   │ Candidate    │        └─────────────┘                   │
   │ Quality      │                               (+)       │      (+)
   └──────┬───────┘                      ┌───────────────────┴───────┐
          │                              │                           │
    (+)   │                              ▼                           ▼
          │                     ┌──────────────────┐     ┌──────────────────┐
          │                     │ Accomplished     │     │   Failed         │
          │                     │ Projects         │     │   Projects       │
          │                     └────────┬─────────┘     └────────┬─────────┘
          │                              │                        │
          │                              │ (+)             (-)    │
          │                              └───────────┐   ┌────────┘
          │                                          │   │
          │                              ┌───────────┴───┴───────────┐
          └──────────────────────────────┤          Reputation        │
                                  (+)    └──▲───────────────▲────────┘
                                            │               │
                                            │               │ (+)
                                    [delay] │               │
                                            │    ┌──────────┴────────┐
                                   ┌────────┴────┴─────────┐         │
                                   │ Open Source            │         │
                                   │ Contributions          │─────────┘
                                   └────────────────────────┘    (+)

                          (+) = reinforcing    (-) = balancing
```
