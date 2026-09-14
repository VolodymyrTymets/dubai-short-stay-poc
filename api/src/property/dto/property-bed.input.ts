import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class PropertyBedInput {
  @IsString()
  @MaxLength(40)
  @Field(() => String)
  type!: string;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  count!: number;
}
