import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";

export class Package extends GeneralModel {
    code: string;
    content: string;
    weight: number;
    calWeight: number;
    length: number;
    width: number;
    height: number;
    isOpen: boolean;
    statusId:number;
    shipmentIds: number[];
    sealNumber: string;
    createdHubId?: number;
    toHubId?: number;
    toProvinceId?: number;
    createdHub?: Hub;
    toHub?: Hub;
    openhub?: Hub;
    totalCount?: number;
    statusName?: string;
    createdHubName?: string;
    createdUserName?: string;
    toHubName?: string;
    totalShipment?: number;
}