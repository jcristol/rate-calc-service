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
    expect(JSON.stringify(groupedByMonday)).toBe(
      JSON.stringify(sampleGroupedByWeekMondayStart)
    );
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
    expect(JSON.stringify(groupedByTuesday)).toBe(
      JSON.stringify(sampleGroupedByWeekTuesdayStart)
    );
  });
});

describe('summarizeWorkWeek', () => {
  it('should calculate the correct amounts for the work week with no overtime', () => {
    const sampleWeek = sampleGroupedByWeekMondayStart[0];
    // baseline wage
    const { workWeek: workWeek1, summary: summary1 } = summarizeWorkWeek(
      sampleWeek,
      45
    );
    expect(workWeek1).toBe('2021-05-03');
    expect(summary1.regularHours).toBe(28);
    expect(summary1.overtimeHours).toBe(0);
    expect(summary1.regularHoursGrossPay).toBe(1260);
    expect(summary1.overtimeHoursGrossPay).toBe(0);
    expect(summary1.totalGrossPay).toBe(1260);
    // lower wage
    const { workWeek: workWeek2, summary: summary2 } = summarizeWorkWeek(
      sampleWeek,
      20
    );
    expect(workWeek2).toBe('2021-05-03');
    expect(summary2.regularHours).toBe(28);
    expect(summary2.overtimeHours).toBe(0);
    expect(summary2.regularHoursGrossPay).toBe(560);
    expect(summary2.overtimeHoursGrossPay).toBe(0);
    expect(summary2.totalGrossPay).toBe(560);
    // mid wage different overtime rate
    const { workWeek: workWeek3, summary: summary3 } = summarizeWorkWeek(
      sampleWeek,
      30,
      1.75
    );
    expect(workWeek3).toBe('2021-05-03');
    expect(summary3.regularHours).toBe(28);
    expect(summary3.overtimeHours).toBe(0);
    expect(summary3.regularHoursGrossPay).toBe(840);
    expect(summary3.overtimeHoursGrossPay).toBe(0);
    expect(summary3.totalGrossPay).toBe(840);
  });
  it('should calculate the correct amounts for the work week with overtime', () => {
    const sampleWeek = sampleGroupedByWeekMondayStart[1];
    // baseline wage
    const { workWeek: workWeek1, summary: summary1 } = summarizeWorkWeek(
      sampleWeek,
      45
    );
    expect(workWeek1).toBe('2021-05-10');
    expect(summary1.regularHours).toBe(40);
    expect(summary1.overtimeHours).toBe(8);
    expect(summary1.regularHoursGrossPay).toBe(1800);
    expect(summary1.overtimeHoursGrossPay).toBe(540);
    expect(summary1.totalGrossPay).toBe(2340);
    // lower wage
    const { workWeek: workWeek2, summary: summary2 } = summarizeWorkWeek(
      sampleWeek,
      20
    );
    expect(workWeek2).toBe('2021-05-10');
    expect(summary2.regularHours).toBe(40);
    expect(summary2.overtimeHours).toBe(8);
    expect(summary2.regularHoursGrossPay).toBe(800);
    expect(summary2.overtimeHoursGrossPay).toBe(240);
    expect(summary2.totalGrossPay).toBe(1040);
    // mid wage different overtime rate
    const { workWeek: workWeek3, summary: summary3 } = summarizeWorkWeek(
      sampleWeek,
      30,
      1.75
    );
    expect(workWeek3).toBe('2021-05-10');
    expect(summary3.regularHours).toBe(40);
    expect(summary3.overtimeHours).toBe(8);
    expect(summary3.regularHoursGrossPay).toBe(1200);
    expect(summary3.overtimeHoursGrossPay).toBe(420);
    expect(summary3.totalGrossPay).toBe(1620);
  });
});

describe('request handler', () => {
  it('should throw a error if the request body doesnt match the schema', () => {}),
    it('should return the correct json repsonse', () => {});
});
