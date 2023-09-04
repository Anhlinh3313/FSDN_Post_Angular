import { GeneralModel } from "./general.model";
import { District } from "./district.model";
import { Ward } from "./ward.model";
import { Province } from ".";

export class Hub extends GeneralModel {
    email:string;
    phoneNumber:string;
    address:string;
    addressPrint:string;
    fax:string;
    lat:number;
    lng:number;
    provinceId:number;
    districtId:number;
    wardId:number;
    centerHubId:number;
    poHubId:number;
    province: Province;
    district:District;
    ward:Ward;
    centerHub:Hub;
    poHub:Hub;
    name:string;
}