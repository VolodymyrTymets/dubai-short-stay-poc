import { InputType, Field } from '@nestjs/graphql';
import { IsPhoneNumber, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class SignUpInput {
  @IsPhoneNumber()
  @Field(() => String, { description: 'phoneNumber' })
  phoneNumber!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Field(() => String, { description: 'password' })
  password!: string;
}
