import * as moment from "moment";
import { ComplainStatus } from "./complainStatus.model";
import { ComplainType } from "./complainType.model";
import { GeneralModel } from "./general.model";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { Shipment } from "./shipment.model";

export class Complain extends GeneralModel {
    complainContent: string;
    complainImagePath: string;
    complainStatus: ComplainStatus
    complainStatusId: number;
    complainType: ComplainType;
    complainTypeId: number;
    customer: Customer;
    customerId: number;
    endDate: Date;
    forwardToEmp: User;
    forwardToEmpId: number;
    forwardToHub: Hub;
    forwardToHubId: number;
    handlingEmpId: number;
    handlingHub: Hub;
    handlingHubId: number;
    handlingUser: User;
    shipment: Shipment;
    shipmentId: number;
    createdWhen: Date;
}
