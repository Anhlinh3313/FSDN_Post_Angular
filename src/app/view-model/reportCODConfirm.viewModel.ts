import { CustomExportFileModel } from "../models";

export class ReportCODConfirmViewModel {
    fromHubId?: any;
    toHubId?: any;
    currentHubId?: any;
    serviceId?: any;
    shipmentStatusId?: any;
    senderId?: any;
    currentEmpId?: any;
    accountingAccountId?: any;
    fromProvinceId?: any;
    toProvinceId?: any;
    dateFrom?: any;
    dateTo?: any;
    pageNumber?: any;
    pageSize?: any;
    searchText?: any;

    customExportFile: CustomExportFileModel = new CustomExportFileModel();
}
