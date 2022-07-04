import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 18)
  password: string;
}
