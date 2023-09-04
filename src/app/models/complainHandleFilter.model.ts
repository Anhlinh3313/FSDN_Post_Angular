import { GeneralModel } from "./general.model";

export class ComplainHandleFilter {
    complainId: number;
    pageNum: number = 1;
    pageSize: number = 10;
    cols: string = "ComplainStatus,HandleEmp";
}