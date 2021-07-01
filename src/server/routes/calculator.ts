import { Router } from 'express';

interface IWorkerTimeSheet {
  workerHours: IWorkRecord[];
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
  if (typeof rawData.workWeekStart !== 'string') {
    throw new Error('workWeekStart was not a string');
  }
  if (typeof rawData.workerHourlyBaseRate !== 'string') {
    throw new Error('workWeekStart was not a string');
  }
  if (!Array.isArray(rawData.workerHours)) {
    throw new Error('workerHours is not an array');
  }
  const config = {
    workWeekStart: rawData.workWeekStart,
    workerHourlyBaseRate: parseInt(rawData.workerHourlyBaseRate)
  };
  const workerHours = rawData.workerHours.map((elem) => {
    if (typeof elem.date !== 'string') {
      throw new Error('workerHours.date was not a string');
    }
    if (typeof elem.hours !== 'string') {
      throw new Error('workerHours.hours was not a string');
    }
    return { date: elem.date, hours: parseInt(elem.hours) };
  });
  return {
    config,
    workerHours
  };
}

function groupWorkByWeek(workerTimeSheet: IWorkerTimeSheet): [[IWorkRecord]] {
  const {
    workerHours,
    config: { workWeekStart }
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
    const workerHourlyBaseRate = workerTimeSheet.config.workerHourlyBaseRate;
    return {
      workWeek: firstDay.date,
      summary: summarizeWorkWeek(week, workerHourlyBaseRate)
    };
  });
  res.json(response);
});
