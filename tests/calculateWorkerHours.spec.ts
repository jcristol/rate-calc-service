import {
  getDateOfPreviousDay,
  getStartOfWorkWeekDate,
  groupWorkByWeek,
  summarizeWorkWeek
} from '../api/v1/calculateWorkerHours';
import calculateWorkerHours from '../api/v1/calculateWorkerHours';
import {
  sampleGroupedByWeekMondayStart,
  sampleGroupedByWeekTuesdayStart,
  sampleWorkerHours
} from './fixtures/workerHours';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const parseJsonFile = (path: string) =>
  JSON.parse(
    readFileSync(resolve(__dirname, path), {
      encoding: 'ascii'
    })
  );

const invalidRequestBody = parseJsonFile('./fixtures/invalidRequestBody.json');
const validRequestBody = parseJsonFile('./fixtures/validRequestBody.json');
const higherDayRateRequestBody = parseJsonFile(
  './fixtures/higherDayRateRequest.json'
);

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
    expect(groupedByMonday).toMatchObject(sampleGroupedByWeekMondayStart);
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
    expect(groupedByTuesday).toMatchObject(sampleGroupedByWeekTuesdayStart);
  });
});

describe('getPreviousDay', () => {
  it('should return the previous day given a date', () => {
    expect(getDateOfPreviousDay('2021-05-03')).toBe('2021-05-02');
    expect(getDateOfPreviousDay('2021-05-01')).toBe('2021-04-30');
    expect(getDateOfPreviousDay('2021-01-01')).toBe('2020-12-31');
  });
});

describe('getStartOfWorkWeekDate', () => {
  it('should return the date of the first day in the work week', () => {
    expect(getStartOfWorkWeekDate('2021-05-03', 'Monday')).toBe('2021-05-03');
    expect(getStartOfWorkWeekDate('2021-05-03', 'Tuesday')).toBe('2021-04-27');
  });
});

describe('summarizeWorkWeek', () => {
  it('should calculate the correct amounts for the work week with no overtime', () => {
    const sampleWeek = sampleGroupedByWeekMondayStart[0];
    // baseline wage
    const { workWeek: workWeek1, summary: summary1 } = summarizeWorkWeek(
      sampleWeek,
      45,
      'Monday'
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
      20,
      'Monday'
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
      'Monday',
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
      45,
      'Monday'
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
      20,
      'Monday'
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
      'Monday',
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
  it('should throw a error if the request body doesnt match the schema', () => {
    const json = jest.fn();
    const req = { body: invalidRequestBody } as VercelRequest;
    const resp = { json } as unknown as VercelResponse;
    expect(() => calculateWorkerHours(req, resp)).toThrowError(
      /.*Failed to validate IWorkerTimeSheet:.*/
    );
  });
  it('should return the correct repsonse for a the sample request', () => {
    const json = jest.fn();
    const req = { body: validRequestBody } as VercelRequest;
    const resp = { json } as unknown as VercelResponse;
    calculateWorkerHours(req, resp);
    const responseObject = json.mock.calls[0][0];
    expect(responseObject).toMatchSnapshot();
  });
  it('should return the correct response for a request with a different base rate and different start date', () => {
    const json = jest.fn();
    const req = { body: higherDayRateRequestBody } as VercelRequest;
    const resp = { json } as unknown as VercelResponse;
    calculateWorkerHours(req, resp);
    const responseObject = json.mock.calls[0][0];
    expect(responseObject).toMatchSnapshot();
  });
});
