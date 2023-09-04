import { GeneralModel } from "./general.model";

export class ServiceDVGT extends GeneralModel {
    code: string;
    name: string;
    concurrencyStamp: string;
    isEnabled: boolean = true;
    id: number;
    vseOracleCode: string;
    price:number;
    isPublish: boolean;
}