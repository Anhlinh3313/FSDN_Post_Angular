import { OnInit } from "@angular/core";
import { CustomerHelper } from "../../../infrastructure/customer.helper";
import { ShipmentCalculateViewModel } from "../../../view-model";
import { PriceService, AuthService, BoxService, ServiceDVGTService, PriceListService } from "../../../services";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { MessageService } from "primeng/components/common/messageservice";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

export class PriceComponent extends InformationComponent implements OnInit {
  constructor(
    protected priceListService: PriceListService,
    protected serviceDVGTService: ServiceDVGTService,
    protected boxService: BoxService,
    protected priceService: PriceService,
    protected generalInfoService: GeneralInfoService,
    protected authService: AuthService,
    protected messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(generalInfoService, authService, messageService,permissionService,router);
  }

  ngOnInit(): void {}

  async calculatePrice(shipment: any) {
    const fromDistrictId = shipment.fromDistrictId;
    const serviceId = shipment.serviceId;
    const toDistrictId = shipment.toDistrictId;
    const fromWardId = shipment.fromWardId;
    const chargeWeight = shipment.chargeWeight;
    const structureId = shipment.structureId;
    const otherPrice = shipment.otherPrice;
    const defaultPrice = shipment.defaultPrice;
    const totalItem = shipment.totalItem;
    const cod = shipment.cod;
    const serviceDVGTIds = shipment.serviceDVGTIds;
    if (
      fromDistrictId &&
      serviceId &&
      toDistrictId &&
      fromWardId &&
      chargeWeight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      if (shipment.fromDistrictId) {
        model.fromDistrictId = fromDistrictId;
      }
      model.fromWardId = fromWardId;
      model.structureId = structureId;
      model.insured = shipment.insured ? shipment.insured : 0;
      model.otherPrice = otherPrice ? otherPrice : 0;
      model.cod = cod ? cod : 0;
      model.priceListId = shipment.priceListId;
      if (shipment.sender) {
        model.senderId = shipment.sender.id;
      }
      model.serviceDVGTIds = shipment.serviceDVGTIds;
      model.serviceId = serviceId;
      model.toDistrictId = toDistrictId;
      model.weight = chargeWeight;
      model.defaultPrice = defaultPrice ? defaultPrice : 0;
      model.totalItem = totalItem ? totalItem : 0;

      const data = await this.serviceDVGTService.getPriceDVGTByShipmentIdAsync(shipment.id);
      const priceDVGTs = data.map(x => {
        x["totalPrice"] = x["price"];
        return x;
      }) as any[];
      model.priceDVGTs = shipment.serviceDVGTIds.map(x => {
        let find = priceDVGTs.find(y => x == y.serviceDVGTId);
        if (find)
          return find;
        else
          return {
            ServiceDVGTId: x,
            isAgree: false,
            totalPrice: 0
          }
      });
      model.priceBox = shipment.boxes;
      model.calWeight = shipment.calWeight;
      model.toWardId = shipment.toWardId;
      const price = await this.priceService.calculateAsync(model);
      if (price) {
        shipment.defaultPrice = price.defaultPrice;
        shipment.fuelPrice = price.fuelPrice;
        shipment.otherPrice = price.otherPrice;
        shipment.remoteAreasPrice = price.remoteAreasPrice;
        shipment.totalDVGT = price.totalDVGT;
        shipment.totalPrice = price.totalPrice;
        shipment.vatPrice = price.vatPrice;
        shipment.priceDVGTs = price.priceDVGTs;
      }
    } else {
      this.resetPrice(shipment);
    }
  }

  resetPrice(shipment: any) {
    shipment.defaultPrice = 0;
    shipment.fuelPrice = 0;
    shipment.otherPrice = 0;
    shipment.remoteAreasPrice = 0;
    shipment.totalDVGT = 0;
    shipment.totalPrice = 0;
    shipment.vatPrice = 0;
  }
}
