import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import {
  PropertyStatus,
  PropertyType,
  CancellationPolicy,
} from '../../../generated/prisma/enums';
import { PropertyBedEntity } from './property-bed.entity';
import { PropertyPhotoEntity } from './property-photo.entity';

registerEnumType(PropertyStatus, { name: 'PropertyStatus' });
registerEnumType(PropertyType, { name: 'PropertyType' });
registerEnumType(CancellationPolicy, { name: 'CancellationPolicy' });

@ObjectType()
export class PropertyEntity {
  @Field(() => String)
  id!: string;

  @Field(() => PropertyStatus)
  status!: PropertyStatus;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  description!: string;

  @Field(() => PropertyType)
  propertyType!: PropertyType;

  @Field(() => Int)
  bedrooms!: number;

  @Field(() => Float)
  bathrooms!: number;

  @Field(() => Int)
  maxGuests!: number;

  @Field(() => [PropertyBedEntity])
  beds!: PropertyBedEntity[];

  @Field(() => String)
  areaId!: string;

  @Field(() => String)
  cityId!: string;

  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;

  @Field(() => Boolean)
  addressDisclosed!: boolean;

  @Field(() => Int)
  basePriceAed!: number;

  @Field(() => Int, { nullable: true })
  cleaningFeeAed?: number | null;

  @Field(() => String)
  currency!: string;

  @Field(() => Boolean)
  isInstantBook!: boolean;

  @Field(() => [String])
  amenityIds!: string[];

  @Field(() => [String])
  accessibilityIds!: string[];

  @Field(() => String, { nullable: true })
  detPermitNumber?: string | null;

  @Field(() => Int, { nullable: true })
  tdfPerBedroom?: number | null;

  @Field(() => String)
  ownerId!: string;

  @Field(() => Int)
  commissionPct!: number;

  @Field(() => CancellationPolicy)
  cancellationPolicy!: CancellationPolicy;

  @Field(() => Int)
  qualityScore!: number;

  @Field(() => Float, { nullable: true })
  rating?: number | null;

  @Field(() => Int)
  reviewCount!: number;

  @Field(() => Int)
  bookingsTotal!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date | null;

  @Field(() => [PropertyPhotoEntity])
  photos!: PropertyPhotoEntity[];
}
