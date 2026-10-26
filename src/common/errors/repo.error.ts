import { HttpException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

export class RepoError extends HttpException {
    constructor(message: string, errorCode: number, cause?: unknown) {
        super(message, errorCode, { cause });
    }

    hasPrismaCode(code: string): boolean {
        return (
            this.cause instanceof Prisma.PrismaClientKnownRequestError &&
            this.cause.code === code
        );
    }
}
