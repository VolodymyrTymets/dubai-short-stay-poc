import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { PropertyStatus } from '../../../generated/prisma/enums';
import { CreatePropertyInput } from './create-property.input';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @IsEnum(PropertyStatus)
  @IsOptional()
  @Field(() => PropertyStatus, { nullable: true })
  status?: PropertyStatus;
}
