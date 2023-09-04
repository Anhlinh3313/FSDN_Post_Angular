import { LadingScheduleReturnHistoryViewModel } from "../view-model/ladingScheduleReturnHistory.viewModel";

export class ShipmentReturnHistory implements LadingScheduleReturnHistoryViewModel {
    id: number;
    ladingScheduleCreatedWhen: Date;
    shipmentStatusId: number
    shipmentStatusName: string;
    ladingScheduleHubId: number;
    ladingScheduleHubName: string;
    note: string;
    shipmentId: number
    shipmentNumber : string;
    pickingAddress: string;
    createdWhen: Date;
    fromHubId: number;
    fromCode: string;
    fromHubName: string
    fromHubAddress: null
    fromHubRoutingId: number
    fromHubRoutingName: string
    fromProvinceProvinceId: number
    fromProvinceName: string
    fromDistrictId: number
    fromDistrictName :number
    fromWardId: number
    fromWardName: number
    toHubId: number
    toCode: string
    toHubName: string
    toHubAddress: string
    toHubRoutingId:number
    toHubRoutingName: string
    toProvinceProvinceId: number
    toProvinceName: string
    toDistrictId: number
    toDistrictName: string
    toWardId: number
    toWardName: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    realRecipientName: string
    paymentTypeId: number
    paymentTypeName: string
    startPickTime:  Date
    endPickTime: Date
    startReturnTime: Date
    endReturnTime: Date
    startDeliveryTime: Date
    endDeliveryTime: Date
    expectedDeliveryTime: Date
    firstDeliveredTime: Date
    numPick: string
    numDeliver: string
    pickUserId: number
    pickupCode: string
    pickupFullName: string
    deliverUserId: number
    deliverCode: string
    deliverFullName: string
    transferFullName: string
    startTransferTime: Date
    weight: number
    calWeight: number
    totalBox: number
    cusNote:string
    pickupNote:string
    deliveryNote: string
    returnNote: string
    deliveryCancelNote: string
    returnUserId: number
    returnCode: string
    returnFullName: string
}
