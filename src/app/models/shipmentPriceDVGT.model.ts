import { Service } from "./service.model";

export class ShipmentPriceDVGT {    
    isEnabled: boolean = true;
    id: number;
    shipmentId: number;
    serviceId: number;
    price:number;
    isAgree: boolean;
    service: Service;
}