import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { API_PREFIX, DOCS_PATH, swaggerConfig } from './openapi';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    app.setGlobalPrefix(API_PREFIX);

    app.enableCors({
        origin: config.getOrThrow<string>('FRONTEND_URL'),
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(DOCS_PATH, app, document);

    const port = config.getOrThrow<number>('PORT');
    await app.listen(port);

    const url = await app.getUrl();
    logger.log(`API running on ${url}/${API_PREFIX}`);
    logger.log(`Swagger docs at ${url}/${DOCS_PATH}`);
}

void bootstrap().catch((err: unknown) => {
    logger.error('Failed to start application', err);
    process.exit(1);
});
