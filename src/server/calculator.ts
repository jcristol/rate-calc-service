import { Router } from 'express';

interface IWorkerTimeSheet {
  workRecords: [IWorkRecord];
  config: ICalculatorConfig;
}

interface ICalculatorConfig {
  workWeekStart: string;
  workerHourlyBaseRate: number;
}

interface IWorkRecord {
  date: string;
  hours: number;
}

interface IWorkWeekSummary {
  regularHours: number;
  overtimeHours: number;
  regularHoursGrossPay: number;
  overtimeHoursGrossPay: number;
  totalGrossPay: number;
}

function buildWorkerTimeSheet(
  rawData: Record<string, unknown>
): IWorkerTimeSheet {
  // maybe do some schema validation here
  const config = rawData['configuration'] as ICalculatorConfig;
  const workRecords = rawData['workHours'] as [IWorkRecord];
  return {
    config,
    workRecords
  };
}

function getWorkRecordsByWeek(
  workerTimeSheet: IWorkerTimeSheet
): [[IWorkRecord]] {
  const {
    workRecords,
    config: { workWeekStart }
  } = workerTimeSheet;
  const records = workRecords.reduce(
    (weeks, record) => {
      const dayOfTheWeek = new Date(record.date).toLocaleString('en-us', {
        weekday: 'long'
      });
      if (dayOfTheWeek !== workWeekStart) {
        const week = weeks[weeks.length - 1];
        week?.push(record);
      }
      if (dayOfTheWeek === workWeekStart) {
        weeks?.push([record]);
      }
      return weeks;
    },
    [[workRecords?.shift()]]
  );
}

function summarizeWorkWeek(week: [IWorkRecord]): IWorkWeekSummary {
  const totalHoursWorked = week.reduce((acc, day) => {
    return acc + day.hours;
  }, 0);
  const regularHours = Math.min(totalHoursWorked, 40);
  const overtimeHours = Math.max(totalHoursWorked - 40, 0);
  const regularHoursGrossPay = regularHours * 45;
  const overtimeHoursGrossPay = overtimeHours * 45 * 1.5;
  return {
    regularHours,
    overtimeHours,
    regularHoursGrossPay,
    overtimeHoursGrossPay,
    totalGrossPay: regularHoursGrossPay + overtimeHoursGrossPay
  };
}

export const calculatorRouter = Router();
calculatorRouter.get('/', (req, res) => {
  const workerTimeSheet = buildWorkerTimeSheet(req.body);
  const hoursWorkedByWeek = getWorkRecordsByWeek(workerTimeSheet);
  const response = hoursWorkedByWeek.map((week) => {
    const [firstDay] = week;
    return {
      workWeek: firstDay?.date,
      summary: summarizeWorkWeek(week)
    };
  });
});
