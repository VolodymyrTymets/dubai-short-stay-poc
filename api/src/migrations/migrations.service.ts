import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MigrationService } from './migration.service';

import { IMigrationItem } from './items/migration-item.interface';
import { InitRolesMigration } from './items/init.roles.migration';
import { InitCustomerMigration } from './items.development/init.customer.migration';
import { AccountService } from '../account/account.service';
import { AccountProfileService } from '../account-profile/account-profile.service';
import { AccountRoleService } from '../account-role/account-role.service';
import { InitAdminMigration } from './items/init.admin.migration';
import { InitPropertyMigration } from './items.development/init.property.migration';

@Injectable()
export class MigrationsService {
  constructor(
    private readonly migrationService: MigrationService,
    private readonly prismaService: PrismaService,
    private readonly accountService: AccountService,
    private readonly accountProfileService: AccountProfileService,
    private readonly accountRoleService: AccountRoleService,
  ) {
    this.migrations = [
      new InitRolesMigration(this.prismaService),
      new InitAdminMigration(
        this.prismaService,
        this.accountProfileService,
        this.accountRoleService,
      ),
    ];
    if (
      process.env.NODE_ENV === 'local' ||
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'development'
    ) {
      this.developmentMigrations = [
        new InitCustomerMigration(
          this.prismaService,
          this.accountService,
          this.accountProfileService,
          this.accountRoleService,
        ),
      ];
    }
    // Excludes 'test': 100 properties x 3 nested photo/file creates is heavy
    // enough to blow test hook timeouts and pollute the shared PGlite
    // instance across every spec file's DataCooker.beforeAll() — this seed
    // is for local/development only.
    if (
      process.env.NODE_ENV === 'local' ||
      process.env.NODE_ENV === 'development'
    ) {
      this.developmentMigrations.push(
        new InitPropertyMigration(this.prismaService, this.accountRoleService),
      );
    }
  }
  private readonly migrations: Array<IMigrationItem> = [];
  private readonly developmentMigrations: Array<IMigrationItem> = [];

  private log(message: string) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    Logger.log(`[MigrationsService] ${message}`);
  }

  async runMigrations() {
    this.log('Checking for upcoming migrations...');

    for (const migration of [
      ...this.migrations,
      ...this.developmentMigrations,
    ]) {
      if (await migration.inNeedToRun()) {
        await this.migrationService.startMigration({
          migration: migration.run.bind(migration) as () => Promise<void>,
          name: migration.name,
        });
      }
    }
    this.log('All migrations completed successfully.');
  }
}
