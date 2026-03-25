import { Injectable } from '@nestjs/common';
import { pickLocalizedValue } from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewLegalService {
  constructor(private readonly prisma: PrismaService) {}

  async list(language = 'en') {
    const documents = await this.prisma.legalDocument.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { effectiveDate: 'desc' }],
    });

    return {
      success: true,
      data: documents.map((document) => ({
        id: document.id,
        type: document.type,
        version: document.version,
        effectiveDate: document.effectiveDate.toISOString().slice(0, 10),
        mandatory: document.mandatory,
        title: document.title,
        localizedTitle: pickLocalizedValue(document.title, language, 'en'),
        url: document.url,
        content: document.content,
      })),
    };
  }
}
