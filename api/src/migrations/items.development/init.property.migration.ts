import * as Sentry from '@sentry/nestjs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AccountRoleType,
  PropertyType,
  CancellationPolicy,
  PropertyStatus,
  KycStatus,
  FileStatus,
} from 'generated/prisma/enums';
import type { Area, Host } from 'generated/prisma/client';
import { IMigrationItem } from '../items/migration-item.interface';
import { AccountRoleService } from '../../account-role/account-role.service';
import hosts from '../../assets/hosts';

// SRS v8.4 §A.3: commission is locked at 12% (see property.service.ts's DEFAULT_COMMISSION_PCT).
const COMMISSION_PCT = 12;
const DUBAI_LAT = 25.2048;
const DUBAI_LNG = 55.2708;
const PROPERTY_COUNT = 100;
const PROPERTY_TYPES = Object.values(PropertyType);
const CANCELLATION_POLICIES = Object.values(CancellationPolicy);
// Skews toward LIVE so seeded listings are actually usable in local dev.
const STATUS_CYCLE: PropertyStatus[] = [
  PropertyStatus.LIVE,
  PropertyStatus.LIVE,
  PropertyStatus.LIVE,
  PropertyStatus.PENDING_REVIEW,
  PropertyStatus.DRAFT,
  PropertyStatus.PAUSED,
];
const TDF_PER_BEDROOM_CYCLE = [7, 10, 15, 20];

const AREAS = [
  { slug: 'dubai-marina', name: 'Dubai Marina' },
  { slug: 'downtown-dubai', name: 'Downtown Dubai' },
  { slug: 'palm-jumeirah', name: 'Palm Jumeirah' },
  { slug: 'business-bay', name: 'Business Bay' },
  { slug: 'jumeirah-beach-residence', name: 'Jumeirah Beach Residence' },
  { slug: 'dubai-hills-estate', name: 'Dubai Hills Estate' },
];

export class InitPropertyMigration implements IMigrationItem {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountRoleService: AccountRoleService,
  ) {}
  public name = 'init.property.migration';

  private log(message: string) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    Logger.log(`[init.property.migration] ${message}`);
  }

  async inNeedToRun() {
    return (await this.prisma.property.count()) === 0;
  }

  private async seedCatalog() {
    const city = await this.prisma.city.upsert({
      where: { slug: 'dubai' },
      update: {},
      create: { name: 'Dubai', slug: 'dubai' },
    });

    const areas: Area[] = [];
    for (const areaInput of AREAS) {
      const area = await this.prisma.area.upsert({
        where: { cityId_slug: { cityId: city.id, slug: areaInput.slug } },
        update: {},
        create: {
          cityId: city.id,
          name: areaInput.name,
          slug: areaInput.slug,
        },
      });
      areas.push(area);
    }

    return { city, areas };
  }

  private async seedHosts() {
    const createdHosts: Host[] = [];
    for (const hostInput of hosts) {
      const account = await this.prisma.account.create({
        data: {
          lastLoginAt: new Date(),
          AccountProfile: {
            create: {
              phoneNumber: hostInput.phoneNumber,
              email: hostInput.email,
              firstName: hostInput.firstName,
              lastName: hostInput.lastName,
            },
          },
          Host: {
            create: {
              HostProfile: {
                create: {
                  kycStatus: KycStatus.VERIFIED,
                  bankAccountVerified: true,
                },
              },
            },
          },
        },
        include: { Host: true },
      });

      await this.accountRoleService.addAccountToRole(
        account.id,
        AccountRoleType.HOST,
      );

      if (!account.Host) {
        throw new Error(`Host row was not created for account ${account.id}`);
      }
      createdHosts.push(account.Host);
      this.log(`Host ${hostInput.email} is added`);
    }
    return createdHosts;
  }

  async run() {
    try {
      const { city, areas } = await this.seedCatalog();
      const createdHosts = await this.seedHosts();

      for (let i = 0; i < PROPERTY_COUNT; i++) {
        const area = areas[i % areas.length];
        const host = createdHosts[i % createdHosts.length];
        const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
        const bedrooms = (i % 5) + 1;
        const bathrooms = Math.max(1, bedrooms - 1) + (i % 2 === 0 ? 0 : 0.5);
        const maxGuests = bedrooms * 2;
        const beds = [
          { type: 'king', count: Math.ceil(bedrooms / 2) },
          ...(bedrooms % 2 === 0 ? [{ type: 'sofa', count: 1 }] : []),
        ];

        const property = await this.prisma.property.create({
          data: {
            slug: `${area.slug}-${propertyType.toLowerCase()}-${i + 1}`,
            title: `${bedrooms}BR ${propertyType.charAt(0)}${propertyType.slice(1).toLowerCase()} in ${area.name}`,
            description: `A ${bedrooms}-bedroom ${propertyType.toLowerCase()} located in ${area.name}, Dubai. Seeded development listing #${i + 1}.`,
            propertyType,
            bedrooms,
            bathrooms,
            maxGuests,
            beds,
            areaId: area.id,
            cityId: city.id,
            lat: DUBAI_LAT + ((i % 20) - 10) * 0.01,
            lng: DUBAI_LNG + ((i % 15) - 7) * 0.01,
            basePriceAed: 400 + (i % 25) * 60,
            cleaningFeeAed: 100 + (i % 5) * 20,
            isInstantBook: i % 3 !== 0,
            detPermitNumber: `DET-${100000 + i}`,
            tdfPerBedroom:
              TDF_PER_BEDROOM_CYCLE[i % TDF_PER_BEDROOM_CYCLE.length],
            cancellationPolicy:
              CANCELLATION_POLICIES[i % CANCELLATION_POLICIES.length],
            ownerId: host.id,
            commissionPct: COMMISSION_PCT,
            status: STATUS_CYCLE[i % STATUS_CYCLE.length],
            ...(STATUS_CYCLE[i % STATUS_CYCLE.length] ===
              PropertyStatus.LIVE && {
              publishedAt: new Date(),
            }),
            Photos: {
              create: [0, 1, 2].map((position) => ({
                position,
                isHero: position === 0,
                File: {
                  create: {
                    createdById: host.accountId,
                    name: `property-${i + 1}-photo-${position + 1}.jpg`,
                    // Dummy placeholder — no real upload/S3 object behind this yet.
                    key: `https://picsum.photos/seed/dss-property-${i + 1}-${position}/1200/800`,
                    mimeType: 'image/jpeg',
                    status: FileStatus.FILE_STATUS_UPLOAD_COMPLETED,
                  },
                },
              })),
            },
          },
        });

        this.log(`Property ${property.slug} is added`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message || '' : 'Unknown error';
      Sentry.captureException(this.name + message);
      throw new Error(this.name + message);
    }
  }
}
