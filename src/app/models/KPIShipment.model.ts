import { GeneralModel } from "./general.model";

export class KPIShipmentModel extends GeneralModel {
    isPublic: boolean = false;
    priority: number;
    serviceId: number;
    fromDate: any;
    toDate: any;
    service: any;
}