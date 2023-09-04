import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { TruckScheduleService } from '../../../services/truckSchedule.service';
import { Constant } from '../../../infrastructure/constant';
import { TruckSchedule } from '../../../models/truckSchedule.model';
import { User } from '../../../models';
import { BsModalRef, BsModalService } from '../../../../../node_modules/ngx-bootstrap';
import { TruckScheduleDetail } from '../../../models/truckScheduleDetail.model';
import { HubService } from '../../../services';
import * as moment from "moment";

@Component({
  selector: 'app-tra-cuu-xe',
  templateUrl: './tra-cuu-xe.component.html',
  styles: []
})
export class TraCuuXeComponent extends BaseComponent implements OnInit {

  constructor(protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private truckScheduleService: TruckScheduleService,
    private hubService: HubService,
    private modalService: BsModalService) {
    super(messageService, permissionService, router)
  }

  //Page name
  parentPage: string = Constant.pages.quanLyChuyen_VanChuyen.name;
  currentPage: string = Constant.pages.quanLyChuyen_VanChuyen.children.traCuuXe.name;
  //

  //Data
  lstData: TruckSchedule[] = [];
  truckScheduleModal: TruckSchedule = new TruckSchedule();
  lstTruckScheduleDetails: TruckScheduleDetail[] = [];

  fromDate: Date;
  toDate: Date;

  dataModel = {
    truckNumber: null,
    fromDate: null,
    toDate: null,
    cols:
      Constant.classes.includes.truckSchedule.fromHub + "," +
      Constant.classes.includes.truckSchedule.toHub + "," +
      Constant.classes.includes.truckSchedule.truckScheduleStatus + "," +
      Constant.classes.includes.truckSchedule.truck
  }

  colsTruckScheduleDetail = Constant.classes.includes.truckScheduleDetail.hub + "," + Constant.classes.includes.truckScheduleDetail.truckScheduleStatus

  singlePickerOrderDate = {
    singleDatePicker: true,
    timePicker: false,
    showDropdowns: true,
    opens: "left",
    startDate: new Date()
  }

  columns = [
    { field: 'id', header: 'STT' },
    { field: 'code', header: 'Mã' },
    { field: 'fromHub.name', header: 'Trạm đi' },
    { field: 'toHub.name', header: 'Trạm đến' },
    { field: 'truckScheduleStatus.name', header: 'Trạng thái' },
    { field: 'truck.name', header: 'Xe' },
    { field: 'sealNumber.name', header: 'Số seal' },
  ]
  //

  //Modal
  modalTitle: string;
  bsModalRef: BsModalRef;

  truckScheduleDetail: TruckScheduleDetail[] = [];
  //

  ngOnInit() {
  }

  //#region Data
  showRiders(riders: User[]) {
    var ridersName = "";
    if (riders && riders.length > 0) {
      ridersName = riders.map(x => x.fullName).join(", ");
    }
    return ridersName;
  }
  //#endregion

  //#region Nút xủ lý
  refresh() {
    this.dataModel.truckNumber = "";
    this.dataModel.fromDate = "";
    this.dataModel.toDate = "";
  }

  async scanTruckNumber() {
    if (!this.dataModel.truckNumber) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập biển số"
      });
    }

    this.lstData = await this.truckScheduleService.searchTruckScheduleByTruckNumber(this.dataModel);
  }

  selectedFromDate(value: any) {
    this.fromDate = value.start;
    this.dataModel.fromDate = this.getStartDate(value.start);
    this.scanTruckNumber();
  }

  selectedToDate(value: any) {
    this.toDate = value.start;
    this.dataModel.toDate = this.getEndDate(value.start);
    this.scanTruckNumber();
  }

  getStartDate(date: Date) {
    const currentDate = moment(date).format("YYYY/MM/DD");
    return currentDate + "T01:00:00";
  }

  getEndDate(date: Date) {
    const currentDate = moment(date).format("YYYY/MM/DD");
    return currentDate + "T23:59:59";
  }

  async viewDetail(rowData: TruckSchedule, template: BsModalRef) {
    let data = await this.truckScheduleService.getTruckScheduleDetail(rowData.id, this.colsTruckScheduleDetail);
    this.truckScheduleModal = rowData;
    if (data.length > 0) {
      // let hub = await this.hubService.getAsync(this.truckScheduleDetail.hubId);
      this.lstTruckScheduleDetails = data;

      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg' });
    }
  }
  //#endregion
}
