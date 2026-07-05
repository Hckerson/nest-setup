import { HttpException } from '@nestjs/common';

export class RepositoryError extends HttpException {
    constructor(message: string, errorCode: number, cause?: unknown) {
        super(message, errorCode, { cause });
    }
}
