import { IBaseModel } from "./abstract/ibaseModel.interface";
export class ReportPickupDelivery implements IBaseModel {
    id: number;
    code: string;
    fullName: string;
    userName: string;
    address: string;
    phoneNumber: string;
    hubId: number;
    hubName: string;
    departmentId: number;
    departmentName: string;
    roleId: number;
    roleName: string;
    totalCODMustCollect: number;
    totalZCOD: number;
    totalSubmitCOD: number;
    totalAcceptedCOD: number;
    totalAwaitSubmitCOD: number;
    totalPickup: number;
    totalPickupFail: number;
    totalShipment: number;
    totalAwaitAccept: number;
    totalDelivering: number;
    totalDeliveredOne: number;
    totalDeliveredTwo: number;
    totalDeliveredThree: number;
    totalDeliveryFail: number;
    totalReturn: number;
    totalPricePickup: number;
    totalPriceDelivery: number;
    //
    grandTotal: number;
    grandTotalReal: number;
}