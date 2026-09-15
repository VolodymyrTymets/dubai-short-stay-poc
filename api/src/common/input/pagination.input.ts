import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortingInput } from './sorting.input';

@InputType()
export class PaginationInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortingInput)
  @IsOptional()
  @Field(() => [SortingInput], {
    nullable: true,
    description: 'sorting',
    defaultValue: [{ field: 'createdAt', order: 'desc' }],
  })
  orderBy!: SortingInput[];

  @IsInt()
  @Min(1)
  @IsOptional()
  @Field(() => Int, {
    description: 'take',
    nullable: true,
  })
  take?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Field(() => Int, {
    nullable: true,
    description: 'skip',
  })
  skip?: number;
}
