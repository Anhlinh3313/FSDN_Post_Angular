import { GeneralModel } from "../models/index";

export class HubRoutingCreateUpdateViewModel extends GeneralModel {
    hubId: number;
    wardIds: number[];
}