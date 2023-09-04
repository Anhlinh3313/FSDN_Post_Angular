import { GeneralModel } from "./general.model";
import { Hub } from "./hub.model";

export class HubRouting extends GeneralModel {
    hubId: number;
    hub: Hub;
}