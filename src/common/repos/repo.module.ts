import { UserRepo } from './user.repo';
import { Global, Module } from '@nestjs/common';

const repos = [UserRepo];

@Global()
@Module({
    providers: repos,
    exports: repos,
})
export class RepoModule {}
