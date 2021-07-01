import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  useDefaults: true
});

export interface IWorkerTimeSheet {
  workerHours: IWorkRecord[];
  configuration: {
    workWeekStart: string;
    workerHourlyBaseRate: number;
  };
}

export interface IWorkRecord {
  date: string;
  hours: string;
}

export interface IWorkWeekSummary {
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
  if (isIWorkerTimeSheet(value)) {
    return value as IWorkerTimeSheet;
  } else {
    throw new Error(
      `Failed to validate IWorkerTimeSheet: ${isIWorkerTimeSheet.errors}`
    );
  }
}
