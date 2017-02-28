import { Pipe, PipeTransform } from '@angular/core';

const courseCars = [
  '0',
  '00',
  '000',
  'sweep1',
  'sweep2',
  'sweep3',
  'sweep4',
  'sweep5'
];

@Pipe({
  name: 'carFilter',
  pure: false
})
export class CarFilterPipe implements PipeTransform {

  transform(value: any, args?: string): any {
    return value.filter(item => {
      if (args.toLowerCase() === 'coursecars') {
        return courseCars.indexOf(item.carNumber.toLowerCase()) !== -1;
      }
      if (args.length > 0) return item.carNumber.toLowerCase() === args.toLowerCase();
      return item.carNumber !== '';
    });
  }
}
