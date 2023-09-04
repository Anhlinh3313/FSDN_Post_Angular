import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";
import { User } from "./user.model";
import { IncidentsReason } from "./incidentsReason.model";

export class Incidents extends GeneralModel {
    createdByEmp: User;
    createdByEmpId: number;
    handleByEmp: User;
    handleByEmpId: number;
    handleContent: string;
    incidentsByEmp: User;
    incidentsByEmpId: number;
    incidentsByHub: Hub;
    incidentsByHubId: number;
    incidentsContent: string;
    incidentsReason: IncidentsReason;
    incidentsReasonId: 30
    isCompensation: any;
    isCompleted: any;
    ladingScheduleId: number;
    name: string;
    shipmentId: number;
    shipmentNumber: any;
    hanldeContent: any;
}