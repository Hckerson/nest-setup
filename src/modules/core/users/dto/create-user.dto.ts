import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma/enums';
import { PASSWORD_MIN_LENGTH } from '@common/enums/auth';

import {
    IsEnum,
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class CreateUserDto {
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

    @ApiProperty({ enum: UserRole, default: UserRole.USER, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ example: 'Short profile bio', required: false })
    @IsOptional()
    @IsString()
    bio?: string;
}
