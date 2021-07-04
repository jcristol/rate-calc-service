import { groupWorkByWeek } from '../api/v1/calculateWorkerHours';
import {
  sampleGroupedByWeekMondayStart,
  sampleGroupedByWeekTuesdayStart,
  sampleWorkerHours
} from './fixtures/workerHours';

describe('groupWorkByWeek', () => {
  it('throw an Error when there isnt work in the time sheet', () => {
    const timeSheet = {
      configuration: {
        workWeekStart: 'Monday',
        workerHourlyBaseRate: 45
      },
      workerHours: []
    };
    expect(() => groupWorkByWeek(timeSheet)).toThrow(Error);
  });
  it.only('should group data by week with the start of each week as Monday', () => {
    const timeSheet = {
      configuration: {
        workWeekStart: 'Monday',
        workerHourlyBaseRate: 45
      },
      workerHours: sampleWorkerHours
    };
    const groupedByMonday = groupWorkByWeek(timeSheet);
    groupedByMonday.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        expect(day.date).toBe(
          sampleGroupedByWeekMondayStart[weekIndex][dayIndex].date
        );
        expect(day.hours).toBe(
          sampleGroupedByWeekMondayStart[weekIndex][dayIndex].hours
        );
      });
    });
  });
  it('group week data with Wednesday as the start date', () => {
    const timeSheet = {
      configuration: {
        workWeekStart: 'Tuesday',
        workerHourlyBaseRate: 45
      },
      workerHours: sampleWorkerHours
    };
    const groupedByTuesday = groupWorkByWeek(timeSheet);
    groupedByTuesday.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        expect(day.date).toBe(
          sampleGroupedByWeekTuesdayStart[weekIndex][dayIndex].date
        );
        expect(day.hours).toBe(
          sampleGroupedByWeekTuesdayStart[weekIndex][dayIndex].hours
        );
      });
    });
  });
});

describe('hello world', () => {
  return;
});
