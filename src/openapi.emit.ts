import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { API_PREFIX, swaggerConfig } from './openapi';

const OUTPUT_PATH = 'openapi.json';

async function emit() {
    const app = await NestFactory.create(AppModule, {
        preview: true,
        logger: false,
    });

    app.setGlobalPrefix(API_PREFIX);

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(document, null, 4)}\n`);
    await app.close();

    process.stdout.write(
        `${OUTPUT_PATH}: ${Object.keys(document.paths).length} paths, ${Object.keys(document.components?.schemas ?? {}).length} schemas\n`,
    );
}

void emit();
