import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DataCooker } from '../utils/DataCooker/DataCooker';
import {
  PropertyStatus,
  PropertyType,
  CancellationPolicy,
} from '../../generated/prisma/enums';

describe('Property (e2e)', () => {
  let prismaService: PrismaService;
  const dataCooker = new DataCooker();

  beforeAll(async () => {
    await dataCooker.beforeAll();
  }, 10000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        PrismaModule,
      ],
    }).compile();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await dataCooker.afterAll();
  }, 10000);

  const seedOwnerAndLocation = async (slugSuffix: string) => {
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    const host = await prismaService.host.create({
      data: { accountId: account.id },
    });
    const city = await prismaService.city.create({
      data: { name: 'Dubai', slug: `dubai-property-${slugSuffix}` },
    });
    const area = await prismaService.area.create({
      data: {
        cityId: city.id,
        name: 'Marina',
        slug: `marina-property-${slugSuffix}`,
      },
    });
    return { host, city, area };
  };

  it('creates a Property with owner/city/area refs and reads it back', async () => {
    const { host, city, area } = await seedOwnerAndLocation('create');

    const property = await prismaService.property.create({
      data: {
        slug: 'marina-loft-create',
        title: 'Marina Loft',
        description: 'A loft with a view.',
        propertyType: PropertyType.APARTMENT,
        bedrooms: 2,
        bathrooms: 1.5,
        maxGuests: 4,
        beds: [
          { type: 'queen', count: 1 },
          { type: 'sofa', count: 1 },
        ],
        areaId: area.id,
        cityId: city.id,
        lat: 25.08,
        lng: 55.14,
        basePriceAed: 500,
        ownerId: host.id,
        commissionPct: 12,
      },
    });

    const found = await prismaService.property.findUnique({
      where: { id: property.id },
    });

    expect(found).toBeDefined();
    expect(found?.status).toEqual(PropertyStatus.DRAFT);
    expect(found?.ownerId).toEqual(host.id);
    expect(found?.cityId).toEqual(city.id);
    expect(found?.areaId).toEqual(area.id);
    expect(found?.addressDisclosed).toEqual(false);
    expect(found?.currency).toEqual('AED');
    expect(found?.cancellationPolicy).toEqual(CancellationPolicy.MODERATE);
    expect(found?.beds).toEqual([
      { type: 'queen', count: 1 },
      { type: 'sofa', count: 1 },
    ]);
  });

  it('links amenities, accessibility features and photos to a Property', async () => {
    const { host, city, area } = await seedOwnerAndLocation('joins');
    const amenity = await prismaService.amenityCatalog.create({
      data: { key: 'wifi-joins', label: 'WiFi', category: 'ESSENTIALS' },
    });
    const feature = await prismaService.accessibilityFeature.create({
      data: {
        key: 'step-free-joins',
        label: 'Step-free access',
        category: 'MOBILITY',
      },
    });
    const file = await prismaService.file.create({
      data: { createdById: host.accountId },
    });

    const property = await prismaService.property.create({
      data: {
        slug: 'marina-loft-joins',
        title: 'Marina Loft',
        description: 'A loft with a view.',
        propertyType: PropertyType.APARTMENT,
        bedrooms: 2,
        bathrooms: 1.5,
        maxGuests: 4,
        beds: [{ type: 'queen', count: 1 }],
        areaId: area.id,
        cityId: city.id,
        lat: 25.08,
        lng: 55.14,
        basePriceAed: 500,
        ownerId: host.id,
        commissionPct: 12,
        Amenities: { create: [{ amenityId: amenity.id }] },
        Accessibility: {
          create: [{ accessibilityFeatureId: feature.id }],
        },
        Photos: { create: [{ fileId: file.id, isHero: true, position: 0 }] },
      },
    });

    const found = await prismaService.property.findUnique({
      where: { id: property.id },
      include: { Amenities: true, Accessibility: true, Photos: true },
    });

    expect(found?.Amenities).toHaveLength(1);
    expect(found?.Amenities[0].amenityId).toEqual(amenity.id);
    expect(found?.Accessibility).toHaveLength(1);
    expect(found?.Accessibility[0].accessibilityFeatureId).toEqual(feature.id);
    expect(found?.Photos).toHaveLength(1);
    expect(found?.Photos[0].fileId).toEqual(file.id);
    expect(found?.Photos[0].isHero).toEqual(true);
  });

  it('allows an empty amenities/accessibility list on create', async () => {
    const { host, city, area } = await seedOwnerAndLocation('empty');

    const property = await prismaService.property.create({
      data: {
        slug: 'marina-loft-empty',
        title: 'Marina Loft',
        description: 'A loft with a view.',
        propertyType: PropertyType.APARTMENT,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        beds: [{ type: 'queen', count: 1 }],
        areaId: area.id,
        cityId: city.id,
        lat: 25.08,
        lng: 55.14,
        basePriceAed: 300,
        ownerId: host.id,
        commissionPct: 12,
      },
      include: { Amenities: true, Accessibility: true },
    });

    expect(property.Amenities).toEqual([]);
    expect(property.Accessibility).toEqual([]);
  });
});
