import { VercelRequest, VercelResponse } from '@vercel/node';
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  useDefaults: true,
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
          type: 'string',
        },
        hours: {
          type: 'string',
        },
      },
      required: ['date', 'hours'],
      type: 'object',
    },
  },
  properties: {
    configuration: {
      properties: {
        workWeekStart: {
          type: 'string',
        },
        workerHourlyBaseRate: {
          type: 'number',
        },
      },
      required: ['workWeekStart', 'workerHourlyBaseRate'],
      type: 'object',
    },
    workerHours: {
      items: {
        $ref: '#/definitions/IWorkRecord',
      },
      type: 'array',
    },
  },
  required: ['configuration', 'workerHours'],
  type: 'object',
};

const isIWorkerTimeSheet = ajv.compile(IWorkerTimeSheetSchema);
export function validate(value: unknown): IWorkerTimeSheet {
  if (isIWorkerTimeSheet(value)) {
    return value as IWorkerTimeSheet;
  } else {
    throw new Error(
      `Failed to validate IWorkerTimeSheet: ${JSON.stringify(
        isIWorkerTimeSheet.errors
      )}`
    );
  }
}

export function groupWorkByWeek(
  workerTimeSheet: IWorkerTimeSheet
): [[IWorkRecord]] {
  const {
    workerHours,
    configuration: { workWeekStart },
  } = workerTimeSheet;
  const firstRecord = workerHours.shift();
  if (typeof firstRecord === 'undefined') {
    throw new Error("The first record of the timesheet was undefined.");
  }
  return workerHours.reduce(
    (weeks, record) => {
      const dayOfTheWeek = new Date(`${record.date} 0:0:0`).toLocaleString(
        'en-us',
        {
          weekday: 'long',
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

export function summarizeWorkWeek(
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
      totalGrossPay: regularHoursGrossPay + overtimeHoursGrossPay,
    },
  };
}

export function calculateWorkersComp(workerTimeSheet: IWorkerTimeSheet): {
  workWeek: string;
  summary: IWorkWeekSummary;
}[] {
  const workByWeek = groupWorkByWeek(workerTimeSheet);
  return workByWeek.map((week) =>
    summarizeWorkWeek(week, workerTimeSheet.configuration.workerHourlyBaseRate)
  );
}

export default (req: VercelRequest, res: VercelResponse): void => {
  const workerTimeSheet = validate(req.body);
  const response = calculateWorkersComp(workerTimeSheet);
  res.json(response);
};
