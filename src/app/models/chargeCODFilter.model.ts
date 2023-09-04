import { GeneralModel } from "./general.model";
export class ChargedCODFilterModel extends GeneralModel  {
    shipmentId: number;
    shipmentNumber: string;
    oldCOD: number   ;
    newCOD: number;
    shipmentSupportNumber: string;
    note: string;
    shipmentSupportId: number;
    changeCODTypeId: number;
    changeCODTypeName: string;
    isAccept: boolean;
}