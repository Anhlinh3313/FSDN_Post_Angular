import { GeneralModel } from "./general.model";

export class Reason extends GeneralModel {
    pickFail: boolean;
    pickCancel: boolean;
    deliverFail: boolean;
    deliverCancel: boolean;
    returnFail: boolean;
    returnCancel: boolean;
    itemOrder: number;
    isDelay: boolean;
    isIncidents: boolean;
    roleId: number;
    isPublic: boolean;
    isAcceptReturn: boolean;
    isMustInput: boolean;
}