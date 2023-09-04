import { Boxes, PriceDVGT } from "../models";

export class ShipmentCalculateViewModel {
    disCount: number;
    priceListId: number;
    priceServiceId: number;
    orderDate: any;
    fromHubId: number;
    senderId: number;
    fromDistrictId: number;
    fromWardId: number;
    toDistrictId: number;
    weight: number;
    serviceId: number;
    paymentTypeId: number;
    structureId: number;
    cod: number;
    insured: number;
    otherPrice: number;
    serviceDVGTIds: number[];
    isAgreementPrice: boolean;
    defaultPrice: number;
    totalItem: number;
    calWeight: number;
    toWardId: number;
    priceBox: Boxes[];
    priceDVGTs: PriceDVGT[];
    priceReturn: number;
    distance: number;
    totalBox: number;
    isReturn: boolean;
}