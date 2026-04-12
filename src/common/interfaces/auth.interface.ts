import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { Role } from "../enums/role.enum";

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 16)
  password: string;
}

export class LoginDto extends AuthDto {}

export class SignupDto extends AuthDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
