import { GeneralModel } from "./general.model";
import { Service } from "./service.model";
import { Area } from "./area.model";
import { Weight } from "./weight.model";
import { DeadlinePickupDelivery } from "./deadlinePickupDelivery.model";


export class DeadlinePickupDeliveryDetail extends GeneralModel {

    deadlinePickupDeliveryId: number;
    deadlinePickupDelivery: DeadlinePickupDelivery;
    serviceId: number;
    service: Service;
    areaId: number;
    area: Area;
    timePickup: number;
    timeDelivery: number;
}