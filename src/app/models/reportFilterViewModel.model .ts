import { CustomExportFileModel } from "./CustomExportFile.model";

export class ReportFilterViewModel {
    DateFrom: any;
    DateTo: any;
    HubId: any;
    EmpId: any; 
    customExportFile: CustomExportFileModel = new CustomExportFileModel();
}