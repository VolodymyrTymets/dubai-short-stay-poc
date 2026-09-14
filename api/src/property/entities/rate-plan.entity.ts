import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class RatePlanEntity {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  propertyId!: string;

  @Field(() => Int)
  baseNightlyAed!: number;

  @Field(() => Float, { nullable: true })
  weekendMultiplier?: number | null;

  @Field(() => Boolean)
  isActive!: boolean;

  // Rule-set fields (seasonalOverrides, losDiscounts, lastMinuteDiscount, occupancyPricing,
  // channelMarkups) are Json in Prisma; no JSON GraphQL scalar is installed yet (rule C2 — no new
  // runtime dependency without approval), so they are not exposed here. Read via Prisma directly,
  // or add a JSON scalar + CRUD surface in a follow-up once RatePlan editing ships.
}
