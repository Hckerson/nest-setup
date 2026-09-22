export enum Period {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}

export const SERIES_LENGTH: Record<Period, number> = {
    [Period.DAY]: 7,
    [Period.MONTH]: 12,
    [Period.YEAR]: 5,
};
