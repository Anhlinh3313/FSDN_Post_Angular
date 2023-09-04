import * as moment from 'moment';

export class DashboardFilter {
    fromDate: any = moment(new Date().setDate(new Date().getDate() - 7)).hour(0).minute(0).second(1);
    toDate: any = moment(new Date()).hour(23).minute(59).second(0);
    hubId: any = null;
}