import { IGeneralModel } from "./igeneralModel.interface";
import { User } from "..";

export interface UploadExcelHistoryViewModel extends IGeneralModel {
    userId: number;
    user: User;
    createdWhen: any;
    totalCreated: number;
    totalUpdated: number;
}