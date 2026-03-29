import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { HealthModule } from "./routes/health/health.module";
import { AppService } from "./app.service";

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
