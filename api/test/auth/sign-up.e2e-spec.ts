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

describe('Sign up with password (e2e)', () => {
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

  it('Should sign up with a new phone number and password', async () => {
    const phoneNumber = '+12125558001';
    const password = 'correct-password';

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            phoneNumber: "${phoneNumber}",
            password: "${password}"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signUp: { accessToken: string; refreshToken: string };
    }>;

    expect(response.body.data.signUp.accessToken).toBeDefined();
    expect(response.body.data.signUp.refreshToken).toBeDefined();

    const accessToken = response.body.data.signUp.accessToken;

    const accountResponse = (await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `query {
          account {
            id
            AccountProfile {
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

    expect(
      accountResponse.body.data.account.AccountProfile.phoneNumber,
    ).toEqual(phoneNumber);
    expect(
      accountResponse.body.data.account.AccountProfile.isPhoneVerified,
    ).toEqual(false);

    const signInResponse = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            phoneNumber: "${phoneNumber}",
            password: "${password}"
          }) {
            accessToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{ signIn: { accessToken: string } }>;

    expect(signInResponse.body.data.signIn.accessToken).toBeDefined();
  });

  it('Should not let sign-up take over an account created by an OTP request', async () => {
    // WHY: requesting an OTP auto-creates a passwordless Account for that
    // phone number (see signInOtp). If signUp were allowed to attach a
    // password to it, anyone who merely knew the phone number could take
    // over the real owner's account the moment they request an OTP.
    const phoneNumber = '+12125558004';
    const otpResponse = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signInOtp(signInInput: { phoneNumber: "${phoneNumber}" }) { code }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{ signInOtp: { code: string } }>;
    expect(otpResponse.body.data.signInOtp).toBeDefined();

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            phoneNumber: "${phoneNumber}",
            password: "attacker-password"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signUp: { accessToken: string; refreshToken: string };
    }>;

    expect(response.body.errors).toBeDefined();

    const identity = await prismaService.accountIdentity.findFirst({
      where: { Account: { AccountProfile: { phoneNumber } } },
    });
    expect(identity?.hash).toBeNull();
  });

  it('Should return a conflict error when the phone number already has a password', async () => {
    const phoneNumber = '+12125558002';
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    await prismaService.accountProfile.create({
      data: { accountId: account.id, phoneNumber },
    });
    await prismaService.accountIdentity.create({
      data: {
        accountId: account.id,
        hash: await hash('existing-password', 10),
      },
    });

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            phoneNumber: "${phoneNumber}",
            password: "new-password"
          }) {
            accessToken
            refreshToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      signUp: { accessToken: string; refreshToken: string };
    }>;

    // NOTE: this repo has no custom GraphQL error formatter (api-graphql.md
    // rule 14 is not yet satisfied anywhere) — only UnauthorizedException
    // gets Apollo's built-in UNAUTHENTICATED mapping. ConflictException
    // falls through to the generic code below until that formatter exists.
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors?.[0].extensions?.code).toEqual(
      'INTERNAL_SERVER_ERROR',
    );
  });

  it('Should return a validation error for an invalid phone number', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
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
          signUp(signUpInput: {
            phoneNumber: "+12125558003",
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
