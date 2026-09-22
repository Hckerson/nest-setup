import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Post, Body, HttpCode, Controller, HttpStatus } from '@nestjs/common';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiEnvelope(AuthResponseDto, { status: 201 })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login and get JWT token' })
    @ApiEnvelope(AuthResponseDto)
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
