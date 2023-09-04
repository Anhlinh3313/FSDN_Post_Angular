import { GeneralModel } from "./general.model";
import { Country } from "./country.model";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { ProvideCodeStatus } from "./provideCodeStatus.model";


export class ProvinceCode {
    preFix: string;
    count: number;
    length: number;
    numberStart: number;
    numberEnd: number;
    provideCodeStatusId: number;
    provideHubId: number;
    provideUserId : number;
    provideCustomerId : number;

    id: number;
    code: string;
    customer: Customer;
    hub: Hub;
    user: User;
    provideCodeStatus: ProvideCodeStatus;
}