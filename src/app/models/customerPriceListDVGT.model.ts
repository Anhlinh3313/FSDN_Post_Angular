import { GeneralModel } from "./general.model";
import { Customer } from "./customer.model";

export class CustomerPriceListDVGT extends GeneralModel {
    customerId: number;
    priceListDVGTId: number;
    customer: Customer
}