import { Injectable } from '@nestjs/common';
import {
  asObject,
  pickLocalizedValue,
} from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewTranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive(language = 'en') {
    const entries = await this.prisma.translationEntry.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
    });

    const fallbackLanguage =
      (await this.prisma.language.findFirst({
        where: { isFallback: true },
      }))?.code || 'en';

    const data: Record<string, string> = {};

    for (const entry of entries) {
      data[entry.key] = String(
        pickLocalizedValue(entry.translations, language, fallbackLanguage) ||
          entry.defaultValue,
      );
    }

    const version = Math.max(0, ...entries.map((entry) => entry.version || 0));

    return {
      success: true,
      language,
      fallbackLanguage,
      version,
      data,
    };
  }

  async getAll(language = 'en') {
    const entries = await this.prisma.translationEntry.findMany({
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    });

    return {
      success: true,
      language,
      data: entries.map((entry) => ({
        id: entry.id,
        namespace: entry.namespace,
        key: entry.key,
        defaultValue: entry.defaultValue,
        activeValue: pickLocalizedValue(entry.translations, language, 'en'),
        translations: asObject(entry.translations),
        version: entry.version,
        isActive: entry.isActive,
      })),
    };
  }

  async import(entries: Array<Record<string, any>>) {
    for (const entry of entries) {
      if (!entry?.key) {
        continue;
      }

      await this.prisma.translationEntry.upsert({
        where: { key: entry.key },
        update: {
          namespace: entry.namespace || 'common',
          defaultValue: entry.defaultValue || entry.key,
          translations: entry.translations || {},
          version: Number(entry.version || 1),
          isActive: entry.isActive !== false,
        },
        create: {
          namespace: entry.namespace || 'common',
          key: entry.key,
          defaultValue: entry.defaultValue || entry.key,
          translations: entry.translations || {},
          version: Number(entry.version || 1),
          isActive: entry.isActive !== false,
        },
      });
    }

    return {
      success: true,
      imported: entries.length,
    };
  }
}
