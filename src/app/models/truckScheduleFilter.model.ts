import { GeneralModel } from "./general.model";
import { Country } from "./country.model";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { TruckScheduleStatus } from "./truckScheduleStatus.model";
import { Truck } from "./truck.model";


export class TruckScheduleFilter {
    fromHubId: number;
    toHubId: number;
    truckScheduleStatusId: number;
    truckId: number;
    searchText: string;
    truckNumber: string;
    fromDate: any;
    toDate: any;
    cols: string;
    pageSize: number;
    pageNumber: number;

}