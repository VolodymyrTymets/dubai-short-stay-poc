import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtStrategyService } from '../jwt-strategy/jwt-strategy.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInPasswordInput } from '../../dto/sign-in-password.input';
import { AuthTokensEntity } from '../../entities/auth-tokens.entity';

@Injectable()
export class JwtAuthStrategyService extends JwtStrategyService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {
    super(prismaService, jwtService, configService);
  }

  // WHY: a fixed, valid-format bcrypt hash with no known plaintext — compared
  // against on the "account/password not set" path so a miss takes the same
  // time as a real mismatch and doesn't reveal account existence via timing.
  private static readonly DUMMY_PASSWORD_HASH =
    '$2b$10$CwTycUXWue0Thq9StjUM0uQxTmrzMYzFAWXTFa5U0F5tE2ADRXK6b';

  async signIn(
    signInPasswordInput: SignInPasswordInput,
  ): Promise<AuthTokensEntity> {
    const { phoneNumber, password } = signInPasswordInput;

    const account = await this.prismaService.account.findFirst({
      where: {
        deleted: false,
        AccountProfile: { phoneNumber, deleted: false },
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
