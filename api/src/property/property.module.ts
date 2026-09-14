import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountRoleModule } from '../account-role/account-role.module';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';

@Module({
  imports: [PrismaModule, AccountRoleModule],
  providers: [PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
