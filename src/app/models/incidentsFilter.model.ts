import * as moment from "moment";

export class IncidentsFilter {
    empId: any = null; 
    shipmentNumber: any = "";
    fromDate: any = moment(new Date().setDate(new Date().getDate() - 7)).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    pageSize: any = 20;
    pageNum: any = 1;
    cols: any = "HandleByEmp,IncidentsByHub,IncidentsReason,IncidentsByEmp";
}
