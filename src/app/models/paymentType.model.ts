import { GeneralModel } from "./general.model";

export class PaymentType extends GeneralModel {
    name: string;
    vseOracleCode: string;
    vseOracleTRA_NGAY: boolean;
}