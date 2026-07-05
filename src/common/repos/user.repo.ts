import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepositoryError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class UserRepo {
    constructor(private prisma: PrismaService) {}

    async findUnique<T extends Prisma.UserFindUniqueArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>> {
        try {
            return (await this.prisma.user.findUnique(
                params,
            )) as Prisma.UserGetPayload<T>;
        } catch (error) {
            throw new RepositoryError(
                'Failed to find unique user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findFirst<T extends Prisma.UserFindFirstArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>> {
        try {
            return (await this.prisma.user.findFirst(
                params,
            )) as Prisma.UserGetPayload<T>;
        } catch (error) {
            throw new RepositoryError(
                'Failed to find first user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.UserFindManyArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>[]> {
        try {
            return (await this.prisma.user.findMany(
                params,
            )) as Prisma.UserGetPayload<T>[];
        } catch (error) {
            throw new RepositoryError(
                'Failed to find users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async create<T extends Prisma.UserCreateArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>> {
        try {
            return (await this.prisma.user.create(
                params,
            )) as Prisma.UserGetPayload<T>;
        } catch (error) {
            throw new RepositoryError(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async createMany(params: Prisma.UserCreateManyArgs): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.createMany(params);
        } catch (error) {
            throw new RepositoryError(
                'Failed to create users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async update<T extends Prisma.UserUpdateArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>> {
        try {
            return (await this.prisma.user.update(
                params,
            )) as Prisma.UserGetPayload<T>;
        } catch (error) {
            throw new RepositoryError(
                'Failed to update user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async updateMany(params: Prisma.UserUpdateManyArgs): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.updateMany(params);
        } catch (error) {
            throw new RepositoryError(
                'Failed to update users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async delete<T extends Prisma.UserDeleteArgs>(
        params: T,
    ): Promise<Prisma.UserGetPayload<T>> {
        try {
            return (await this.prisma.user.delete(
                params,
            )) as Prisma.UserGetPayload<T>;
        } catch (error) {
            throw new RepositoryError(
                'Failed to delete user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async deleteMany(params: Prisma.UserDeleteManyArgs): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.deleteMany(params);
        } catch (error) {
            throw new RepositoryError(
                'Failed to delete users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.UserCountArgs): Promise<number> {
        try {
            return await this.prisma.user.count(params);
        } catch (error) {
            throw new RepositoryError(
                'Failed to count users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async groupBy<T extends Prisma.UserGroupByArgs>(params: T): Promise<any> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return await this.prisma.user.groupBy(params as any);
        } catch (error) {
            throw new RepositoryError(
                'Failed to group users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
