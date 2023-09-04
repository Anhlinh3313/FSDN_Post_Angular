export class ListUpdateStatusViewModel {
    empId: number;
    printCodeId: number;
    receiveHubId: number;
    shipmentStatusId: number;
    currentLat: number;
    currentLng: number;
    location: string;
    note: string;
    cusNote: string;
    endDeliveryTime: any;

    notInShipmentIds: number[];
    scheduleErrorShipmentIds: string[];
    listGoodsId: number;
    deliveryOther: boolean;
    shipmentIds: number[];
    sealNumber: string;
    fromHubId: number;
    toHubId: number;
    realRecipientName: string;
    // transportType
    transportTypeId: number;
    realWeight: number;
    truckNumber: string;
    mawb: string;
    startExpectedTime: any;
    startTime: any;
    endExpectedTime: any;
    endTime: any;
    tplId: number;
    UnShipmentIds: number[];
    AddShipmentIds: number[];
    ListGoodsId: number;

    shipmentNumber: string;
    shipmentId: number;
    isTransferAllHub?: boolean = false;
}