import { GeneralModel } from "./general.model";

export class GeneralInfoModel extends GeneralModel {
    companyName: string;
    logoUrl: string;
    hotLine: string;
    addressMain: string;
    website: string;
    fax: number;
    defaultWeight: number;
    policy: string;
}