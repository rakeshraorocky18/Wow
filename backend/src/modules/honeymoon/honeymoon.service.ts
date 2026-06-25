import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoneymoonPackageEntity, HoneymoonBookingEntity } from './entities/honeymoon.entity';
import { CreatePackageDto, BookPackageDto, SearchPackagesDto } from './dto/honeymoon.dto';

@Injectable()
export class HoneymoonService {
  constructor(
    @InjectRepository(HoneymoonPackageEntity)
    private packageRepository: Repository<HoneymoonPackageEntity>,
    @InjectRepository(HoneymoonBookingEntity)
    private bookingRepository: Repository<HoneymoonBookingEntity>,
  ) {}

  // ─── Packages ───

  async createPackage(vendorId: string, dto: CreatePackageDto): Promise<HoneymoonPackageEntity> {
    const pkg = this.packageRepository.create({ vendorId, ...dto });
    return this.packageRepository.save(pkg);
  }

  async getPackage(id: string): Promise<HoneymoonPackageEntity> {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async searchPackages(filters: SearchPackagesDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const qb = this.packageRepository.createQueryBuilder('p').where('p.isActive = :active', { active: true });

    if (filters.destination) {
      qb.andWhere('p.destination LIKE :dest', { dest: `%${filters.destination}%` });
    }
    if (filters.type) {
      qb.andWhere('p.type = :type', { type: filters.type });
    }
    if (filters.minPrice) {
      qb.andWhere('p.couplePrice >= :minPrice OR p.pricePerPerson >= :minPricePP', {
        minPrice: filters.minPrice, minPricePP: filters.minPrice / 2,
      });
    }
    if (filters.maxPrice) {
      qb.andWhere('p.couplePrice <= :maxPrice OR p.pricePerPerson <= :maxPricePP', {
        maxPrice: filters.maxPrice, maxPricePP: filters.maxPrice / 2,
      });
    }
    if (filters.minDuration) {
      qb.andWhere('p.durationNights >= :minDur', { minDur: filters.minDuration });
    }
    if (filters.maxDuration) {
      qb.andWhere('p.durationNights <= :maxDur', { maxDur: filters.maxDuration });
    }

    qb.orderBy('p.isFeatured', 'DESC').addOrderBy('p.rating', 'DESC');

    const skip = (page - 1) * limit;
    const [packages, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { packages, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getFeaturedPackages(): Promise<HoneymoonPackageEntity[]> {
    return this.packageRepository.find({
      where: { isActive: true, isFeatured: true },
      order: { rating: 'DESC' },
      take: 10,
    });
  }

  async getPopularDestinations() {
    const packages = await this.packageRepository.find({ where: { isActive: true } });
    const destMap: Record<string, { count: number; minPrice: number; image?: string }> = {};

    packages.forEach(p => {
      if (!destMap[p.destination]) {
        destMap[p.destination] = { count: 0, minPrice: p.couplePrice || p.pricePerPerson * 2, image: p.images?.[0] };
      }
      destMap[p.destination].count++;
      const price = p.couplePrice || p.pricePerPerson * 2;
      if (price < destMap[p.destination].minPrice) destMap[p.destination].minPrice = price;
    });

    return Object.entries(destMap)
      .map(([name, data]) => ({ destination: name, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  // ─── Bookings ───

  async bookPackage(userId: string, dto: BookPackageDto): Promise<HoneymoonBookingEntity> {
    const pkg = await this.getPackage(dto.packageId);
    const travellers = dto.travellers || 2;
    const totalAmount = pkg.couplePrice || pkg.pricePerPerson * travellers;

    const booking = this.bookingRepository.create({
      userId,
      packageId: dto.packageId,
      travelDate: dto.travelDate,
      returnDate: dto.returnDate,
      travellers,
      totalAmount,
      specialRequests: dto.specialRequests,
      status: 'requested',
    });

    return this.bookingRepository.save(booking);
  }

  async getUserBookings(userId: string): Promise<HoneymoonBookingEntity[]> {
    return this.bookingRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getBooking(id: string): Promise<HoneymoonBookingEntity> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<HoneymoonBookingEntity> {
    const booking = await this.getBooking(id);
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async saveItinerary(bookingId: string, itinerary: object): Promise<HoneymoonBookingEntity> {
    const booking = await this.getBooking(bookingId);
    booking.itinerary = JSON.stringify(itinerary);
    return this.bookingRepository.save(booking);
  }
}
