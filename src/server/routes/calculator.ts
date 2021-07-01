import { Router } from 'express';
import {
  IWorkerTimeSheet,
  IWorkRecord,
  IWorkWeekSummary,
  validate
} from './types';

function groupWorkByWeek(workerTimeSheet: IWorkerTimeSheet): [[IWorkRecord]] {
  const {
    workerHours,
    configuration: { workWeekStart }
  } = workerTimeSheet;
  // record from the front of the list
  const firstRecord = workerHours.shift();
  if (typeof firstRecord === 'undefined') {
    throw new Error(
      "The first record of the timesheet was undefined. This means there weren't records in the timesheet."
    );
  }
  return workerHours.reduce(
    (weeks, record) => {
      const dayOfTheWeek = new Date(`${record.date} 0:0:0`).toLocaleString(
        'en-us',
        {
          weekday: 'long'
        }
      );
      if (dayOfTheWeek !== workWeekStart) {
        const week = weeks[weeks.length - 1];
        week.push(record);
      }
      if (dayOfTheWeek === workWeekStart) {
        weeks.push([record]);
      }
      return weeks;
    },
    [[firstRecord]]
  );
}

function summarizeWorkWeek(
  week: IWorkRecord[],
  hourlyRate: number,
  overtimeRate = 1.5
): { workWeek: string; summary: IWorkWeekSummary } {
  const [firstDay] = week;
  const totalHoursWorked = week
    .map((day) => parseInt(day.hours))
    .reduce((acc, hours) => acc + hours, 0);
  const regularHours = Math.min(totalHoursWorked, 40);
  const overtimeHours = Math.max(totalHoursWorked - 40, 0);
  const regularHoursGrossPay = regularHours * hourlyRate;
  const overtimeHoursGrossPay = overtimeHours * hourlyRate * overtimeRate;
  return {
    workWeek: firstDay.date,
    summary: {
      regularHours,
      overtimeHours,
      regularHoursGrossPay,
      overtimeHoursGrossPay,
      totalGrossPay: regularHoursGrossPay + overtimeHoursGrossPay
    }
  };
}

export const calculatorRouter = Router();
calculatorRouter.post('/', (req, res) => {
  const workerTimeSheet = validate(req.body);
  const workByWeek = groupWorkByWeek(workerTimeSheet);
  const hourlyRate = workerTimeSheet.configuration.workerHourlyBaseRate;
  const response = workByWeek.map((week) =>
    summarizeWorkWeek(week, hourlyRate)
  );
  res.json(response);
});
