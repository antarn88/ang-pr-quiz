import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sorter'
})
export class SorterPipe implements PipeTransform {

  transform(value: any[], column: string, order: string): any[] {
    return value.sort((a, b) => {
      if (typeof a[column] === 'number' && typeof b[column] === 'number') {
        if (order === 'ASC') {
          return a[column] - b[column];
        }
        return b[column] - a[column];
      }
      else {
        const a2 = String(a[column]).toLowerCase();
        const b2 = String(b[column]).toLowerCase();
        if (order === 'ASC') {
          return a2.localeCompare(b2);
        }
        return b2.localeCompare(a2);
      }
    });
  }

}
