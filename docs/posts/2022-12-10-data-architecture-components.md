---
title: "A Summary of Big Data Platform Components"
labels:
  - thoughts
description: |
    This post goes through product categories of large data analysis platforms.
---


Data engineering in 2022 often involves stitching various semi-open products together. There are a few maps of data products out there such as [this](http://mattturck.wpenginepowered.com/wp-content/uploads/2021/12/2021-MAD-Landscape-v3.pdf) one that summarize what is available. The huge amount of products with more or less telling names is oppressing. To architect something it thus makes more sense to start with the product _categories_. In this post I want to quickly go through the categories outlined in the above linked map called below the Matturck Map.

From data to insight, this catchphrase does describe relatively well what most data platforms are about. Maybe seeing insight in the wider, not human-exclusive sense. Data is a symbolic representation of some real world facts. These facts are processed, transformed until they can help us update models of the world, typically abstractions on a much higher level than data that allow to then make decisions. A data platform thus consists of the two endpoints, low level data and high level models, as well as all pipelines and transformations that connect the two.

To start we thus need a **data storage** component. This is the medium on which the data, a symbolic representation of reality, lives. The Matturck Map spells out a few categories here:

- storage
- hadoop for a large distributed file system
- data lakes for a schema-on-read storage
- data warehouses for a schema-on-write storage
- streaming/in-memory
- RDBMS
- NoSQL Databases
- New SQL Databases
- Real Time Databases
- Graph Databases
- MPP Databases

We then move to data processing:

- ETL/ELT/Data Transformation
- Reverse ETL

Data Integration

https://hackernoon.com/the-ai-hierarchy-of-needs-18f111fcc007

