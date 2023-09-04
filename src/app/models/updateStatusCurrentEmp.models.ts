import { GeneralModel } from "./general.model";

export class UpdateStatusCurrentEmp extends GeneralModel {
    id: number;
    shipmentNumber: string;
    compensationValue: number;
    shipmentStatusId: number;
    note: string;
}