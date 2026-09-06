import { Injectable } from '@nestjs/common';
import { UserRepo } from '@common/repos/user.repo';
import { Prisma, User } from 'generated/prisma/client';
import { PasswordUtil } from '@core/auth/utils/password.util';
import { calendarParts } from '@lib/calendar';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
    constructor(private userRepo: UserRepo) {}

    async create(dto: CreateUserDto): Promise<User> {
        const { password, ...rest } = dto;
        const passwordHash = await PasswordUtil.hash(password);
        return this.userRepo.create({
            data: { ...rest, passwordHash, ...calendarParts(new Date()) },
        });
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.findMany({});
    }

    async findOne(id: string): Promise<User | null> {
        return this.userRepo.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findUnique({ where: { email } });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.userRepo.update({
            where: { id: String(id) },
            data,
        });
    }

    async remove(id: string): Promise<User> {
        return this.userRepo.delete({ where: { id: String(id) } });
    }
}
