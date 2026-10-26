import { Test } from '@nestjs/testing';
import {
    ConflictException,
    ForbiddenException,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';
import { UserRepo } from '@common/repos/user.repo';
import { RepoError } from '@common/errors/repo.error';
import { RECORD_NOT_FOUND, UNIQUE_VIOLATION } from '@common/enums/prisma';
import { PasswordUtil } from '@core/auth/utils/password.util';
import type { AuthUser } from '@core/auth/types/auth.types';
import { UsersService } from './users.service';

const DTO = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'correct-horse',
};

const MEMBER: AuthUser = {
    id: 'usr_1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: UserRole.USER,
};

const ADMIN: AuthUser = {
    id: 'usr_9',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
};

type RepoMock = Partial<Record<keyof UserRepo, jest.Mock>>;

const serviceWith = async (repo: RepoMock) => {
    const moduleRef = await Test.createTestingModule({
        providers: [UsersService, { provide: UserRepo, useValue: repo }],
    }).compile();
    return moduleRef.get(UsersService);
};

const prismaFailure = (code: string) =>
    new RepoError(
        'Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
        new Prisma.PrismaClientKnownRequestError('Prisma', {
            code,
            clientVersion: 'test',
        }),
    );

const capturing = () =>
    jest.fn((params: { data: { passwordHash?: string } }) =>
        Promise.resolve({ id: 'usr_1', ...params.data }),
    );

describe('UsersService.create', () => {
    it('answers 409 when the email is already registered', async () => {
        const create = jest
            .fn()
            .mockRejectedValue(prismaFailure(UNIQUE_VIOLATION));
        const service = await serviceWith({ create });

        await expect(service.create(DTO)).rejects.toBeInstanceOf(
            ConflictException,
        );
    });

    it('lets any other failure through unchanged', async () => {
        const failure = new RepoError(
            'Failed to create user',
            HttpStatus.INTERNAL_SERVER_ERROR,
            new Error('connection lost'),
        );
        const service = await serviceWith({
            create: jest.fn().mockRejectedValue(failure),
        });

        await expect(service.create(DTO)).rejects.toBe(failure);
    });

    it('never stores the plain password', async () => {
        const create = capturing();
        await (await serviceWith({ create })).create(DTO);

        const [[{ data }]] = create.mock.calls;
        expect(data).not.toHaveProperty('password');
        await expect(
            PasswordUtil.compare(DTO.password, data.passwordHash ?? ''),
        ).resolves.toBe(true);
    });
});

describe('UsersService.findOne', () => {
    it('answers 404 instead of an empty profile', async () => {
        const service = await serviceWith({
            findUnique: jest.fn().mockResolvedValue(null),
        });

        await expect(service.findOne('usr_2')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('still lets the guard ask without throwing', async () => {
        const service = await serviceWith({
            findUnique: jest.fn().mockResolvedValue(null),
        });

        await expect(service.findById('usr_2')).resolves.toBeNull();
    });
});

describe('UsersService.update', () => {
    it('refuses to let a member edit someone else', async () => {
        const update = capturing();
        const service = await serviceWith({ update });

        await expect(
            service.update(MEMBER, 'usr_2', { fullName: 'Mallory' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(update).not.toHaveBeenCalled();
    });

    it('refuses to let a member promote themselves', async () => {
        const service = await serviceWith({ update: capturing() });

        await expect(
            service.update(MEMBER, MEMBER.id, { role: UserRole.ADMIN }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets a member edit their own profile', async () => {
        const update = capturing();
        await (
            await serviceWith({ update })
        ).update(MEMBER, MEMBER.id, { bio: 'Analyst' });

        expect(update).toHaveBeenCalledTimes(1);
    });

    it("lets an admin change anyone's role", async () => {
        const update = capturing();
        await (
            await serviceWith({ update })
        ).update(ADMIN, 'usr_2', { role: UserRole.ADMIN });

        const [[params]] = update.mock.calls;
        expect(params).toMatchObject({
            where: { id: 'usr_2' },
            data: { role: UserRole.ADMIN },
        });
    });

    it('hashes a new password instead of handing it to Prisma', async () => {
        const update = capturing();
        await (
            await serviceWith({ update })
        ).update(MEMBER, MEMBER.id, { password: 'new-password' });

        const [[{ data }]] = update.mock.calls;
        expect(data).not.toHaveProperty('password');
        await expect(
            PasswordUtil.compare('new-password', data.passwordHash ?? ''),
        ).resolves.toBe(true);
    });

    it('answers 404 for a user that does not exist', async () => {
        const service = await serviceWith({
            update: jest.fn().mockRejectedValue(prismaFailure(RECORD_NOT_FOUND)),
        });

        await expect(
            service.update(ADMIN, 'usr_2', { bio: 'Analyst' }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('answers 409 when the new email is taken', async () => {
        const service = await serviceWith({
            update: jest.fn().mockRejectedValue(prismaFailure(UNIQUE_VIOLATION)),
        });

        await expect(
            service.update(MEMBER, MEMBER.id, { email: 'taken@example.com' }),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});

describe('UsersService.remove', () => {
    it('answers 404 for a user that does not exist', async () => {
        const service = await serviceWith({
            delete: jest.fn().mockRejectedValue(prismaFailure(RECORD_NOT_FOUND)),
        });

        await expect(service.remove('usr_2')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
