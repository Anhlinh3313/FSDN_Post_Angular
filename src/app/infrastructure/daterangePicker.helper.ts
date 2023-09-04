import * as moment from "moment";
import { environment } from "../../environments/environment";

export class DaterangePickerHelper {
    static eventLog: string = "";
    static mainInput = {
        start: moment().subtract(0, "day"),
        end: moment()
    };

    static calendarEventsHandler(e: any) {
        this.eventLog += "\nEvent Fired: " + e.event.type;
    }

    static getSettings(daterangepickerOptions: any): any {
        daterangepickerOptions.settings = {
            locale: { format: environment.formatDate },
            alwaysShowCalendars: false,
            ranges: {
                "Hôm nay": [moment().subtract(0, "day"), moment()],
                "1 tuần": [moment().subtract(7, "day"), moment()],
                "1 tháng trước": [moment().subtract(1, "month"), moment()],
                "3 tháng trước": [moment().subtract(4, "month"), moment()],
                "6 tháng trước": [moment().subtract(6, "month"), moment()],
                "12 tháng trước": [moment().subtract(12, "month"), moment()],
                "2 năm trước": [moment().subtract(24, "month"), moment()]
            }
        };
        return daterangepickerOptions;
    }

    static getOptionSingleDatePickerNoTime(daterangepickerOptions: any): any {
        daterangepickerOptions =  {
            singleDatePicker: true,
            timePicker: false,
            showDropdowns: true,
            opens: "left",
            startDate: new Date()
        };
        return daterangepickerOptions;
    }
}