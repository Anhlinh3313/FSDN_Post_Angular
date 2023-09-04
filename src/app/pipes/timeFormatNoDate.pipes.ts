import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";
import { environment } from '../../environments/environment';

@Pipe({
  name: 'timeFormatNoDate'
})
export class TimeFormatNoDatePipes implements PipeTransform {

  transform(value: any): any {
    if (value) {
      let date = moment(value).format(environment.formatTime)
      return date;
    }
    return null;
  }

}
