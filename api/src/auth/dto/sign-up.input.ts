import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class SignUpInput {
  @IsEmail()
  @Field(() => String, { description: 'email' })
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Field(() => String, { description: 'password' })
  password!: string;
}
