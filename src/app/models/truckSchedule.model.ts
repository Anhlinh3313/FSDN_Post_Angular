import { GeneralModel } from "./general.model";
import { Country } from "./country.model";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { TruckScheduleStatus } from "./truckScheduleStatus.model";
import { Truck } from "./truck.model";
import { ListGoods } from "./listGoods.model";


export class TruckSchedule extends GeneralModel {
    fromHubId: number;
    toHubId: number;

    truckScheduleStatusId: number;
    truckId: number;

    sealNumber: string;

    startDatetime: any;
    startKM: number;

    totalBox: number;
    totalWeight: number;

    fromHub: Hub;
    toHub: Hub;
    truckScheduleStatus: TruckScheduleStatus;
    truck: Truck;
    riders: User[];
    riderIds: number[];

    listGood: ListGoods[];
}