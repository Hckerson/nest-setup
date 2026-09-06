import { JwtAuthGuard } from './guards';
import { AuthService } from './auth.service';

import {
    Post,
    Body,
    Request,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
} from '@nestjs/common';
import {
    LoginDto,
    RegisterDto,
    OnboardingDto,
    AuthResponseDto,
    ResetPasswordDto,
    ForgotPasswordDto,
} from './dto';
import {
    ApiTags,
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { MessageResponseDto } from '@common/dto';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import type { RequestWithUser } from '@common/interfaces/req';

const RESET_INSTRUCTIONS_SENT =
    'If the email exists, reset instructions were sent.';

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

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request a password reset' })
    @ApiEnvelope(MessageResponseDto)
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        void dto;
        return { message: RESET_INSTRUCTIONS_SENT };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password' })
    @ApiEnvelope(MessageResponseDto)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('onboarding')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Complete profile onboarding' })
    @ApiEnvelope(MessageResponseDto)
    async onboarding(
        @Body() dto: OnboardingDto,
        @Request() req: RequestWithUser,
    ) {
        return this.authService.onboarding(req.user.id, dto);
    }
}
