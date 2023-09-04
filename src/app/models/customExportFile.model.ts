import * as moment from "moment";
import { ColumnExcelModel } from "./columnExcel.model";

export class CustomExportFileModel {
    linkLogo: string;
    nameReport: string;
    textList: string[] = []; 
    columnExcelModels: ColumnExcelModel[]; 
    fileNameReport : string;
}
