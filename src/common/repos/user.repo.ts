import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class UserRepo {
    constructor(private prisma: PrismaService) {}

    async findUnique<T extends Prisma.UserFindUniqueArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>,
    ) {
        try {
            return await this.prisma.user.findUnique(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find unique user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findFirst<T extends Prisma.UserFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>,
    ) {
        try {
            return await this.prisma.user.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.UserFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>,
    ) {
        try {
            return await this.prisma.user.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async create<T extends Prisma.UserCreateArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserCreateArgs>,
    ) {
        try {
            return await this.prisma.user.create(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async createMany(
        params: Prisma.UserCreateManyArgs,
    ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.createMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async update<T extends Prisma.UserUpdateArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserUpdateArgs>,
    ) {
        try {
            return await this.prisma.user.update(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async updateMany(
        params: Prisma.UserUpdateManyArgs,
    ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.updateMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async delete<T extends Prisma.UserDeleteArgs>(
        params: Prisma.SelectSubset<T, Prisma.UserDeleteArgs>,
    ) {
        try {
            return await this.prisma.user.delete(params);
        } catch (error) {
            throw new RepoError(
                'Failed to delete user',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async deleteMany(
        params: Prisma.UserDeleteManyArgs,
    ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.user.deleteMany(params);
        } catch (error) {
            throw new RepoError(
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
            throw new RepoError(
                'Failed to count users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async groupBy(
        field: Prisma.UserScalarFieldEnum,
        where: Prisma.UserWhereInput,
    ) {
        try {
            return await this.prisma.user.groupBy({
                by: [field],
                where,
                _count: { _all: true },
            });
        } catch (error) {
            throw new RepoError(
                'Failed to group users',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
