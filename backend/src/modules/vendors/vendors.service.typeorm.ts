import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { VendorEntity, VendorReviewEntity } from './entities/vendor.entity';
import { CreateVendorDto, CreateReviewDto } from './dto/vendor.dto';
import { VendorCategory } from '../../common/enums';

@Injectable()
export class VendorsServiceTypeorm {
  constructor(
    @InjectRepository(VendorEntity)
    private vendorRepository: Repository<VendorEntity>,
    @InjectRepository(VendorReviewEntity)
    private reviewRepository: Repository<VendorReviewEntity>,
  ) {}

  async createVendor(userId: string, dto: CreateVendorDto): Promise<VendorEntity> {
    const vendor = this.vendorRepository.create({
      userId,
      businessName: dto.businessName,
      category: dto.category,
      description: dto.description,
      city: dto.location?.city,
      state: dto.location?.state,
      address: dto.location?.address,
      phone: dto.phone,
      email: dto.email,
      startingPrice: dto.pricing?.startingPrice,
      priceType: dto.pricing?.priceType,
      services: dto.services,
    });
    return this.vendorRepository.save(vendor);
  }

  async getVendorById(id: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async updateVendor(userId: string, vendorId: string, dto: Partial<CreateVendorDto>): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findOne({ where: { id: vendorId, userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    Object.assign(vendor, {
      businessName: dto.businessName ?? vendor.businessName,
      category: dto.category ?? vendor.category,
      description: dto.description ?? vendor.description,
      city: dto.location?.city ?? vendor.city,
      state: dto.location?.state ?? vendor.state,
      phone: dto.phone ?? vendor.phone,
      email: dto.email ?? vendor.email,
      services: dto.services ?? vendor.services,
    });
    return this.vendorRepository.save(vendor);
  }

  async searchVendors(filters: {
    category?: VendorCategory;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
  }, page = 1, limit = 20) {
    const qb = this.vendorRepository.createQueryBuilder('v').where('v.isActive = :active', { active: true });

    if (filters.category) qb.andWhere('v.category = :category', { category: filters.category });
    if (filters.city) qb.andWhere('v.city LIKE :city', { city: `%${filters.city}%` });
    if (filters.minRating) qb.andWhere('v.ratingAverage >= :minRating', { minRating: filters.minRating });
    if (filters.search) {
      qb.andWhere('(v.businessName LIKE :search OR v.description LIKE :search)', { search: `%${filters.search}%` });
    }

    qb.orderBy('v.isFeatured', 'DESC').addOrderBy('v.ratingAverage', 'DESC');

    const skip = (page - 1) * limit;
    const [vendors, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { vendors, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addReview(userId: string, vendorId: string, dto: CreateReviewDto): Promise<VendorReviewEntity> {
    const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const review = this.reviewRepository.create({ vendorId, userId, rating: dto.rating, review: dto.review });
    await this.reviewRepository.save(review);

    // Update average
    const reviews = await this.reviewRepository.find({ where: { vendorId } });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    vendor.ratingAverage = Math.round(avg * 10) / 10;
    vendor.ratingCount = reviews.length;
    await this.vendorRepository.save(vendor);

    return review;
  }

  async getReviews(vendorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { vendorId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { reviews, total };
  }

  async getFeaturedVendors(category?: VendorCategory): Promise<VendorEntity[]> {
    const where: any = { isActive: true, isFeatured: true };
    if (category) where.category = category;
    return this.vendorRepository.find({ where, take: 10 });
  }
}
