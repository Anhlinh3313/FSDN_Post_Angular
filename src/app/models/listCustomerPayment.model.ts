import { GeneralModel } from "./general.model";
import { ListCustomerPaymentType } from "./listCustomerPaymentType.model";
import { Hub } from "./hub.model";
import { Customer } from "./index";

export class ListCustomerPayment extends GeneralModel {
    customerId: number;
    hubCreatedId : number;
    totalShipment: number;
    grandTotal: number;
    adjustPrice: number;
    note: string;
    attachmentId: number;
    listCustomerPaymentTypeId: number;
    listCustomerPaymentType: ListCustomerPaymentType;
    hubCreated: Hub;
    customer: Customer;
}