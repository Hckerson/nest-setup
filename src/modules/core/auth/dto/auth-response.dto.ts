import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    role: string;
}

export class AuthResponseDto {
    @ApiProperty({ type: AuthResponseUserDto })
    user: AuthResponseUserDto;

    @ApiProperty({ required: false })
    accessToken?: string;
}
