import { StatsService } from './stats.service';
import { UserRole } from 'generated/prisma/enums';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@core/auth/guards/roles.guard';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { Roles } from '@core/auth/decorators/roles.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import {
    SeriesQueryDto,
    TotalQueryDto,
    PeriodSeriesResponseDto,
    PeriodTotalResponseDto,
} from './dto';

@ApiTags('stats')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('users/total')
    @ApiOperation({
        summary: 'Users created in one day, month or year (Admin only)',
    })
    @ApiEnvelope(PeriodTotalResponseDto)
    usersTotal(@Query() query: TotalQueryDto) {
        return this.statsService.usersTotal(query);
    }

    @Get('users/series')
    @ApiOperation({
        summary:
            'Users created per day, month or year up to the current one (Admin only)',
    })
    @ApiEnvelope(PeriodSeriesResponseDto)
    usersSeries(@Query() query: SeriesQueryDto) {
        return this.statsService.usersSeries(query);
    }
}
