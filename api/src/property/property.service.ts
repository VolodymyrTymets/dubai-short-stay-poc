import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  PropertyStatus,
  CancellationPolicy,
  KycStatus,
  AccountRoleType,
} from '../../generated/prisma/client';
import { AccountRoleService } from '../account-role/account-role.service';
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

// SRS v8.4 §A.3 "Locked commercial rules": Commission · Homes = 12%, locked. No per-owner
// override exists yet — stored per-property so a future rate change never rewrites history.
const DEFAULT_COMMISSION_PCT = 12;

// Allowlist (backend-core rule 18): never pass a client-supplied field/direction straight
// into Prisma orderBy — it can reach unintended relations or throw an opaque 500.
const SORTABLE_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'basePriceAed',
  'title',
  'status',
  'bedrooms',
  'bathrooms',
]);
const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;

type BedShape = { type: string; count: number };

function isBedShape(value: unknown): value is BedShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BedShape).type === 'string' &&
    typeof (value as BedShape).count === 'number'
  );
}

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountRoleService: AccountRoleService,
  ) {}

  toEntity(property: PropertyWithJoins) {
    const beds = Array.isArray(property.beds)
      ? property.beds.filter(isBedShape)
      : [];
    return {
      ...property,
      beds,
      amenityIds: property.Amenities.map((a) => a.amenityId),
      accessibilityIds: property.Accessibility.map(
        (a) => a.accessibilityFeatureId,
      ),
      photos: property.Photos,
    };
  }

  private async isAdmin(accountId: string) {
    const roles = await this.accountRoleService.getAccountRoles(accountId);
    return roles.includes(AccountRoleType.ADMIN);
  }

  async createProperty(input: CreatePropertyInput, accountId: string) {
    const host = await this.prisma.host.upsert({
      where: { accountId },
      create: { accountId },
      update: {},
    });

    const property = await this.prisma.property.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        maxGuests: input.maxGuests,
        // input.beds is a class-validated PropertyBedInput[]; mapped to a plain object so no
        // class-instance value reaches Prisma's InputJsonValue (which rejects class instances).
        beds: input.beds.map(({ type, count }) => ({
          type,
          count,
        })),
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
      where: { id: propertyId, deleted: false },
      include: { Owner: true },
    });
    if (!property) {
      throw new ForbiddenException(FORBIDDEN);
    }
    if (
      property.Owner.accountId !== accountId &&
      !(await this.isAdmin(accountId))
    ) {
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
          // See createProperty — mapped to a plain object for the same InputJsonValue reason.
          beds: input.beds.map(({ type, count }) => ({
            type,
            count,
          })),
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
      where: { id, deleted: false },
      include: { ...PROPERTY_INCLUDE, Owner: true },
    });
    if (!property) {
      return null;
    }
    if (
      property.Owner.accountId !== accountId &&
      !(await this.isAdmin(accountId))
    ) {
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

    const orderBy = pagination.orderBy
      .filter((sort) => SORTABLE_FIELDS.has(sort.field))
      .map((sort) => ({ [sort.field]: sort.order }));

    const properties = await this.prisma.property.findMany({
      where: {
        ownerId: host.id,
        deleted: false,
        ...(search?.slug && { slug: { contains: search.slug } }),
      },
      orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: 'desc' }],
      take: Math.min(pagination.take ?? DEFAULT_TAKE, MAX_TAKE),
      skip: pagination.skip,
      include: PROPERTY_INCLUDE,
    });

    return properties.map((property) => this.toEntity(property));
  }
}
