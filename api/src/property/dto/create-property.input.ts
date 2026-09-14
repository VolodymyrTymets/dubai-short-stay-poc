import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PropertyType,
  CancellationPolicy,
} from '../../../generated/prisma/enums';
import { PropertyBedInput } from './property-bed.input';

@InputType()
export class CreatePropertyInput {
  @IsString()
  @Field(() => String)
  slug!: string;

  @IsString()
  @Field(() => String)
  title!: string;

  @IsString()
  @Field(() => String)
  description!: string;

  @IsEnum(PropertyType)
  @Field(() => PropertyType)
  propertyType!: PropertyType;

  @IsInt()
  @Min(0)
  @Field(() => Int)
  bedrooms!: number;

  @IsNumber()
  @Min(0)
  @Field(() => Float)
  bathrooms!: number;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  maxGuests!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyBedInput)
  @Field(() => [PropertyBedInput])
  beds!: PropertyBedInput[];

  @IsString()
  @Field(() => String)
  areaId!: string;

  @IsString()
  @Field(() => String)
  cityId!: string;

  @IsNumber()
  @Field(() => Float)
  lat!: number;

  @IsNumber()
  @Field(() => Float)
  lng!: number;

  @IsInt()
  @Min(0)
  @Field(() => Int)
  basePriceAed!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  cleaningFeeAed?: number;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  isInstantBook?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true, defaultValue: [] })
  amenityIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true, defaultValue: [] })
  accessibilityIds?: string[];

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  detPermitNumber?: string;

  @IsInt()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  tdfPerBedroom?: number;

  @IsEnum(CancellationPolicy)
  @IsOptional()
  @Field(() => CancellationPolicy, { nullable: true })
  cancellationPolicy?: CancellationPolicy;
}
