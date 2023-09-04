import { ResponseModel } from "..";
import { SumOfReport } from "./sumOfReport.interface";

export interface ResponseOfReportModel extends ResponseModel {
   sumOfReport: SumOfReport;
}
