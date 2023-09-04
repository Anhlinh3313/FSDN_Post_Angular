import { GeneralModel } from "./general.model";
import { Province } from "./province.model";
import { District } from "./district.model";
import { Ward } from "./ward.model";

export class Customer extends GeneralModel {
    isPublic:boolean;
    nameEn:string;
    address:string;
    addressNote:string;
    businessLicenseNumber:string;
    email:string;
    fax:string;
    legalRepresentative:string;
    notes:string;
    parentCustomerId:number;
    phoneNumber:string;
    salesOrganizationId:number;
    salesUserId:number;
    customerStatusId:number;
    stopServiceAlertDuration:number;
    supportOrganizationId:number;
    supportUserId:number;
    taxCode:string;
    tradingName:string;
    customerTypeId:number;
    provinceId:number;
    districtId:number;
    wardId:number;
    website:string;
    workTimeId:number;
    priceListId: number;
    isShowPrice: boolean;
    lat:number;
    lng:number;
    companyFrom: string;
    companyTo: string;
    discount: number;

    province: Province;
    district: District;
    ward: Ward;
    code: string;
    userName: string;
    companyName: string;
    paymentTypeId: number;
}