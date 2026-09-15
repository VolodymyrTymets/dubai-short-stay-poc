import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { hash } from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { DataCooker } from '../utils/DataCooker/DataCooker';
import { PrismaService } from '../../src/prisma/prisma.service';
import type { GraphQLResponseType } from '../utils/e2e-services/interfaces/types';

type GraphQLValidationErrorResponse = {
  body: {
    errors?: Array<{
      extensions?: { originalError?: { message: string[] } };
    }>;
  };
};

describe('Sign in with password (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  const dataCooker = new DataCooker();

  beforeAll(async () => {
    await dataCooker.beforeAll();
  }, 10000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    prismaService = await moduleFixture.resolve(PrismaService);
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  async function createAccountWithPassword(
    phoneNumber: string,
    password: string,
  ) {
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    await prismaService.accountProfile.create({
      data: { accountId: account.id, phoneNumber },
    });
    const passwordHash = await hash(password, 10);
    await prismaService.accountIdentity.create({
      data: { accountId: account.id, hash: passwordHash },
    });
    return account;
  }

  it('Should sign in with a valid phone number and password', async () => {
    const phoneNumber = '+12125557001';
    const password = 'correct-password';
    const account = await createAccountWithPassword(phoneNumber, password);

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "${phoneNumber}",
            password: "${password}"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signIn: { accessToken: string; refreshToken: string };
    }>;

    expect(response.body.data.signIn.accessToken).toBeDefined();
    expect(response.body.data.signIn.refreshToken).toBeDefined();

    const accessToken = response.body.data.signIn.accessToken;

    const accountResponse = (await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `query {
          account {
            id
            AccountProfile {
              id
              phoneNumber
              isPhoneVerified
            }
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      account: {
        id: string;
        AccountProfile: { phoneNumber: string; isPhoneVerified: boolean };
      };
    }>;

    expect(accountResponse.body.data.account.id).toEqual(account.id);
    expect(
      accountResponse.body.data.account.AccountProfile.phoneNumber,
    ).toEqual(phoneNumber);
    expect(
      accountResponse.body.data.account.AccountProfile.isPhoneVerified,
    ).toEqual(false);
  });

  it('Should not sign in with a wrong password', async () => {
    const phoneNumber = '+12125557002';
    await createAccountWithPassword(phoneNumber, 'correct-password');

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "${phoneNumber}",
            password: "wrong-password"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signIn: { accessToken: string; refreshToken: string };
    }>;

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors?.[0].extensions?.code).toEqual(
      'UNAUTHENTICATED',
    );
  });

  it('Should not sign in when the account does not exist', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "+12125557003",
            password: "whatever-password"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signIn: { accessToken: string; refreshToken: string };
    }>;

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors?.[0].extensions?.code).toEqual(
      'UNAUTHENTICATED',
    );
  });

  it('Should return a validation error for an invalid phone number', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "invalid-phone",
            password: "whatever-password"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLValidationErrorResponse;

    expect(response.body.errors).toBeDefined();
    const errorMessages =
      response.body.errors?.[0].extensions?.originalError?.message;
    expect(errorMessages).toBeDefined();
    expect(errorMessages?.[0]).toMatch(/phone number/i);
  });

  it('Should return a validation error for a too-short password', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "+12125557004",
            password: "short"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLValidationErrorResponse;

    expect(response.body.errors).toBeDefined();
    const errorMessages =
      response.body.errors?.[0].extensions?.originalError?.message;
    expect(errorMessages).toBeDefined();
    expect(errorMessages?.[0]).toMatch(/password/i);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await dataCooker.afterAll();
  });
});
