import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Invoice, InvoiceDocument } from './invoices.schema';

@Injectable()
export class InvoicesRepository extends BaseRepository<InvoiceDocument> {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {
    super(invoiceModel);
  }

  async findByNumber(
    workspaceId: string,
    number: string,
  ): Promise<InvoiceDocument | null> {
    return this.model.findOne({ workspaceId, number, isDeleted: false }).exec();
  }
}
