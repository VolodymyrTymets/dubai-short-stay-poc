import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  PropertyStatus,
  CancellationPolicy,
  KycStatus,
} from '../../generated/prisma/client';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PaginationInput } from '../common/input/pagination.input';
import { SearchInput } from '../common/input/search.input';
import { FORBIDDEN } from '../common/errors';

const PROPERTY_INCLUDE = {
  Amenities: true,
  Accessibility: true,
  Photos: { orderBy: { position: 'asc' } },
} satisfies Prisma.PropertyInclude;

type PropertyWithJoins = Prisma.PropertyGetPayload<{
  include: typeof PROPERTY_INCLUDE;
}>;

// Homes commission is locked at 12% (CLAUDE.md §A.3); no per-owner override exists yet.
const DEFAULT_COMMISSION_PCT = 12;

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateHost(accountId: string) {
    const existing = await this.prisma.host.findUnique({
      where: { accountId },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.host.create({ data: { accountId } });
  }

  toEntity(property: PropertyWithJoins) {
    return {
      ...property,
      beds: property.beds as { type: string; count: number }[],
      amenityIds: property.Amenities.map((a) => a.amenityId),
      accessibilityIds: property.Accessibility.map(
        (a) => a.accessibilityFeatureId,
      ),
      photos: property.Photos,
    };
  }

  async createProperty(input: CreatePropertyInput, accountId: string) {
    const host = await this.getOrCreateHost(accountId);

    const property = await this.prisma.property.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        maxGuests: input.maxGuests,
        beds: input.beds as unknown as Prisma.InputJsonValue,
        areaId: input.areaId,
        cityId: input.cityId,
        lat: input.lat,
        lng: input.lng,
        basePriceAed: input.basePriceAed,
        cleaningFeeAed: input.cleaningFeeAed,
        isInstantBook: input.isInstantBook ?? true,
        detPermitNumber: input.detPermitNumber,
        tdfPerBedroom: input.tdfPerBedroom,
        cancellationPolicy:
          input.cancellationPolicy ?? CancellationPolicy.MODERATE,
        ownerId: host.id,
        commissionPct: DEFAULT_COMMISSION_PCT,
        Amenities: {
          create: (input.amenityIds ?? []).map((amenityId) => ({
            amenityId,
          })),
        },
        Accessibility: {
          create: (input.accessibilityIds ?? []).map(
            (accessibilityFeatureId) => ({ accessibilityFeatureId }),
          ),
        },
      },
      include: PROPERTY_INCLUDE,
    });

    return this.toEntity(property);
  }

  private async assertOwnership(propertyId: string, accountId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { Owner: true },
    });
    if (!property || property.Owner.accountId !== accountId) {
      throw new ForbiddenException(FORBIDDEN);
    }
    return property;
  }

  async updateProperty(
    id: string,
    input: UpdatePropertyInput,
    accountId: string,
  ) {
    const existing = await this.assertOwnership(id, accountId);

    if (input.status === PropertyStatus.LIVE) {
      await this.assertKycVerified(existing.ownerId);
    }

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.propertyType !== undefined && {
          propertyType: input.propertyType,
        }),
        ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
        ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
        ...(input.maxGuests !== undefined && { maxGuests: input.maxGuests }),
        ...(input.beds !== undefined && {
          beds: input.beds as unknown as Prisma.InputJsonValue,
        }),
        ...(input.areaId !== undefined && { areaId: input.areaId }),
        ...(input.cityId !== undefined && { cityId: input.cityId }),
        ...(input.lat !== undefined && { lat: input.lat }),
        ...(input.lng !== undefined && { lng: input.lng }),
        ...(input.basePriceAed !== undefined && {
          basePriceAed: input.basePriceAed,
        }),
        ...(input.cleaningFeeAed !== undefined && {
          cleaningFeeAed: input.cleaningFeeAed,
        }),
        ...(input.isInstantBook !== undefined && {
          isInstantBook: input.isInstantBook,
        }),
        ...(input.detPermitNumber !== undefined && {
          detPermitNumber: input.detPermitNumber,
        }),
        ...(input.tdfPerBedroom !== undefined && {
          tdfPerBedroom: input.tdfPerBedroom,
        }),
        ...(input.cancellationPolicy !== undefined && {
          cancellationPolicy: input.cancellationPolicy,
        }),
        ...(input.status !== undefined && {
          status: input.status,
          ...(input.status === PropertyStatus.LIVE && {
            publishedAt: new Date(),
          }),
        }),
      },
      include: PROPERTY_INCLUDE,
    });

    return this.toEntity(property);
  }

  private async assertKycVerified(hostId: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { hostId },
    });
    if (
      !hostProfile ||
      hostProfile.kycStatus !== KycStatus.VERIFIED ||
      !hostProfile.bankAccountVerified
    ) {
      throw new ForbiddenException(
        'Property cannot go live until the owner has a verified KYC status and a verified bank account.',
      );
    }
  }

  async findPropertyForOwner(id: string, accountId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { ...PROPERTY_INCLUDE, Owner: true },
    });
    if (!property || property.Owner.accountId !== accountId) {
      return null;
    }
    return this.toEntity(property);
  }

  async findMyProperties(
    accountId: string,
    pagination: PaginationInput,
    search?: SearchInput,
  ) {
    const host = await this.prisma.host.findUnique({ where: { accountId } });
    if (!host) {
      return [];
    }

    const properties = await this.prisma.property.findMany({
      where: {
        ownerId: host.id,
        deleted: false,
        ...(search?.slug && { slug: { contains: search.slug } }),
      },
      orderBy: pagination.orderBy.map((sort) => ({
        [sort.field]: sort.order,
      })),
      take: pagination.take,
      skip: pagination.skip,
      include: PROPERTY_INCLUDE,
    });

    return properties.map((property) => this.toEntity(property));
  }
}
