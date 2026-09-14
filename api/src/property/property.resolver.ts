import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PropertyEntity } from './entities/property.entity';
import { PropertyService } from './property.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PaginationInput } from '../common/input/pagination.input';
import { SearchInput } from '../common/input/search.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentAccount } from '../decorators/current-account.decorator';
import type { AuthAccount } from '../auth/strategies/jwt.strategy';
import { AccountRoleType } from '../../generated/prisma/enums';

@Resolver(() => PropertyEntity)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @Mutation(() => PropertyEntity, {
    description: 'Create a new property listing (draft) for the current host',
  })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleType.HOST, AccountRoleType.ADMIN)
  @UseGuards(GqlAuthGuard)
  createProperty(
    @Args('input') input: CreatePropertyInput,
    @CurrentAccount() currentAccount: AuthAccount,
  ) {
    return this.propertyService.createProperty(input, currentAccount.accountId);
  }

  @Mutation(() => PropertyEntity, {
    description: "Update the current host's own property listing",
  })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleType.HOST, AccountRoleType.ADMIN)
  @UseGuards(GqlAuthGuard)
  updateProperty(
    @Args('id') id: string,
    @Args('input') input: UpdatePropertyInput,
    @CurrentAccount() currentAccount: AuthAccount,
  ) {
    return this.propertyService.updateProperty(
      id,
      input,
      currentAccount.accountId,
    );
  }

  @Query(() => PropertyEntity, {
    name: 'property',
    nullable: true,
    description: "Get one of the current host's own property listings by id",
  })
  @UseGuards(GqlAuthGuard)
  property(
    @Args('id') id: string,
    @CurrentAccount() currentAccount: AuthAccount,
  ) {
    return this.propertyService.findPropertyForOwner(
      id,
      currentAccount.accountId,
    );
  }

  @Query(() => [PropertyEntity], {
    name: 'myProperties',
    description: "List the current host's own property listings",
  })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleType.HOST, AccountRoleType.ADMIN)
  @UseGuards(GqlAuthGuard)
  myProperties(
    @CurrentAccount() currentAccount: AuthAccount,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('search', { nullable: true }) search?: SearchInput,
  ) {
    return this.propertyService.findMyProperties(
      currentAccount.accountId,
      pagination ?? { orderBy: [{ field: 'createdAt', order: 'desc' }] },
      search,
    );
  }
}
