import { GeneralModel } from "./general.model";
import { Country } from "./country.model";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { TruckScheduleStatus } from "./truckScheduleStatus.model";
import { Truck } from "./truck.model";


export class TruckScheduleDetail extends GeneralModel {
    truckScheduleId: number;
    sealNumber: string;
    note: string;

    hubId: number;
    truckScheduleStatusId: number;

    hub: Hub;
    truckScheduleStatus: TruckScheduleStatus
}