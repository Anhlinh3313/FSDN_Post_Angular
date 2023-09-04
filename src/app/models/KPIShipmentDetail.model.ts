import { GeneralModel } from "./general.model";

export class KPIShipmentDetailModel extends GeneralModel {
    districtId: any;
    wardId: any;
    vehicle: any;
    targetDeliveryTime: number;
    kpiShipmentId: number;
}