import * as moment from "moment";

export class ComplainFilter {
    fromDate: any = moment(new Date().setDate(new Date().getDate() - 7)).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    centerHubIds: number[] = [];
    customerIds: number[] = [];
    complainStatusIds: number[] = [];
    type: number;
    cols: string = "Customer,ComplainType,ComplainStatus,HandlingHub,HandlingUser,ForwardToHub,ForwardToEmp,Shipment,ComplainType.Role";
    pageSize: number = 20;
    pageNum: number = 1;
}
