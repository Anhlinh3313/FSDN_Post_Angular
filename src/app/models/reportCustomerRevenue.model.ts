import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ReportCustomerRevenue implements IBaseModel {
    id: number;
    code: string;
    name: string;
}