import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './dto';
import { HealthStatus } from '@common/enums/health';

@Injectable()
export class HealthService {
    check(): HealthResponseDto {
        return { status: HealthStatus.OK };
    }
}
