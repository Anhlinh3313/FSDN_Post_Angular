import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService, StorageType } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { Shipment } from '../../models/shipment.model';
import { ShipmentService, RequestShipmentService } from '../../services/index';
import { LadingSchesule } from '../../models/index';
import { BaseComponent } from '../../shared/components/baseComponent';
import { Constant } from '../../infrastructure/constant';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-detail',
  templateUrl: 'request-detail.component.html',
  styles: []
})
export class RequestDetailComponent extends BaseComponent implements OnInit {

  shipmentNumber: string;
  selectedShipmentType: string = "2";
  shipmentData: Shipment = new Shipment();
  shipmentLadingSchedule: LadingSchesule[] = [];

  constructor(public bsModalRef: BsModalRef, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService, private requestShipmentService: RequestShipmentService, public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {

  }

  resetData() {
    this.shipmentData = new Shipment;
    this.shipmentLadingSchedule = [];
  }

  loadData(shipment: Shipment) {
    this.shipmentData = shipment;
    this.shipmentLadingSchedule = this.shipmentData.ladingSchedules;
  }

  onEnterSearchGBDetail() {
    if (this.shipmentNumber) {
      this.resetData();
      // console.log(this.selectedShipmentType);
      let includes = [
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.toHub,
        Constant.classes.includes.shipment.fromWard,
        Constant.classes.includes.shipment.fromDistrict,
        Constant.classes.includes.shipment.fromProvince,
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.toWard,
        Constant.classes.includes.shipment.toDistrict,
        Constant.classes.includes.shipment.toProvince,
        Constant.classes.includes.shipment.shipmentStatus,
        Constant.classes.includes.shipment.paymentType,
        Constant.classes.includes.shipment.service,
        Constant.classes.includes.shipment.serviceDVGT,
      ];

      if (this.selectedShipmentType === "1") {
        this.shipmentService.trackingShort(this.shipmentNumber.trim(), includes).subscribe(
          x => {
            if (!super.isValidResponse(x)) return;
            this.loadData(x.data as Shipment);
          }
        );
      } else if (this.selectedShipmentType === "2") {
        this.requestShipmentService.trackingShort(this.shipmentNumber.trim(), includes).subscribe(
          x => {
            if (!super.isValidResponse(x)) return;
            this.loadData(x.data as Shipment);
          }
        );
      }
    }
    this.shipmentNumber = null;
  }
}