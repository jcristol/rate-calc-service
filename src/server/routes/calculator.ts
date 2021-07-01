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

function groupWorkByWeek(workerTimeSheet: IWorkerTimeSheet): [[IWorkRecord]] {
  const {
    workRecords,
    config: { workWeekStart }
  } = workerTimeSheet;
  // record from the front of the list
  const firstRecord = workRecords.shift();
  if (typeof firstRecord === 'undefined') {
    throw "The first record of the timesheet was undefined. Likely this means there weren't records in the timesheet.";
  }
  return workRecords.reduce(
    (weeks, record) => {
      const dayOfTheWeek = new Date(record.date).toLocaleString('en-us', {
        weekday: 'long'
      });
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
  week: [IWorkRecord],
  hourlyRate = 45,
  overtimeRate = 1.5
): IWorkWeekSummary {
  const totalHoursWorked = week.reduce((acc, day) => acc + day.hours, 0);
  const regularHours = Math.min(totalHoursWorked, 40);
  const overtimeHours = Math.max(totalHoursWorked - 40, 0);
  const regularHoursGrossPay = regularHours * hourlyRate;
  const overtimeHoursGrossPay = overtimeHours * hourlyRate * overtimeRate;
  return {
    regularHours,
    overtimeHours,
    regularHoursGrossPay,
    overtimeHoursGrossPay,
    totalGrossPay: regularHoursGrossPay + overtimeHoursGrossPay
  };
}

export const calculatorRouter = Router();
calculatorRouter.post('/', (req, res) => {
  const workerTimeSheet = buildWorkerTimeSheet(req.body);
  const workByWeek = groupWorkByWeek(workerTimeSheet);
  const response = workByWeek.map((week) => {
    const [firstDay] = week;
    return {
      workWeek: firstDay.date,
      summary: summarizeWorkWeek(week)
    };
  });
  res.json(response);
});
