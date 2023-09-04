import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";

export class AreaGroup extends GeneralModel {
    hubId: number;
    hub: Hub;
    isAuto: boolean;
}