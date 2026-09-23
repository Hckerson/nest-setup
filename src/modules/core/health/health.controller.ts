import { Controller, Get } from '@nestjs/common';
import { HealthResponseDto } from './dto';
import { HealthService } from './health.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    @ApiOperation({ summary: 'Report that the API is up' })
    @ApiEnvelope(HealthResponseDto)
    check() {
        return this.healthService.check();
    }
}
