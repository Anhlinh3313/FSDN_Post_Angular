import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";
import { AreaGroup } from "./index";

export class DeadlinePickupDelivery extends GeneralModel {
    timeStart: any;
    fromHudId: number;
    wardFromId: number;
    serviceId: number;
    districtToId: number;
    formatDatetime: Date;
    formatDateTT: Date;
    formatDateHH: Date;
    formatDay: number;
    formatTime: number;
    formatTimeSys: number;
    hubId: number;
    areaGroupId: number;
    
    hub: Hub;
    areaGroup: AreaGroup;
}