import { GeneralModel } from "./general.model";
import { Customer } from "./customer.model";

export class CustomerPriceService extends GeneralModel {
    customerId: number;
    priceServiceId: number;
    vatPercent: number;
    fuelPercent: number;
    dim: number;
    remoteAreasPricePercent: number;
    customer: Customer
}