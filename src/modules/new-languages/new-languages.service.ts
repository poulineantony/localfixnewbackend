import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { serializeLanguage } from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewLanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const languages = await this.prisma.language.findMany({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });

    const fallbackLanguage =
      languages.find((language) => language.isFallback)?.code || 'en';

    return {
      success: true,
      defaultLanguage: fallbackLanguage,
      fallbackLanguage,
      data: languages.map((language) => serializeLanguage(language)),
    };
  }

  async seed() {
    const filePath = path.resolve(
      process.cwd(),
      'docs',
      'sample-language-seed.json',
    );
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    for (const [index, language] of parsed.seed.entries()) {
      await this.prisma.language.upsert({
        where: { code: language.code },
        update: {
          name: language.name,
          nativeName: language.nativeName,
          direction: language.direction,
          isEnabled: language.isEnabled,
          isFallback: language.isFallback,
          isRemovable: language.isRemovable,
          sortOrder: index,
        },
        create: {
          code: language.code,
          name: language.name,
          nativeName: language.nativeName,
          direction: language.direction,
          isEnabled: language.isEnabled,
          isFallback: language.isFallback,
          isRemovable: language.isRemovable,
          sortOrder: index,
        },
      });
    }

    return {
      success: true,
      message: 'Language seed applied successfully.',
      seededCodes: parsed.seed.map((language: any) => language.code),
    };
  }
}
