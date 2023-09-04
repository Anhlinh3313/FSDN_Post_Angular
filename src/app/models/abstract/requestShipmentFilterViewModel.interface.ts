import { SearchDate } from "../../infrastructure/searchDate.helper";


export class RequestShipmentFilterViewModel {
    type: string = "all";
    isEnabled?: boolean;
    shipmentNumber?: string;
    orderDateFrom?: any = SearchDate.formatToISODate(new Date());;
    orderDateTo?: any = SearchDate.formatToISODate(new Date());;
    senderId?: number;
    fromHubId?: number;
    currentHubId?: number;
    toHubId?: number;
    typePickup: string;
    pickUserId: number;
    shipmentStatusId?: number;
    pickupType?: number;
    pageSize?: number = 10;
    pageNumber?: number = 1;
    isSortDescending?: boolean = false;
}
