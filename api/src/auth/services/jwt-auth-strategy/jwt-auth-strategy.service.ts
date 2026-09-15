import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { JwtStrategyService } from '../jwt-strategy/jwt-strategy.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInPasswordInput } from '../../dto/sign-in-password.input';
import { SignUpInput } from '../../dto/sign-up.input';
import { AuthTokensEntity } from '../../entities/auth-tokens.entity';
import { AccountService } from '../../../account/account.service';

@Injectable()
export class JwtAuthStrategyService extends JwtStrategyService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super(prismaService, jwtService, configService);
  }

  private static readonly BCRYPT_ROUNDS = 10;

  // WHY: a fixed, valid-format bcrypt hash with no known plaintext — compared
  // against on the "account/password not set" path so a miss takes the same
  // time as a real mismatch and doesn't reveal account existence via timing.
  private static readonly DUMMY_PASSWORD_HASH =
    '$2b$10$CwTycUXWue0Thq9StjUM0uQxTmrzMYzFAWXTFa5U0F5tE2ADRXK6b';

  async signIn(
    signInPasswordInput: SignInPasswordInput,
  ): Promise<AuthTokensEntity> {
    const { email, password } = signInPasswordInput;

    const account = await this.prismaService.account.findFirst({
      where: {
        deleted: false,
        AccountProfile: { email, deleted: false },
      },
      include: {
        AccountIdentity: true,
      },
    });

    const identity =
      account?.AccountIdentity && !account.AccountIdentity.deleted
        ? account.AccountIdentity
        : undefined;

    const passwordMatches = await compare(
      password,
      identity?.hash ?? JwtAuthStrategyService.DUMMY_PASSWORD_HASH,
    );

    if (!account || !identity?.hash || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(account.id);
  }

  // WHY: an account that already exists for this email — with or without a
  // password — must never be adopted here. An Account's email can be set
  // through updateAccountProfile without ever setting a password (e.g. an
  // OTP-only account that later fills in its email), so allowing sign-up to
  // attach a password to an *existing* account would let anyone who merely
  // knows a victim's email take it over. Only a brand-new account may
  // proceed; claiming an existing one needs a separate, verified flow that
  // doesn't exist yet.
  async signUp(signUpInput: SignUpInput): Promise<AuthTokensEntity> {
    const { email, password } = signUpInput;

    const existingAccount = await this.prismaService.account.findFirst({
      where: {
        deleted: false,
        AccountProfile: { email, deleted: false },
      },
    });

    if (existingAccount) {
      throw new ConflictException('Account already exists');
    }

    const account = await this.accountService.createGuestAccountByEmail(email);

    const salt = await genSalt(JwtAuthStrategyService.BCRYPT_ROUNDS);
    const passwordHash = await hash(password, salt);

    await this.prismaService.accountIdentity.create({
      data: { accountId: account.id, hash: passwordHash, salt },
    });

    return this.issueTokens(account.id);
  }

  async validateRefreshToken(accountId: string, refreshToken: string) {
    try {
      const identity =
        await this.prismaService.accountIdentity.findFirstOrThrow({
          where: { accountId },
        });
      if (!identity || !identity.refreshToken) {
        throw new UnauthorizedException();
      }
      const refreshTokenMatches = await compare(
        refreshToken,
        identity.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException();
      }
      return { accountId };
    } catch (error) {
      Logger.error('Verify user refresh token error', error);
      throw new UnauthorizedException();
    }
  }

  refreshToken(accountId: string) {
    return this.refreshTokens(accountId);
  }
}
