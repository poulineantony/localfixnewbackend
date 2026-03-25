import { Injectable } from '@nestjs/common';
import { pickLocalizedValue } from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(language = 'en') {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { enabled: true },
      orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
    });

    return {
      success: true,
      data: methods.map((method) => ({
        code: method.code,
        enabled: method.enabled,
        title: method.title,
        localizedTitle: pickLocalizedValue(method.title, language, 'en'),
        displayOrder: method.displayOrder,
        meta: method.meta || {},
      })),
    };
  }
}
