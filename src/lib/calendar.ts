import { Day, Month } from 'generated/prisma/enums';

const DAYS = [
    Day.SUN,
    Day.MON,
    Day.TUE,
    Day.WED,
    Day.THU,
    Day.FRI,
    Day.SAT,
] as const;

const MONTHS = [
    Month.JAN,
    Month.FEB,
    Month.MAR,
    Month.APR,
    Month.MAY,
    Month.JUN,
    Month.JUL,
    Month.AUG,
    Month.SEP,
    Month.OCT,
    Month.NOV,
    Month.DEC,
] as const;

export interface CalendarParts {
    year: number;
    day: Day;
    month: Month;
}

export const calendarParts = (date: Date): CalendarParts => ({
    year: date.getFullYear(),
    day: DAYS[date.getDay()],
    month: MONTHS[date.getMonth()],
});
