import { Pipe, PipeTransform } from '@angular/core';

const courseCars = /#0|#00|#000|#combo[0-9]{0,3}|#sweep[0-9]{0,3}/i;

@Pipe({
  name: 'carFilter',
  pure: false
})
export class CarFilterPipe implements PipeTransform {

  transform(value: any, args?: string): any {
    return value.filter(item => {
      if (args.toLowerCase() === 'coursecars') {
        return item.carNumber.match(courseCars);
      }
      if (args.length > 0) return item.carNumber.toLowerCase() === args.toLowerCase();
      return item.carNumber !== '';
    });
  }
}
