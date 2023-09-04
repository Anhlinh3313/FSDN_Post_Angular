import { GeneralModel } from "./general.model";
import { Role } from "./role.model";

export class ComplainType extends GeneralModel {
    roleId: any;
    role: Role;
}