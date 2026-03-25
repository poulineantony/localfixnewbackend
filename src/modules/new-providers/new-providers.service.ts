import { Injectable } from '@nestjs/common';
import {
  serializeBooking,
  serializeProvider,
} from '../../common/serializers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(_userId: string) {
    return {
      success: true,
      data: null,
    };
  }

  async getStaff() {
    return {
      success: true,
      data: [],
    };
  }

  async getBookings(_userId: string, providerId?: string) {
    if (!providerId) {
      return {
        success: true,
        data: [],
      };
    }

    const [provider, services, bookings] = await Promise.all([
      this.prisma.provider.findUnique({ where: { id: providerId } }),
      this.prisma.serviceItem.findMany(),
      this.prisma.booking.findMany({
        where: { providerId },
        orderBy: { scheduledDate: 'desc' },
      }),
    ]);

    const serviceById = new Map(services.map((service) => [service.id, service]));

    return {
      success: true,
      provider: provider ? serializeProvider(provider, services) : null,
      data: bookings.map((booking) =>
        serializeBooking(
          booking,
          serviceById.get(booking.serviceId),
          provider,
        ),
      ),
    };
  }
}
