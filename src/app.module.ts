import { Module, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { AuthModule } from "./routes/auth/auth.module";
import { HealthModule } from "./routes/health/health.module";
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
  imports: [AuthModule, HealthModule, AuthModule],
})
export class AppModule {}
