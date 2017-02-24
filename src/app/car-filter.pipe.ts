import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'carFilter',
  pure: false
})
export class CarFilterPipe implements PipeTransform {

  transform(value: any, args?: string): any {
    return value.filter(item => {
      if (args.length > 0) return item.carNumber.toLowerCase() === args.toLowerCase();
      return true;
    });
  }
}
