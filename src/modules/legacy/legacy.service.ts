import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  asArray,
  asObject,
  buildBookingQuote,
  humanizeSlug,
  serializeAddress,
  serializeBooking,
  serializeProvider,
  serializeService,
  serializeUser,
} from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegacyService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDefaultAddress(userId: string) {
    return this.prisma.savedAddress.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getAllServices() {
    return this.prisma.serviceItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  private async getProvidersAndServices() {
    const [providers, services] = await Promise.all([
      this.prisma.provider.findMany({
        orderBy: { businessName: 'asc' },
      }),
      this.getAllServices(),
    ]);

    return { providers, services };
  }

  private buildCategoryCatalog(services: any[]) {
    const map = new Map<string, any>();

    for (const service of services) {
      if (!service.category) {
        continue;
      }

      const existing = map.get(service.category);
      if (existing) {
        existing.activeCount += 1;
        existing.totalCount += 1;
        continue;
      }

      map.set(service.category, {
        value: service.category,
        label: humanizeSlug(service.category),
        slogan: `${humanizeSlug(service.category)} services near you`,
        logoUrl: service.logoUrl || '',
        iconName: service.iconName || 'home-repair-service',
        accentColor: service.accentColor || '#FC8019',
        displayOrder: map.size + 1,
        isFeatured: map.size < 3,
        totalCount: 1,
        activeCount: 1,
        hasActiveServices: true,
      });
    }

    return Array.from(map.values()).sort(
      (left, right) => Number(left.displayOrder) - Number(right.displayOrder),
    );
  }

  private async resolveBookingForUser(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const [service, provider] = await Promise.all([
      this.prisma.serviceItem.findUnique({ where: { id: booking.serviceId } }),
      this.prisma.provider.findUnique({ where: { id: booking.providerId } }),
    ]);

    return { booking, service, provider };
  }

  async getConfig() {
    return {
      success: true,
      data: {
        androidVersion: '1.0.0',
        iosVersion: '1.0.0',
        minAndroidVersion: '1.0.0',
        minIosVersion: '1.0.0',
        maintenanceMode: false,
        languageVersion: 1,
        forceUpdateMessage: 'Please update the app to continue.',
        maintenanceMessage: 'The platform is currently under maintenance.',
      },
    };
  }

  async registerDevice(userId: string, payload: Record<string, any>) {
    const saved = await this.prisma.deviceRegistration.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId: String(payload.deviceId || 'unknown-device'),
        },
      },
      update: {
        appType: payload.appType || 'customer',
        deviceModel: payload.deviceModel || null,
        manufacturer: payload.manufacturer || null,
        brand: payload.brand || null,
        platform: payload.platform || null,
        osVersion: payload.osVersion || null,
        appVersion: payload.appVersion || null,
        buildNumber: payload.buildNumber || null,
        fcmToken: payload.fcmToken || null,
        pushEnabled: Boolean(payload.pushEnabled),
        notificationPermissionGranted: Boolean(
          payload.notificationPermissionGranted,
        ),
        locale: payload.locale || null,
        timezone: payload.timezone || null,
      },
      create: {
        userId,
        appType: payload.appType || 'customer',
        deviceId: String(payload.deviceId || 'unknown-device'),
        deviceModel: payload.deviceModel || null,
        manufacturer: payload.manufacturer || null,
        brand: payload.brand || null,
        platform: payload.platform || null,
        osVersion: payload.osVersion || null,
        appVersion: payload.appVersion || null,
        buildNumber: payload.buildNumber || null,
        fcmToken: payload.fcmToken || null,
        pushEnabled: Boolean(payload.pushEnabled),
        notificationPermissionGranted: Boolean(
          payload.notificationPermissionGranted,
        ),
        locale: payload.locale || null,
        timezone: payload.timezone || null,
      },
    });

    return {
      success: true,
      data: {
        device: {
          id: saved.id,
          deviceId: saved.deviceId,
          deviceModel: saved.deviceModel || undefined,
          manufacturer: saved.manufacturer || undefined,
          brand: saved.brand || undefined,
          platform: saved.platform || undefined,
          osVersion: saved.osVersion || undefined,
          appVersion: saved.appVersion || undefined,
          buildNumber: saved.buildNumber || undefined,
          pushEnabled: saved.pushEnabled,
          notificationPermissionGranted: saved.notificationPermissionGranted,
          fcmTokenMasked: saved.fcmToken
            ? `${saved.fcmToken.slice(0, 6)}***`
            : null,
        },
        bootstrapNotifications: [
          {
            type: 'welcome',
            channel: 'general',
            title: 'Notifications enabled',
            body: 'You will receive updates about bookings and provider activity.',
          },
        ],
        notificationsConfigured: false,
        pushTransport: saved.fcmToken ? 'fcm' : 'local',
      },
    };
  }

  async updateProfile(userId: string, payload: Record<string, any>) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    const nextUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name ?? currentUser.name,
        email: payload.email ?? currentUser.email,
        preferredLanguage: payload.language ?? currentUser.preferredLanguage,
        avatar: payload.avatar ?? currentUser.avatar,
      },
    });

    const defaultAddress = await this.getDefaultAddress(userId);

    return {
      success: true,
      data: serializeUser(nextUser, defaultAddress),
    };
  }

  async getSavedAddresses(userId: string) {
    const addresses = await this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return {
      success: true,
      data: addresses.map((address) => serializeAddress(address)),
    };
  }

  async addSavedAddress(userId: string, payload: Record<string, any>) {
    if (payload.isDefault) {
      await this.prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const coordinates = asObject(payload.coordinates);

    await this.prisma.savedAddress.create({
      data: {
        userId,
        label: payload.label || 'home',
        customLabel: payload.customLabel || null,
        street: payload.street || null,
        landmark: payload.landmark || null,
        formattedAddress: payload.formattedAddress || null,
        city: payload.city || null,
        state: payload.state || null,
        country: payload.country || 'India',
        zipCode: payload.zipCode || null,
        placeId: payload.placeId || null,
        zoneId: payload.zoneId || null,
        zoneName: payload.zoneName || null,
        isFallbackZone: Boolean(payload.isFallbackZone),
        latitude:
          coordinates.latitude !== undefined ? Number(coordinates.latitude) : null,
        longitude:
          coordinates.longitude !== undefined
            ? Number(coordinates.longitude)
            : null,
        isDefault: Boolean(payload.isDefault),
      },
    });

    return this.getSavedAddresses(userId);
  }

  async updateSavedAddress(
    userId: string,
    addressId: string,
    payload: Record<string, any>,
  ) {
    const existing = await this.prisma.savedAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Saved address not found.');
    }

    if (payload.isDefault) {
      await this.prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const coordinates = asObject(payload.coordinates);

    await this.prisma.savedAddress.update({
      where: { id: addressId },
      data: {
        label: payload.label ?? existing.label,
        customLabel: payload.customLabel ?? existing.customLabel,
        street: payload.street ?? existing.street,
        landmark: payload.landmark ?? existing.landmark,
        formattedAddress: payload.formattedAddress ?? existing.formattedAddress,
        city: payload.city ?? existing.city,
        state: payload.state ?? existing.state,
        country: payload.country ?? existing.country,
        zipCode: payload.zipCode ?? existing.zipCode,
        placeId: payload.placeId ?? existing.placeId,
        zoneId: payload.zoneId ?? existing.zoneId,
        zoneName: payload.zoneName ?? existing.zoneName,
        isFallbackZone:
          payload.isFallbackZone !== undefined
            ? Boolean(payload.isFallbackZone)
            : existing.isFallbackZone,
        latitude:
          payload.coordinates !== undefined
            ? coordinates.latitude !== undefined
              ? Number(coordinates.latitude)
              : null
            : existing.latitude,
        longitude:
          payload.coordinates !== undefined
            ? coordinates.longitude !== undefined
              ? Number(coordinates.longitude)
              : null
            : existing.longitude,
        isDefault:
          payload.isDefault !== undefined
            ? Boolean(payload.isDefault)
            : existing.isDefault,
      },
    });

    return this.getSavedAddresses(userId);
  }

  async deleteSavedAddress(userId: string, addressId: string) {
    await this.prisma.savedAddress.deleteMany({
      where: { id: addressId, userId },
    });

    const remaining = await this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (remaining.length > 0 && !remaining.some((address) => address.isDefault)) {
      await this.prisma.savedAddress.update({
        where: { id: remaining[0].id },
        data: { isDefault: true },
      });
    }

    return this.getSavedAddresses(userId);
  }

  async getServices(query: Record<string, string>) {
    const services = await this.getAllServices();

    let filtered = services;

    if (query.category) {
      filtered = filtered.filter((service) => service.category === query.category);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter((service) =>
        `${service.name} ${service.description} ${service.category} ${service.subcategory || ''}`
          .toLowerCase()
          .includes(search),
      );
    }

    if (query.service) {
      filtered = filtered.filter((service) => service.id === query.service);
    }

    return {
      success: true,
      data: filtered.map((service) => serializeService(service)),
    };
  }

  async getServiceById(serviceId: string) {
    const service = await this.prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    return {
      success: true,
      data: serializeService(service),
    };
  }

  async getServiceCategories() {
    const services = await this.getAllServices();
    const catalog = this.buildCategoryCatalog(services);

    return {
      success: true,
      data: catalog.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    };
  }

  async getServiceCategoryCatalog(_query: Record<string, string>) {
    const services = await this.getAllServices();

    return {
      success: true,
      data: this.buildCategoryCatalog(services),
    };
  }

  async getProviders(query: Record<string, string>) {
    const { providers, services } = await this.getProvidersAndServices();

    let filtered = providers;

    if (query.service) {
      filtered = filtered.filter((provider) =>
        asArray<string>(provider.serviceIds).includes(query.service),
      );
    }

    if (query.verified === 'true') {
      filtered = filtered.filter((provider) => provider.isVerified);
    }

    return {
      success: true,
      data: filtered.map((provider) => serializeProvider(provider, services)),
    };
  }

  async getProviderById(providerId: string) {
    const { providers, services } = await this.getProvidersAndServices();
    const provider = providers.find((item) => item.id === providerId);

    if (!provider) {
      throw new NotFoundException('Provider not found.');
    }

    return {
      success: true,
      data: serializeProvider(provider, services),
    };
  }

  async getReviews(query: Record<string, string>) {
    const limit = Number(query.limit || 20);
    const reviews = await this.prisma.review.findMany({
      where: {
        providerId: query.provider || undefined,
        serviceId: query.service || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: Number.isFinite(limit) ? limit : 20,
    });

    return {
      success: true,
      data: reviews.map((review) => ({
        _id: review.id,
        customer: {
          _id: `customer_${review.id}`,
          name: review.customerName,
        },
        provider: {
          _id: review.providerId,
        },
        booking: review.bookingId,
        rating: review.rating,
        comment: review.comment || undefined,
        service: review.serviceId
          ? {
              _id: review.serviceId,
            }
          : undefined,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      })),
    };
  }

  async getBookings(userId: string, query: Record<string, string>) {
    const statuses = query.status
      ? query.status
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

    const bookings = await this.prisma.booking.findMany({
      where: {
        customerId: userId,
        status: statuses && statuses.length > 0 ? { in: statuses } : undefined,
      },
      orderBy: { scheduledDate: 'desc' },
      take: query.limit ? Number(query.limit) : undefined,
    });

    const { providers, services } = await this.getProvidersAndServices();
    const providerById = new Map(providers.map((provider) => [provider.id, provider]));
    const serviceById = new Map(services.map((service) => [service.id, service]));

    return {
      success: true,
      data: bookings.map((booking) =>
        serializeBooking(
          booking,
          serviceById.get(booking.serviceId),
          providerById.get(booking.providerId),
        ),
      ),
    };
  }

  async getBookingById(userId: string, bookingId: string) {
    const { booking, service, provider } = await this.resolveBookingForUser(
      userId,
      bookingId,
    );

    return {
      success: true,
      data: serializeBooking(booking, service, provider),
    };
  }

  async getBookingQuote(serviceId: string, additionalServiceIds: string[]) {
    const services = await this.prisma.serviceItem.findMany({
      where: {
        id: {
          in: [serviceId, ...additionalServiceIds],
        },
      },
    });
    const primaryService = services.find((service) => service.id === serviceId);

    if (!primaryService) {
      throw new NotFoundException('Service not found.');
    }

    const additionalServices = services.filter((service) =>
      additionalServiceIds.includes(service.id),
    );

    return {
      success: true,
      data: buildBookingQuote(primaryService, additionalServices),
    };
  }

  async createCheckoutOrder(userId: string, payload: Record<string, any>) {
    const service = await this.prisma.serviceItem.findUnique({
      where: { id: payload.service },
    });
    const provider = await this.prisma.provider.findUnique({
      where: { id: payload.provider },
    });

    if (!service || !provider) {
      throw new BadRequestException('Service or provider is invalid.');
    }

    const additionalServiceIds = asArray<string>(payload.additionalServices);
    const additionalServices = additionalServiceIds.length
      ? await this.prisma.serviceItem.findMany({
          where: {
            id: {
              in: additionalServiceIds,
            },
          },
        })
      : [];

    const quote = buildBookingQuote(service, additionalServices);

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber: `LFN-${Date.now()}`,
        customerId: userId,
        providerId: provider.id,
        serviceId: service.id,
        additionalServiceIds,
        status: 'pending',
        scheduledDate: new Date(payload.scheduledDate || Date.now()),
        scheduledStartTime:
          asObject(payload.scheduledTime).startTime || '10:00 AM',
        address: {
          street: payload.address?.street || '',
          city: payload.address?.city || '',
          state: payload.address?.state || '',
          zipCode: payload.address?.zipCode || '',
          landmark: payload.address?.landmark || undefined,
          coordinates: payload.address?.coordinates || undefined,
        },
        pricing: {
          visitFee: 0,
          basePrice: quote.basePrice,
          additionalServicesTotal: quote.additionalServicesTotal,
          estimatedTotalAmount: quote.estimatedTotalAmount,
          totalAmount: quote.estimatedTotalAmount,
          advanceAmount: quote.advanceAmount,
        },
        payment: {
          method: 'card',
          status: 'pending',
          amountPaid: 0,
          amountDue: quote.estimatedTotalAmount,
        },
        paymentStatus: 'pending',
        notes: payload.notes || null,
      },
    });

    return {
      success: true,
      data: {
        booking: serializeBooking(booking, service, provider),
        razorpay: {
          keyId: process.env.RAZORPAY_KEY_ID || 'mock_localfixnew',
          orderId: `mock_${booking.id}`,
          amount: quote.advanceAmount * 100,
          currency: quote.currency,
          bookingNumber: booking.bookingNumber,
        },
        pricing: quote,
      },
    };
  }

  async verifyCheckoutPayment(userId: string, payload: Record<string, any>) {
    const { booking, service, provider } = await this.resolveBookingForUser(
      userId,
      payload.bookingId,
    );

    const pricing = asObject(booking.pricing);

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'confirmed',
        payment: {
          method: 'card',
          status: 'paid',
          amountPaid: pricing.advanceAmount || 0,
          amountDue:
            (pricing.estimatedTotalAmount || 0) - (pricing.advanceAmount || 0),
          paidAt: new Date().toISOString(),
          razorpayOrderId:
            payload.razorpay_order_id || `mock_${booking.id}`,
          razorpayPaymentId:
            payload.razorpay_payment_id || `mock_payment_${booking.id}`,
        },
        paymentStatus: 'paid',
      },
    });

    return {
      success: true,
      data: serializeBooking(updated, service, provider),
    };
  }

  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const { booking, service, provider } = await this.resolveBookingForUser(
      userId,
      bookingId,
    );

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'cancelled',
        notes: reason || booking.notes,
      },
    });

    return {
      success: true,
      data: serializeBooking(updated, service, provider),
    };
  }

  async updateBookingStatus(userId: string, bookingId: string, status: string) {
    const { booking, service, provider } = await this.resolveBookingForUser(
      userId,
      bookingId,
    );

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : booking.completedAt,
      },
    });

    return {
      success: true,
      data: serializeBooking(updated, service, provider),
    };
  }

  async triggerSos(userId: string, bookingId: string, message?: string) {
    await this.resolveBookingForUser(userId, bookingId);

    return {
      success: true,
      data: {
        bookingId,
        message:
          message || 'Customer requested emergency assistance for this booking.',
      },
    };
  }

  async getBookingMaterials(userId: string, bookingId: string) {
    const { booking } = await this.resolveBookingForUser(userId, bookingId);

    return {
      success: true,
      data: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        pricing: booking.pricing,
        materialWorkflow: {
          status: 'not_required',
          approvalRequired: false,
        },
        currentRevision: null,
        revisions: [],
        invoice: null,
      },
    };
  }

  async getBookingInvoice(userId: string, bookingId: string) {
    const { booking } = await this.resolveBookingForUser(userId, bookingId);
    const pricing = asObject(booking.pricing);
    const payment = asObject(booking.payment);

    return {
      success: true,
      data: {
        _id: `invoice_${booking.id}`,
        invoiceNumber: `INV-${booking.bookingNumber}`,
        visitFee: pricing.visitFee || 0,
        laborCharge: pricing.basePrice || 0,
        materialLines: [],
        materialSubtotal: 0,
        tax: 0,
        grandTotal: pricing.estimatedTotalAmount || pricing.totalAmount || 0,
        paymentSnapshot: {
          amountPaid: payment.amountPaid || 0,
          amountDue: payment.amountDue || 0,
          status: payment.status || 'pending',
          method: payment.method || 'card',
        },
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async raiseDispute(userId: string, payload: Record<string, any>) {
    if (payload.bookingId) {
      await this.resolveBookingForUser(userId, payload.bookingId);
    }

    return {
      success: true,
      message: 'Dispute recorded successfully.',
      data: {
        id: `dispute_${Date.now()}`,
        ...payload,
      },
    };
  }
}
