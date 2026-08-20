# Multi-Tenancy Architecture

This is the most critical document in the codebase. Every feature, query, and schema decision must be understood in this context.

---

## Strategy: Shared Database, Separated Collections

Orkpad uses a **shared database with document-level tenant isolation**. There is one MongoDB database. All tenants (workspaces) store their data in the same collections. Isolation is enforced by filtering every single query on `workspaceId`.

This is different from:
- **Separate databases per tenant** — we do not do this (too expensive to scale)
- **Separate collections per tenant** — we do not do this (collection explosion, no schema control)

The consequence is: **a missing `workspaceId` filter is a security vulnerability, not just a bug.** It leaks one customer's data to another.

---

## The workspaceId Contract

### Rule

> Every document stored in MongoDB MUST have a `workspaceId` field.
> Every query against MongoDB MUST include a `workspaceId` filter.

No exceptions. Even internal background jobs must pass a workspaceId when querying tenant data.

### Where workspaceId comes from

On every authenticated HTTP request, the `workspaceId` is extracted from the JWT payload by `WorkspaceTenantInterceptor` and attached to the request object at `request.workspaceId`. Controllers extract it via the `@WorkspaceId()` parameter decorator and pass it down to the service layer.

---

## WorkspaceTenantInterceptor

**Location:** `src/common/interceptors/workspace-tenant.interceptor.ts`

This interceptor runs on every request (registered globally in `main.ts`). It:

1. Reads the decoded JWT payload already attached by `JwtAuthGuard` (`request.user`)
2. Extracts `workspaceId` from the payload
3. Attaches it to the request object as `request.workspaceId`
4. Calls `next.handle()` to continue

```typescript
@Injectable()
export class WorkspaceTenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard

    if (!user?.workspaceId) {
      throw new UnauthorizedException('No workspace context found in token');
    }

    request.workspaceId = user.workspaceId;
    return next.handle();
  }
}
```

**Registration in `main.ts`:**

```typescript
app.useGlobalInterceptors(new WorkspaceTenantInterceptor());
```

The interceptor runs **after** `JwtAuthGuard` in the pipeline, so `request.user` is already populated when it executes.

---

## @WorkspaceId() Decorator

**Location:** `src/common/decorators/workspace-id.decorator.ts`

A parameter decorator that extracts `workspaceId` from the request object. Used in controller method parameters.

```typescript
export const WorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceId;
  },
);
```

**Usage in a controller:**

```typescript
@Get()
findAll(@WorkspaceId() workspaceId: string) {
  return this.clientsService.findAll(workspaceId);
}
```

---

## BaseRepository Pattern

**Location:** `src/common/base/base.repository.ts`

All repository classes extend `BaseRepository<T>`. It enforces workspaceId on every operation at the infrastructure level so services cannot accidentally omit it.

```typescript
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(
    workspaceId: string,
    filters: FilterQuery<T> = {},
  ): Promise<T[]> {
    return this.model.find({ ...filters, workspaceId, isDeleted: false }).exec();
  }

  async findOne(
    workspaceId: string,
    id: string,
  ): Promise<T | null> {
    return this.model
      .findOne({ _id: id, workspaceId, isDeleted: false })
      .exec();
  }

  async create(workspaceId: string, data: Partial<T>): Promise<T> {
    const document = new this.model({ ...data, workspaceId });
    return document.save();
  }

  async update(
    workspaceId: string,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: data },
        { new: true },
      )
      .exec();
  }

  async softDelete(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }

  async countDocuments(
    workspaceId: string,
    filters: FilterQuery<T> = {},
  ): Promise<number> {
    return this.model.countDocuments({ ...filters, workspaceId, isDeleted: false });
  }
}
```

**Extending BaseRepository:**

```typescript
@Injectable()
export class ClientsRepository extends BaseRepository<ClientDocument> {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {
    super(clientModel);
  }
}
```

---

## Correct vs Incorrect Query Patterns

### CORRECT — always filtered by workspaceId

```typescript
// Via BaseRepository (preferred)
const clients = await this.clientsRepository.findAll(workspaceId);

// Direct Mongoose (only in BaseRepository itself)
const client = await this.model.findOne({ _id: id, workspaceId });
```

### INCORRECT — missing workspaceId filter

```typescript
// NEVER DO THIS — returns data from ALL workspaces
const clients = await this.clientModel.find({});

// NEVER DO THIS — finds a document regardless of which workspace owns it
const client = await this.clientModel.findById(id);

// NEVER DO THIS — service bypassing the repository
const invoice = await this.invoiceModel.find({ status: 'paid' });
```

### INCORRECT — raw model access from a service

```typescript
// NEVER DO THIS — services must not import Model<T> directly
@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>, // WRONG
  ) {}
}
```

Services depend on their Repository class, not on the Mongoose model directly.

---

## Security Implications of Missing workspaceId

If a query runs without a `workspaceId` filter:

- A user in Workspace A can read, modify, or delete documents belonging to Workspace B
- In a list endpoint, all workspaces' data is merged and returned to a single caller
- In an update/delete endpoint, a malicious user can target any document in the database by guessing its `_id`

This is a **P0 security issue** — it constitutes a tenant isolation breach and must be treated as a critical vulnerability, not a regular bug.

---

## New Module Multi-Tenancy Checklist

Before merging any new module, verify each point:

- [ ] The schema file extends `BaseSchema` (which adds `workspaceId`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`)
- [ ] The repository class extends `BaseRepository<T>` and does NOT define custom `find` methods that omit `workspaceId`
- [ ] The service receives `workspaceId` as a parameter in every method that queries data
- [ ] The controller passes `workspaceId` obtained from `@WorkspaceId()` into every service call
- [ ] No service directly imports `@InjectModel()` — only repositories do
- [ ] The collection has a `workspaceId` index (see `DATABASE.md`)
- [ ] E2E tests verify that a request authenticated for Workspace A cannot access Workspace B's data
- [ ] Swagger responses do not expose `workspaceId` in the response DTO (it's internal)
