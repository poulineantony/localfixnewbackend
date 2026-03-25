import { Injectable } from '@nestjs/common';
import {
  pickLocalizedValue,
  serializeLanguage,
  serializeUser,
} from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewBootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  async getBootstrap(userId: string, language = 'en') {
    const [user, defaultAddress, languages, paymentMethods, legalDocuments, sections] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.savedAddress.findFirst({
          where: { userId, isDefault: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.language.findMany({
          where: { isEnabled: true },
          orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        }),
        this.prisma.paymentMethod.findMany({
          where: { enabled: true },
          orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
        }),
        this.prisma.legalDocument.findMany({
          where: { isActive: true },
          orderBy: [{ type: 'asc' }, { effectiveDate: 'desc' }],
        }),
        this.prisma.homeSection.findMany({
          where: { enabled: true },
          orderBy: { displayOrder: 'asc' },
        }),
      ]);

    const fallbackLanguage =
      languages.find((item) => item.isFallback)?.code || 'en';
    const selectedLanguage = user?.preferredLanguage || language || fallbackLanguage;

    return {
      success: true,
      data: {
        tenant: {
          tenantId: process.env.TENANT_ID || 'tenant_agensis',
          tenantCode: process.env.TENANT_CODE || 'AGENSIS',
          tenantName: process.env.TENANT_NAME || 'Agensis',
          platformName: process.env.PLATFORM_NAME || 'Agensis Platform',
        },
        user: user
          ? {
              userId: user.id,
              role: user.role || 'customer',
              fullName: user.name,
              preferredLanguage: selectedLanguage,
            }
          : null,
        provider: null,
        country: {
          code: process.env.APP_COUNTRY_CODE || 'IN',
          name: process.env.APP_COUNTRY_NAME || 'India',
          currency: process.env.APP_CURRENCY || 'INR',
          timezone: process.env.APP_TIMEZONE || 'Asia/Calcutta',
          defaultLanguage: fallbackLanguage,
          supportedLanguages: languages.map((item) => item.code),
          fallbackLanguage,
        },
        zone: {
          code: process.env.APP_ZONE_CODE || 'IN_CHENNAI',
          name: process.env.APP_ZONE_NAME || 'Chennai',
          countryCode: process.env.APP_COUNTRY_CODE || 'IN',
        },
        localization: {
          selectedLanguage,
          defaultLanguage: fallbackLanguage,
          fallbackLanguage,
          supportedLanguages: languages.map((item) => item.code),
          rtlLanguages: languages
            .filter((item) => item.direction === 'rtl')
            .map((item) => item.code),
          languages: languages.map((item) => serializeLanguage(item)),
        },
        features: {
          wallet: true,
          cash: false,
          multilingualContent: true,
          providerDashboard: true,
          dynamicHome: true,
          aiSuggestions: false,
        },
        payments: {
          currency: process.env.APP_CURRENCY || 'INR',
          methods: paymentMethods.map((method) => ({
            code: method.code,
            enabled: method.enabled,
            title: method.title,
          })),
        },
        legal: {
          termsVersion:
            legalDocuments.find((document) => document.type === 'terms')?.version ||
            'v1',
          privacyVersion:
            legalDocuments.find((document) => document.type === 'privacy')?.version ||
            'v1',
          documents: legalDocuments.map((document) => ({
            type: document.type,
            version: document.version,
            effectiveDate: document.effectiveDate.toISOString().slice(0, 10),
            mandatory: document.mandatory,
            title: document.title,
            url: document.url,
          })),
        },
        content: {
          version: sections[0]?.version || '2026.03.25',
          translationVersion: `tr-${new Date().toISOString().slice(0, 10)}`,
          home: {
            appKey: 'customer',
            themeVariant: 'fe',
            version: sections[0]?.version || '2026.03.25',
            sections: sections.map((section) => {
              const content = section.content as Record<string, any>;

              return {
                id: section.key,
                type: section.type,
                enabled: section.enabled,
                displayOrder: section.displayOrder,
                audience: section.audience || ['customer'],
                content,
                localizedContent: Object.keys(content || {}).reduce<Record<string, any>>(
                  (acc, key) => {
                    acc[key] = pickLocalizedValue(content[key], selectedLanguage, fallbackLanguage);
                    return acc;
                  },
                  {},
                ),
              };
            }),
          },
        },
        profile: user ? serializeUser(user, defaultAddress) : null,
      },
    };
  }
}
