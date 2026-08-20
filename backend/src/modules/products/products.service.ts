import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  async findAll(workspaceId: string, query: QueryProductDto) {
    const { search, status, type, page, limit } = query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return this.repository.findAll(workspaceId, filters, { page, limit });
  }

  async findOne(workspaceId: string, id: string) {
    const item = await this.repository.findOne(workspaceId, id);
    if (!item) throw new NotFoundException(`Product ${id} not found`);
    return item;
  }

  async create(workspaceId: string, dto: CreateProductDto) {
    return this.repository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateProductDto) {
    const item = await this.repository.update(workspaceId, id, dto);
    if (!item) throw new NotFoundException(`Product ${id} not found`);
    return item;
  }

  async remove(workspaceId: string, id: string) {
    const item = await this.repository.softDelete(workspaceId, id);
    if (!item) throw new NotFoundException(`Product ${id} not found`);
    return item;
  }

  async findAllActiveForPortfolio(workspaceId: string) {
    const result = await this.repository.findAll(
      workspaceId,
      { status: 'active' },
      { limit: 100, sort: { createdAt: -1 } },
    );
    return result.data;
  }
}
