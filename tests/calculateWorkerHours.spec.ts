import { groupWorkByWeek } from '../api/v1/calculateWorkerHours';
// todo: tests
// const sampleWorkerHours = [
//   {
//     date: '2021-05-03',
//     hours: '0'
//   },
//   {
//     date: '2021-05-04',
//     hours: '0'
//   },
//   {
//     date: '2021-05-05',
//     hours: '8'
//   },
//   {
//     date: '2021-05-06',
//     hours: '8'
//   },
//   {
//     date: '2021-05-07',
//     hours: '8'
//   },
//   {
//     date: '2021-05-08',
//     hours: '4'
//   },
//   {
//     date: '2021-05-09',
//     hours: '0'
//   },
//   {
//     date: '2021-05-10',
//     hours: '10'
//   },
//   {
//     date: '2021-05-11',
//     hours: '10'
//   },
//   {
//     date: '2021-05-12',
//     hours: '8'
//   },
//   {
//     date: '2021-05-13',
//     hours: '8'
//   },
//   {
//     date: '2021-05-14',
//     hours: '8'
//   },
//   {
//     date: '2021-05-15',
//     hours: '4'
//   },
//   {
//     date: '2021-05-16',
//     hours: '0'
//   },
//   {
//     date: '2021-05-17',
//     hours: '8'
//   },
//   {
//     date: '2021-05-18',
//     hours: '8'
//   },
//   {
//     date: '2021-05-19',
//     hours: '8'
//   },
//   {
//     date: '2021-05-20',
//     hours: '8'
//   },
//   {
//     date: '2021-05-21',
//     hours: '10'
//   },
//   {
//     date: '2021-05-22',
//     hours: '0'
//   },
//   {
//     date: '2021-05-23',
//     hours: '0'
//   }
// ];

describe('groupWorkByWeek', () => {
  it('throw an Error when there are no workerHours', () => {
    const timeSheet = {
      configuration: {
        workWeekStart: 'Monday',
        workerHourlyBaseRate: 45,
      },
      workerHours: [],
    };
    expect(() => groupWorkByWeek(timeSheet)).toThrow(Error);
  });
  it('group week data with Monday as the start date', () => {
    // const timeSheet = {
    //   configuration: {
    //     workWeekStart: 'Monday',
    //     workerHourlyBaseRate: 45
    //   },
    //   workerHours: sampleWorkerHours
    // };
    // const
    // expect there to be three top level array with the proper number of entries
    // expect the data of the output arrary to be the proper shape
  });
  // it('group week data with Wednesday as the start date', () => {});
});
