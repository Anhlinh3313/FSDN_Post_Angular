import { GeneralModel } from "./general.model";

export class TransferReship extends GeneralModel {
    content: string;
    weight: number;
    calWeight: number;
    length: number;
    width: number;
    height: number;
    isOpen: boolean;
    ShipmentIds: number[];
}