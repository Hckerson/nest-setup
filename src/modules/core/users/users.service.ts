import { Injectable } from '@nestjs/common';
import { UserRepo } from '@common/repos/user.repo';
import { Prisma, User } from 'generated/prisma/client';
import { PasswordUtil } from '@core/auth/utils/password.util';
import { calendarParts } from '@lib/calendar';
import { CreateUserDto, UserResponse, userSelect } from './dto';

@Injectable()
export class UsersService {
    constructor(private userRepo: UserRepo) {}

    async create(dto: CreateUserDto): Promise<UserResponse> {
        const { password, ...rest } = dto;
        const passwordHash = await PasswordUtil.hash(password);
        return this.userRepo.create({
            data: { ...rest, passwordHash, ...calendarParts(new Date()) },
            select: userSelect,
        });
    }

    async findAll(): Promise<UserResponse[]> {
        return this.userRepo.findMany({ select: userSelect });
    }

    async findOne(id: string): Promise<UserResponse | null> {
        return this.userRepo.findUnique({ where: { id }, select: userSelect });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findUnique({ where: { email } });
    }

    async update(
        id: string,
        data: Prisma.UserUpdateInput,
    ): Promise<UserResponse> {
        return this.userRepo.update({
            where: { id },
            data,
            select: userSelect,
        });
    }

    async remove(id: string): Promise<UserResponse> {
        return this.userRepo.delete({ where: { id }, select: userSelect });
    }
}
