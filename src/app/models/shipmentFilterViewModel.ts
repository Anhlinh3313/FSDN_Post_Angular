import { CustomExportFileModel } from "./CustomExportFile.model";

export class ShipmentFilterViewModel {
    OrderDateFrom: any;
    OrderDateTo: any;
    ShipmentNumber: any;
    FromProvinceId: any;
    ToProvinceId: any;
    ToProvinceIds : any;
    RequestShipmentId: number;
    ShipmentNumberListSelect: string[];
    ShipmentNumberListUnSelect: string[];
    SenderId: any;
    WeightFrom: any;
    ServiceId: any;
    WeightTo: any;
    PaymentTypeId: any;
    ShipmentStatusId: any;
    ShipmentStatusIds: any;
    SearchText: any;
    Type: any;
    PageSize: any;
    PageNumber: any;
    Cols: any;
    FromHubId: any;
    CurrentHubId: any;
    DeliveryUserId: any;
    ToHubId: any;
    IsSuccess: boolean;
    IsExistInfoDelivery: boolean;
    IsExistImagePickup: boolean;
    CurrentHubDelivery: any;
    isEnabled: boolean;
    currentEmpId: any;
    receiveHubId: any;
    listGoodsId: any;
    listGoodsIds : any;
    transferUserId: number;
    // times delivery
    numIssueDelivery?: number;
    endNumDelivery?: number;
    handlingEmpId?: number;
    uploadExcelHistoryId?: number;
    // sort theo thứ tự giảm dần = true, tăng dần = false, mặc định là giảm dần
    isSortDescending: boolean = true;
    isBox: boolean = null;
    groupStatusId: number;
    isPrintBill: boolean;
    deadlineTypeId: number = null;
    referencesCode: string;
    isGroupEmp: boolean = false;
    //
    isReturn: boolean;
    endDeliveryTime = null;
    customExportFile: CustomExportFileModel = new CustomExportFileModel();
    
}