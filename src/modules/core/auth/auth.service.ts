import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';
import { PasswordUtil } from './utils/password.util';
import { metricBuilder } from 'src/lib/metric-builder';
import { UsersService } from '@core/users/users.service';
import type { AuthResponse, JwtPayload } from './types/auth.types';
import { LoginDto, RegisterDto, ResetPasswordDto, OnboardingDto } from './dto';

import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    // ─── Registration & Login ──────────────────────────────────────────────────

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const passwordHash = await PasswordUtil.hash(dto.password);
        const data = metricBuilder<Prisma.UserCreateInput>({
            passwordHash,
            role: dto.role,
            email: dto.email,
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
        });

        const user = await this.usersService.create(data);
        const accessToken = this.generateToken(user);

        return { user: this.toAuthUser(user), accessToken };
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.authenticateUser(dto.email, dto.password);
        const accessToken = this.generateToken(user);

        return { user: this.toAuthUser(user), accessToken };
    }

    // ─── Password & Profile ─────────────────────────────────────────────────────

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        try {
            const payload: JwtPayload = this.jwtService.verify(dto.token);
            const user = await this.usersService.findByEmail(payload.email);
            if (!user) throw new UnauthorizedException('Invalid token');

            const passwordHash = await PasswordUtil.hash(dto.password);
            await this.usersService.update(user.id, { passwordHash });
            return { message: 'Password reset successful.' };
        } catch {
            throw new UnauthorizedException('Invalid or expired token.');
        }
    }

    async onboarding(
        userId: string,
        dto: OnboardingDto,
    ): Promise<{ message: string }> {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.usersService.update(userId, {
            bio: dto.bio,
            phoneNumber: dto.phoneNumber,
        });
        return { message: 'Onboarding completed.' };
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private toAuthUser(user: User) {
        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
        };
    }

    private generateToken(user: {
        id: string;
        email: string;
        role: UserRole;
    }): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }

    private async authenticateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await PasswordUtil.compare(
            password,
            user.passwordHash,
        );
        if (!passwordValid)
            throw new UnauthorizedException('Invalid credentials');

        return user;
    }
}
