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

  it('Should sign up with a new email and password', async () => {
    const email = 'sign-up-e2e-1@example.com';
    const password = 'correct-password';

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            email: "${email}",
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
              email
              isPhoneVerified
            }
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{
      account: {
        id: string;
        AccountProfile: { email: string; isPhoneVerified: boolean };
      };
    }>;

    expect(accountResponse.body.data.account.AccountProfile.email).toEqual(
      email,
    );
    expect(
      accountResponse.body.data.account.AccountProfile.isPhoneVerified,
    ).toEqual(false);

    const signInResponse = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signIn(signInPasswordInput: {
            email: "${email}",
            password: "${password}"
          }) {
            accessToken
          }
        }`,
      })
      .expect(200)) as GraphQLResponseType<{ signIn: { accessToken: string } }>;

    expect(signInResponse.body.data.signIn.accessToken).toBeDefined();
  });

  it('Should not let sign-up take over an existing account that has no password', async () => {
    // WHY: an account's email can be set via updateAccountProfile without
    // ever setting a password (e.g. an OTP-only account that later fills in
    // its email). If signUp were allowed to attach a password to it, anyone
    // who merely knew the email could take over the real owner's account.
    const email = 'sign-up-e2e-4@example.com';
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    await prismaService.accountProfile.create({
      data: { accountId: account.id, email },
    });
    await prismaService.accountIdentity.create({
      data: { accountId: account.id },
    });

    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            email: "${email}",
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
      where: { Account: { AccountProfile: { email } } },
    });
    expect(identity?.hash).toBeNull();
  });

  it('Should return a conflict error when the email already has a password', async () => {
    const email = 'sign-up-e2e-2@example.com';
    const account = await prismaService.account.create({
      data: { lastLoginAt: new Date() },
    });
    await prismaService.accountProfile.create({
      data: { accountId: account.id, email },
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
            email: "${email}",
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

  it('Should return a validation error for an invalid email', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            email: "invalid-email",
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
    expect(errorMessages?.[0]).toMatch(/email/i);
  });

  it('Should return a validation error for a too-short password', async () => {
    const response = (await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          signUp(signUpInput: {
            email: "sign-up-e2e-3@example.com",
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
