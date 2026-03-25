import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { buildBookingQuote, serializeUser } from '../../common/serializers';

@Injectable()
export class NewAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private signTokens(user: any) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role || 'customer',
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'localfixnew-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'localfixnew-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    return { token, refreshToken };
  }

  private async ensureDemoCustomerData(user: any) {
    const addressCount = await this.prisma.savedAddress.count({
      where: { userId: user.id },
    });

    if (addressCount === 0) {
      await this.prisma.savedAddress.createMany({
        data: [
          {
            userId: user.id,
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
            longitude: 80.2707,
          },
          {
            userId: user.id,
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
            longitude: 80.2482,
          },
        ],
      });
    }

    const defaultAddress = await this.prisma.savedAddress.findFirst({
      where: { userId: user.id, isDefault: true },
      orderBy: { createdAt: 'asc' },
    });

    if (defaultAddress) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          address: {
            street: defaultAddress.street || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            zipCode: defaultAddress.zipCode || '',
            coordinates:
              defaultAddress.latitude !== null &&
              defaultAddress.latitude !== undefined &&
              defaultAddress.longitude !== null &&
              defaultAddress.longitude !== undefined
                ? {
                    latitude: defaultAddress.latitude,
                    longitude: defaultAddress.longitude,
                  }
                : undefined,
          },
        },
      });
    }

    const bookingCount = await this.prisma.booking.count({
      where: { customerId: user.id },
    });

    if (bookingCount > 0) {
      return;
    }

    const services = await this.prisma.serviceItem.findMany({
      where: {
        id: {
          in: ['svc_plumbing_basic', 'svc_cleaning_home', 'svc_ac_service'],
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    const providers = await this.prisma.provider.findMany({
      where: {
        id: {
          in: [
            'prov_arun_homecare',
            'prov_meena_clean',
            'prov_rahim_cooltech',
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const serviceById = new Map<string, any>(
      services.map((item) => [item.id, item]),
    );
    const providerById = new Map<string, any>(
      providers.map((item) => [item.id, item]),
    );

    const templates = [
      {
        bookingNumber: `LFN-${String(user.phone).slice(-4)}01`,
        serviceId: 'svc_plumbing_basic',
        providerId: 'prov_arun_homecare',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledStartTime: '10:00 AM',
        status: 'confirmed',
      },
      {
        bookingNumber: `LFN-${String(user.phone).slice(-4)}02`,
        serviceId: 'svc_cleaning_home',
        providerId: 'prov_meena_clean',
        scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        scheduledStartTime: '02:00 PM',
        status: 'in-progress',
      },
      {
        bookingNumber: `LFN-${String(user.phone).slice(-4)}03`,
        serviceId: 'svc_ac_service',
        providerId: 'prov_rahim_cooltech',
        scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        scheduledStartTime: '11:30 AM',
        status: 'completed',
        completedAt: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
        ),
      },
    ];

    for (const entry of templates) {
      const service = serviceById.get(entry.serviceId);
      const provider = providerById.get(entry.providerId);

      if (!service || !provider) {
        continue;
      }

      const quote = buildBookingQuote(service);

      await this.prisma.booking.create({
        data: {
          bookingNumber: entry.bookingNumber,
          customerId: user.id,
          providerId: provider.id,
          serviceId: service.id,
          additionalServiceIds: [],
          status: entry.status,
          scheduledDate: entry.scheduledDate,
          scheduledStartTime: entry.scheduledStartTime,
          address: {
            street: defaultAddress?.street || '12 Lake View Road',
            city: defaultAddress?.city || 'Chennai',
            state: defaultAddress?.state || 'Tamil Nadu',
            zipCode: defaultAddress?.zipCode || '600001',
            landmark: defaultAddress?.landmark || 'Near Central Park',
            coordinates:
              defaultAddress?.latitude !== null &&
              defaultAddress?.latitude !== undefined &&
              defaultAddress?.longitude !== null &&
              defaultAddress?.longitude !== undefined
                ? {
                    latitude: defaultAddress.latitude,
                    longitude: defaultAddress.longitude,
                  }
                : undefined,
          },
          pricing: {
            visitFee: 0,
            basePrice: quote.basePrice,
            additionalServicesTotal: quote.additionalServicesTotal,
            estimatedTotalAmount: quote.estimatedTotalAmount,
            totalAmount: quote.estimatedTotalAmount,
            advanceAmount: quote.advanceAmount,
            finalTotalAmount: quote.estimatedTotalAmount,
          },
          payment: {
            method: 'card',
            status: 'paid',
            amountPaid: quote.advanceAmount,
            amountDue: quote.dueAmount,
            paidAt: new Date().toISOString(),
          },
          paymentStatus: 'paid',
          completedAt: entry.completedAt || null,
        },
      });
    }
  }

  async requestOtp(phone: string, devicePayload: Record<string, any>) {
    const normalizedPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (normalizedPhone.length !== 10) {
      throw new BadRequestException('Please provide a valid 10-digit phone number.');
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));

    await this.prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        code: otp,
        devicePayload,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return {
      success: true,
      message: 'OTP created successfully.',
      data: {
        phone: normalizedPhone,
        otp,
        expiresInSeconds: 600,
      },
    };
  }

  async verifyOtp(phone: string, otp: string, _payload: Record<string, any>) {
    const normalizedPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const normalizedOtp = String(otp || '').trim();

    const latestOtp = await this.prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const isDevFallback =
      process.env.NODE_ENV !== 'production' && normalizedOtp === '1234';

    if (
      !isDevFallback &&
      (!latestOtp ||
        latestOtp.consumedAt ||
        latestOtp.expiresAt.getTime() < Date.now() ||
        latestOtp.code !== normalizedOtp)
    ) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    if (latestOtp && !latestOtp.consumedAt) {
      await this.prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: { consumedAt: new Date() },
      });
    }

    const user = await this.prisma.user.upsert({
      where: { phone: normalizedPhone },
      update: {
        isVerified: true,
      },
      create: {
        phone: normalizedPhone,
        name: `Customer ${normalizedPhone.slice(-4)}`,
        email: `customer.${normalizedPhone.slice(-4)}@temp.localfix.com`,
        isVerified: true,
        isEmailVerified: true,
      },
    });

    await this.ensureDemoCustomerData(user);

    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    const defaultAddress = await this.prisma.savedAddress.findFirst({
      where: { userId: user.id, isDefault: true },
      orderBy: { createdAt: 'asc' },
    });
    const tokens = this.signTokens(freshUser || user);

    return {
      success: true,
      message: 'OTP verified successfully.',
      data: {
        ...tokens,
        user: serializeUser(freshUser || user, defaultAddress),
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'localfixnew-refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      const defaultAddress = await this.prisma.savedAddress.findFirst({
        where: { userId: user.id, isDefault: true },
        orderBy: { createdAt: 'asc' },
      });
      const tokens = this.signTokens(user);

      return {
        success: true,
        message: 'Token refreshed successfully.',
        data: {
          ...tokens,
          user: serializeUser(user, defaultAddress),
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const defaultAddress = await this.prisma.savedAddress.findFirst({
      where: { userId: user.id, isDefault: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      data: serializeUser(user, defaultAddress),
    };
  }
}
