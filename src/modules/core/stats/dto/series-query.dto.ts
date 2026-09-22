import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Period } from '@common/enums/period';

export class SeriesQueryDto {
    @ApiProperty({ enum: Period })
    @IsEnum(Period)
    period: Period;
}
