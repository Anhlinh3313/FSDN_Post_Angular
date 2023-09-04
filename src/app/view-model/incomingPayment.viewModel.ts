import { GeneralInfoModel } from "../models/generalInfo.model";

export class IncomingPaymentViewModel {
    id: number;
    bankAccount: string;
    paymentDate: any;
    grandTotalReal:number;
    cashFlowCode: string;
}