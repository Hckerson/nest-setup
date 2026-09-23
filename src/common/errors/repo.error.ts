import { HttpException } from '@nestjs/common';

export class RepoError extends HttpException {
    constructor(message: string, errorCode: number, cause?: unknown) {
        super(message, errorCode, { cause });
    }
}
