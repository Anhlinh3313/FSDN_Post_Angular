import { Shipment } from "../shipment.model";

export interface ChildRequestShipmentTracking {
  totalBox?: number;
  weight?: number;
  calWeight?: number;
  totalChildShipment?: number;
  note?: string;
  cusDepartmentId?: number;
  cusDepartmentName?: string;
  shipmentNumber?: string;
  listChildShipmentNumber?: string;
  shipments?: Shipment[];
  classChildShipment?: string;
}
