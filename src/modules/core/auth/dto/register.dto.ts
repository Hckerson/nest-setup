import {
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MIN_LENGTH } from '@common/enums/auth';

export class RegisterDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: PASSWORD_MIN_LENGTH })
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    password: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;
}
