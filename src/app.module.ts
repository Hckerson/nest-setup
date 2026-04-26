import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { Module, ValidationPipe } from "@nestjs/common";
import configuration from "@common/config/main.config";
import { HealthModule } from "./modules/health/health.module";
import { LeadsModule } from "./modules/core/leads/leads.module";
import { HttpExceptionFilter } from "./common/filters/http-exception-filter";

@Module({
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [AppController],
  imports: [
    AuthModule,
    HealthModule,
    AuthModule,
    LeadsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
