import { GeneralModel } from "./general.model";

export class TransferReceive extends GeneralModel {
    content: string;
    weight: number;
    calWeight: number;
    length: number;
    width: number;
    height: number;
    isOpen: boolean;
    ShipmentIds: number[];
}