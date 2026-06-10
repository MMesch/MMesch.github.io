---
title: "3 Ways For Dealing with CSV in Haskell"
labels:
  - thoughts
description: |
    This post outlines 3 different ways for dealing with CSV data in Haskell.
---

Reading CSV in Haskell is a notorious pain for newcomers used to the simplicity
of Python. I am using Haskell now for a few years now for simple data analysis
workflows and have converged to the following:

# Nix as entrypoint

```
```

# Level 0, List of Lists


- pros
  - most basic approach

- cos
  - no heterogeneous field types
  - no automatic parsing
  - no CSV standards (quotation)
  - no enforcement of list length

# Level 1, Cassava and Vector of Vectors

- pros
  - no heterogeneous field types
  - correct lengths are enforced
  - fast
  - no upfront information on columns required
  - standard data types

# Level 2, Cassava and Named Records

- pros
  - heterogeneous field types
  - automatic parsing
  - csv standards
  - type-level protection against changes in/wrong columns etc

- cons
  - no flexibility on input data schema
  - records in Haskell are static/difficult to wrangle, e.g. no new records can easily be derived
    from the existing ones.

# Level 3, Frames and extensible Vinyl Records

- pros
  - heterogeneous field types
  - automatic parsing
  - csv standards
  - type level protection
  - flexible records, new records can be derived, etc

- cons
  - non-standard record type
  - sometimes difficult type-level errors etc
  - polymorphic operations on heterogeneous records are not easy, class constraints etc
  - need info upfront about what is in the csv file
