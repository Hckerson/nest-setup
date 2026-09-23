import { ApiProperty } from '@nestjs/swagger';
import { HealthStatus } from '@common/enums/health';

export class HealthResponseDto {
    @ApiProperty({ enum: HealthStatus })
    status: HealthStatus;
}
