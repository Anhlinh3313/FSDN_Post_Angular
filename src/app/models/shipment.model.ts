import { IBaseModel } from "./abstract/ibaseModel.interface";
import { Customer } from "./customer.model";
import { Hub } from "./hub.model";
import { Ward } from "./ward.model";
import { ShipmentStatus } from "./shipmentStatus.model";
import { LadingSchesule } from "./ladingSchedule.model";
import { Package, Reason, Province, PriceDVGT } from "./index";
import { Size } from "./size.model";
import { User } from "./user.model";
import { Service } from "./service.model";
import { PaymentType } from "./paymentType.model";
import { Structure } from "./structure.model";
import { ReasonService } from "../services/index";
import { Boxes } from "./boxes.model";
import { TPL } from "./tpl.model";
import { ListGoods } from "./listGoods.model";
import { District } from "./district.model";
import { CusDepartment } from "./cusDepartment.model";

export class Shipment implements IBaseModel {
    id: number;
    concurrencyStamp: string;
    isEnabled: boolean;
    shipmentNumber: string;
    shopCode: string;
    disCount: number;
    orderDate: any;
    deliveryDate: any;
    endPickTime: any;
    startPickTime?: any;
    sellerId?: number;
    sellerName?: string;
    sellerPhone: string;
    senderId: number;
    senderName: string;
    senderPhone: string;
    companyFrom: string;
    addressNoteFrom: string;
    pickingAddress: string;
    latFrom: number;
    lngFrom: number;
    fromStreetId?: number;
    fromWardId?: number;
    fromDistrictId?: number;
    fromProvinceId?: number;
    fromHubId?: number;
    fromHubRoutingId?: number;
    receiverName: string;
    receiverPhone: string;
    companyTo: string;
    addressNoteTo: string;
    shippingAddress: string;
    latTo: number;
    lngTo: number;
    toWardId?: number;
    toDistrictId?: number;
    toProvinceId?: number;
    toHubId?: number;
    toHubRoutingId?: number;
    serviceId?: number;
    paymentTypeId?: number;
    thirdPLId?: number;
    pickUserId?: number;
    deliverUserId?: number;
    numDeliver?: number;
    transferUserId?: number;
    transferUser?: any;
    transferReturnUserId?: number;
    returnUserId?: number;
    note: string;
    weight: number = 0;
    length: number;
    height: number;
    width: number;
    calWeight: number = 0;
    excWeight?: number = 0;
    shipmentStatusId: number;;
    cusNote: string;
    content: string;
    totalBox: number;
    doc?: number = 0;
    currentEmpId: number;
    keepingTotalPriceEmpId?: number;
    keepingTotalPriceHubId?: number;
    keepingCODEmpId?: number;
    keepingCODHubId?: number;
    isPaidPrice: boolean;
    requestShipmentId?: number;
    packageId?: number;
    receiveHubId?: number;
    currentHubId: number;
    cod: number;
    insured: number;
    defaultPrice: number;
    isAgreementPrice: boolean;
    isCreditTransfer: boolean;
    remoteAreasPrice: number;
    fuelPrice: number;
    totalDVGT: number;
    otherPrice: number;
    vatPrice: number;
    totalPrice: number;
    structureId: number;
    serviceDVGTIds: number[];
    strServiceDVGTIds?: string;
    strServiceDVGTName?: string;
    listGoodsId?: number;
    provinceCode?: string;
    deliveryImagePath?: string[];
    deliveryImages?: string[];
    firstDeliveredTime?: any;
    parrentShipmentNumber?: string;
    childShipmentNumbers?: string;
    shipmentTypeName?: string;
    senderCode?: string;
    //
    currentLat: number;
    currentLng: number;
    location: string;
    //
    tplId?: number;
    tpl?: TPL;
    tplNumber?: string;
    tplCreatedWhen?: any;

    package?: Package;
    requestShipment?: Shipment;
    parentShipment?: Shipment;
    sender?: Customer;
    receiver?: Customer;
    fromHub?: Hub;
    fromHubRouting?: Hub;
    toHub?: Hub;
    toHubRouting?: Hub;
    fromWard?: Ward;
    toWard?: Ward;
    receiveHub?: Hub;
    currentHub?: Hub;
    currentEmp?: User;
    deliverUser?: User;
    pickUser?: User;
    businessUser?: User;
    returnUser?: User;
    shipmentStatus?: ShipmentStatus;
    paymentType?: PaymentType;
    ladingSchedules?: LadingSchesule[];
    fromProvince?: Province;
    toProvince?: Province;
    toDistrict?: District;
    service?: Service;
    size?: Size;
    structure?: Structure;
    serviceDVGT?: Service;
    shipmentServiceDVGTs?: Service[];
    serviceDVGTIdsCode?: string;
    //
    //dateRangeValue: any = new Object();
    reasonService?: ReasonService;
    reason?: Reason;
    boxes?: Boxes[] = [];
    //assign pickup
    assignPickTime?: Date;
    listGoods?: ListGoods;
    //EXCEL
    requestCode?: string;
    staffCode?: string;
    customerCode?: string;
    structureCode?: string;
    serviceCode?: string;
    serviceDVGTCode?: string;
    paymentTypeCode?: string;
    assignedPickupMinutes?: number;
    assignedPickupHours?: number;
    //assing delivery
    assignDeliveryTime?: Date;
    assignedDeliveyMinutes?: number;
    assignedDeliveyHours?: number;
    endDeliveryTime?: any;
    //RealRecipientName
    realRecipientName: string;
    key?: number;
    isValid?: boolean;
    message?: string;
    isExistVersion?: boolean;
    fromHubName?: string;
    toHubName?: string;
    // shipment support
    totalShipment?: number;
    shipmentId?: any;
    chargeWeight?: number;
    // department
    cusDepartmentId?: number;
    CusDepartment?: CusDepartment;
    // return
    isReturn: boolean;
    pickupImagePath?: string;
    reasonId: number;
    // change ShippingAddress
    defaultShippingAddress?: string;
    isChangeShippingAddress?: boolean;
    totalItem: number;
    countShipmentAccept?: number;
    totalShipmentNotFill?: number;
    priceDVGTs: PriceDVGT[];
    // process error
    isProcessError?: boolean;
    processErrorTime?: any;
    priceListId?: number;
    //
    totalChildRequestShipment?: number;
    totalChildShipment?: number;
    // shipment canceled
    createdWhen?: any;
    deletedShipmentAt?: any;
    userCode?: string;
    userFullName?: string;
    userHubName?: string;
    paymentTypeName?: string;
    serviceName?: string;
    deliverUserName?: string;
    fromProvinceName?: string;
    fromHubRoutingName?: string;
    toProvinceName?: string;
    toDistrictName?: string;
    toWardName?: string;
    toHubRoutingName?: string;
    typeId?: number;
    handlingEmpId?: number;
    // ghi log dữ liệu thay đổi
    dataChanged?: string;
    // tpl
    tplPrice?: number;
    tplCurrentId?: number;
    tplPriceReal?: number;
    tplTransitListGoodsId?: number;
    isTPLTransit?: boolean;
    //
    listCustomerPaymentCODId?: number;
    listCustomerPaymentTotalPriceId?: number;
    deliveryNote?: string;
    //
    paymentCODTypeId?: number = null;
    receiverId?: number;
    businessUserId?: number;
    priceReturn: number;
    priceCOD: number;
    totalPriceSYS: number;
    //
    isBox: boolean;
    isCreatedChild: boolean;
    isPaymentChild: boolean;
    isPrioritize: boolean;
    defaultPriceS: number;
    defaultPriceP: number;
    //
    deliveryAppointmentTime?: any;
    expectedDeliveryTime?: any;
    expectedDeliveryTimeSystem?: any;
    pickupAppointmentTime?: any;
    endReturnTime?: any;
    //
    isTruckDelivery: boolean = false;
    typeRider: any;
    //
    isQua4Tieng?: boolean;
    isTooLate?: boolean;
    totalCount?: number;
    reasonName: string;
    //
    kmNumberTW: number;
    KmNumberTD: number;
    //
    distance: number;
    receiverCode2: string;
    //
    payCOD: number;
    payPriceCOD: number;
    payTotalPrice: number;
    sumPayCOD: number;
    sumPayPriceCOD: number;
    sumPayTotalPrice: number;
    //
    inputUserFullName?: string;
    outputUserFullName?: string;
    //
    toHubRoutingEmp?: string;
    //
    totalShipmentInPackage?: number;
    totalPackage?: number;
    totalBoxs?: number;
    //
    fullName?: string;
    kmNumber: number;
    receiptCODCode: string;
    receiptPriceCode: string;
    timeCompare?: number;
    timeCompareString: string;
    // 
    totalPricePay?: number;
    returnReason: string;
    deliveryWhenOne?: any;
    deliveryReasonOne: string;
    deliveryWhenTwo?: any;
    deliveryReasonTwo: string;
    deliveryWhenThree?: any;
    deliveryReasonThree: string;
    receiptCODCreatedWhen?: any;
    countImageDelivery?: number;
    //    
    addressNew?: string;
    sumInsured?: number;
    sumCOD?: number;
    sumPriceCOD?: number;
    sumTotalPrice?: number;
    sumTotalPricePay?: number;
    tplCode?: string;
    tplName?: string;
    //
    fromHubNameISSUE: string;
    fromUserFullname: string;
    toUserFullname: string;
    listGoodsCode: string;
    inOutDate: string;
}
