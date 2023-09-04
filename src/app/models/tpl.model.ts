import { GeneralModel } from "./general.model";

export class TPL extends GeneralModel {
     address : string;
     phone : string;
     email : string;
     isInternational : boolean;
     code : string;
     name : string;
     createdWhen: Date;
     createdBy: number;
     modifiedWhen: Date;
     modifiedBy: number;
     priceListId: number;
}