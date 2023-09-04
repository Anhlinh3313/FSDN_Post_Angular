import { CustomExportFileModel } from ".";

export class ReportExpenseFilterModel {
    hubId?: any = null;
    dateFrom?: any = null;
    dateTo?: any = null;
    userId?: any = null;
    pageNumber?: any = null;
    pageSize?: any = null;
    accountingAccountId?: any = null;
	customExportFile: CustomExportFileModel = new CustomExportFileModel();
}