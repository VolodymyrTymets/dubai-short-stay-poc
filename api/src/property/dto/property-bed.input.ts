import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, Min } from 'class-validator';

@InputType()
export class PropertyBedInput {
  @IsString()
  @Field(() => String)
  type!: string;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  count!: number;
}
