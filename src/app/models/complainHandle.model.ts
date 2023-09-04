import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";
import { Customer } from "./customer.model";
import { ComplainStatus } from "./complainStatus.model";

export class ComplainHandle extends GeneralModel {
    complainId: number;
    complainStatus: ComplainStatus;
    complainStatusId: number;
    handleContent: string;
    handleEmp: Customer;
    handleEmpId: number;
    handleHub: Hub;
    handleHubId: number;
    handleImagePath: string;
    createdWhen: Date;
    imageBase64: string;
}