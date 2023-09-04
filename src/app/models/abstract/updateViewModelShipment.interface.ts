import { Shipment } from "..";

export interface UpdateViewModelShipment extends Shipment {
    empId: number;
    appointmentTime: any;
    reasonId: number;
}