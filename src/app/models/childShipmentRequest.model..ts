import { Shipment } from "./shipment.model";

export class ChildShipmentRequest extends Shipment {
    serviceName?: string;
    serviceDVGTNames?: string;
}
