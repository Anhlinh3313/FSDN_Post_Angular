import { CustomExportFileModel } from "./CustomExportFile.model";

export class ReportCODConfirmFilter {
    fromHubId?: any;
    toHubId?: any;
    paymentTypeId?: any;
    serviceId?: any;
    shipmentStatusId?: any;
    senderId?: any;
    dateFrom?: any;
    dateTo?: any;
    pageNumber?: any;
    pageSize?: any;
    searchText?: any;
    
    customExportFile: CustomExportFileModel = new CustomExportFileModel();
}