import { GeneralModel } from "./general.model";
import { Department } from "./department.model";
import { Hub } from "./hub.model";
import { Role } from "./role.model";

export class User extends GeneralModel {
    id:number;
    concurrencyStamp: string;
    isEnabled:boolean;
    roleId:number;
    departmentId:number;
    hubId:number;
    userName:string;
    passWord:string;
    code:string;
    email:string;
    phoneNumber:string;
    address:string;
    avatarBase64:string;
    fullName:string;
    identityCard:string;
    normalizedEmail:string;
    normalizedUserName:string;
    isGlobalAdministrator:boolean;
    isHidden:boolean;
    //
    currentLat: number;
    currentLng: number;
    lastUpdateLocationTime: Date;
    //custom
    typeMap: number;
    seriNumber: string;

    department:Department;
    hub:Hub;
    role:Role;
    roles: Role[];
    roleName: string;
    manageHubId: number;
}