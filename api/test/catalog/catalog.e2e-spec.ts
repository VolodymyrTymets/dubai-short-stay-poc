import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DataCooker } from '../utils/DataCooker/DataCooker';
import {
  PoiType,
  AmenityCategory,
  AccessibilityCategory,
} from '../../generated/prisma/enums';

describe('Catalog reference models (e2e)', () => {
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

  it('creates and reads back a City', async () => {
    const city = await prismaService.city.create({
      data: { name: 'Dubai', slug: 'dubai-catalog-test' },
    });

    const found = await prismaService.city.findUnique({
      where: { id: city.id },
    });

    expect(found).toBeDefined();
    expect(found?.name).toEqual('Dubai');
    expect(found?.country).toEqual('UAE');
    expect(found?.active).toEqual(true);
  });

  it('creates and reads back an Area scoped to its City', async () => {
    const city = await prismaService.city.create({
      data: { name: 'Dubai', slug: 'dubai-area-test' },
    });
    const area = await prismaService.area.create({
      data: {
        cityId: city.id,
        name: 'Downtown Dubai',
        slug: 'downtown-dubai',
        insiderData: { peakSeason: 'Nov-Mar', averageNightlyRateAed: 850 },
      },
    });

    const found = await prismaService.area.findUnique({
      where: { id: area.id },
    });

    expect(found).toBeDefined();
    expect(found?.cityId).toEqual(city.id);
    expect(found?.insiderData).toEqual({
      peakSeason: 'Nov-Mar',
      averageNightlyRateAed: 850,
    });
  });

  it('creates and reads back a Poi linked to a City and Area', async () => {
    const city = await prismaService.city.create({
      data: { name: 'Dubai', slug: 'dubai-poi-test' },
    });
    const area = await prismaService.area.create({
      data: { cityId: city.id, name: 'Marina', slug: 'marina-poi-test' },
    });
    const poi = await prismaService.poi.create({
      data: {
        name: 'Dubai Marina Walk',
        type: PoiType.LANDMARK,
        cityId: city.id,
        areaId: area.id,
        lat: 25.0805,
        lng: 55.1403,
      },
    });

    const found = await prismaService.poi.findUnique({ where: { id: poi.id } });

    expect(found).toBeDefined();
    expect(found?.type).toEqual(PoiType.LANDMARK);
    expect(found?.areaId).toEqual(area.id);
  });

  it('creates and reads back an AmenityCatalog entry', async () => {
    const amenity = await prismaService.amenityCatalog.create({
      data: {
        key: 'pool',
        label: 'Swimming pool',
        category: AmenityCategory.OUTDOOR,
      },
    });

    const found = await prismaService.amenityCatalog.findUnique({
      where: { id: amenity.id },
    });

    expect(found).toBeDefined();
    expect(found?.category).toEqual(AmenityCategory.OUTDOOR);
    expect(found?.active).toEqual(true);
  });

  it('creates and reads back an AccessibilityFeature entry', async () => {
    const feature = await prismaService.accessibilityFeature.create({
      data: {
        key: 'step-free-access',
        label: 'Step-free access',
        category: AccessibilityCategory.MOBILITY,
      },
    });

    const found = await prismaService.accessibilityFeature.findUnique({
      where: { id: feature.id },
    });

    expect(found).toBeDefined();
    expect(found?.category).toEqual(AccessibilityCategory.MOBILITY);
  });
});
