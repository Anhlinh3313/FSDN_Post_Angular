import { OnInit } from "@angular/core";
import { DeadlinePickupDelivery } from "../../../models";
import { DeadlinePickupDeliveryService, PriceService, AuthService, ServiceDVGTService, BoxService, PriceListService } from "../../../services";
import { PriceComponent } from "./price-helper.component";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { MessageService } from "primeng/components/common/messageservice";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

export class DeadlineComponent extends PriceComponent implements OnInit {
  constructor(
    protected deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
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
    super(priceListService, serviceDVGTService, boxService, priceService, generalInfoService, authService, messageService,permissionService,router);
  }

  ngOnInit(): void {}

  async loadDeadlinePickupDelivery(shipment: any) {
    const fromWardId = shipment.fromWardId;
    const fromHubId = shipment.fromHubId;
    const serviceId = shipment.serviceId;
    const toDistrictId = shipment.toDistrictId;
    if ((fromWardId || fromHubId) && serviceId && toDistrictId) {
      let model: DeadlinePickupDelivery = new DeadlinePickupDelivery();
      if (shipment.orderDate) {
        model.timeStart = shipment.orderDate;
      } else {
        model.timeStart = new Date();
      }
      if (fromWardId) {
        model.wardFromId = fromWardId;
      }
      if (fromHubId) {
        model.fromHudId = fromHubId;
      }
      model.serviceId = serviceId;
      model.districtToId = toDistrictId;

      const data = await this.deadlinePickupDeliveryService.getDeadlineDeliveryAsync(
        model
      );
      if (data) {
        shipment.expectedDeliveryTime = data.formatDatetime;
        shipment.expectedDeliveryTimeSystem = data.formatDatetime;
      } else {
        shipment.expectedDeliveryTime = null;
      }
    } else {
      shipment.expectedDeliveryTime = null;
    }
  }
}
