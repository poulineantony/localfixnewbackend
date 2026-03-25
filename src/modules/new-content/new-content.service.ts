import { Injectable } from '@nestjs/common';
import { asArray, pickLocalizedValue } from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome(language = 'en') {
    const sections = await this.prisma.homeSection.findMany({
      where: { enabled: true },
      orderBy: { displayOrder: 'asc' },
    });

    const data = sections.map((section) => {
      const content = section.content as Record<string, any>;

      return {
        id: section.key,
        type: section.type,
        enabled: section.enabled,
        displayOrder: section.displayOrder,
        audience: asArray(section.audience),
        countryCodes: asArray(section.countryCodes),
        zoneCodes: asArray(section.zoneCodes),
        providerIds: asArray(section.providerIds),
        content: Object.keys(content || {}).reduce<Record<string, any>>(
          (acc, key) => {
            const value = content[key];
            acc[key] =
              typeof value === 'string'
                ? value
                : pickLocalizedValue(value, language, 'en');
            return acc;
          },
          {},
        ),
        localizedContent: content,
        version: section.version,
      };
    });

    return {
      success: true,
      data: {
        appKey: 'customer',
        themeVariant: 'fe',
        version: sections[0]?.version || '2026.03.25',
        sections: data,
      },
    };
  }
}
