import { GeneralInfoService } from "../services/generalInfo.service";
import { GeneralInfoModel } from "../models/generalInfo.model";
import { Shipment } from "../models/shipment.model";
import { AuthService } from "../services/auth/auth.service";
import { BaseComponent } from "../shared/components/baseComponent";
import { MessageService } from "primeng/components/common/messageservice";
import { PermissionService } from "../services/permission.service";
import { Router } from "@angular/router";

export class InformationComponent extends BaseComponent {
    generalInfo: GeneralInfoModel;
    constructor(protected generalInfoService: GeneralInfoService, protected authService: AuthService, protected messageService: MessageService,
        public permissionService: PermissionService, 
        public router: Router,
    ) {
        super(messageService,permissionService,router);
    }

    async sendSelectDataPrintMultiShipment(data: Shipment[], generalInfo?: GeneralInfoModel): Promise<any> {
        let cloneSelectData: any = [];
        const time = new Date;
        const getFullYear = time.getFullYear();
        const createdBy = this.authService.getFullName();

        cloneSelectData = data.map(x => {
            const data = {
                id: x.id,
                shipmentNumber: x.shipmentNumber,
                fakeId: "id" + x.id,
                senderName: x.senderName,
                companyFrom: x.companyFrom,
                senderCode: x.sender ? x.sender.code : null,
                addressNoteFrom: x.addressNoteFrom,
                pickingAddress: x.pickingAddress,
                senderPhone: x.senderPhone,
                receiverName: x.receiverName,
                companyTo: x.companyTo,
                addressNoteTo: x.addressNoteTo,
                shippingAddress: x.shippingAddress,
                toProvinceName: x.toProvince ? x.toProvince.name : null,
                toDistrictName: (x.toWard && x.toWard.district) ? x.toWard.district.name : null,
                toWardName: x.toWard ? x.toWard.name : null,
                receiverPhone: x.receiverPhone,
                totalBox: x.totalBox,
                weight: x.weight,
                calWeight: x.calWeight,
                expectedDeliveryTime: x.expectedDeliveryTime,
                cusNote: x.cusNote,
                content: x.content,
                serviceName: x.service ? x.service.name : null,
                structureName: x.structure ? x.structure.name : null,
                insured: x.insured,
                fuelPrice: x.fuelPrice,
                isShowPrice: x.sender ? x.sender.isShowPrice : null,
                defaultPrice: x.defaultPrice,
                totalDVGT: x.totalDVGT,
                otherPrice: x.otherPrice,
                vatPrice: x.vatPrice,
                totalPrice: x.totalPrice,
                cod: x.cod,
                paymentName: x.paymentType ? x.paymentType.name : null,
                paymentTypeId: x.paymentTypeId,
                fromHubCode: x.fromHub ? x.fromHub.code : null,
                endPickTime: x.endPickTime,
                toHubCode: x.toHub ? x.toHub.code : null,
                createdBy: createdBy,
                pickUserFullName: x.pickUser ? x.pickUser.fullName : null,
                pickUserCode: x.pickUser ? x.pickUser.code : null,
                deliveryUserName: x.deliverUser ? x.deliverUser.fullName : null,
                getFullYear: getFullYear,
                printTime: time,
                orderDate: x.orderDate,
                tplName: x.tpl ? x.tpl.name : null,
                tplCode: x.tpl ? x.tpl.code : null,
                isReturn: x.isReturn,
                shopCode: x.shopCode,
                noPrintShipment: false,
            };
            return data;
        });
        this.generalInfo = generalInfo;
        if (this.generalInfo) {
            cloneSelectData.logoUrl = this.generalInfo.logoUrl;
            cloneSelectData.companyName = this.generalInfo.companyName.toLocaleUpperCase();
            cloneSelectData.hotLine = this.generalInfo.hotLine;
            cloneSelectData.centerHubAddress = this.generalInfo.addressMain;
            cloneSelectData.policy = this.generalInfo.policy;
            cloneSelectData.website = this.generalInfo.website;
        }
        return cloneSelectData;
    }

    async sendSelectDataPrintMultiShipmentVSE(data: any, generalInfo?: GeneralInfoModel): Promise<any> {
        this.generalInfo = generalInfo;
        if (this.generalInfo) {
            data.logoUrl = this.generalInfo.logoUrl;
            data.companyName = this.generalInfo.companyName.toLocaleUpperCase();
            data.hotLine = this.generalInfo.hotLine;
            data.centerHubAddress = this.generalInfo.addressMain;
            data.policy = this.generalInfo.policy;
            data.website = this.generalInfo.website;
        }
        data.map(x => x.fakeId = ("id" + x.id));
        return data;
    }

    async sendSelectDataPrintMultiCode(data: Shipment[]): Promise<any> {
        const cloneSelectCode: any = data;
        cloneSelectCode.forEach(item => {
            item.fakeId = "id" + item.id;
        });
        return cloneSelectCode;
    }
}