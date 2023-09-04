import { Component, OnInit } from '@angular/core';
import { ServiceDVGT, Shipment, Customer, User, Hub, Service, BaseModel } from '../../../models';
import { ServiceDVGTService, ShipmentService, BaseService, ServiceService } from '../../../services';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { Structure } from '../../../models/structure.model';
import { PaymentType } from '../../../models/paymentType.model';
import { Constant } from '../../../infrastructure/constant';
import { MessageService } from 'primeng/components/common/messageservice';
import { environment } from '../../../../environments/environment';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-transfer',
  templateUrl: './confirm-transfer.component.html'
})
export class ConfirmTransferComponent extends BaseComponent implements OnInit {

  shipmentNumber: string = "";
  data: Shipment;

  serviceDVGTs: Service[];
  selectedServiceDVGTs: string[];

  unit = environment.unit;

  constructor(
    private serviceDVGTService: ServiceDVGTService,
    private shipmentService: ShipmentService,
    private serviceService: ServiceService,
    public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);

    this.data = new Shipment();
    this.data.shipmentStatus = new ShipmentStatus();
    this.data.pickUser = new User();
    this.data.deliverUser = new User();
    this.data.fromHub = new Hub();
    this.data.toHub = new Hub();
    this.data.structure = new Structure();
    this.data.paymentType = new PaymentType();
    this.data.service = new Service();
  }

  ngOnInit() {
    this.loadServiceDVGT();
  }

  async scanShipmentNumber() {
    let columns = [
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.pickUser,
      Constant.classes.includes.shipment.deliverUser,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.structure,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
    ]

    let shipment = await this.shipmentService.trackingShortAsync(this.shipmentNumber, columns);
    if (shipment) {

      if (shipment.isCreditTransfer) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: ("Vận đơn đã được xác nhận chuyển khoản trước đó.")
        });
      }

      this.data = shipment;
      this.data.chargeWeight = shipment.weight >= shipment.calWeight ? shipment.weight : shipment.calWeight;
      this.data.orderDate = this.data.orderDate ? new Date(this.data.orderDate).toLocaleString() : "";
      this.data.expectedDeliveryTime = this.data.expectedDeliveryTime ? new Date(this.data.expectedDeliveryTime).toLocaleString() : "";
      this.data.endDeliveryTime = this.data.endDeliveryTime ? new Date(this.data.endDeliveryTime).toLocaleString() : "";

      this.data.shipmentStatus = shipment.shipmentStatus ? shipment.shipmentStatus : new ShipmentStatus();
      this.data.pickUser = shipment.pickUser ? shipment.pickUser : new User();
      this.data.deliverUser = shipment.deliverUser ? shipment.deliverUser : new User();
      this.data.fromHub = shipment.fromHub ? shipment.fromHub : new Hub();
      this.data.toHub = shipment.toHub ? shipment.toHub : new Hub();
      this.data.structure = shipment.structure ? shipment.structure : new Structure();
      this.data.paymentType = shipment.paymentType ? shipment.paymentType : new PaymentType();
      this.data.service = shipment.service ? shipment.service : new Service();

      this.selectedServiceDVGTs = [];
      let dvgt = await this.serviceDVGTService.getByShipmentIdAsync(shipment.id);
      dvgt.forEach(item => {
        this.selectedServiceDVGTs = this.selectedServiceDVGTs.concat(item.code);
      });
    }
    else {
      this.refresh();
    }
  }

  async loadServiceDVGT() {
    this.serviceDVGTs = await this.serviceService.GetListServiceSubAsync();
  }

  refresh() {
    this.shipmentNumber = "";
    this.data = new Shipment();
    this.data.shipmentStatus = new ShipmentStatus();
    this.data.pickUser = new User();
    this.data.deliverUser = new User();
    this.data.fromHub = new Hub();
    this.data.toHub = new Hub();
    this.data.structure = new Structure();
    this.data.paymentType = new PaymentType();
    this.data.service = new Service();
    this.selectedServiceDVGTs = [];
  }

  async Accept() {
    if (this.data.id) {
      let model: BaseModel = new BaseModel(this.data.id);
      let rs = await this.shipmentService.acceptCreditTransferAsync(model)
      if (rs) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: ("Xác nhận chuyển khoản thành công.")
        });
        this.refresh();
      }
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: ("Vui lòng quét mã vận đơn.")
      });
    }
  }
}
