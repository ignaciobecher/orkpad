# Module Structure

Every feature in Orkpad lives in its own NestJS module under `src/modules/`. This document defines the exact layout, naming conventions, and required files for any new module.

---

## Folder Structure

Every module follows this exact layout. Use `clients` as the reference example:

```
src/modules/clients/
├── dto/
│   ├── create-client.dto.ts
│   ├── update-client.dto.ts
│   └── query-client.dto.ts
├── clients.controller.ts
├── clients.controller.spec.ts
├── clients.module.ts
├── clients.repository.ts
├── clients.schema.ts
├── clients.service.ts
└── clients.service.spec.ts
```

No subfolders beyond `dto/`. If a module grows large, split it into smaller modules — do not add more nesting.

---

## Naming Conventions

| File | Convention | Example |
|---|---|---|
| Module files | `kebab-case` | `invoice-lines.module.ts` |
| Class names | `PascalCase` | `InvoiceLinesModule` |
| DTO class names | `PascalCase` + suffix | `CreateInvoiceLineDto` |
| Schema class | `PascalCase` (singular) | `InvoiceLine` |
| Document type | schema class + `Document` | `InvoiceLineDocument` |
| Collection name | `plural-kebab-case` | `invoice-lines` |
| Repository class | `PascalCase` + `Repository` | `InvoiceLineRepository` |
| Service class | `PascalCase` + `Service` | `InvoiceLineService` |
| Controller class | `PascalCase` + `Controller` | `InvoiceLineController` |

---

## Required Files — Templates

### `*.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import { Client, ClientSchema } from './clients.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService], // only export if another module needs it
})
export class ClientsModule {}
```

### `*.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ collection: 'clients', timestamps: true })
export class Client extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ default: 'active' })
  status: 'active' | 'archived';
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// Indexes — always add workspaceId index plus compound indexes for common queries
ClientSchema.index({ workspaceId: 1 });
ClientSchema.index({ workspaceId: 1, status: 1 });
ClientSchema.index({ workspaceId: 1, createdAt: -1 });
```

### `*.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Client, ClientDocument } from './clients.schema';

@Injectable()
export class ClientsRepository extends BaseRepository<ClientDocument> {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {
    super(clientModel);
  }

  // Add custom query methods here only if BaseRepository cannot cover the use case.
  // Every custom method MUST accept and filter by workspaceId.
  async findByEmail(workspaceId: string, email: string): Promise<ClientDocument | null> {
    return this.model.findOne({ workspaceId, email, isDeleted: false }).exec();
  }
}
```

### `*.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async findAll(workspaceId: string, query: QueryClientDto) {
    return this.clientsRepository.findAll(workspaceId, query);
  }

  async findOne(workspaceId: string, id: string) {
    const client = await this.clientsRepository.findOne(workspaceId, id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async create(workspaceId: string, dto: CreateClientDto) {
    return this.clientsRepository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateClientDto) {
    const client = await this.clientsRepository.update(workspaceId, id, dto);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async remove(workspaceId: string, id: string) {
    const client = await this.clientsRepository.softDelete(workspaceId, id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }
}
```

### `*.controller.ts`

```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clients in the workspace' })
  findAll(@WorkspaceId() workspaceId: string, @Query() query: QueryClientDto) {
    return this.clientsService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single client by ID' })
  findOne(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.clientsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@WorkspaceId() workspaceId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a client' })
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.clientsService.remove(workspaceId, id);
  }
}
```

### `dto/create-*.dto.ts`

```typescript
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1 555 000 0000' })
  @IsString()
  @IsOptional()
  phone?: string;
}
```

### `dto/update-*.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
```

### `dto/query-*.dto.ts`

```typescript
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryClientDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['active', 'archived'] })
  @IsIn(['active', 'archived'])
  @IsOptional()
  status?: 'active' | 'archived';

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
```

---

## Registering a New Module in AppModule

Open `src/app.module.ts` and add the new module to the `imports` array:

```typescript
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ClientsModule,      // ← add here
    ProjectsModule,
    // ...
  ],
})
export class AppModule {}
```

Do not forget this step. NestJS will silently fail to resolve the module's providers if it is not registered.

---

## Swagger Setup

The global Swagger document is configured in `main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Orkpad API')
  .setDescription('Multi-tenant SaaS backend for freelancers')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

Every controller:
- MUST have `@ApiTags('FeatureName')` to group its endpoints
- MUST have `@ApiBearerAuth()` if the route is authenticated
- SHOULD have `@ApiOperation({ summary: '...' })` on each endpoint
- DTOs SHOULD use `@ApiProperty` / `@ApiPropertyOptional` on every field

---

## New Module Checklist

Before considering a module complete, verify all 8 points:

- [ ] Folder is at `src/modules/<module-name>/` with all required files
- [ ] Schema extends `BaseSchema` and declares all indexes
- [ ] Repository extends `BaseRepository<T>` and every custom method filters by `workspaceId`
- [ ] Service receives `workspaceId` as first parameter in every data-access method
- [ ] Controller uses `@WorkspaceId()` and passes it to every service call
- [ ] All DTOs have `class-validator` decorators and `@ApiProperty` Swagger decorators
- [ ] Module is added to `AppModule` imports
- [ ] Unit tests exist for the service (`*.service.spec.ts`) and at least one E2E test covers the happy path
