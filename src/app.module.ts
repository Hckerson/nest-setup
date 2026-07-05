import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from '@core/auth/auth.module';
import { UsersModule } from '@core/users/users.module';
import { AdminModule } from '@core/admin/admin.module';
import { RepoModule } from '@common/repos/repo.module';
import { PrismaModule } from '@common/database/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        RepoModule,
        AuthModule,
        UsersModule,
        AdminModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
