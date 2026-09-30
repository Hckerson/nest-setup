import { ConflictException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { UNIQUE_VIOLATION } from '@common/enums/prisma';
import { UsersService } from './users.service';
import type { UserRepo } from '@common/repos/user.repo';

const DTO = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'correct-horse',
};

const serviceWith = (create: jest.Mock) =>
    new UsersService({ create } as Pick<UserRepo, 'create'> as UserRepo);

describe('UsersService.create', () => {
    it('answers 409 when the email is already registered', async () => {
        const taken = new Prisma.PrismaClientKnownRequestError('Unique', {
            code: UNIQUE_VIOLATION,
            clientVersion: 'test',
        });
        const service = serviceWith(jest.fn().mockRejectedValue(taken));

        await expect(service.create(DTO)).rejects.toBeInstanceOf(
            ConflictException,
        );
    });

    it('lets any other failure through unchanged', async () => {
        const failure = new Error('connection lost');
        const service = serviceWith(jest.fn().mockRejectedValue(failure));

        await expect(service.create(DTO)).rejects.toBe(failure);
    });

    it('never stores the plain password', async () => {
        const create = jest.fn().mockResolvedValue({ id: 'usr_1' });
        await serviceWith(create).create(DTO);

        const [[{ data }]] = create.mock.calls as [
            [{ data: Record<string, unknown> }],
        ];
        expect(data).not.toHaveProperty('password');
        expect(data.passwordHash).not.toBe(DTO.password);
    });
});
