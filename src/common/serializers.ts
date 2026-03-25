type AnyRecord = Record<string, any>;

export const asObject = (value: unknown): AnyRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as AnyRecord;
};

export const asArray = <T = any>(value: unknown): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as T[];
};

export const humanizeSlug = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const pickLocalizedValue = (
  value: unknown,
  language = 'en',
  fallbackLanguage = 'en',
) => {
  if (typeof value === 'string') {
    return value;
  }

  const map = asObject(value);
  return (
    map[language] ||
    map[fallbackLanguage] ||
    Object.values(map).find((entry) => typeof entry === 'string') ||
    ''
  );
};

export const serializeLanguage = (language: any) => ({
  code: language.code,
  label: language.name,
  nativeLabel: language.nativeName,
  direction: language.direction,
  isDefault: Boolean(language.isFallback),
  isEnabled: Boolean(language.isEnabled),
  isFallback: Boolean(language.isFallback),
  isRemovable: Boolean(language.isRemovable),
});

export const serializeAddress = (address: any) => ({
  _id: address.id,
  label: address.label,
  customLabel: address.customLabel || undefined,
  street: address.street || undefined,
  landmark: address.landmark || undefined,
  formattedAddress:
    address.formattedAddress ||
    [address.street, address.landmark, address.city, address.state, address.zipCode]
      .filter(Boolean)
      .join(', '),
  city: address.city || undefined,
  state: address.state || undefined,
  country: address.country || undefined,
  zipCode: address.zipCode || undefined,
  placeId: address.placeId || undefined,
  zoneId: address.zoneId || undefined,
  zoneName: address.zoneName || undefined,
  isFallbackZone: Boolean(address.isFallbackZone),
  coordinates:
    address.latitude !== null &&
    address.latitude !== undefined &&
    address.longitude !== null &&
    address.longitude !== undefined
      ? {
          latitude: address.latitude,
          longitude: address.longitude,
        }
      : undefined,
  isDefault: Boolean(address.isDefault),
});

export const serializeService = (service: any) => ({
  _id: service.id,
  serviceId: service.id,
  name: service.name,
  description: service.description,
  category: service.category,
  subcategory: service.subcategory || undefined,
  pricing: {
    type: 'fixed',
    basePrice: service.basePrice,
    currency: service.currency || 'INR',
  },
  duration: {
    estimated: service.durationEstimate,
    unit: service.durationUnit || 'minutes',
  },
  images: service.logoUrl ? [{ url: service.logoUrl }] : [],
  rating: {
    average: Number(service.ratingAverage || 0),
    count: Number(service.ratingCount || 0),
  },
  isActive: Boolean(service.isActive),
  createdAt: service.createdAt?.toISOString?.() || service.createdAt,
  updatedAt: service.updatedAt?.toISOString?.() || service.updatedAt,
});

export const serializeProvider = (provider: any, services: any[] = []) => {
  const providerServiceIds = asArray<string>(provider.serviceIds);
  const providerServices = services
    .filter((service) => providerServiceIds.includes(service.id))
    .map((service) => serializeService(service));

  const serviceArea = asObject(provider.serviceArea);
  const certifications = asArray<any>(provider.certifications);

  return {
    _id: provider.id,
    providerId: provider.id,
    user: {
      _id: `provider_user_${provider.id}`,
      name: provider.userName,
      phone: provider.phone || '',
    },
    businessName: provider.businessName,
    services: providerServices,
    experience: {
      years: provider.experienceYears || 0,
    },
    rating: {
      average: Number(provider.ratingAverage || 0),
      count: Number(provider.ratingCount || 0),
    },
    completedJobs: Number(provider.completedJobs || 0),
    availability: {
      isAvailable: Boolean(provider.isAvailable),
    },
    serviceArea: {
      cities: asArray<string>(serviceArea.cities),
      radius: serviceArea.radius || 15,
      unit: serviceArea.unit || 'km',
    },
    certifications,
    verification: {
      isVerified: Boolean(provider.isVerified),
    },
    isActive: true,
    createdAt: provider.createdAt?.toISOString?.() || provider.createdAt,
    updatedAt: provider.updatedAt?.toISOString?.() || provider.updatedAt,
  };
};

export const serializeUser = (user: any, defaultAddress?: any) => {
  const addressFromUser = asObject(user.address);
  const addressSource = defaultAddress ? serializeAddress(defaultAddress) : undefined;

  return {
    _id: user.id,
    name: user.name,
    email: user.email || `customer.${String(user.phone).slice(-4)}@temp.localfix.com`,
    phone: user.phone,
    role: user.role || 'customer',
    avatar: user.avatar || undefined,
    isVerified: Boolean(user.isVerified ?? true),
    isEmailVerified: Boolean(user.isEmailVerified ?? true),
    language: user.preferredLanguage || 'en',
    address:
      addressSource ||
      (Object.keys(addressFromUser).length > 0
        ? {
            street: addressFromUser.street || undefined,
            city: addressFromUser.city || undefined,
            state: addressFromUser.state || undefined,
            zipCode: addressFromUser.zipCode || undefined,
            coordinates: addressFromUser.coordinates || undefined,
          }
        : undefined),
    createdAt: user.createdAt?.toISOString?.() || user.createdAt,
    updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
  };
};

export const buildBookingQuote = (service: any, additionalServices: any[] = []) => {
  const additionalServicesTotal = additionalServices.reduce(
    (sum, item) => sum + Number(item.basePrice || 0),
    0,
  );
  const estimatedTotalAmount =
    Number(service?.basePrice || 0) + Number(additionalServicesTotal || 0);
  const advanceAmount = Math.max(99, Math.round(estimatedTotalAmount * 0.25));

  return {
    basePrice: Number(service?.basePrice || 0),
    additionalServicesTotal,
    estimatedTotalAmount,
    advanceAmount,
    dueAmount: estimatedTotalAmount - advanceAmount,
    currency: service?.currency || 'INR',
    advancePercentage: 25,
    disclaimer:
      'Final price may vary after site inspection and material confirmation.',
  };
};

export const serializeBooking = (booking: any, service: any, provider: any) => {
  const pricing = asObject(booking.pricing);
  const payment = asObject(booking.payment);
  const materialWorkflow = asObject(booking.materialWorkflow);
  const address = asObject(booking.address);

  return {
    _id: booking.id,
    bookingNumber: booking.bookingNumber,
    customer: booking.customerId,
    service: service ? serializeService(service) : booking.serviceId,
    additionalServices: [],
    provider: provider ? serializeProvider(provider, service ? [service] : []) : booking.providerId,
    scheduledDate: booking.scheduledDate?.toISOString?.() || booking.scheduledDate,
    scheduledTime: {
      startTime: booking.scheduledStartTime,
    },
    address: {
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      landmark: address.landmark || undefined,
      coordinates: address.coordinates || undefined,
    },
    status: booking.status,
    pricing,
    materialWorkflow:
      Object.keys(materialWorkflow).length > 0 ? materialWorkflow : undefined,
    totalAmount:
      pricing.totalAmount || pricing.estimatedTotalAmount || pricing.finalTotalAmount || 0,
    estimatedTotalAmount:
      pricing.estimatedTotalAmount || pricing.totalAmount || pricing.finalTotalAmount || 0,
    finalTotalAmount: pricing.finalTotalAmount || undefined,
    advanceAmount: pricing.advanceAmount || payment.amountPaid || 0,
    payment,
    paymentStatus: booking.paymentStatus || payment.status || 'pending',
    notes: booking.notes || undefined,
    completedAt: booking.completedAt?.toISOString?.() || booking.completedAt || undefined,
    createdAt: booking.createdAt?.toISOString?.() || booking.createdAt,
    updatedAt: booking.updatedAt?.toISOString?.() || booking.updatedAt,
  };
};
