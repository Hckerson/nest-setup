import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@core/auth/auth.module';
import { UsersModule } from '@core/users/users.module';
import { StatsModule } from '@core/stats/stats.module';
import { HealthModule } from '@core/health/health.module';
import { RepoModule } from '@common/repos/repo.module';
import { PrismaModule } from '@common/database/prisma.module';
import { validateEnv } from '@common/config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        PrismaModule,
        RepoModule,
        AuthModule,
        UsersModule,
        HealthModule,
        StatsModule,
    ],
})
export class AppModule {}
