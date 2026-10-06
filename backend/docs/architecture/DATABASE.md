# Database Conventions

MongoDB via Mongoose. This document covers schema design, soft deletes, indexes, and naming rules. Read `MULTI_TENANCY.md` first — it defines the `workspaceId` contract that underpins everything here.

---

## BaseSchema

**Location:** `src/common/base/base.schema.ts`

Every schema in the project extends `BaseSchema`. It provides the fields that must exist on every document without exception.

```typescript
import { Prop } from '@nestjs/mongoose';

export abstract class BaseSchema {
  @Prop({ required: true, index: true })
  workspaceId: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;

  // createdAt and updatedAt are injected by { timestamps: true } in @Schema()
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields provided by BaseSchema

| Field | Type | Default | Purpose |
|---|---|---|---|
| `workspaceId` | `string` | — (required) | Tenant isolation key. Never null. |
| `isDeleted` | `boolean` | `false` | Soft-delete flag. |
| `deletedAt` | `Date \| null` | `null` | Timestamp of soft deletion. |
| `createdAt` | `Date` | set by Mongoose | Injected by `{ timestamps: true }`. |
| `updatedAt` | `Date` | set by Mongoose | Injected by `{ timestamps: true }`. |

### How to extend BaseSchema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ collection: 'projects', timestamps: true })
export class Project extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'active' })
  status: 'active' | 'on-hold' | 'completed' | 'archived';
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
```

Always pass `timestamps: true` in `@Schema()` options. Without it, `createdAt` and `updatedAt` are not populated.

---

## Soft Delete Policy

**Never use hard deletes.** The only exceptions are:

1. An explicit, irreversible account-deletion flow requested by the workspace owner
2. Purging data as part of a GDPR deletion request (handled by a dedicated admin process, not a standard API endpoint)

### Soft delete in BaseRepository

`BaseRepository.softDelete()` sets `isDeleted: true` and `deletedAt: new Date()`. All `find` methods in `BaseRepository` include `isDeleted: false` in every query, so soft-deleted documents are invisible to normal operations.

```typescript
// What BaseRepository does internally on every find:
this.model.find({ workspaceId, isDeleted: false, ...otherFilters })
```

### Querying deleted documents

If a service legitimately needs to access soft-deleted records (e.g., an audit log), it must call the Mongoose model directly from the repository with an explicit filter — never through the standard `findAll` / `findOne` methods of `BaseRepository`.

```typescript
// In a custom repository method (explicitly named to signal intent)
async findDeleted(workspaceId: string): Promise<T[]> {
  return this.model.find({ workspaceId, isDeleted: true }).exec();
}
```

---

## Index Strategy

### Required indexes for every collection

Every schema MUST declare these three indexes at minimum:

```typescript
// 1. Standalone workspaceId — for queries that only filter by tenant
Schema.index({ workspaceId: 1 });

// 2. Compound: workspaceId + status — for filtered list views
Schema.index({ workspaceId: 1, status: 1 });

// 3. Compound: workspaceId + createdAt — for sorted/paginated lists
Schema.index({ workspaceId: 1, createdAt: -1 });
```

### When to add additional indexes

Add a compound index for any query pattern that will run at high frequency:

```typescript
// workspaceId + a date field used in range queries (e.g., invoice due dates)
InvoiceSchema.index({ workspaceId: 1, dueDate: 1 });

// workspaceId + a foreign key used in joins (e.g., all tasks for a project)
TaskSchema.index({ workspaceId: 1, projectId: 1 });

// Unique constraint scoped to workspace (e.g., client email unique per workspace)
ClientSchema.index({ workspaceId: 1, email: 1 }, { unique: true, sparse: true });
```

### Index declaration location

Declare all indexes at the bottom of the schema file, after `SchemaFactory.createForClass()`:

```typescript
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ workspaceId: 1 });
InvoiceSchema.index({ workspaceId: 1, status: 1 });
InvoiceSchema.index({ workspaceId: 1, createdAt: -1 });
InvoiceSchema.index({ workspaceId: 1, dueDate: 1 });
InvoiceSchema.index({ workspaceId: 1, clientId: 1 });
```

---

## Naming Conventions

### Collections

Collection names are `plural-kebab-case`. They are set explicitly via the `collection` option in `@Schema()` — never rely on Mongoose's auto-pluralization.

```typescript
@Schema({ collection: 'invoice-lines', timestamps: true })
export class InvoiceLine extends BaseSchema { ... }
```

| Module | Collection name |
|---|---|
| clients | `clients` |
| projects | `projects` |
| tasks | `tasks` |
| invoices | `invoices` |
| invoice lines | `invoice-lines` |
| time entries | `time-entries` |
| workspaces | `workspaces` |
| users | `users` |
| subscriptions | `subscriptions` |
| docs | `documents` |
| agenda | `events` |

### Mongoose model names

Model names are `PascalCase` (singular), matching the class name. NestJS injects them by `Class.name`:

```typescript
MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])
//                                ^^^^^^^^^^^^^^ resolves to 'Client'
```

### Foreign key field names

Reference fields use the suffix `Id` in camelCase:

```typescript
@Prop({ required: true })
clientId: string;   // not client_id, not clientID

@Prop({ required: true })
projectId: string;
```

Do not use Mongoose `ref` / `populate()` for cross-tenant queries. Foreign keys are stored as strings. Joins are performed at the application layer when needed.

---

## Pagination Convention

List endpoints return a paginated response. `BaseRepository` supports pagination via the `QueryOptions` pattern:

```typescript
async findAll(
  workspaceId: string,
  filters: FilterQuery<T> = {},
  options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {},
): Promise<{ data: T[]; total: number; page: number; limit: number }> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const sort = options.sort ?? { createdAt: -1 };
  const skip = (page - 1) * limit;

  const query = { ...filters, workspaceId, isDeleted: false };

  const [data, total] = await Promise.all([
    this.model.find(query).sort(sort).skip(skip).limit(limit).exec(),
    this.model.countDocuments(query),
  ]);

  return { data, total, page, limit };
}
```

The response envelope shape:

```json
{
  "data": [...],
  "total": 84,
  "page": 2,
  "limit": 20
}
```

---

## Schema Design Rules

1. **No embedded documents for shared entities.** Use string foreign keys instead. Embedded arrays are fine for line items owned exclusively by the parent (e.g., `InvoiceLine[]` inside an `Invoice`).
2. **Enums as string unions, not TypeScript enums.** Use `'active' | 'archived'` in the TypeScript class and `String` type in `@Prop()`. Mongoose handles validation at the application layer via DTOs.
3. **Money fields are stored in the smallest currency unit (cents/pence/etc.) as integers.** Never store floats for money.
4. **Dates are always stored as UTC `Date` objects.** No string dates in the database.
5. **Required fields must have `required: true` in `@Prop()`.** Mongoose-level enforcement is a last-resort safety net, but DTOs with `class-validator` are the primary validation layer.
