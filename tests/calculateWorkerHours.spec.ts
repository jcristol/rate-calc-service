import {
  groupWorkByWeek,
  summarizeWorkWeek
} from '../api/v1/calculateWorkerHours';
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
  it('should group data by week with the start of each week as Monday', () => {
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
  it('group week data with Tuesday as the start date', () => {
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

describe('summarizeWorkWeek', () => {
  it('should calculate the correct amounts for the work done in a week with no overtime', () => {
    const sampleWeek = sampleGroupedByWeekMondayStart[0];
    const {
      workWeek,
      summary: {
        regularHours,
        overtimeHours,
        regularHoursGrossPay,
        overtimeHoursGrossPay,
        totalGrossPay
      }
    } = summarizeWorkWeek(sampleWeek, 45);
    expect(workWeek).toBe('2021-05-03');
    expect(regularHours).toBe(28);
    expect(overtimeHours).toBe(0);
    expect(regularHoursGrossPay).toBe(1260);
    expect(overtimeHoursGrossPay).toBe(0);
    expect(totalGrossPay).toBe(1260);
  });
});
