import { PartialType } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-doc.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
