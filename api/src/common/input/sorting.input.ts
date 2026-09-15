import { InputType, Field } from '@nestjs/graphql';
import { IsIn, IsString } from 'class-validator';

export type SortingType = Record<string, 'asc' | 'desc'>;

@InputType()
export class SortingInput {
  @IsString()
  @Field(() => String, { description: 'sorting field' })
  field!: string;

  @IsIn(['asc', 'desc'])
  @Field(() => String, { description: 'sorting order' })
  order!: 'asc' | 'desc';
}
