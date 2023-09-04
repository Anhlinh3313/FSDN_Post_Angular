import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService, StorageType } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { Shipment } from '../../models/shipment.model';
import { ShipmentService, RequestShipmentService } from '../../services/index';
import { LadingSchesule, User } from '../../models/index';
import { BaseComponent } from '../../shared/components/baseComponent';
import { Constant } from '../../infrastructure/constant';
import { StatusHelper } from '../../infrastructure/statusHelper';
import * as moment from 'moment';
import { ShipmentReportEmpViewModel } from '../../view-model/index';
import { environment } from '../../../environments/environment';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shipment-all-detail',
  templateUrl: 'shipment-all-detail.component.html',
  styles: []
})
export class ShipmentAllDetailComponent extends BaseComponent implements OnInit {
  shipments: Shipment[];
  user: User;
  shipmentStatusId: number = StatusHelper.picking;
  reportEmp: ShipmentReportEmpViewModel;
  //
  currentDate: Date;
  firstDay: Date;
  lastDay: Date;
  
  unit = environment.unit;

  constructor(public bsModalRef: BsModalRef, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService, private requestShipmentService: RequestShipmentService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  ngOnInit() {
    this.resetData();
    this.currentDate = new Date();
    this.firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    this.lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
  }

  resetData() {
    this.shipments = [];
    this.user = new User;
    this.reportEmp = new ShipmentReportEmpViewModel();
  }

  setData(user: User, shipments: Shipment[]) {
    this.user = user;
    this.shipments = shipments;

    this.shipmentService.getShipmentReportByEmpId(this.user.id, this.firstDay, this.lastDay).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.reportEmp = x.data as ShipmentReportEmpViewModel;
      }
    );
  }

  loadData() {
    this.shipmentService.getShipmentReportByEmpId(this.user.id, this.firstDay, this.lastDay).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.reportEmp = x.data as ShipmentReportEmpViewModel;
      }
    );

    let includes = [
      // Constant.classes.includes.shipment.fromHub,
      // Constant.classes.includes.shipment.toHub,
      // Constant.classes.includes.shipment.fromWard,
      // Constant.classes.includes.shipment.fromDistrict,
      // Constant.classes.includes.shipment.fromProvince,
      // Constant.classes.includes.shipment.toWard,
      // Constant.classes.includes.shipment.toDistrict,
      // Constant.classes.includes.shipment.toProvince,
      // Constant.classes.includes.shipment.shipmentStatus,
      // Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
      // Constant.classes.includes.shipment.serviceDVGT,
    ];

    if (this.user) {
      this.shipmentService.getByStatusEmpId(this.user.id, this.shipmentStatusId, this.firstDay, this.lastDay, includes).subscribe(
        x => {
          if (!super.isValidResponse(x)) return;
          this.shipments = x.data as Shipment[];
        }
      );
    }
  }

  clickLoadShipment(statusId: number) {
    this.shipmentStatusId = statusId;
    this.loadData();
  }
}
