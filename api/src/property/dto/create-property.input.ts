import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  Matches,
  Max,
  MaxLength,
  Min,
  IsNumber,
  IsOptional,
  IsString,
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
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by hyphens',
  })
  @Field(() => String)
  slug!: string;

  @IsString()
  @MaxLength(200)
  @Field(() => String)
  title!: string;

  @IsString()
  @MaxLength(5000)
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
  @Min(-90)
  @Max(90)
  @Field(() => Float)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
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
  @MaxLength(64)
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
