import { InputType, Field, Int } from '@nestjs/graphql';
import { SortingInput } from './sorting.input';

@InputType()
export class PaginationInput {
  @Field(() => [SortingInput], {
    nullable: true,
    description: 'sorting',
    defaultValue: [{ field: 'createdAt', order: 'desc' }],
  })
  orderBy!: SortingInput[];

  @Field(() => Int, {
    description: 'take',
    nullable: true,
  })
  take?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'skip',
  })
  skip?: number;
}
