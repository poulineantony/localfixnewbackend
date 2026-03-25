const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rootDir = path.resolve(__dirname, '..', '..');
const docsDir = path.join(rootDir, 'docs');

const readJson = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(docsDir, fileName), 'utf8'));

const languageSeed = readJson('sample-language-seed.json').seed;
const translationSeed = readJson('translation-matrix.json');

const serviceCatalog = [
  {
    id: 'svc_plumbing_basic',
    name: 'Pipe Leak Repair',
    description: 'Fast leak detection, tap fitting replacement, and pipe repair at home.',
    category: 'plumbing',
    subcategory: 'Leak repair',
    basePrice: 299,
    durationEstimate: 60,
    iconName: 'plumbing',
    accentColor: '#F28B50'
  },
  {
    id: 'svc_plumbing_install',
    name: 'Bathroom Fitting Installation',
    description: 'Install faucets, showers, and bathroom accessories with clean finishing.',
    category: 'plumbing',
    subcategory: 'Installation',
    basePrice: 399,
    durationEstimate: 90,
    iconName: 'plumbing',
    accentColor: '#F28B50'
  },
  {
    id: 'svc_electrical_switch',
    name: 'Switchboard Repair',
    description: 'Safe switchboard fixes, wiring checks, and quick electrical troubleshooting.',
    category: 'electrical',
    subcategory: 'Wiring',
    basePrice: 349,
    durationEstimate: 45,
    iconName: 'electrical-services',
    accentColor: '#F4B942'
  },
  {
    id: 'svc_electrical_fan',
    name: 'Ceiling Fan Installation',
    description: 'New fan mounting, balancing, and regulator configuration by verified electricians.',
    category: 'electrical',
    subcategory: 'Installation',
    basePrice: 449,
    durationEstimate: 75,
    iconName: 'electrical-services',
    accentColor: '#F4B942'
  },
  {
    id: 'svc_cleaning_home',
    name: 'Full Home Deep Cleaning',
    description: 'Bedroom, kitchen, and bathroom deep clean with professional equipment.',
    category: 'cleaning',
    subcategory: 'Deep cleaning',
    basePrice: 1199,
    durationEstimate: 180,
    iconName: 'cleaning-services',
    accentColor: '#38B38A'
  },
  {
    id: 'svc_cleaning_sofa',
    name: 'Sofa Shampoo Cleaning',
    description: 'Fabric-safe sofa wash with stain treatment and deodorising.',
    category: 'cleaning',
    subcategory: 'Furniture cleaning',
    basePrice: 699,
    durationEstimate: 90,
    iconName: 'cleaning-services',
    accentColor: '#38B38A'
  },
  {
    id: 'svc_ac_service',
    name: 'AC General Service',
    description: 'Cooling performance check, gas inspection, and indoor unit cleaning.',
    category: 'ac-repair',
    subcategory: 'Servicing',
    basePrice: 599,
    durationEstimate: 75,
    iconName: 'ac-unit',
    accentColor: '#5B8CFF'
  },
  {
    id: 'svc_appliance_wm',
    name: 'Washing Machine Repair',
    description: 'Diagnosis and repair for front-load and top-load washing machines.',
    category: 'appliance-repair',
    subcategory: 'Repair',
    basePrice: 499,
    durationEstimate: 60,
    iconName: 'settings',
    accentColor: '#6B7BFF'
  }
];

const categoryCatalog = [
  {
    value: 'plumbing',
    label: 'Plumbing',
    slogan: 'Leak fixes and fittings',
    iconName: 'plumbing',
    accentColor: '#F28B50',
    displayOrder: 1
  },
  {
    value: 'electrical',
    label: 'Electrical',
    slogan: 'Wiring and quick repair',
    iconName: 'electrical-services',
    accentColor: '#F4B942',
    displayOrder: 2
  },
  {
    value: 'cleaning',
    label: 'Cleaning',
    slogan: 'Deep clean support',
    iconName: 'cleaning-services',
    accentColor: '#38B38A',
    displayOrder: 3
  },
  {
    value: 'ac-repair',
    label: 'AC Repair',
    slogan: 'Cooling service at home',
    iconName: 'ac-unit',
    accentColor: '#5B8CFF',
    displayOrder: 4
  },
  {
    value: 'appliance-repair',
    label: 'Appliance Repair',
    slogan: 'Kitchen and home appliance care',
    iconName: 'settings',
    accentColor: '#6B7BFF',
    displayOrder: 5
  }
];

const providerCatalog = [
  {
    id: 'prov_arun_homecare',
    businessName: 'Arun HomeCare',
    userName: 'Arun Kumar',
    phone: '9876543210',
    serviceIds: ['svc_plumbing_basic', 'svc_plumbing_install', 'svc_electrical_switch'],
    experienceYears: 7,
    ratingAverage: 4.8,
    ratingCount: 126,
    completedJobs: 342,
    isAvailable: true,
    isVerified: true,
    certifications: [{ name: 'Electrical Safety', issuer: 'Agensis' }],
    serviceArea: { cities: ['Chennai', 'Pondicherry'], radius: 18, unit: 'km' }
  },
  {
    id: 'prov_meena_clean',
    businessName: 'Meena Clean Co',
    userName: 'Meena Ravi',
    phone: '9123456780',
    serviceIds: ['svc_cleaning_home', 'svc_cleaning_sofa'],
    experienceYears: 5,
    ratingAverage: 4.9,
    ratingCount: 211,
    completedJobs: 410,
    isAvailable: true,
    isVerified: true,
    certifications: [{ name: 'Deep Cleaning Specialist', issuer: 'Agensis' }],
    serviceArea: { cities: ['Chennai'], radius: 12, unit: 'km' }
  },
  {
    id: 'prov_rahim_cooltech',
    businessName: 'Rahim CoolTech',
    userName: 'Rahim Ali',
    phone: '9988776655',
    serviceIds: ['svc_ac_service', 'svc_appliance_wm', 'svc_electrical_fan'],
    experienceYears: 8,
    ratingAverage: 4.7,
    ratingCount: 184,
    completedJobs: 295,
    isAvailable: true,
    isVerified: true,
    certifications: [{ name: 'AC Maintenance', issuer: 'Agensis' }],
    serviceArea: { cities: ['Chennai', 'Karaikal'], radius: 20, unit: 'km' }
  }
];

const homeSections = [
  {
    key: 'welcome-banner',
    type: 'banner',
    enabled: true,
    displayOrder: 1,
    audience: ['customer'],
    content: {
      title: {
        en: 'Welcome',
        hi: 'स्वागत है',
        fr: 'Bienvenue',
        ar: 'مرحباً'
      },
      subtitle: {
        en: 'Backend-driven multilingual home',
        hi: 'बैकएंड नियंत्रित बहुभाषी होम',
        fr: 'Accueil multilingue piloté par le backend',
        ar: 'واجهة رئيسية متعددة اللغات ومدارة من الخلفية'
      }
    }
  }
];

const paymentMethods = [
  {
    code: 'card',
    enabled: true,
    displayOrder: 1,
    title: {
      en: 'Card',
      hi: 'कार्ड',
      fr: 'Carte',
      ar: 'بطاقة'
    }
  }
];

const legalDocuments = [
  {
    type: 'terms',
    version: 'v1',
    effectiveDate: new Date('2026-03-25T00:00:00.000Z'),
    mandatory: true,
    url: 'https://agensis.example.com/legal/terms/v1',
    title: {
      en: 'Terms and Conditions',
      hi: 'नियम और शर्तें',
      fr: 'Conditions générales',
      ar: 'الشروط والأحكام'
    },
    content: {
      en: 'By using LocalFix New you agree to the latest terms and service rules.',
      hi: 'LocalFix New का उपयोग करके आप नवीनतम नियमों और सेवा शर्तों से सहमत होते हैं।',
      fr: 'En utilisant LocalFix New vous acceptez les conditions de service en vigueur.',
      ar: 'باستخدام LocalFix New فإنك توافق على أحدث الشروط وقواعد الخدمة.'
    }
  },
  {
    type: 'privacy',
    version: 'v1',
    effectiveDate: new Date('2026-03-25T00:00:00.000Z'),
    mandatory: true,
    url: 'https://agensis.example.com/legal/privacy/v1',
    title: {
      en: 'Privacy Policy',
      hi: 'गोपनीयता नीति',
      fr: 'Politique de confidentialité',
      ar: 'سياسة الخصوصية'
    },
    content: {
      en: 'We process booking and profile data only to run the LocalFix New service.',
      hi: 'हम LocalFix New सेवा चलाने के लिए ही बुकिंग और प्रोफ़ाइल डेटा संसाधित करते हैं।',
      fr: 'Nous traitons les données de réservation et de profil uniquement pour exécuter le service LocalFix New.',
      ar: 'نعالج بيانات الحجز والملف الشخصي فقط لتشغيل خدمة LocalFix New.'
    }
  }
];

const quoteForService = (service, additionalServices = []) => {
  const additionalTotal = additionalServices.reduce((sum, item) => sum + item.basePrice, 0);
  const estimatedTotalAmount = service.basePrice + additionalTotal;
  const advanceAmount = Math.max(99, Math.round(estimatedTotalAmount * 0.25));

  return {
    basePrice: service.basePrice,
    additionalServicesTotal: additionalTotal,
    estimatedTotalAmount,
    advanceAmount,
    dueAmount: estimatedTotalAmount - advanceAmount,
    currency: service.currency,
    advancePercentage: 25,
    disclaimer: 'Final price may vary after site inspection and material confirmation.'
  };
};

async function seedLanguages() {
  for (const [index, language] of languageSeed.entries()) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {
        name: language.name,
        nativeName: language.nativeName,
        direction: language.direction,
        isEnabled: language.isEnabled,
        isFallback: language.isFallback,
        isRemovable: language.isRemovable,
        sortOrder: index
      },
      create: {
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
        direction: language.direction,
        isEnabled: language.isEnabled,
        isFallback: language.isFallback,
        isRemovable: language.isRemovable,
        sortOrder: index
      }
    });
  }
}

async function seedTranslations() {
  for (const entry of translationSeed) {
    await prisma.translationEntry.upsert({
      where: { key: entry.key },
      update: {
        namespace: entry.namespace,
        defaultValue: entry.defaultValue,
        translations: entry.translations,
        isActive: true
      },
      create: {
        key: entry.key,
        namespace: entry.namespace,
        defaultValue: entry.defaultValue,
        translations: entry.translations,
        isActive: true
      }
    });
  }
}

async function seedCatalog() {
  for (const service of serviceCatalog) {
    await prisma.serviceItem.upsert({
      where: { id: service.id },
      update: service,
      create: service
    });
  }

  for (const provider of providerCatalog) {
    await prisma.provider.upsert({
      where: { id: provider.id },
      update: provider,
      create: provider
    });
  }
}

async function seedContent() {
  for (const section of homeSections) {
    await prisma.homeSection.upsert({
      where: { key: section.key },
      update: section,
      create: section
    });
  }

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method
    });
  }

  for (const document of legalDocuments) {
    await prisma.legalDocument.upsert({
      where: {
        type_version: {
          type: document.type,
          version: document.version
        }
      },
      update: document,
      create: document
    });
  }
}

async function seedDemoCustomer() {
  const user = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {
      name: 'Demo Customer',
      email: 'demo@temp.localfix.com',
      preferredLanguage: 'en',
      isEmailVerified: true
    },
    create: {
      phone: '9999999999',
      name: 'Demo Customer',
      email: 'demo@temp.localfix.com',
      preferredLanguage: 'en',
      isEmailVerified: true
    }
  });

  const defaultAddress = {
    label: 'home',
    customLabel: 'Home',
    street: '12 Lake View Road',
    landmark: 'Near Central Park',
    formattedAddress: '12 Lake View Road, Chennai, Tamil Nadu 600001',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    zipCode: '600001',
    zoneName: 'Chennai Central',
    isDefault: true,
    latitude: 13.0827,
    longitude: 80.2707
  };

  const workAddress = {
    label: 'work',
    customLabel: 'Office',
    street: '88 Marina Tech Park',
    landmark: 'Tower B',
    formattedAddress: '88 Marina Tech Park, Chennai, Tamil Nadu 600096',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    zipCode: '600096',
    zoneName: 'OMR',
    isDefault: false,
    latitude: 12.9864,
    longitude: 80.2482
  };

  const existingAddresses = await prisma.savedAddress.findMany({
    where: { userId: user.id }
  });

  if (existingAddresses.length === 0) {
    await prisma.savedAddress.createMany({
      data: [
        { userId: user.id, ...defaultAddress },
        { userId: user.id, ...workAddress }
      ]
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      address: {
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zipCode,
        coordinates: {
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude
        }
      }
    }
  });

  const existingBookings = await prisma.booking.count({
    where: { customerId: user.id }
  });

  if (existingBookings > 0) {
    return;
  }

  const plumbingService = await prisma.serviceItem.findUnique({ where: { id: 'svc_plumbing_basic' } });
  const cleaningService = await prisma.serviceItem.findUnique({ where: { id: 'svc_cleaning_home' } });
  const acService = await prisma.serviceItem.findUnique({ where: { id: 'svc_ac_service' } });
  const providerA = await prisma.provider.findUnique({ where: { id: 'prov_arun_homecare' } });
  const providerB = await prisma.provider.findUnique({ where: { id: 'prov_meena_clean' } });
  const providerC = await prisma.provider.findUnique({ where: { id: 'prov_rahim_cooltech' } });

  const bookingTemplates = [
    {
      id: 'booking_demo_1',
      bookingNumber: 'LFN-1001',
      service: plumbingService,
      provider: providerA,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scheduledStartTime: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 'booking_demo_2',
      bookingNumber: 'LFN-1002',
      service: cleaningService,
      provider: providerB,
      scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      scheduledStartTime: '02:00 PM',
      status: 'in-progress'
    },
    {
      id: 'booking_demo_3',
      bookingNumber: 'LFN-1003',
      service: acService,
      provider: providerC,
      scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      scheduledStartTime: '11:30 AM',
      status: 'completed',
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    }
  ];

  for (const item of bookingTemplates) {
    if (!item.service || !item.provider) {
      continue;
    }

    const quote = quoteForService(item.service);

    const booking = await prisma.booking.create({
      data: {
        id: item.id,
        bookingNumber: item.bookingNumber,
        customerId: user.id,
        providerId: item.provider.id,
        serviceId: item.service.id,
        additionalServiceIds: [],
        status: item.status,
        scheduledDate: item.scheduledDate,
        scheduledStartTime: item.scheduledStartTime,
        address: {
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          landmark: defaultAddress.landmark,
          coordinates: {
            latitude: defaultAddress.latitude,
            longitude: defaultAddress.longitude
          }
        },
        pricing: {
          visitFee: 0,
          basePrice: quote.basePrice,
          additionalServicesTotal: quote.additionalServicesTotal,
          estimatedTotalAmount: quote.estimatedTotalAmount,
          totalAmount: quote.estimatedTotalAmount,
          advanceAmount: quote.advanceAmount,
          finalTotalAmount: quote.estimatedTotalAmount
        },
        payment: {
          method: 'card',
          status: 'paid',
          amountPaid: quote.advanceAmount,
          amountDue: quote.dueAmount,
          paidAt: new Date().toISOString()
        },
        paymentStatus: 'paid',
        completedAt: item.completedAt || null
      }
    });

    await prisma.review.upsert({
      where: { id: `${booking.id}_review` },
      update: {},
      create: {
        id: `${booking.id}_review`,
        providerId: item.provider.id,
        bookingId: booking.id,
        serviceId: item.service.id,
        customerName: user.name,
        rating: item.status === 'completed' ? 5 : 4,
        comment:
          item.provider.id === 'prov_meena_clean'
            ? 'Arrived on time and left the apartment spotless.'
            : item.provider.id === 'prov_rahim_cooltech'
              ? 'Very clear explanation and quick AC service.'
              : 'Professional work and transparent pricing.'
      }
    });
  }
}

async function main() {
  console.log('Seeding localfixnewbackend...');
  await seedLanguages();
  await seedTranslations();
  await seedCatalog();
  await seedContent();
  await seedDemoCustomer();
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
