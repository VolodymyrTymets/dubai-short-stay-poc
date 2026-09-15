import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DataCooker } from '../utils/DataCooker/DataCooker';
import { KycStatus, HostKycDocumentType } from '../../generated/prisma/enums';

describe('HostProfile + HostKycDocument (e2e)', () => {
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

  const createHost = async () => {
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    return prismaService.host.create({ data: { accountId: account.id } });
  };

  it('attaches a HostProfile to a Host with a default pending kycStatus', async () => {
    const host = await createHost();

    const profile = await prismaService.hostProfile.create({
      data: { hostId: host.id },
    });

    const found = await prismaService.hostProfile.findUnique({
      where: { id: profile.id },
    });

    expect(found).toBeDefined();
    expect(found?.hostId).toEqual(host.id);
    expect(found?.kycStatus).toEqual(KycStatus.PENDING);
    expect(found?.bankAccountVerified).toEqual(false);
  });

  it('attaches two HostKycDocument rows to a HostProfile', async () => {
    const host = await createHost();
    const profile = await prismaService.hostProfile.create({
      data: { hostId: host.id },
    });
    const file1 = await prismaService.file.create({
      data: { createdById: host.accountId },
    });
    const file2 = await prismaService.file.create({
      data: { createdById: host.accountId },
    });

    await prismaService.hostKycDocument.create({
      data: {
        hostProfileId: profile.id,
        type: HostKycDocumentType.PASSPORT,
        fileId: file1.id,
      },
    });
    await prismaService.hostKycDocument.create({
      data: {
        hostProfileId: profile.id,
        type: HostKycDocumentType.EMIRATES_ID,
        fileId: file2.id,
      },
    });

    const documents = await prismaService.hostKycDocument.findMany({
      where: { hostProfileId: profile.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(documents).toHaveLength(2);
    expect(documents.map((doc) => doc.type)).toEqual([
      HostKycDocumentType.PASSPORT,
      HostKycDocumentType.EMIRATES_ID,
    ]);
    expect(documents[0].status).toEqual(KycStatus.PENDING);
  });
});
