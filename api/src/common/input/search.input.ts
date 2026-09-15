import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class SearchInput {
  @IsString()
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'default search argument',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'search by title',
  })
  title?: string;
}
