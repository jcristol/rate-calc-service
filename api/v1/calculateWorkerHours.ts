import { VercelRequest, VercelResponse } from '@vercel/node';
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  useDefaults: true
});

interface IWorkerTimeSheet {
  workerHours: IWorkRecord[];
  configuration: {
    workWeekStart: string;
    workerHourlyBaseRate: number;
  };
}

interface IWorkRecord {
  date: string;
  hours: string;
}

interface IWorkWeekSummary {
  regularHours: number;
  overtimeHours: number;
  regularHoursGrossPay: number;
  overtimeHoursGrossPay: number;
  totalGrossPay: number;
}

const IWorkerTimeSheetSchema = {
  definitions: {
    IWorkRecord: {
      properties: {
        date: {
          type: 'string'
        },
        hours: {
          type: 'string'
        }
      },
      required: ['date', 'hours'],
      type: 'object'
    }
  },
  properties: {
    configuration: {
      properties: {
        workWeekStart: {
          type: 'string'
        },
        workerHourlyBaseRate: {
          type: 'number'
        }
      },
      required: ['workWeekStart', 'workerHourlyBaseRate'],
      type: 'object'
    },
    workerHours: {
      items: {
        $ref: '#/definitions/IWorkRecord'
      },
      type: 'array'
    }
  },
  required: ['configuration', 'workerHours'],
  type: 'object'
};

const isIWorkerTimeSheet = ajv.compile(IWorkerTimeSheetSchema);
export function validate(value: unknown): IWorkerTimeSheet {
  if (!isIWorkerTimeSheet(value)) {
    throw new Error(
      `Failed to validate IWorkerTimeSheet: ${JSON.stringify(
        isIWorkerTimeSheet.errors
      )}`
    );
  }
  return value as IWorkerTimeSheet;
}

const getDayOfTheWeek = (date: string) =>
  new Date(`${date} 0:0:0`).toLocaleString('en-us', { weekday: 'long' });

export const getDateOfPreviousDay = (date: string): string => {
  const currentDate = new Date(`${date} 0:0:0`);
  const previousDate = new Date(currentDate);
  previousDate.setDate(currentDate.getDate() - 1);
  const day = previousDate.toLocaleString('en-us', { day: '2-digit' });
  const month = previousDate.toLocaleString('en-us', { month: '2-digit' });
  const year = previousDate.toLocaleString('en-us', { year: 'numeric' });
  return `${year}-${month}-${day}`;
};

export function groupWorkByWeek(
  workerTimeSheet: IWorkerTimeSheet
): [[IWorkRecord]] {
  const {
    workerHours,
    configuration: { workWeekStart }
  } = workerTimeSheet;
  // make a copy of workerHours passed in to prevent side effects
  const workerHoursCopy = Array.from(workerHours);
  const firstRecord = workerHoursCopy.shift();
  if (typeof firstRecord === 'undefined') {
    throw new Error('The first record of the timesheet was undefined.');
  }
  return workerHoursCopy.reduce(
    (weeks, record) => {
      const dayOfTheWeek = getDayOfTheWeek(record.date);
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

export function getStartOfWorkWeekDate(
  date: string,
  workWeekStart: string
): string {
  const dayOfTheWeek = getDayOfTheWeek(date);
  if (dayOfTheWeek === workWeekStart) {
    return date;
  }
  const previousDaysDate = getDateOfPreviousDay(date);
  return getStartOfWorkWeekDate(previousDaysDate, workWeekStart);
}

export function summarizeWorkWeek(
  week: IWorkRecord[],
  hourlyRate: number,
  workWeekStart: string,
  overtimeRate = 1.5
): { workWeek: string; summary: IWorkWeekSummary } {
  const [firstDay] = week;
  const firstDayOfWorkWeek = getStartOfWorkWeekDate(
    firstDay.date,
    workWeekStart
  );
  const totalHoursWorked = week
    .map((day) => parseInt(day.hours))
    .reduce((acc, hours) => acc + hours, 0);
  const regularHours = Math.min(totalHoursWorked, 40);
  const overtimeHours = Math.max(totalHoursWorked - 40, 0);
  const regularHoursGrossPay = regularHours * hourlyRate;
  const overtimeHoursGrossPay = overtimeHours * hourlyRate * overtimeRate;
  return {
    workWeek: firstDayOfWorkWeek,
    summary: {
      regularHours,
      overtimeHours,
      regularHoursGrossPay,
      overtimeHoursGrossPay,
      totalGrossPay: regularHoursGrossPay + overtimeHoursGrossPay
    }
  };
}

export default (req: VercelRequest, res: VercelResponse): void => {
  const workerTimeSheet = validate(req.body);
  const workByWeek = groupWorkByWeek(workerTimeSheet);
  const response = workByWeek.map((week) =>
    summarizeWorkWeek(
      week,
      workerTimeSheet.configuration.workerHourlyBaseRate,
      workerTimeSheet.configuration.workWeekStart
    )
  );
  res.json(response);
};
