import { StreamInvocationMessage } from "@aspnet/signalr";
import { Boxes } from "./boxes.model";

export class AssignShipmentWarehousing {
    ShipmentNumber: string;
    Cols?: string;
    note: string;
    totalBox: number;
    weight: number;
    calWeight: number;
    isCheck: boolean;
    isPushCustomer: boolean;
    typeWarehousing: number;
    listGoodsId: number;
    packageId?: number;
    serviceId: number;
    toHubId: number;
    toProvinceId: number;
    toDistrictId: number;
    toWardId: number;
    shippingAddress: string;
    content: string;
    cusNote: string;
    length: number;
    width: number;
    height: number;
    isCheckSchedule: boolean;
    isPackage: boolean;
    doc?: number = 0;
    boxes?: Boxes[] = [];
    toUserId?: number;
}