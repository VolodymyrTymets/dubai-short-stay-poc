import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PropertyBedEntity {
  @Field(() => String)
  type!: string;

  @Field(() => Int)
  count!: number;
}
