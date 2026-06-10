---
title: "A comparison of modern data query engines"
labels:
  - thoughts
description: |
    A comparison of Apache Hudi, Iceberg and Delta lake
---


- cloud data lakes distributed file stores, evolution of Hadoop/HDFS, modern standard
- open source data lake technologies are technologies on top
- simplify management of large distributed data lakes, organize and maintain data in a systematic way (schemas, how do these look like?)
- simplify ingestion, storage and querying of data
- transactional writes [ACID] (How is this done?)
- schema evolution
- versioning (how?)
- data quality
- query optimization (indexing, partitioning, statistics management, data pruning)
- ecosystem integration (Spark, Hive, Flink)


# Apache Hudi (Hadoop Upserts Deletes and Incrementals)

- unique features: efficient and scalable update/inserts (upserts) and incremental data processing in data lakes (What does this mean?)
- write-optimized file format called "Copy on Write" (CoW) for efficient data ingestion and fast updates.
- built-in data change capture for real-time processing of changes
→ Good for stream processing (see blog post)
- Community: diverse community under Apache Software Foundation
- Use cases: frequent updates, incremental data processing, real-time analytics. Data capture, slowly changing dimensions and near-real-time analytics pipelines.

Industry use cases:

- E-commerce: real-time inventory management systems with efficient updates and queries
- Financial Services: real-time fraud detection
- IoT: high-velocity data streams from devices

Example:

- spin up local, single-node hadoop cluster
# Apache Iceberg

- unique features: unified table format for large-scale data lakes supporting batch and streaming.
- concept of time travel to query at different points in time
- fine-grained metadata mangement, schema evolution support and transactional consistency
- Iceberg comes from Netflix and is now part of ASF
- optimized for data versioning, schema evolution and query performanmce. Data lakes that require strong consistency, batch and streaming and evolution of schemas over time.

Industry use cases:

- Media/Entertainment: storing and querying large volumns of media files, with efficient versioning and time-travel capacities
- Financial Analytics: reliable and consistent data access accross time periods for historical analysis and auditing purposes
- Healthcare: data versioning and schema evolution for medical records, research datasets and healthcare analytics

# Delta lake

- features open source storage layer with ACID capacities for Spark and other engines.
- transaction log that records all data modifications, strong consistency and fault tolerance. Schema enforcement, data deduplication and automatic file optimization for better query performance.
- comes from Databricks, company behind Spark, now under Linux Foundation.
- optimized use case: transactional guarantees, reliability and data quality, machine learning pipelines and schenarios where data integrity is crucial.

Industry use cases:

- Generic data engineering: building robust and scalable pipelines with data integrity and quality checks
- machine learning: storage layer for machine learning pipelines with transactional capacities
- fintech: auditable data processing


