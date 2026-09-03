# Module 8: Processing Your Database Operations

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Table Design](#2-table-design)
3. [Table Operations](#3-table-operations)
4. [Loading Items](#4-loading-items)
5. [Reading Items](#5-reading-items)
6. [Updating and Deleting Items](#6-updating-and-deleting-items)
7. [Higher-Level Interfaces](#7-higher-level-interfaces)
8. [DynamoDB Caching](#8-dynamodb-caching)
9. [Changes from the Courseware](#9-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 9](#9-changes-from-the-courseware) for what changed and how.
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Develop programs that interact with Amazon DynamoDB using the AWS SDKs
- Perform CRUD operations to access tables, indexes, and data
- Describe developer best practices when accessing DynamoDB
- Review DynamoDB caching options that improve performance

### Where This Module Sits

| Item | Content |
|---|---|
| Module 7 | Getting started with databases — Amazon DynamoDB core concepts |
| **Module 8** | **Processing your database operations** — Table design, control plane and data plane operations, higher-level interfaces, DynamoDB caching |
| Lab 3 | Developing a solution with Amazon DynamoDB |

### What This Module Covers

The courseware divides the table lifecycle into four steps. This document follows the same order.

| Step | Content | In this document |
|---|---|---|
| Step 1 Plan | Identify access patterns, design partition keys and indexes, choose initial throughput | [Section 2](#2-table-design) |
| Step 2 Create table | Create / Update / List / Delete | [Section 3](#3-table-operations) |
| Step 3 Load data | Single item (`PutItem`), batch operations (`BatchWriteItem`) | [Section 4](#4-loading-items) |
| Step 4 Process data | Read (`Query`, `Scan`), update, delete, higher-level interfaces | [Section 5](#5-reading-items) · [Section 6](#6-updating-and-deleting-items) · [Section 7](#7-higher-level-interfaces) |

The example application works with a `Notes` table. The partition key is `UserId`, the sort key is `NoteId`, and non-key attributes such as `Notes` and `Favorite` are attached.

### 1.1 Control Plane and Data Plane Operations 🆕

Control plane operations let you create and manage DynamoDB tables, and also work with indexes, streams, and other objects that depend on tables. Data plane operations let you perform CRUD actions on table data, and some data plane operations also let you read data from a secondary index.

| Category | Operations |
|---|---|
| Control plane | `CreateTable`, `DescribeTable`, `ListTables`, `UpdateTable`, `DeleteTable` |
| Data plane — classic APIs | Create: `PutItem`, `BatchWriteItem` (up to 25) / Read: `GetItem`, `BatchGetItem` (up to 100), `Query`, `Scan` / Update: `UpdateItem` / Delete: `DeleteItem`, `BatchWriteItem` |
| Data plane — PartiQL 🆕 | `ExecuteStatement`, `BatchExecuteStatement` |
| Transactions 🆕 | `TransactWriteItems`, `TransactGetItems`, `ExecuteTransaction` (PartiQL) |
| DynamoDB Streams | `ListStreams`, `DescribeStream`, `GetShardIterator`, `GetRecords` |

The list of five control plane operations on courseware slide 4 matches the current documentation. What changed is the breadth of the data plane. The courseware presents only the classic APIs, whereas current documentation states that the same CRUD work can be done **with PartiQL** and that **transactions** exist as a separate category. PartiQL and transactions are covered in [Section 7.5](#75-two-interfaces-not-in-the-courseware-partiql-and-transactions).

> — Source: [DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.API.html)

---

## 2. Table Design

### 2.1 Table Design Starts with Planning

Table design starts with planning. You ask questions that help you understand the application's needs, and then you design a database that can load and use the data efficiently.

### 2.2 Key NoSQL Design Concepts

DynamoDB is a NoSQL database. Developers do not begin the process by defining a schema. Instead they begin by identifying the questions that must be answered, and they first confirm the application's access patterns for the operations that must be supported.

The three properties the courseware presents (**size, shape, and velocity**) are as follows.

| Property | Content |
|---|---|
| Data size | Knowing how much data is stored and requested at one time helps you decide the most effective way to partition the data |
| Data shape | Unlike an RDBMS, a NoSQL database does not reshape data when processing a query. Instead it organizes data so that the shape inside the database matches the data being queried. Data shape is a key factor in increased speed and scalability |
| Data velocity | DynamoDB scales by increasing the number of physical partitions available to process queries and distributing data efficiently across those partitions. Knowing the peak query load in advance helps you decide how to partition data to make the most of read and write capacity |

Developers **should not start creating tables until all access patterns are identified.** Understanding how the data is accessed is the key to table design.

Three common queries for the Notes application:

- List all notes for a specific user
- Get a specific note for a specific user
- List notes flagged as favorites across all users

### 2.3 Partition Key Design 🆕

The primary key uniquely identifies each item in a DynamoDB table. DynamoDB supports two kinds of primary keys.

| Type | Content |
|---|---|
| Partition key (simple primary key) | Composed of one attribute. Also called a **hash attribute**. DynamoDB uses the partition key value as input to an internal hash function to determine the partition where the item is stored. In a table that has only a partition key, no two items can have the same partition key value |
| Partition key + sort key (composite primary key) | Composed of two attributes. The sort key is also called a **range attribute**. Items with the same partition key value are stored together in sorted order by sort key value. Multiple items can share a partition key value, but their sort key values must differ |

🆕 A constraint the courseware does not cover: **each primary key attribute must be a scalar, and the only data types allowed are string, number, and binary.** Non-key attributes have no such restriction. Other than the primary key, the table is schemaless, and nested attributes are supported up to 32 levels deep.

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

Key selection criteria (courseware slide 8): common access patterns / high cardinality / values representative of the application.

The courseware's two designs for the same data:

| Design | Partition key | Sort key | "Get all notes for StudentC" |
|---|---|---|---|
| Table 1 | `NoteId` | none | A full table **scan**. Unique, but does not support the access pattern and is potentially expensive |
| Table 2 | `UserId` | `NoteId` | An efficient **query** over the same data |

Design the partition key around **common access patterns** and the **uniqueness (high cardinality)** of partition key values across items in the table.

### 2.4 Index Design and Secondary Index Quotas 🆕

The four principles on courseware slide 9:

| Principle | Content |
|---|---|
| Use secondary indexes | They enable a wider variety of queries than the base table can support, and those queries are still fast and relatively inexpensive |
| Keep related data together | Considered the most important factor in ensuring timely responses to queries |
| Use sort order | When the core design requires items to be sorted together, grouping related items lets you query them efficiently |
| Distribute queries | If a high volume of queries concentrates on one part of the database, you can exceed I/O capacity. Design data keys so that traffic spreads across many partitions and hot spots are avoided |

🆕 The courseware covers secondary indexes but **does not state the difference between the two kinds or the per-table count quotas.**

| Item | Global secondary index (GSI) | Local secondary index (LSI) |
|---|---|---|
| Partition key | **Can differ** from the table's | **Must match** the table's |
| Sort key | Can differ from the table's | Must differ from the table's |
| Primary key value uniqueness | Not required to be unique | — |
| Count per table | **Default quota of 20** (adjustable) | **Maximum of 5** |
| Read consistency | **Eventually consistent only** | Strongly consistent supported |
| Size limit | No constraint | **10 GB** per partition key value |

Projected attributes have a quota too. User-specified projected attributes are limited to **100 combined** across all of a table's LSIs and GSIs, and this quota applies only when `ProjectionType` is `INCLUDE`, not for `KEYS_ONLY` or `ALL`.

> — Source: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

### 2.5 Choosing Initial Throughput 🔄

Inputs to consider when choosing a table's initial throughput (courseware slide 10): item size / expected table read and write rates / read consistency requirements.

#### Capacity Unit Calculation 🔄

The courseware states that "a query returning a single response item of 2 KB is charged **1 RCU** for this operation. If the same table were used for a write operation, the table would be charged **2 WCU**." The write side is correct, but the read side **omits the read consistency model.**

| Read type | One item up to 4 KB |
|---|---|
| Strongly consistent read | **1 RCU** |
| Eventually consistent read (the **default** for `GetItem`, `Query`, `Scan`) | **0.5 RCU** |
| Transactional read | **2 RCU** |

| Write type | One item up to 1 KB |
|---|---|
| Standard write | **1 WCU** |
| Transactional write | **2 WCU** |

- Item sizes for reads are **rounded up to the next 4 KB multiple**. Reading a 3,500-byte item consumes the same throughput as reading a 4 KB item.
- Item sizes for writes are **rounded up to the next 1 KB multiple**. Writing a 500-byte item is the same as writing a 1 KB item.
- So reading one 2 KB item costs 1 RCU with a strongly consistent read and **0.5 RCU with the default eventually consistent read**. A 2 KB write costs 2 WCU, matching the courseware.
- 🆕 **Read throughput is consumed even when you read an item that does not exist.** For `Query` and `Scan`, you are still charged additional read throughput based on read consistency and the number of partitions searched, even if no data exists.

> — Source: [DynamoDB read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html)

#### Capacity Modes 🔄

The courseware presents provisioned mode first and describes on-demand as the alternative for "unknown workloads." **The current documentation reverses that order.**

| Mode | Courseware description | Current documentation |
|---|---|---|
| On-demand | Unknown workloads / unpredictable traffic. "A flexible billing option that can handle thousands of requests per second without capacity planning" | **The default and recommended throughput option.** A serverless throughput option that removes capacity planning, monitoring, and scaling policy configuration, billed per request |
| Provisioned | Predictable traffic / known workloads / reserved capacity available | You specify reads and writes per second. Suited to **steady workloads with predictable growth**. Billed on the hourly capacity you provisioned rather than what you consumed, which gives cost predictability |

Facts about on-demand that the courseware does not cover: 🆕

- On-demand tables deliver **the same single-digit millisecond latency, SLA, and security** as provisioned mode.
- New on-demand tables sustain up to **4,000 writes and 12,000 reads per second** immediately, and instantly accommodate up to **double** the previous peak traffic.
- You can optionally configure **maximum throughput** for individual on-demand tables and GSIs to keep costs bounded.
- Throttling can occur if you exceed double your previous peak within 30 minutes, so pre-warming (warm throughput) or spacing growth over at least 30 minutes is recommended.

> — Source: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

#### Capacity Mode Switching Limits 🔄

The courseware instructor notes state two things. Both differ from current behavior.

| Courseware statement | Verified content |
|---|---|
| "You must provision the table's capacity when you create a table using the AWS CLI or an AWS SDK" | `BillingMode` on `CreateTable` is **not required.** Valid values are `PROVISIONED` and `PAY_PER_REQUEST`, and if you choose `PAY_PER_REQUEST` you **cannot** specify `ProvisionedThroughput`. The documentation recommends `PAY_PER_REQUEST` for most workloads |
| "You can switch read/write capacity mode once every 24 hours" | Provisioned → on-demand is limited to **four times in a 24-hour rolling window**; on-demand → provisioned can be done **at any time** |

Things to know about switching: 🆕

- Switching from provisioned to on-demand can take several minutes, and during the switch the table delivers throughput consistent with the previously provisioned amounts.
- If you switch using the console, Auto Scaling settings are **deleted**; if you use the AWS CLI or an SDK, they are **preserved**.
- Switching back from on-demand to provisioned delivers throughput consistent with the previous peak reached during on-demand.

> — Source: [Considerations when switching capacity modes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-switching-capacity-modes.html)

#### Burst and Adaptive Capacity 🆕

The courseware instructor notes only say "you can fine-tune application capacity by taking advantage of burst and adaptive capacity." The concrete values are as follows.

| Item | Content |
|---|---|
| Burst capacity | Retains unused read and write capacity for **up to five minutes (300 seconds)**. DynamoDB can also consume it for background maintenance without prior notice |
| Adaptive capacity | **Enabled automatically** for every table, at no additional cost, and does not need to be explicitly enabled or disabled |
| Partition limits | Throttling occurs if a single partition receives more than **3,000 reads or 1,000 writes**. Adaptive capacity automatically and instantly increases throughput for partitions receiving more traffic |
| Frequently accessed items | Partitions are rebalanced so that frequently accessed items do not reside together. However, when the table **has an LSI**, item collections are not split across partitions |

> — Source: [DynamoDB burst and adaptive capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html)

### 2.6 Other Table Quotas 🆕

Courseware slide 21 links the service quotas document but does not give any values.

| Item | Value |
|---|---|
| Size units | All size measurements in DynamoDB use **binary-based units** (1 KB = 1024 bytes, 1 MB = 1024 KB) |
| Table size | No practical limit; unconstrained in number of items or bytes |
| Tables per account per Region | Initial quota of **2,500**. Beyond that, reach out to your AWS account team for up to 10,000; for more than 10,000, the recommended best practice is multiple accounts |
| Throughput per table | 40,000 read units and 40,000 write units, for both on-demand and provisioned |
| Throughput per account | 80,000 read and 80,000 write capacity units for provisioned. **No account-level quotas apply to on-demand tables** |
| Minimum throughput for a table or GSI | 1 read capacity unit and 1 write capacity unit |

> — Source: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

---

## 3. Table Operations

### 3.1 Creating a Table: Java Low-Level Interface 🔄

Courseware slides 13 and 14 build the key schema and attribute definitions and then build a `CreateTableRequest`. The request-building portion is AWS SDK for Java 2.x syntax, but **the last line, which receives the response, uses a 1.x class name.**

| Courseware statement | Verified content |
|---|---|
| `CreateTableResult result = ddb.createTable(request);` | The 2.x return type is **`CreateTableResponse`**, and `tableDescription()` returns the table properties. `CreateTableResult` is the 1.x class name |

```java
// Set the key attributes and values for the request
List<KeySchemaElement> keySchema = new ArrayList<>();
keySchema.add(KeySchemaElement.builder()
        .attributeName("UserId").keyType(KeyType.HASH).build());   // partition key
keySchema.add(KeySchemaElement.builder()
        .attributeName("NoteId").keyType(KeyType.RANGE).build());  // sort key

// Set the attribute definitions for the request.
// NoteId is defined as N (number). The courseware alternates between S and N,
// but every CLI example from slide 25 onward uses {"NoteId":{"N":"42"}}.
List<AttributeDefinition> attributeDefinitions = new ArrayList<>();
attributeDefinitions.add(AttributeDefinition.builder()
        .attributeName("UserId").attributeType(ScalarAttributeType.S).build());
attributeDefinitions.add(AttributeDefinition.builder()
        .attributeName("NoteId").attributeType(ScalarAttributeType.N).build());

// Set the table throughput for the request (5 WCU / 5 RCU)
ProvisionedThroughput provisionedThroughput = ProvisionedThroughput.builder()
        .writeCapacityUnits(5L)
        .readCapacityUnits(5L)
        .build();

// Build the CreateTable request
CreateTableRequest request = CreateTableRequest.builder()
        .attributeDefinitions(attributeDefinitions)
        .keySchema(keySchema)
        .billingMode(BillingMode.PROVISIONED)   // state it explicitly when using ProvisionedThroughput
        .provisionedThroughput(provisionedThroughput)
        .tableName("Notes")
        .build();

// The AWS SDK for Java 2.x return type is CreateTableResponse
CreateTableResponse response = ddb.createTable(request);
System.out.println(response.tableDescription().tableStatus());   // CREATING
```

`KeyType` takes two values, `HASH` (partition key) and `RANGE` (sort key), and a composite primary key must provide **exactly two elements** in `HASH`, `RANGE` order.

> — Source: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html), [CreateTableResponse (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/dynamodb/model/CreateTableResponse.html)

#### The `NoteId` Attribute Type: A Contradiction Inside the Courseware 🔄

| Location | `NoteId` type |
|---|---|
| Slide 13 code | `ScalarAttributeType.S` |
| Slide 13 instructor notes | "primarykey (UserId) and sortKey (NoteId) are **both set to string (S)**" |
| Slide 14 instructor notes | "primarykey (UserId) is set to string (S) and sortKey (NoteId) is set to **number (N)**" |
| Slide 15 .NET example | `ScalarAttributeType.N` |
| Every CLI example from slide 25 onward | `{"NoteId":{"N":"..."}}` |

Valid `AttributeType` values are `S`, `N`, and `B`, and a primary key attribute must be string, number, or binary, so either is syntactically possible. But two definitions cannot coexist for one `Notes` table. This document **standardizes on `N`, matching the majority of the examples.**

> — Source: [AttributeDefinition](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html)

### 3.2 Checking Status After Table Creation 🆕

`CreateTable` is an **asynchronous operation.**

| Stage | Content |
|---|---|
| Immediately after the request | Returns a response with `TableStatus` of **`CREATING`** |
| After creation completes | DynamoDB sets `TableStatus` to **`ACTIVE`** |
| When reads and writes are possible | **Only on an `ACTIVE` table** |
| How to check status | `DescribeTable` |

The response carries a `TableDescription` object that includes `BillingModeSummary`, `CreationDateTime`, `GlobalSecondaryIndexes`, `TableStatus`, and more. This matches the courseware slide 16 instructor notes.

🆕 Constraints the courseware does not cover: table names must be **unique within each Region** (you can reuse a name in a different Region), and only **one table with secondary indexes** can be in the `CREATING` state at any given time.

> — Source: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)

### 3.3 Creating a Table: .NET Low-Level Interface 🔄

The example on courseware slides 15 and 16 has three problems.

| Courseware | Problem | Correction |
|---|---|---|
| `AttributeName = "NoteId",I` | Stray character `I` | `AttributeName = "NoteId",` |
| `},,` | Duplicated comma | `},` |
| `var response = client.CreateTable(request);` | The current official .NET (v4) example uses an asynchronous call | `await client.CreateTableAsync(request)` |

The first two are courseware typos and are not the kind of fact you verify against AWS documentation; the last one is a difference from the official code example.

```csharp
AmazonDynamoDBClient client = new AmazonDynamoDBClient();
string tableName = "Notes";
var request = new CreateTableRequest
{
    TableName = tableName,
    AttributeDefinitions = new List<AttributeDefinition>()
    {
        new AttributeDefinition { AttributeName = "UserId", AttributeType = ScalarAttributeType.S },
        new AttributeDefinition { AttributeName = "NoteId", AttributeType = ScalarAttributeType.N }
    },
    KeySchema = new List<KeySchemaElement>()
    {
        new KeySchemaElement { AttributeName = "UserId", KeyType = KeyType.HASH },   // partition key
        new KeySchemaElement { AttributeName = "NoteId", KeyType = KeyType.RANGE }   // sort key
    },
    // With on-demand you cannot specify ProvisionedThroughput.
    // To use provisioned mode, set BillingMode.PROVISIONED and supply ProvisionedThroughput.
    BillingMode = BillingMode.PAY_PER_REQUEST
};

// The current official example uses the asynchronous method
var response = await client.CreateTableAsync(request);

// Poll until the table status becomes ACTIVE
var describeRequest = new DescribeTableRequest
{
    TableName = response.TableDescription.TableName
};
TableStatus status;
do
{
    Thread.Sleep(2000);
    var describeResponse = await client.DescribeTableAsync(describeRequest);
    status = describeResponse.Table.TableStatus;
}
while (status != TableStatus.ACTIVE);
```

If the table already exists, a `ResourceInUseException` is raised.

> — Source: [Use CreateTable with an AWS SDK or CLI](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_CreateTable_section.html)

### 3.4 Creating a Table with an Index Using the CLI

Courseware slide 17 shows the base table key `(UserId, NoteId)` and the index key `(UserId, Is_Incomplete)` in a diagram. Attribute types are set with the following values.

| Value | Meaning |
|---|---|
| `S` | String type attribute |
| `N` | Number type attribute |
| `B` | Binary type attribute |

```bash
aws dynamodb create-table \
  --table-name Notes \
  --attribute-definitions \
      AttributeName=UserId,AttributeType=S \
      AttributeName=NoteId,AttributeType=N \
      AttributeName=Is_Incomplete,AttributeType=S \
  --key-schema \
      AttributeName=UserId,KeyType=HASH \
      AttributeName=NoteId,KeyType=RANGE \
  --local-secondary-indexes \
      '[{"IndexName":"IsIncompleteIndex",
         "KeySchema":[{"AttributeName":"UserId","KeyType":"HASH"},
                      {"AttributeName":"Is_Incomplete","KeyType":"RANGE"}],
         "Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST
```

A note from the courseware instructor notes: by design, developers **do not need to declare non-key attributes** on a DynamoDB table. DynamoDB is schemaless except for `--key-schema`. This statement matches the current documentation's "other than the primary key, neither the attributes nor their data types need to be defined beforehand."

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.5 Using a Waiter 🔄

The AWS SDK for Java provides waiters that wait until a resource transitions to a desired state. Without a waiter, you have to write your own polling code that repeatedly checks the state.

The code on courseware slide 18 has two problems.

| Courseware | Problem |
|---|---|
| `CreateTableResponse response = ddb.createTable("Notes");` | The slide annotation and instructor notes say the table is created "using the information in the `CreateTableRequest` object," but the code passes a string literal. `DynamoDbClient.createTable` has only overloads that take a **request object or a builder `Consumer`** |
| `dbWaiter.waitUntilTableExists("Notes");` | The official example passes a **builder that constructs a `DescribeTableRequest`** |

```java
// Pass the standard client to the waiter so the same Region is used.
// DynamoDbWaiter is AutoCloseable, so close it with try-with-resources.
try (DynamoDbWaiter dbWaiter = DynamoDbWaiter.builder().client(ddb).build()) {

    // Create the table using the request object
    CreateTableResponse response = ddb.createTable(request);

    // Wait until the Amazon DynamoDB table is created.
    // The argument is not a string but a builder that constructs a DescribeTableRequest.
    ResponseOrException<DescribeTableResponse> waiterResponse = dbWaiter
            .waitUntilTableExists(b -> b.tableName("Notes").build())
            .matched();

    DescribeTableResponse tableDescription = waiterResponse.response().orElseThrow(
            () -> new RuntimeException("Notes table was not created."));
    System.out.println(tableDescription.table().tableStatus());   // ACTIVE
}
```

`DynamoDbWaiter` lives in the `software.amazon.awssdk.services.dynamodb.waiters` package and provides `waitUntilTableExists` and `waitUntilTableNotExists`.

> — Source: [Create a DynamoDB table if needed (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html)

### 3.6 Update, List, and Delete a Table (Java) 🔄

The Java examples on courseware slides 19 and 20 use **AWS SDK for Java 1.x Document API syntax.**

| Courseware code | Version |
|---|---|
| `Table table = dynamoDB.getTable("Notes");` | 1.x |
| `new ProvisionedThroughput().withReadCapacityUnits(15L)` | 1.x |
| `TableCollection<ListTablesResult> tables = dynamoDB.listTables();` | 1.x |

AWS SDK for Java 1.x **reached end-of-support on December 31, 2025** (announced January 12, 2024; entered maintenance mode July 31, 2024). Slides 13–14, 18, and 41–42 in the same module use 2.x syntax, so versions are mixed inside the courseware. The package names differ too: 1.x is `com.amazonaws` and 2.x is `software.amazon.awssdk`.

```java
// Update — AWS SDK for Java 2.x
UpdateTableRequest updateRequest = UpdateTableRequest.builder()
        .tableName("Notes")
        .provisionedThroughput(ProvisionedThroughput.builder()
                .readCapacityUnits(15L)
                .writeCapacityUnits(15L)
                .build())
        .build();
ddb.updateTable(updateRequest);

// Delete
ddb.deleteTable(DeleteTableRequest.builder().tableName("Notes").build());

// List — the output is paginated at a maximum of 100 names per page.
// A paginator lets the SDK make the follow-up calls for you.
ddb.listTablesPaginator(ListTablesRequest.builder().build())
        .tableNames()
        .forEach(System.out::println);
```

> — Source: [Programming DynamoDB with the AWS SDK for Java 2.x](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 3.7 Update, List, and Delete a Table (.NET)

The examples on courseware slides 21 and 22. Apart from converting the synchronous methods to asynchronous ones, they match the courseware (see [Section 3.3](#33-creating-a-table-net-low-level-interface)).

```csharp
// Update
string tableName = "Notes";
var request = new UpdateTableRequest()
{
    TableName = tableName,
    ProvisionedThroughput = new ProvisionedThroughput()
    {   // Provide the new values.
        ReadCapacityUnits = 20,
        WriteCapacityUnits = 10
    }
};
var response = await client.UpdateTableAsync(request);

// Delete
var deleteRequest = new DeleteTableRequest { TableName = tableName };
var deleteResponse = await client.DeleteTableAsync(deleteRequest);

// List — create a request object to specify optional parameters.
var listRequest = new ListTablesRequest
{
    Limit = 10,  // page size (1-100, defaults to 100 when omitted)
    ExclusiveStartTableName = lastEvaluatedTableName
};
var listResponse = await client.ListTablesAsync(listRequest);
foreach (string name in listResponse.TableNames)
    Console.WriteLine(name);
```

### 3.8 Throughput Increase and Decrease Limits 🔄

Three of the four statements in the courseware slide 21 instructor notes still hold; one differs.

| Courseware statement | Verified content |
|---|---|
| You can increase `ReadCapacityUnits` or `WriteCapacityUnits` **as often as necessary** | Correct |
| In a single call you can increase throughput for a table, its GSIs, or any combination | Correct |
| The new settings do not take effect until the `UpdateTable` operation is complete | Correct |
| **"You can decrease up to four times per day, at any time"** | Differs. See the table below |

The current decrease quota works as follows.

| Item | Content |
|---|---|
| Definition of a day | **Universal Time Coordinated (UTC)** |
| At the start of each day | **4** available decreases |
| Replenishment | **1** additional decrease each hour, up to a maximum of 4 available at any time |
| Total over 24 hours | Up to **27** (4 in the first hour, plus 1 for each of the remaining 23 hours) |
| Table versus GSI | Decrease limits are **decoupled**. However, if a single request decreases both a table and a GSI and either exceeds its limit, **the entire request is rejected** and is not partially processed |

> — Source: [Quotas in Amazon DynamoDB — Increasing or decreasing throughput](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

### 3.9 `ListTables` Is Paginated 🔄

The courseware repeats on slides 19–20 and 22 that "the `ListTables` operation does not require any parameters." That statement is still correct. However, the courseware Java list example looks as though it iterates every table in one pass.

| Item | Content |
|---|---|
| Output | **Paginated**, returning a maximum of **100** table names per page |
| `Limit` | Optional. Defaults to **100** when omitted; valid range **1–100** |
| `ExclusiveStartTableName` | Optional. Pass the `LastEvaluatedTableName` value from the previous response |
| Termination | If the response contains **no** `LastEvaluatedTableName`, there are no more table names to retrieve |

```bash
# First page
aws dynamodb list-tables --limit 3
# {
#     "TableNames": ["Forum", "Reply", "Thread"],
#     "LastEvaluatedTableName": "Thread"
# }

# Next page
aws dynamodb list-tables --limit 3 --exclusive-start-table-name Thread
```

> — Source: [ListTables API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ListTables.html)

---

## 4. Loading Items

Data plane operations perform CRUD actions on table data. The APIs for creating data are `PutItem` and `BatchWriteItem`.

### 4.1 Creating an Item: `PutItem` 🔄

`PutItem` creates a new item or **completely replaces an existing item with a new one.** If an item with the same primary key already exists, the new item completely replaces it.

```bash
aws dynamodb put-item \
  --table-name Notes \
  --item '{"UserId":{"S":"StudentD"}, "NoteId":{"N":"42"}, "Notes":{"S":"Test note"}}'
```

| Item | Content |
|---|---|
| Default behavior | **Unconditional** |
| Required attributes | When you add an item, **only the primary key attributes** are required |
| `ReturnValues` | Returns the item's attribute values in the same operation. To determine whether an overwrite occurred, set it to `ALL_OLD` and check whether the response includes an `Attributes` element 🆕 |
| Conditional put | Add a new item only if one with the specified primary key does not exist, or replace an existing item only if it has certain attribute values |

The courseware instructor notes only say "attribute values cannot be `null`." The current documentation is more precise. 🔄

| Value | Allowed |
|---|---|
| **Empty string or empty binary** value on a non-key attribute | **Allowed** |
| String or binary value used as a **key attribute** for a table or index | Must have a length **greater than zero** |
| Set type attribute | Cannot be empty |
| An invalid request containing empty values | Rejected with `ValidationException` |

To prevent a new item from replacing an existing one, use a condition expression containing the `attribute_not_exists` function with the name of the attribute used as the table's partition key. Since every record must contain that attribute, `attribute_not_exists` succeeds only when no matching item exists.

```bash
aws dynamodb put-item \
  --table-name Notes \
  --item '{"UserId":{"S":"StudentD"}, "NoteId":{"N":"42"}, "Notes":{"S":"Test note"}}' \
  --condition-expression "attribute_not_exists(UserId)"
```

If the condition is not satisfied, a `ConditionalCheckFailedException` (HTTP 400, message `The conditional request failed`) is returned.

> — Source: [PutItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

### 4.2 Put or Delete Multiple Items: `BatchWriteItem` 🔄

```bash
aws dynamodb batch-write-item --request-items file://request-items.json
```

The request consists of a map of one or more table names and, for each table, a list of operations to perform (`DeleteRequest` or `PutRequest`).

```json
{
  "Notes": [
    { "PutRequest": { "Item": { "UserId": {"S": "StudentE"}, "NoteId": {"N": "55"}, "Notes": {"S": "Batch note"} } } },
    { "DeleteRequest": { "Key": { "UserId": {"S": "StudentB"}, "NoteId": {"N": "23"} } } }
  ]
}
```

The limits the courseware presents are still correct.

| Operation | Item count | Data size |
|---|---|---|
| `BatchWriteItem` | Up to **25** puts or deletes | Up to **16 MB** |
| `BatchGetItem` | Up to **100** items read | Up to **16 MB** |
| Maximum size of an individual item | **400 KB** | — |

Behavior the courseware does not cover: 🆕

| Item | Content |
|---|---|
| Two meanings of item size | An individual item can be up to 400 KB **once stored**, but its **representation** in DynamoDB's JSON format during the API call might be larger than 400 KB |
| Atomicity | Individual `PutItem` and `DeleteItem` operations are atomic, but **`BatchWriteItem` as a whole is not** |
| Failure handling | Failed operations are returned in the `UnprocessedItems` response parameter. Retry them in a loop, but **exponential backoff is strongly recommended** |
| Per-request conditions | **Not possible.** You cannot specify conditions on individual put and delete requests, and `BatchWriteItem` does not return deleted items in the response |
| Parallel processing | `BatchWriteItem` performs the specified puts and deletes in parallel. Parallel processing reduces latency, but **each request consumes the same number of write capacity units whether it is processed in parallel or not**. A delete on a nonexistent item still consumes one write capacity unit |
| Conditions that reject the whole batch | More than 25 requests / any individual item over 400 KB / total request size over 16 MB / multiple operations on the same item / two or more items with identical hash and range keys / a table that does not exist / primary key schema mismatch |
| Key length limits | Partition key **2,048 bytes**, sort key **1,024 bytes** |
| Updates | **`BatchWriteItem` cannot update items.** Performing it on an existing item overwrites the values so it looks as though it was updated; the documentation recommends `UpdateItem` to update items |

> — Source: [BatchWriteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html)

`BatchGetItem` also has more detail than the courseware covers. 🆕

| Item | Content |
|---|---|
| Requesting more than 100 items | **`ValidationException`** with the message `Too many items requested for the BatchGetItem call` |
| Partial results | Returns partial results along with `UnprocessedKeys` when the response size limit is exceeded, provisioned throughput is exceeded, **more than 1 MB per partition is requested**, or an internal processing failure occurs |
| Example | If you ask for 100 items and each is 300 KB, the system returns **52** items so as not to exceed the 16 MB limit, along with an `UnprocessedKeys` value |
| Read consistency | **Eventually consistent** by default. `ConsistentRead` can be set to `true` per table |
| Ordering | DynamoDB **does not return items in any particular order.** To parse the response by item, include the primary key values in `ProjectionExpression` |
| Duplicate keys | `ValidationException` if the same key is specified multiple times |

> — Source: [BatchGetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html)

---

## 5. Reading Items

### 5.1 Reading an Item: `GetItem`

```bash
aws dynamodb get-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentA"}, "NoteId": {"N": "11"}}'
```

```json
{
  "Item": {
    "Note": { "S": "Hello World\n" },
    "NoteId": { "N": "11" },
    "UserId": { "S": "StudentA" }
  }
}
```

| Item | Content |
|---|---|
| Returns | A set of attributes for the item with the given primary key |
| When there is no matching item | Returns no data and there is **no `Item` element** in the response |
| Default read consistency | **Eventually consistent** |
| Strongly consistent read | Set `ConsistentRead` to `true`. It might take more time than an eventually consistent read but **always returns the last updated value** |
| Primary key | You must provide all attributes. For a composite primary key, provide values for **both** the partition key and the sort key |

🆕 `AttributesToGet` is a legacy parameter; use `ProjectionExpression` instead (see [Section 5.7](#57-legacy-conditional-parameters)).

> — Source: [GetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html)

### 5.2 Querying Data: `Query` 🔄

`Query` requires the name of the partition key attribute and a **single value** for that attribute, and returns all items with that partition key value.

```bash
aws dynamodb query \
  --table-name Notes \
  --key-condition-expression "UserId = :userid" \
  --expression-attribute-values '{":userid":{"S":"StudentA"}}'
```

> The CLI example on courseware slide 30 reads `'{":userid":{"S":"StudentA"}'`, which is **missing a closing brace** and therefore fails JSON parsing. The example above corrects it.

#### Sort Key Condition Operators 🔄

The slide body lists `=, <, >, <=, >=, AND, BETWEEN or begins_with`, while the instructor notes on the same slide omit `BETWEEN`. The accurate list is as follows.

| Form | Meaning |
|---|---|
| `sortKeyName = :val` | The sort key value equals `:val` |
| `sortKeyName < :val` | Less than |
| `sortKeyName <= :val` | Less than or equal to |
| `sortKeyName > :val` | Greater than |
| `sortKeyName >= :val` | Greater than or equal to |
| `sortKeyName BETWEEN :v1 AND :v2` | Greater than or equal to `:v1` and less than or equal to `:v2` |
| `begins_with(sortKeyName, :val)` | Begins with a particular substring. **Cannot be used with a Number sort key.** The function name is case-sensitive |

`AND` is not a standalone comparison operator; it is part of the `BETWEEN :v1 AND :v2` construct.

#### A Filter Expression Does Not Reduce What Is Read 🔄

The courseware instructor notes state that "you can combine a filter expression and limit the results. Combining the two gives you a refined dataset **without reading more items than necessary**." This invites a misunderstanding.

| Item | Verified content |
|---|---|
| Basis for capacity calculation | DynamoDB calculates consumed read capacity units based on **item size**, not on the amount of data returned to the application |
| Effect of projection | The number of capacity units consumed is **the same** whether you request all attributes or only some using `ProjectionExpression` |
| Effect of a filter | **The number is also the same whether or not you use a `FilterExpression`** |
| When it is applied | `FilterExpression` is applied after `Query` finishes but before the results are returned |
| Constraint | A `Query`'s `FilterExpression` **cannot contain partition key or sort key attributes.** Those go in `KeyConditionExpression` |

In short, what reduces the amount read is **`KeyConditionExpression`, `Limit`, and secondary indexes**; a filter only screens the returned results.

#### Other `Query` Behavior 🆕

| Item | Content |
|---|---|
| Page limit | A single `Query` reads up to the maximum number of items set with `Limit` or a maximum of **1 MB** of data, and then applies the filter |
| Meaning of `Limit` | The maximum number of items to **evaluate**, not necessarily the number of matching items |
| Sorting | Results are **always sorted by sort key value**. Numeric order for Number, UTF-8 byte order otherwise. Ascending by default; `ScanIndexForward=false` reverses it |
| Empty results | A result set is always returned, and queries that return no results consume **the minimum read capacity units for that read type** |
| A page fully removed by a filter | Can return an empty result set **together with** a `LastEvaluatedKey` |
| GSI read consistency | GSIs support **eventually consistent reads only.** Specifying `ConsistentRead=true` on a GSI query raises `ValidationException` |

> — Source: [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)

### 5.3 Paginating Results 🔄

DynamoDB paginates `Query` results into pages of **1 MB or less**. An application can process the first page, then the second, and so on.

```json
{
  "Count": 8,
  "Items": [
    {"UserId": {"S": "StudentA"}},
    {"UserId": {"S": "StudentB"}},
    {"UserId": {"S": "StudentC"}},
    {"UserId": {"S": "StudentD"}},
    {"UserId": {"S": "StudentE"}},
    {"UserId": {"S": "StudentF"}},
    {"UserId": {"S": "StudentG"}},
    {"UserId": {"S": "StudentH"}}
  ],
  "LastEvaluatedKey": {
    "UserId": {"S": "StudentH"},
    "NoteId": {"N": "88"}
  },
  "ScannedCount": 8
}
```

The procedure matches the courseware. (1) Check whether the result contains a `LastEvaluatedKey`. (2) If it does, construct a new `Query` with the same `KeyConditionExpression` and use that value as `ExclusiveStartKey`. (3) Run it. (4) Repeat.

There is one important caveat the courseware does not state. 🔄

| Courseware statement | Verified content |
|---|---|
| Request the next page "if the query has a `LastEvaluatedKey` element and the value is not `null`" | A non-empty `LastEvaluatedKey` only means the previous `Query` **stopped at a page boundary** (the 1 MB page-size limit or a `Limit` value); it is **not a guarantee** that more matching items remain. In particular, when you use a `FilterExpression`, the 1 MB/`Limit` cap applies to the items read **before** the filter is applied, so a page can return zero matching items and still include a `LastEvaluatedKey`. The only way to know you have reached the end of the result set is when `LastEvaluatedKey` is empty |

🆕 **Automatic pagination is the default behavior in both AWS CLI version 1 and version 2.** Use `--no-paginate` to page yourself. Note that `--max-items` returns a `NextToken` while `--limit` returns a `LastEvaluatedKey`.

> — Source: [Paginating table query results in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html)

### 5.4 Scanning Data: `Scan` 🔄

`Scan` reads **every item** in a table or a secondary index. By default it returns all data attributes for every item; `ProjectionExpression` returns only some of them.

```bash
aws dynamodb scan \
  --table-name Notes \
  --filter-expression "contains(Text, :word)" \
  --expression-attribute-values '{":word":{"S":"covid"}}'
```

| Item | Content |
|---|---|
| Page limit | A single `Scan` request retrieves a maximum of **1 MB** of data. This limit applies **before** the filter expression is evaluated |
| When the filter is applied | After `Scan` finishes but before the results are returned (matches the courseware) |
| Consumed capacity | **A `Scan` consumes the same amount of read capacity, regardless of whether a filter expression is present** 🔄 |
| Attributes usable in the filter | Unlike `Query`, you can specify **any attributes, including partition key and sort key attributes** 🆕 |
| `Limit` | Specifies the maximum number of items to return **before** filter expression evaluation. With `Limit=6` plus a filter, six items are read and only the matches remain, so the final result contains six items **or fewer** |
| Read consistency | **Eventually consistent** by default. With `ConsistentRead=true` you get strong consistency as of the time the `Scan` begins |
| Return order | Partition key values are returned in an **arbitrary, unsorted order**; within a single partition key value, items are returned in ascending sort key order 🆕 |
| `ReturnConsumedCapacity` default | `NONE` 🆕 |

Two counters in the response must be distinguished. 🆕

| Field | Meaning |
|---|---|
| `ScannedCount` | The number of items evaluated **before** any filter is applied |
| `Count` | The number of items that remain **after** a filter expression was applied |

Without a filter expression the two are the same. **A high `ScannedCount` with few or no `Count` results signals an inefficient `Scan`.**

What consumes the capacity also differs. 🆕

| Scan target | Read capacity consumed from |
|---|---|
| Table | The table's provisioned read capacity |
| Global secondary index | **The index's** provisioned read capacity |
| Local secondary index | **The base table's** provisioned read capacity |

`contains(path, operand)` tests whether a String contains a substring, a Set contains an element, or a List contains an element. The path and the operand must be distinct, so `contains(a, a)` returns an error.

> — Source: [Scanning tables in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)

### 5.5 Choosing Query or Scan

| Category | Content |
|---|---|
| Query | Finds items based on primary key values |
| Scan | Reads **every item** in a table or secondary index |

The courseware's emphasis: a scan is less efficient than a query, but it is often the only solution. The instructor notes' guidance also still holds. **Avoid using a Scan operation with a filter that removes many results on a large table.** As a table grows, the scan takes longer and consumes more capacity.

The consumed-capacity rule in [Section 5.4](#54-scanning-data-scan) explains why. A filter that removes many results means **you have already spent the read capacity and are simply getting fewer items back.**

### 5.6 Parallel Scan 🆕

By default a `Scan` processes data sequentially and DynamoDB returns data in 1 MB increments. A sequential `Scan` might not fully use provisioned read throughput. Even though DynamoDB distributes a large table's data across multiple physical partitions, **a `Scan` can only read one partition at a time**, so its throughput is constrained by the maximum throughput of a single partition.

A parallel scan logically divides a table or secondary index into multiple **segments**, with multiple workers scanning the segments in parallel. Each worker can be a thread or an operating system process.

| Parameter | Content |
|---|---|
| `Segment` | The segment a particular worker scans. Each worker must use a different value, and segments are **zero-based** |
| `TotalSegments` | The total number of segments for the parallel scan. It must equal the **number of workers** your application will use |

The example on courseware slide 34: the application spawns three threads and assigns each a number. Each thread issues a scan request with `Segment` set to its designated number and `TotalSegments` set to 3, scans its designated segment 1 MB at a time, and returns the data to the main thread.

How segments are assigned, which the courseware does not cover: 🆕

- DynamoDB assigns items to segments by **applying a hash function to each item's partition key.** For a given `TotalSegments` value, **all items with the same partition key are always assigned to the same `Segment`**, regardless of sort key values or item collection size.
- Because segment assignment is based solely on the partition key hash, **segments can be unevenly distributed.** Some segments might contain no items while others contain many partition keys with large item collections.
- Therefore **increasing the number of segments does not guarantee faster scan performance**, particularly when partition keys are not uniformly distributed across the keyspace.

The cautions in the courseware instructor notes still hold. A parallel scan with a large number of workers can easily consume all of the provisioned throughput for the table or index being scanned, so avoid such scans if the table or index is also incurring heavy read or write activity from other applications. Use the `Limit` parameter to control the amount of data returned per request.

> — Source: [Scanning tables in DynamoDB — Parallel scan](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)

### 5.7 Legacy Conditional Parameters 🆕

Every example in the courseware uses expression-based parameters, which matches current guidance. However, legacy parameters remain in the API and you will meet them when maintaining older code.

| API operation | Legacy parameter | Expression parameter to use instead |
|---|---|---|
| `BatchGetItem`, `GetItem`, `Query`, `Scan` | `AttributesToGet` | `ProjectionExpression` |
| `DeleteItem`, `PutItem`, `UpdateItem` | `Expected` | `ConditionExpression` |
| `Query` | `KeyConditions` | `KeyConditionExpression` |
| `Query` | `QueryFilter` | `FilterExpression` |
| `Scan` | `ScanFilter` | `FilterExpression` |
| `UpdateItem` | `AttributeUpdates` | `UpdateExpression` |
| `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan` | `ConditionalOperator` | `ConditionExpression` / `FilterExpression` |

**You cannot mix legacy conditional parameters and expression parameters in a single call.** For example, calling `Query` with both `AttributesToGet` and `ConditionExpression` results in an error.

> — Source: [Legacy DynamoDB conditional parameters](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html)

---

## 6. Updating and Deleting Items

### 6.1 Updating an Item: `UpdateItem`

`UpdateItem` updates **only the attributes that are passed.** The default behavior is **unconditional.**

```bash
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentC"}, "NoteId": {"N": "12"}}' \
  --update-expression "SET Notes = :newnote" \
  --expression-attribute-values '{":newnote":{"S":"To be reviewed"}}' \
  --return-values ALL_NEW
```

| Item | Content |
|---|---|
| What it can do | Update existing attribute values, add new attributes, delete attributes of an existing item |
| What it cannot do | **Update primary key attributes** |
| When the item does not exist | **Creates a new item** (upsert) |
| `ReturnValues` | Returns the item's attribute values in the same operation. `ALL_NEW` returns the entire item after the update |
| Consumed capacity | DynamoDB considers the item size **before and after** the update, and the consumed throughput reflects **the larger** of the two. Even when you update a subset of the attributes, the full amount is consumed |

This consumption rule matches the current documentation. 🆕 `AttributeUpdates` is a legacy parameter; use `UpdateExpression` instead.

> — Source: [UpdateItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html)

### 6.2 Conditional Write Operations 🔄

By default, DynamoDB write operations (`PutItem`, `UpdateItem`, `DeleteItem`) are **unconditional.** A conditional write succeeds only if the item attributes meet one or more expected conditions.

The intent of courseware slide 37 is to "allow the update only when the note is not flagged as a favorite." However, the condition expression in the CLI example is not valid syntax.

| Courseware statement | Problem |
|---|---|
| `--condition-expression "Favorite NOT yes"` | `NOT` is a **logical operator that negates a single condition**, so it cannot be used as a binary comparison in the form `operand NOT operand`. Also, a value such as `yes` cannot be written as a literal and must be passed as an **expression attribute value (`:val`)** |
| `expression-attribute-values.json` contains only `:newnote` | The placeholder value the condition expression needs is missing |

The syntax for a condition expression is as follows.

```text
condition-expression ::=
      operand comparator operand
    | operand BETWEEN operand AND operand
    | operand IN ( operand (',' operand (, ...) ))
    | function
    | condition AND condition
    | condition OR condition
    | NOT condition
    | ( condition )

comparator ::= = | <> | < | <= | > | >=

function ::=
      attribute_exists (path)
    | attribute_not_exists (path)
    | attribute_type (path, type)
    | begins_with (path, substr)
    | contains (path, operand)
    | size (path)
```

An `IN` list can contain up to 100 values. Function names are **case-sensitive.** A Boolean attribute cannot be referenced on its own as a condition; supply the Boolean value in the expression attribute values and compare it with `=` or `<>`.

Rewriting the courseware's intent so that it conforms to the grammar:

```bash
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentD"}, "NoteId": {"N": "42"}}' \
  --update-expression "SET Notes = :newnote" \
  --condition-expression "attribute_not_exists(Favorite) OR Favorite <> :fav" \
  --expression-attribute-values file://expression-attribute-values.json
```

```json
{
  ":newnote": { "S": "Amazon DynamoDB is a ..." },
  ":fav": { "S": "yes" }
}
```

The update proceeds only when the `Favorite` attribute is absent or its value is not `yes`.

> — Source: [Condition and filter expressions, operators, and functions in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html), [DynamoDB condition expression CLI example](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)

#### Write Capacity Is Consumed Even When the Condition Fails 🔄

The courseware instructor notes split the consumption into two cases. The current documentation describes a single rule.

| Courseware statement | Verified content |
|---|---|
| "If the item does not currently exist in the table, DynamoDB consumes **one** write capacity unit" | The documentation **does not state a fixed value of one.** Write capacity units are consumed even when the condition evaluates to `false`, and the amount depends on **the size of the existing item or of the new item you are trying to create or update** |
| "If the item exists, the number of write capacity units consumed depends on the item size" | Correct. The documentation's example: if the existing item is 300 KB and the new item you are trying to create or update is 310 KB, the write capacity consumed is **based on the 310 KB new item** |

A failed conditional write returns `ConditionalCheckFailedException` (HTTP 400). In that case the response does not carry information about the write capacity consumed, but you can check the table's `ConsumedWriteCapacityUnits` metric in Amazon CloudWatch. 🆕 The exception can carry the item that caused it (`Item`), and the `ReturnValuesOnConditionCheckFailure` parameter controls how it is returned.

> — Source: [DynamoDB read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html), [PutItem API — Errors](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

### 6.3 Deleting an Item: `DeleteItem`

```bash
aws dynamodb delete-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}'
```

| Item | Content |
|---|---|
| Behavior | Deletes a **single item** in a table by primary key |
| Default behavior | **Unconditional** |
| Idempotency | **Idempotent unless you specify conditions.** Running it multiple times on the same item or attribute does not result in an error response |
| `ReturnValues` | Returns the item's attribute values in the same operation as the delete |
| Conditional delete | Deletes the item only if it exists or has an expected attribute value. If the condition is met DynamoDB performs the delete; otherwise the item is not deleted |

The best practice on courseware slide 39 ("conditional operations provide an extra level of protection when deleting items") matches the current documentation.

```bash
# Delete only notes that are not favorites
aws dynamodb delete-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}' \
  --condition-expression "attribute_not_exists(Favorite)"
```

> — Source: [DeleteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html)

---

## 7. Higher-Level Interfaces

### 7.1 The Three Interfaces in Java 2.x 🆕

The courseware presents only the enhanced client as the Java higher-level interface. The AWS SDK for Java 2.x supports **three** interfaces depending on the level of abstraction you want.

| Interface | Content |
|---|---|
| Low-level | A one-to-one mapping to the service API. Every DynamoDB API is available, but it is verbose because you must wrap values with functions such as `.s()` and `.n()` |
| High-level (**DynamoDB enhanced client**) | Maps client-side data classes to tables. The main class is `DynamoDbEnhancedClient`, published in a separate package and Maven artifact named `software.amazon.awssdk.enhanced.dynamodb`. The 1.x high-level interface was referred to by its main class `DynamoDBMapper` |
| Document | No need to specify data type descriptors; types are implied by the semantics of the data. It uses `EnhancedDocument` and provides `fromJson(String)` and `toJson()` utility methods |

This table supports the courseware slide 41 instructor notes statement that "the DynamoDB Enhanced Client API is a high-level library that succeeds the `DynamoDBMapper` class of the SDK for Java v1.x."

🆕 The enhanced client can also map **immutable data classes** using **`@DynamoDbImmutable`** instead of `@DynamoDbBean`. An immutable class has only getters and requires a builder class the SDK uses to create instances; libraries such as Project Lombok can reduce the boilerplate.

> — Source: [Programming DynamoDB with the AWS SDK for Java 2.x — Supported interfaces](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 7.2 Java: DynamoDB Enhanced Client Data Class 🔄

The example on courseware slide 41 has four problems.

| Courseware | Problem | Correction |
|---|---|---|
| `@DynamoDbPartition` | **No such name exists** in the official annotation list. The instructor notes on the same slide correctly write `@DynamoDbPartitionKey` | `@DynamoDbPartitionKey` |
| `public void setNoteId(Integer noteId)` | The field is `private String noteId` and the getter returns `String`, but only the setter takes `Integer`, so it does not compile | `setNoteId(String noteId)` |
| Class name `Note` versus `NotesItems` and `NotesItem` in the instructor notes | Three names are mixed | Standardize on `Note` |
| Placement of `@DynamoDbAttribute` | You can apply an attribute-level annotation to the getter **or** the setter, but not both. The official guide shows annotations on getters | On the getter only |

The main entries in the current official annotation list are as follows.

| Annotation | Applies to | What it does |
|---|---|---|
| `@DynamoDbBean` | class | Marks a data class as mappable to a table schema |
| `@DynamoDbImmutable` | class | Marks an immutable data class as mappable to a table schema |
| `@DynamoDbPartitionKey` | attribute | Marks an attribute as the primary partition key (hash key) of the table |
| `@DynamoDbSortKey` | attribute | Marks an attribute as the optional primary sort key (range key) |
| `@DynamoDbAttribute` | attribute | Defines or renames the table attribute the property maps to |
| `@DynamoDbIgnore` | attribute | Leaves the attribute unmapped |
| `@DynamoDbSecondaryPartitionKey` | attribute | Marks an attribute as a partition key for a global secondary index |
| `@DynamoDbSecondarySortKey` | attribute | Marks an attribute as an optional sort key for a global or local secondary index |
| `@DynamoDbAtomicCounter` | attribute | Increments a tagged numerical attribute each time a record is written |
| `@DynamoDbAutoGeneratedTimestampAttribute` | attribute | Updates a tagged attribute with a current timestamp on every successful write |
| `@DynamoDbAutoGeneratedUuid` | attribute | Generates a unique UUID when a new record is written |
| `@DynamoDbVersionAttribute` | attribute | Increments an item version number |
| `@DynamoDbUpdateBehavior` | attribute | Specifies the behavior when the attribute is updated as part of an update operation such as `UpdateItem` |
| `@DynamoDbFlatten` | attribute | Flattens the attributes of a separate data class and adds them as top-level attributes |

```java
@DynamoDbBean // class-level annotation
public static class Note {    // data members corresponding to the columns of the Notes table
    private String userId;
    private String noteId;
    private String notes;

    @DynamoDbPartitionKey // attribute-level annotation for the partition key (not @DynamoDbPartition)
    @DynamoDbAttribute("UserId")
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @DynamoDbSortKey // attribute-level annotation for the sort key
    @DynamoDbAttribute("NoteId")
    public String getNoteId() { return this.noteId; }
    // Match the field and getter types. The courseware's setNoteId(Integer) does not compile.
    public void setNoteId(String noteId) { this.noteId = noteId; }

    @DynamoDbAttribute("Notes")
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @Override
    public String toString() {
        return "Notes [UserId=" + userId + ", NoteId=" + noteId + ", Notes=" + notes + "]";
    }
}
```

🆕 There is a reason `@DynamoDbAttribute("UserId")` is needed. When a table is generated from a data class, **its attribute names begin with a lowercase letter**, so to have an attribute name begin with an uppercase letter you must supply the name with `@DynamoDbAttribute(NAME)`.

> — Source: [Data class annotations (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html)

### 7.3 Java: Working with Items Using the Enhanced Client 🔄

Use the `table` method of `DynamoDbEnhancedClient`, passing the table name and table schema, to instantiate a `DynamoDbTable` object. With that object you can perform both table operations (`createTable()`, `deleteTable()`, `describeTable()`) and CRUD operations (scan, query, getItem, putItem, updateItem, and so on).

Courseware slide 42 calls `note.setNodeId("9")`. The class on slide 41 has no `setNodeId`, only `setNoteId`, so this is a typo.

```java
// Instantiate the enhanced client
static final DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.create();

// Instantiate the Notes table
static final DynamoDbTable<Note> notesTable = enhancedClient
        .table("Notes", TableSchema.fromBean(Note.class));

// A new note
Note note = new Note();
note.setUserId("UserA");
note.setNoteId("9");        // the courseware's setNodeId is a typo
note.setNotes("This is a note");

// Put the item
notesTable.putItem(note);

// Get the item
Note found = notesTable.getItem(
        Key.builder().partitionValue("UserA").sortValue("9").build());
```

🆕 When you create a table with the enhanced client and skip the builder by calling `notesTable.createTable()` alone, values for provisioned throughput are not set and the table's **billing mode is set to on-demand.** This points the same direction as "on-demand is the default and recommended option" in [Section 2.5](#25-choosing-initial-throughput).

> — Source: [Create a DynamoDB table if needed (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html)

### 7.4 .NET: Object Persistence Model and Document Model 🔄

The AWS SDK for .NET provides two higher-level models.

| Model | Namespace | Main classes | Create/update/delete tables |
|---|---|---|---|
| Object persistence model | `Amazon.DynamoDBv2.DataModel` | `DynamoDBContext` | **Not possible** 🔄 |
| Document model | `Amazon.DynamoDBv2.DocumentModel` | `Table`, `Document` | **Not possible** |

The courseware attaches the "cannot create, update, or delete tables" constraint only to the document model (slide 44). The current documentation states that **the object persistence model has the same constraint.** Both models provide only data operations, and you must use the low-level API to create, update, and delete tables. 🔄

#### Object Persistence Model

Each object instance maps to an item in the corresponding table. The entry point is the `DynamoDBContext` class, which provides a connection to DynamoDB and lets you access tables, perform CRUD operations, and run queries.

| Mapping style | Content |
|---|---|
| Explicit mapping | You **must** use the `DynamoDBHashKey` and `DynamoDBRangeKey` attributes for primary keys. For non-primary-key properties, define the mapping with `DynamoDBProperty` when the class property name and the table attribute name differ |
| Default mapping | Class properties map to table attributes **with the same name** |
| Exclusion | A class property marked with `DynamoDBIgnore` is not mapped and is excluded from saves and retrievals |
| Table mapping | The `DynamoDBTable` attribute maps the class to a table |

```csharp
[DynamoDBTable("Notes")]
public class NotesItems
{
    [DynamoDBHashKey]                 // partition key
    public string UserId { get; set; }

    [DynamoDBRangeKey]                // sort key
    public int NoteId { get; set; }

    [DynamoDBProperty("Tags")]        // when the property name differs from the table attribute name
    public List<string> NotesTags { get; set; }

    public string Notes { get; set; } // default mapping: maps to the same-named table attribute

    [DynamoDBIgnore]                  // not mapped
    public string NotesData { get; set; }
}
```

🆕 Two things the courseware does not cover: the object persistence model supports **optimistic locking**, which ensures you have the latest copy of the item you are about to update. And the data type mapping is as follows.

| .NET primitive type | DynamoDB type |
|---|---|
| All number types | `N` |
| All string types | `S` |
| `MemoryStream`, `byte[]` | `B` |
| `bool` | `N` (0 represents false, 1 represents true) |
| `DateTime` | `S` (stored as ISO-8601 formatted strings) |
| Collection types | `BS`, `SS`, `NS` |

#### Document Model

The `Table` class provides data operation methods such as `PutItem`, `GetItem`, and `DeleteItem`, along with `Query` and `Scan` methods. The `Document` class represents a single item in a table.

```csharp
// GetItem example
Table table = Table.LoadTable(client, "Notes");
GetItemOperationConfig config = new GetItemOperationConfig()
{
    AttributesToGet = new List<string>() { "UserId", "Notes" },
    ConsistentRead = true
};
Document doc = await table.GetItemAsync("StudentA", config);
```

The `UpdateItem` example on courseware slide 44 comments that `note["Favorite"] = null;` deletes an existing attribute. 🔄 The current documentation states that **`DynamoDBNull`** is used for the DynamoDB null type, and that empty string attribute values of string type and empty string values contained within List or Map type are **dropped from write requests.** To actually remove an attribute, the low-level `UpdateExpression` `REMOVE` clause is clearer.

```csharp
Table table = Table.LoadTable(client, "Notes");
var note = new Document();
// Set the attributes you want to update.
note["UserId"] = "StudentB"; // primary key
note["Notes"] = "Updated";
await table.UpdateItemAsync(note);
```

```bash
# To remove the attribute itself, use the REMOVE clause of the low-level UpdateExpression
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}' \
  --update-expression "REMOVE Favorite"
```

The document model maps DynamoDB's Boolean, null, list, and map types to `DynamoDBBool`, `DynamoDBNull`, `DynamoDBList`, and `Document` respectively.

> — Source: [Working with the .NET object persistence model and DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html), [Working with the .NET document model in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html)

### 7.5 Two Interfaces Not in the Courseware: PartiQL and Transactions 🆕

#### PartiQL

Amazon DynamoDB supports **PartiQL**, a SQL-compatible query language, to select, insert, update, and delete data.

| Item | Content |
|---|---|
| How to run it | The DynamoDB console, NoSQL Workbench, the AWS CLI, and the DynamoDB APIs |
| APIs | `ExecuteStatement`, `BatchExecuteStatement`, `ExecuteTransaction` |
| Performance | PartiQL operations provide **the same availability, latency, and performance** as the other DynamoDB data plane operations |
| Constraints | DynamoDB supports only a **subset** of the PartiQL query language and does not support the Amazon Ion data format or Ion literals |

```sql
SELECT UserId, Notes FROM Notes WHERE UserId = 'StudentA'
```

Even though PartiQL looks like SQL, the fact that omitting the partition key turns into a full scan internally does not change. The access pattern design in [Section 2.2](#22-key-nosql-design-concepts) still comes first.

> — Source: [PartiQL - a SQL-compatible query language for Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html)

#### Transactions

A conditional write ([Section 6.2](#62-conditional-write-operations)) guarantees atomicity for **a single item** only. When you need all-or-nothing behavior across multiple items or tables, use transactions.

| Item | `TransactWriteItems` | `TransactGetItems` |
|---|---|---|
| Nature | Synchronous, idempotent write | Synchronous read |
| Action count | Up to **100** | Up to **100** |
| Target items | Up to 100 **distinct** items in one or more tables within the same account and Region | Same |
| Total size | **4 MB** or less | **4 MB** or less |
| Action kinds | `Put`, `Update`, `Delete`, `ConditionCheck` | `Get` |

| Constraint | Content |
|---|---|
| Difference from `BatchWriteItem` | With `BatchWriteItem` only some actions might succeed, whereas a transaction **either succeeds entirely or makes no changes at all** |
| Indexes | **Transactions cannot be performed using indexes** |
| Duplicate items | You cannot target the same item with multiple actions within the same transaction |
| Idempotency | Achieved with a client token, which remains valid for **10 minutes** after the request that uses it finishes |
| Failure | A condition that is not met or a conflict with a concurrent transaction results in `TransactionCanceledException` |
| Isolation level | **Serializable** isolation applies between transactional operations and standard read and write operations |
| Capacity | A transactional write performs two underlying writes (prepare and commit), so it consumes **2 WCU** per item up to 1 KB, and that capacity is consumed even when the transaction is canceled by a failed condition check |

> — Source: [Amazon DynamoDB Transactions: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)

### 7.6 What About Python's Higher-Level Interface 🆕

The courseware covers only Java and .NET for higher-level interfaces and does not cover Python. In Python, the boto3 **resources interface** (`boto3.resource('dynamodb').Table(...)`) is what you notice first when looking for a higher-level interface. The direction, however, is settled.

| Item | Content |
|---|---|
| New features | The AWS Python SDK team **does not intend to add new features** to the resources interface in boto3 |
| Existing code | Existing interfaces will continue to operate during boto3's lifecycle |
| Access to newer features | Provided through the **client interface** |
| Thread safety | Resource instances are **not thread safe.** Do not share them across threads or processes; create a new one for each |
| Waiters | Resources also have waiters that poll until the resource reaches the state being polled for |

Write new code against `boto3.client('dynamodb')`.

```python
import boto3

ddb = boto3.client('dynamodb')

# Put an item — the client interface uses the DynamoDB JSON format directly
ddb.put_item(
    TableName='Notes',
    Item={
        'UserId': {'S': 'StudentD'},
        'NoteId': {'N': '42'},
        'Notes': {'S': 'Test note'},
    },
    # Prevent an overwrite
    ConditionExpression='attribute_not_exists(UserId)',
)

# Query — a paginator lets the SDK cross the 1 MB page boundary for you
paginator = ddb.get_paginator('query')
for page in paginator.paginate(
        TableName='Notes',
        KeyConditionExpression='UserId = :userid',
        ExpressionAttributeValues={':userid': {'S': 'StudentA'}}):
    for item in page['Items']:
        print(item)
```

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

---

## 8. DynamoDB Caching

### 8.1 DynamoDB Caching Options 🔄

Amazon DynamoDB is designed for scale and performance. **In most cases DynamoDB response times can be measured in single-digit milliseconds.** However, certain use cases require response times in **microseconds.** For those cases DAX delivers fast response times for accessing eventually consistent data.

The courseware presents two caching options, DAX and Amazon ElastiCache. The ElastiCache description differs from current documentation.

| Courseware statement | Verified content |
|---|---|
| "A web service you use to deploy and run server nodes compliant with the **Memcached or Redis** protocol" | ElastiCache works with the **Valkey, Memcached, and Redis OSS** engines |
| Assumes node-based clusters only | You can operate ElastiCache in two formats: a **serverless cache** or a node-based cluster |

| Format | Content |
|---|---|
| Serverless cache | Creates a highly available cache in under a minute with no instance provisioning and no node or cluster configuration. Compatible with Valkey 7.2 and higher, Memcached 1.6.22 and above, and Redis OSS 7.1 |
| Node-based cluster | You choose the node type, number of nodes, and node placement across Availability Zones, and whether to run in cluster mode. For node-based Valkey clusters you can enable durability to persist data in a distributed Multi-AZ transactional log |

As in the courseware, this lesson focuses on DAX.

> — Source: [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

### 8.2 Amazon DynamoDB Accelerator (DAX) 🆕

DAX is a **DynamoDB-compatible caching service** that lets demanding applications benefit from fast in-memory performance. The three core scenarios the courseware presents match the current documentation.

| # | Scenario |
|---|---|
| 1 | As an in-memory cache, DAX reduces the response times of eventually consistent read workloads **by an order of magnitude**, from single-digit milliseconds to microseconds |
| 2 | DAX reduces operational and application complexity by providing a managed service that is **API-compatible** with DynamoDB. It requires only minimal functional changes to use with an existing application |
| 3 | For read-heavy or bursty workloads, DAX provides increased throughput and potential operational cost savings by **reducing the need to overprovision read capacity units** |

DAX use cases where it fits and where it does not. Evidence and reasoning have been added to the courseware's lists.

| Fits | Reason |
|---|---|
| Applications that require the fastest possible response time for reads | Real-time bidding, social gaming, trading applications |
| Applications that read a small number of items more frequently than others | Mitigates the impact of a hot key and non-uniform traffic distribution |
| Applications that are read-intensive but also cost-sensitive | Offloading read activity to DAX reduces the read capacity units you need to purchase |
| Applications that require repeated reads against a large set of data | Avoids diverting read capacity from other applications |

| Does not fit | Reason |
|---|---|
| Applications that require strongly consistent reads | DAX provides access to **eventually consistent** data |
| Applications that do not require microsecond response times for reads | There is no benefit if you do not need to offload repeated reads from the table |
| Write-intensive applications | 🆕 A high volume of writes leads to **increased replication across DAX nodes in a cluster**, which increases resource consumption and the risk of availability issues |
| Applications without many repeated reads | 🆕 DAX performs best when **cache hit rates exceed 90%.** Lower hit rates increase cache misses, which consumes more cluster resources |

DAX characteristics the courseware does not cover: 🆕

| Item | Content |
|---|---|
| Scale | A Multi-AZ DAX cluster can serve **millions of requests per second** |
| Encryption | Supports both **encryption at rest** (data DAX writes to disk when propagating changes from the primary node to read replicas) and **encryption in transit** (TLS, with cluster x509 certificate verification) |
| Supported languages | Go, Java, Node.js, Python, and .NET |
| Platform | **EC2-VPC only** |
| IAM | The cluster service role policy must allow **`dynamodb:DescribeTable`** |
| Caution | DAX clusters maintain metadata about the **top-level attribute names** of the items they store **indefinitely.** Using timestamps, UUIDs, or session IDs as attribute **names** can exhaust cluster memory over time (attribute **values** are not a problem) |

> — Source: [In-memory acceleration with DynamoDB Accelerator (DAX)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html)

### 8.3 Requests DAX Handles 🔄

The four read operations on courseware slide 48 match the current documentation. The write operations list is missing one.

| Category | Courseware statement | Verified content |
|---|---|---|
| Read | `GetItem`, `BatchGetItem`, `Query`, `Scan` | Same |
| Write (write-through) | `BatchWriteItem`, `UpdateItem`, `DeleteItem`, `PutItem` | These four **plus `TransactWriteItems`** |

How read requests flow:

| Request type | Behavior |
|---|---|
| Eventually consistent read (default) — cache hit | Returned from the cache without accessing DynamoDB |
| Eventually consistent read (default) — cache miss | The request passes through to DynamoDB, and the results are returned while also being **written to the cache on the primary node** |
| **Strongly consistent read** | DAX passes the request through to DynamoDB and **does not cache the results** 🆕 |

How write requests flow (write-through):

1. DAX sends the request to DynamoDB.
2. DynamoDB confirms that the write succeeded.
3. DAX writes the item to its item cache.
4. DAX returns success to the requester.

So the operation is successful **only if the data is successfully written to both the table and DAX.** 🆕 If a write to DynamoDB fails for any reason, including throttling, the item is not cached in DAX and the exception is returned to the requester. `TransactWriteItems` is slightly different: once DynamoDB confirms the transaction completed, DAX returns success immediately and in the background makes a `TransactGetItems` request for each item to populate the item cache (to ensure serializable isolation).

🆕 An important constraint the courseware does not cover: **DAX does not recognize table management operations such as `CreateTable` and `UpdateTable`.** If your application needs to perform these operations, it must access DynamoDB directly rather than using DAX.

If the number of requests exceeds the capacity of a node, DAX returns a `ThrottlingException`. Monitor the `ThrottledRequestCount` metric in CloudWatch, and consider scaling up the cluster if you see these exceptions regularly.

> — Source: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html), [DAX and DynamoDB consistency models](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.consistency.html)

### 8.4 The Two DAX Caches 🆕

Every DAX cluster has two distinct caches: an **item cache** and a **query cache.** They serve different purposes and operate independently of one another.

| Cache | What it stores | Key |
|---|---|---|
| Item cache | Results from `GetItem` and `BatchGetItem` | The item's primary key values |
| Query cache | Result sets from `Query` and `Scan` | The request **parameter values** |

| Item | Content |
|---|---|
| Item cache TTL | **5 minutes** by default. You can specify it when you create the cluster |
| If TTL is set to zero | The item cache is refreshed only by LRU eviction or a write-through operation, and the query cache does not cache the response |
| Eviction | Both caches maintain an LRU list and evict older entries when full, even ones that have not expired. The LRU algorithm is always enabled and is not user-configurable |
| Interaction between caches | **Writes to the item cache do not affect the query cache.** You cannot warm up the item cache by performing a `Scan` |
| Consistency among nodes | Changes on the primary node are replicated to the other nodes. This replication is **eventually consistent** and usually takes less than one second. Two clients reading the same key from the same cluster can therefore receive different values depending on the node they accessed |
| Changes that bypass DAX | If an application modifies the DynamoDB table directly, bypassing DAX, DAX and DynamoDB hold inconsistent values for the same key until the TTL expires |

Applications that use DAX should be designed **to tolerate eventually consistent data.**

> — Source: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html)

### 8.5 DAX Cluster Configuration 🆕

The courseware covers DAX only at a conceptual level. The values you actually need when creating a cluster are as follows.

| Item | Content |
|---|---|
| Node | The smallest building block of a cluster. Each node runs an instance of the DAX software and maintains a single replica of the cached data |
| Ways to scale | (1) Add more nodes to increase overall read throughput (2) Use a larger node type (which requires creating a new cluster) |
| Node type | **Every node within a cluster is of the same node type** |
| Primary node | Fulfills requests for cached data, **handles write operations to DynamoDB**, and evicts data according to the cluster's eviction policy |
| Read replicas | Fulfill requests for cached data and evict data. **They do not write to DynamoDB** |
| Maximum nodes per cluster | **11** (the primary node plus a maximum of 10 read replicas) |
| Production recommendation | **At least three nodes**, each placed in a different Availability Zone. Three nodes are required for fault tolerance |
| One- and two-node clusters | For development and test workloads. **Not fault-tolerant.** Software or hardware errors can make the cluster unavailable or lose cached data |
| Tables per cluster | A maximum of **500**. Going beyond that may degrade availability and performance |
| Region | A DAX cluster in a Region can only interact with DynamoDB tables **in the same Region.** If you have tables in other Regions you must launch clusters there too |
| Networking | Runs in a VPC; add a security group ingress rule for **TCP port 8111** |
| Failover | On primary node failure, DAX automatically fails over to a read replica and designates it as the new primary |
| Runtime settings | Settings such as cache TTL policy are managed with **parameter groups** so that all nodes in a cluster are configured identically |

Using the cluster endpoint means your application does not need to know the hostnames and port numbers of individual nodes.

```text
# Cluster endpoint without encryption in transit
dax://my-cluster.l6fzcv.dax-clusters.us-east-1.amazonaws.com

# Cluster endpoint configured to use encryption in transit
daxs://my-encrypted-cluster.l6fzcv.dax-clusters.us-east-1.amazonaws.com
```

> — Source: [DAX cluster components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.cluster.html)

### 8.6 DAX Node Types 🆕

DAX offers two instance families.

| Family | Examples | Characteristics |
|---|---|---|
| Fixed performance | R4, R5, R7 | Recommended for databases that need consistently high CPU performance |
| Burstable performance | T2, T3 | Provide a baseline CPU performance with the ability to burst above it when needed. Baseline performance and burst capability are governed by **CPU credits** |

| Aspect | DAX T2 | DAX T3 |
|---|---|---|
| Mode | **Standard mode** | **Unlimited mode** |
| After credits are exhausted | CPU utilization is gradually lowered to the baseline level | Can burst above the baseline even when the CPU credit balance is zero (for an additional charge) |
| Intended for | Test and development workloads that need price predictability | Workloads with moderate CPU usage that experience temporary spikes |

For example, a `dax.t3.small` instance receives 24 CPU credits per hour, giving baseline performance equivalent to **20%** of a CPU core, and stores up to **576 CPU credits.** One CPU credit provides the performance of a full CPU core for one minute.

> — Source: [DAX T3/T2 burstable instances](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.Burstable.html)

### 8.7 The DAX Client

To use DAX from an application, you use the **DAX client** for your programming language. This is what the courseware instructor notes mean by "using DAX requires the Amazon DynamoDB Accelerator (DAX) SDK." The DAX client is designed for minimal disruption to your existing DynamoDB applications, with only **a few simple code modifications** needed.

You deploy your application together with the DAX client on an EC2 instance, and at runtime the DAX client directs all of your application's DynamoDB API requests to the DAX cluster. If DAX can process a request directly it does so; otherwise it passes the request through to DynamoDB.

> — Source: [Developing with the DynamoDB Accelerator (DAX) client](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.client.html)

---

## 9. Changes from the Courseware

These are items in the courseware (the instructor deck) that differ from current behavior. Because learners have the official courseware in hand, we record what changed and why.

### 9.1 Courseware Statements That Do Not Match the Facts

| Item | Courseware statement | Verified content | Source |
|---|---|---|---|
| RCU example (slide 10) | "A query returning a 2 KB item is charged 1 RCU" | 1 RCU is the **strongly consistent** read figure. With the default eventually consistent read used by `GetItem`, `Query`, and `Scan` it is **0.5 RCU**, and a transactional read is 2 RCU. The 2 WCU in the same example is correct | [Read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html) |
| Sort key operator list (slide 30) | The body lists `=, <, >, <=, >=, AND, BETWEEN or begins_with`; the instructor notes list six without `BETWEEN` | `AND` is not a standalone operator but part of the `BETWEEN :v1 AND :v2` construct. The accurate list is `=`, `<`, `<=`, `>`, `>=`, `BETWEEN :v1 AND :v2`, and `begins_with(sortKeyName, :val)`, and `begins_with` cannot be used with a Number sort key. The body and the notes disagree with each other | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| Effect of a filter expression (slide 30) | "Combining the two gives you a refined dataset without reading more items than necessary" | DynamoDB calculates capacity from **item size**, not the amount of data returned, and consumed capacity is the same whether or not a `FilterExpression` is used. The same applies to `Scan`. What reduces the amount read is `KeyConditionExpression`, `Limit`, and secondary indexes | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| Condition expression syntax (slide 37) | `--condition-expression "Favorite NOT yes"` | In the condition expression grammar, `NOT` is a **logical operator that negates a single condition**, so it cannot be used as a binary comparison, and a value such as `yes` cannot be a literal and must be passed as an expression attribute value. The courseware's values file also lacks the value the condition needs | [Condition and filter expressions, operators, and functions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html) |
| `@DynamoDbPartition` (slide 41) | The partition key annotation in the code | No such name exists in the official data class annotation list. The correct name is **`@DynamoDbPartitionKey`**, which the instructor notes on the same slide write correctly | [Data class annotations](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html) |
| `ddb.createTable("Notes")` (slide 18) | Passes a string literal | The slide annotation and instructor notes say the information in the `CreateTableRequest` object is used, but the code differs. `DynamoDbClient.createTable` has only overloads that take a request object or a builder `Consumer` | [Create a DynamoDB table if needed (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| `waitUntilTableExists("Notes")` (slide 18) | Passes a string literal | The official example uses `waiter.waitUntilTableExists(b -> b.tableName("Notes").build())`, passing a builder that constructs a `DescribeTableRequest` | [Create a DynamoDB table if needed (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| `NoteId` attribute type (slides 13 and 14) | Slide 13 code and notes say `S`; slide 14 notes say `N` | Valid `AttributeType` values are `S`, `N`, and `B`, so either is syntactically possible, but two definitions cannot coexist for one `Notes` table. Since the .NET example on slide 15 and every CLI example from slide 25 onward use `N`, this document standardizes on `N` | [AttributeDefinition](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html) |
| .NET code typos (slide 16) | `AttributeName = "NoteId",I` and `},,` | A stray character and a duplicated comma mean the code does not compile. These are courseware typos, so the code was corrected without an AWS documentation source | — (see [Section 9.5](#95-items-we-could-not-verify)) |
| query CLI JSON (slide 30) | `'{":userid":{"S":"StudentA"}'` | A missing closing brace makes JSON parsing fail. This is a courseware notation error | — (see [Section 9.5](#95-items-we-could-not-verify)) |
| Enhanced client example (slides 41 and 42) | Class name `Note` versus `NotesItems` and `NotesItem` in the notes, `setNoteId(Integer)`, `note.setNodeId("9")` | Three names are mixed; the field and getter are `String` while only the setter is `Integer`, so it does not compile; and `setNodeId` is a nonexistent method. These are internal courseware inconsistencies | — (see [Section 9.5](#95-items-we-could-not-verify)) |

### 9.2 Changed Behavior and Defaults

| Item | Courseware statement | Current | Source |
|---|---|---|---|
| Provisioned throughput decreases | "You can decrease up to four times per day, at any time" | A day (UTC) starts with 4 decreases and **1 is replenished each hour**, with a maximum of 4 available at any time, allowing up to **27** over 24 hours. Table and GSI limits are decoupled, but if a single request decreases both and either exceeds its limit the entire request is rejected | [DynamoDB quotas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| Capacity mode switching | "You can switch read/write capacity mode once every 24 hours" | Provisioned → on-demand is limited to **four times in a 24-hour rolling window**; on-demand → provisioned can be done **at any time** | [Considerations when switching capacity modes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-switching-capacity-modes.html) |
| Capacity at table creation | "You must provision the table's capacity when you create a table using the AWS CLI or an AWS SDK" | `BillingMode` on `CreateTable` is not required, and with `PAY_PER_REQUEST` you cannot specify `ProvisionedThroughput`. The documentation describes on-demand as the **default and recommended throughput option**, and calling `createTable()` without a builder on the enhanced client sets the billing mode to on-demand | [On-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| Order in which capacity modes are presented | Provisioned first, on-demand as the alternative for "unknown workloads" | On-demand is the **default and recommended** option for most workloads. Provisioned is for steady workloads with predictable growth | [On-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| Capacity of a failed conditional write | "If the item does not currently exist in the table, **one** write capacity unit is consumed" | The documentation does not state a fixed value of one; consumption is based on **the size of the existing item or of the new item you are trying to create or update** (example: existing 300 KB, new item 310 KB → based on 310 KB) | [Read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html) |
| Meaning of `LastEvaluatedKey` | Request the next page "if the value is not `null`" | A non-empty `LastEvaluatedKey` only means the request stopped at a page boundary (1 MB or `Limit`); it is **not a guarantee that more matching items remain.** With a filter, a page with zero matching items can still include the key | [Paginating table query results](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html) |
| Attribute values and `null` | "Attribute values cannot be `null`" | **Empty string and binary values are allowed** on non-key attributes; only string and binary values used as key attributes for a table or index must have a length greater than zero. Set types cannot be empty | [PutItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html) |
| `CreateTableResult` | `CreateTableResult result = ddb.createTable(request);` | The AWS SDK for Java 2.x return type is **`CreateTableResponse`**, with `tableDescription()` returning the table properties. `CreateTableResult` is the 1.x class name | [CreateTableResponse (Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/dynamodb/model/CreateTableResponse.html) |
| .NET synchronous methods | `client.CreateTable` / `UpdateTable` / `DeleteTable` / `ListTables` | The current official .NET (v4) DynamoDB code examples use **asynchronous methods** (`CreateTableAsync` and so on) and specify `BillingMode.PAY_PER_REQUEST` | [CreateTable code examples](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_CreateTable_section.html) |
| Constraint on the .NET object persistence model | Attaches the "cannot create or delete tables" constraint only to the document model | **The object persistence model has the same constraint.** Both models provide only data operations, and the low-level API is required to create, update, and delete tables | [.NET object persistence model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html) |
| Assigning `null` in the document model | `note["Favorite"] = null;` to delete an attribute | The documentation states that **`DynamoDBNull`** is used for the DynamoDB null type, and that empty string values of string type and empty strings inside List or Map are dropped from write requests. To remove an attribute, the `REMOVE` clause of `UpdateExpression` is clearer | [.NET document model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html) |
| DAX supported write operations | Four: `BatchWriteItem`, `UpdateItem`, `DeleteItem`, `PutItem` | These four **plus `TransactWriteItems`.** For `TransactWriteItems`, DAX returns success after DynamoDB confirms completion and populates the cache in the background using `TransactGetItems` | [DAX consistency models](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.consistency.html) |
| ElastiCache engines | "Server nodes compliant with the Memcached or Redis protocol" | **Valkey, Memcached, and Redis OSS** — three engines. In addition to node-based clusters there is a **serverless cache** format | [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html) |
| `ListTables` results | States only that "it does not require any parameters" (which is correct) | The output is **paginated at a maximum of 100 names per page**, and `Limit` defaults to 100 when omitted (range 1–100). Retrieving everything requires a `LastEvaluatedTableName` → `ExclusiveStartTableName` loop | [ListTables API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ListTables.html) |

### 9.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS SDK for Java 1.x (Java examples on slides 19–20) | **End-of-support on December 31, 2025** (announced January 12, 2024; maintenance mode July 31, 2024) | AWS SDK for Java 2.x (`software.amazon.awssdk`). Use `DynamoDbClient` for table operations, `DynamoDbEnhancedClient` for mapping, and `EnhancedDocument` to avoid data type descriptors | [Programming DynamoDB with the AWS SDK for Java 2.x](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html) |
| Legacy conditional parameters (`AttributesToGet`, `Expected`, `KeyConditions`, `QueryFilter`, `ScanFilter`, `AttributeUpdates`, `ConditionalOperator`) | Discouraged. **Cannot be mixed** with expression parameters | `ProjectionExpression`, `ConditionExpression`, `KeyConditionExpression`, `FilterExpression`, `UpdateExpression`. The courseware already uses only expression-based parameters, which matches current guidance | [Legacy conditional parameters](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html) |
| boto3 resources interface (not in the courseware; the path you meet when looking for a Python higher-level interface) | No plans to add new features. Existing interfaces continue to operate | `boto3.client('dynamodb')`. Resource instances are not thread safe and must be created per thread | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

### 9.4 Added After the Courseware

| Item | Summary | Source |
|---|---|---|
| PartiQL | A SQL-compatible query language. `ExecuteStatement`, `BatchExecuteStatement`, `ExecuteTransaction`. Runs from the console, NoSQL Workbench, CLI, and APIs. DynamoDB supports only a subset and does not support Amazon Ion | [PartiQL for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html) |
| Transactions | `TransactWriteItems` (up to 100 actions, 100 distinct items, 4 MB) and `TransactGetItems` (same). Actions are `Put`, `Update`, `Delete`, `ConditionCheck`. No index targets, no duplicate items, 10-minute client token, `TransactionCanceledException`, serializable isolation | [DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html) |
| Secondary index quotas | Up to 5 LSIs per table; default quota of 20 GSIs per table (adjustable). Projected attributes limited to 100 across all indexes (`INCLUDE` only). LSIs have a 10 GB limit per partition key value | [DynamoDB quotas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| Consistency difference between GSI and LSI | GSIs support eventually consistent reads only; specifying `ConsistentRead=true` raises `ValidationException` | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| Other table quotas | Binary units (1 KB = 1024 B), no table size limit, initial quota of 2,500 tables per account per Region, 40,000/40,000 throughput per table, 80,000/80,000 provisioned per account | [DynamoDB quotas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| Values for burst and adaptive capacity | Burst retains up to five minutes (300 seconds) of unused capacity. Adaptive capacity is automatic and free. Partition limits are 3,000 reads and 1,000 writes. Item collections are not split when an LSI exists | [Burst and adaptive capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html) |
| On-demand initial throughput | New on-demand tables sustain 4,000 writes and 12,000 reads per second immediately, and instantly accommodate double the previous peak. Maximum throughput settings bound costs | [On-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| `CreateTable` asynchronous behavior | `CREATING` → `ACTIVE`, reads and writes only on `ACTIVE`. Table names unique within a Region; only one table with secondary indexes can be `CREATING` at a time | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| `BatchWriteItem` details | The difference between 400 KB once stored and the JSON representation in transit, `UnprocessedItems` plus exponential backoff, no per-request conditions, key length limits (partition 2,048 B, sort 1,024 B) | [BatchWriteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) |
| `BatchGetItem` details | `ValidationException` beyond 100 items, partial results when more than 1 MB per partition is requested, `UnprocessedKeys`, no ordering guarantee, `ValidationException` on duplicate keys | [BatchGetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html) |
| `ScannedCount` and `Count` for `Scan` | `ScannedCount` is the pre-filter evaluated count and `Count` the post-filter count; a large former with a small latter is inefficient. Scanning an LSI consumes base table capacity, and a GSI consumes index capacity | [Scan documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html) |
| Parallel scan segment assignment | Segments are assigned by partition key hash, so the same partition key always lands in the same segment. Distribution can be uneven, so more segments do not guarantee better performance | [Scan documentation — Parallel scan](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html) |
| The three interfaces in Java 2.x | Low-level / enhanced client / Document (`EnhancedDocument`, `fromJson`, `toJson`). `@DynamoDbImmutable` for immutable classes. `queryPaginator` and `scanPaginator` for automatic pagination | [Programming DynamoDB with the AWS SDK for Java 2.x](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html) |
| Enhanced client annotation list | `@DynamoDbAtomicCounter`, `@DynamoDbAutoGeneratedTimestampAttribute`, `@DynamoDbAutoGeneratedUuid`, `@DynamoDbVersionAttribute`, `@DynamoDbUpdateBehavior`, `@DynamoDbFlatten`, and more. Attribute annotations go on the getter or the setter, not both | [Data class annotations](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html) |
| Enhanced client attribute naming rule | Tables generated from a data class have attribute names beginning with a lowercase letter. Use `@DynamoDbAttribute(NAME)` to begin with an uppercase letter | [Create a DynamoDB table if needed (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| Optimistic locking in the .NET object persistence model | Supports optimistic locking to ensure you have the latest copy of the item you are about to update | [.NET object persistence model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html) |
| DAX handling of strongly consistent reads | Strongly consistent reads pass through to DynamoDB and are **not cached.** DAX does not recognize table management operations | [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html) |
| The two DAX caches | The item cache (TTL 5 minutes by default) and the query cache are separate and operate independently. Item cache writes do not affect the query cache. LRU is always enabled | [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html) |
| DAX cluster configuration | Up to 11 nodes per cluster (1 primary + 10 replicas), at least 3 nodes across AZs for production, 500 tables per cluster, TCP port 8111, `dax://` and `daxs://` endpoints, parameter groups | [DAX cluster components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.cluster.html) |
| DAX node types | Fixed performance (R4, R5, R7) and burstable (T2 standard mode, T3 unlimited mode). `dax.t3.small` gets 24 credits per hour, 20% baseline, up to 576 credits | [DAX T3/T2 burstable instances](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.Burstable.html) |
| DAX operational constraints | EC2-VPC only, best above a 90% cache hit rate, top-level attribute name metadata retained indefinitely, encryption at rest and in transit supported, Go, Java, Node.js, Python, and .NET supported | [DAX overview](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html) |

### 9.5 Items We Could Not Verify

We record these honestly. Confirm them before stating them definitively in class.

| Item | Status |
|---|---|
| The value applied when `BillingMode` is omitted from `CreateTable` | Two things were confirmed: that `BillingMode` is not a required parameter of `CreateTable` (CreateTable API documentation), and that on-demand is described as "the default and recommended throughput option" (on-demand capacity mode documentation). However, **we did not find a sentence stating which value applies when `BillingMode` is omitted entirely from an API call.** That calling `createTable()` without a builder on the enhanced client yields on-demand was confirmed in the Java developer guide, but that is SDK high-level behavior and cannot be assumed identical to the API default. In practice it is safer to **state `BillingMode` explicitly** |
| The full list of DAX node types and their specifications | The existence of the fixed performance family (R4, R5, R7) and the burstable family (T2, T3), the mode difference between them, and the `dax.t3.small` credit figures were confirmed in the DAX T3/T2 documentation. **The full list of available node types is pointed to the pricing page by the documentation and was not retrieved for this document.** Check the pricing page directly when sizing a cluster |
| The DAX client distribution site | The DAX documentation notes that clients for various languages are available on a separate distribution site. That site is an HTTP-only address and is not on this project's list of citable domains, so **it was not retrieved.** Only the fact that the documentation links to it was confirmed |
| .NET code typos on slide 16 (`,I`, `},,`) | Notation errors that prevent compilation. These are not the kind of fact you verify against AWS documentation but courseware typos, so only the code was corrected and no source citation was attached |
| The missing closing brace in the query CLI on slide 30 | Not a documentation verification target for the same reason. It is a notation error that breaks JSON parsing, and only the brace was restored |
| Name and type inconsistencies in the enhanced client example on slides 41 and 42 | The three mixed class names, the `setNoteId(Integer)` type mismatch, and the `setNodeId` typo are all internal courseware inconsistencies. They are not verifiable against external documentation, so only the names and types were aligned |
| Whether `NoteId` should be defined as `S` or `N` | We confirmed that valid `AttributeType` values are `S`, `N`, and `B` and that primary key attributes must be string, number, or binary. **Which one is the "correct" design for this application cannot be determined from AWS documentation.** This document chose `N` on the majority evidence that the .NET example on slide 15 and every CLI example from slide 25 onward use `N` |
| Whether the .NET document model still supports synchronous methods | The .NET examples in this document use `GetItemAsync` and `UpdateItemAsync`, matching the official .NET (v4) DynamoDB code examples that use async. **We did not separately confirm whether the document model's `Table` class still exposes synchronous `GetItem` and `Update`.** The document model documentation names the provided methods as `PutItem`, `GetItem`, and `DeleteItem` |
| Lab 3 workflow (slides 51 and 52) | The original deck has only a diagram with no text. There was no source text to summarize, so this document does not cover it |
