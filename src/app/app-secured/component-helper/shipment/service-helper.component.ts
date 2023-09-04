import { OnInit } from "@angular/core";
import {
  CustomerService,
  PriceService,
  DeadlinePickupDeliveryService,
  AuthService,
  PriceServiceService,
  BoxService,
  ServiceDVGTService,
  PriceListService
} from "../../../services";
import { ServiceHelper } from "../../../infrastructure/service.helper";
import { SelectItem } from "primeng/primeng";
import { DeadlineComponent } from "./deadline-helper.component";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { MessageService } from "primeng/components/common/messageservice";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { EntryShipment } from "../../../models/abstract/entryShipment.interface";

export class ServiceComponent extends DeadlineComponent implements OnInit {
  constructor(
    protected priceServiceService: PriceServiceService,
    protected customerService: CustomerService,
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
    super(deadlinePickupDeliveryService, priceListService, serviceDVGTService, boxService, priceService, generalInfoService, authService, messageService,permissionService,router);
  }

  ngOnInit(): void {}

  async loadPriceList(shipment: EntryShipment) {
    const priceList = await this.priceListService.getSelectModelByHubAndCustomerAsync(shipment.fromHubId ? shipment.fromHubId : 0, shipment.senderId);
    if (priceList) {
      if (priceList["length"] > 0) {
        shipment.priceList = priceList;
        const findPriceListId = priceList.find(x => (x.value && x.value == shipment.priceListId));
        if (!findPriceListId) {
          shipment.priceListId = priceList[1].value;
        }
      }
    } else {
      shipment.priceList = [];
      shipment.priceListId = null;
    }
    this.loadDIM(shipment);
  }

  async changePriceList(shipment: EntryShipment) {
    this.loadDIM(shipment);
  }

  async loadServiceSP(shipment: any): Promise<any> {
    const fromDistrictId = shipment.fromDistrictId;
    const fromWardId = shipment.fromWardId;
    const toDistrictId = shipment.toDistrictId;
    const chargeWeight = (shipment.weight >= shipment.calWeight) ? shipment.weight : shipment.calWeight;
    shipment.chargeWeight = chargeWeight;
    const customerId = shipment.senderId;
    const customer = await this.customerService.getCustomerById(customerId);
    shipment.customer = customer;
    const insured = shipment.insured ? shipment.insured : 0;
    const totalItem = shipment.totalItem ? shipment.totalItem : 0;
    const structureId = shipment.structureId ? shipment.structureId : 0;
    const model = ServiceHelper.checkParams(customer, fromDistrictId, fromWardId, toDistrictId, chargeWeight);
    if (model) {
      model.insured = insured ? insured : 0;
      model.totalItem = totalItem;
      model.structureId = structureId;
      const data = await this.priceService.loadListServiceAsync(model);
      if (data.message) {
        shipment.msgService = data.message;
      } else {
        shipment.msgService = null;
        shipment.services = data.data as SelectItem[];
        if (shipment.serviceId) {
          const service = shipment.services.find(x => x.value == shipment.serviceId);
          if (service) {
            shipment.serviceLabel = service.label;
          }
        } else {
          shipment.serviceId = shipment.services[1].value;
          shipment.serviceLabel = shipment.services[1].label;
        }
        this.loadDIM(shipment);
        this.loadDeadlinePickupDelivery(shipment);
        this.calculatePrice(shipment);
      }
    } else {
      this.resetService(shipment);
      this.resetPrice(shipment);
    }
  }

  async loadDIM(shipment: any) {
    const data = await this.priceServiceService.getDIMAsync(shipment.priceListId, shipment.serviceId);
    if (data) {
      shipment.dim = data.dim;
    }
  }

  resetService(shipment: any) {
    shipment.serviceId = null;
    shipment.services = null;
    shipment.serviceLabel = null;
  }
}
