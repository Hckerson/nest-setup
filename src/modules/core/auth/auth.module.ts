import { JwtModule } from '@nestjs/jwt';
import {
    JWT_ALGORITHM,
    privateKeyFrom,
    publicKeyFrom,
} from '@common/config/jwt-keys';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@core/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                privateKey: privateKeyFrom(config),
                publicKey: publicKeyFrom(config),
                signOptions: {
                    algorithm: JWT_ALGORITHM,
                    expiresIn: '7d',
                },
                verifyOptions: { algorithms: [JWT_ALGORITHM] },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
