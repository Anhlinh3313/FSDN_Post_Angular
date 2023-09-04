import { CustomExportFileModel } from "./CustomExportFile.model";

export class GetListWarehousingFilter {
    warehousingType: any = null;
    userId: any = null;
    hubId: any = null;
    toHubId: any = null;
    toUserId: any = null;
    senderId: any = null;
    fromProvinceId: any = null;
    serviceId: any = null;
    isPrioritize: any = null;
    isIncidents: any = null;
    isAllShipment: any = false;
    listGoodsList: any = null;
    typeWarehousing: any = null;
    pageNumber: any = 1;
    pageSize: any = 20;
    dateFrom : any;
    dateTo: any;
    isNullHubRouting:any = false;

    customExportFile: CustomExportFileModel = new CustomExportFileModel();
}