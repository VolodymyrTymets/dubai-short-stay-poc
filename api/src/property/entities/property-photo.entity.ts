import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PropertyPhotoEntity {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  fileId!: string;

  @Field(() => Int)
  position!: number;

  @Field(() => Boolean)
  isHero!: boolean;
}
