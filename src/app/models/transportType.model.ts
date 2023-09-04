import { GeneralModel } from "./general.model";
import { TPLTransportType } from "./tplTransportType.model";

export class TransportType extends GeneralModel {
    isRequiredTPL: boolean;
    tplTransportTypes: TPLTransportType[];
    createdWhen: any;
    createdBy: number;
    modifiedWhen: any;
    modifiedBy: number;
    tplIds?: number[];
}