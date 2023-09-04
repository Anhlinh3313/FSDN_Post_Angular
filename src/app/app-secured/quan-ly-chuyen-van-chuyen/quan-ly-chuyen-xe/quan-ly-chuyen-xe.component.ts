import { Component, OnInit, ViewChild } from '@angular/core';
import { HubService, UserService, ListGoodsService } from '../../../services';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Constant } from '../../../infrastructure/constant';
import { SelectModel } from '../../../models/select.model';
import { Table } from '../../../../../node_modules/primeng/table';
import { TruckScheduleService } from '../../../services/truckSchedule.service';
import { TruckScheduleStatusService } from '../../../services/truckScheduleStatus.service';
import { BsModalRef, BsModalService, TabsetComponent } from '../../../../../node_modules/ngx-bootstrap';
import { TruckSchedule } from '../../../models/truckSchedule.model';
import { TruckService } from '../../../services/truck.service';
import { Message } from '../../../../../node_modules/primeng/primeng';
import { User } from '../../../models';

import * as moment from "moment";
import { DaterangePickerComponent } from '../../../../../node_modules/ng2-daterangepicker';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { TruckScheduleFilter } from '../../../models/truckScheduleFilter.model';

@Component({
  selector: 'app-quan-ly-chuyen-xe',
  templateUrl: './quan-ly-chuyen-xe.component.html',
  styles: []
})
export class QuanLyChuyenXeComponent extends BaseComponent implements OnInit {

  constructor(private hubService: HubService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private truckScheduleService: TruckScheduleService,
    private truckScheduleStatusService: TruckScheduleStatusService,
    private userService: UserService,
    private truckService: TruckService,
    private listGoodsService: ListGoodsService,
    private modalService: BsModalService,
    private printFrormServiceInstance: PrintFrormServiceInstance) {
    super(messageService, permissionService, router);
  }

  //Page name
  parentPage: string = Constant.pages.quanLyChuyen_VanChuyen.name;
  currentPage: string = Constant.pages.quanLyChuyen_VanChuyen.children.quanLyChuyenXe.name;
  //

  //Dropdown
  fromDate: Date = new Date();;
  toDate: Date = new Date();;

  hubs: SelectModel[] = [];
  selectedFromHub: number;
  selectedToHub: number;

  truckScheduleStatuses: SelectModel[] = [];
  selectedTruckScheduleStatus: number;

  trucks: SelectModel[] = [];
  selectedTruck: number;

  searchText: string = "";

  truckScheduleStatuses_tab1: SelectModel[] = [];

  hubs_tab1: SelectModel[];

  trucks_tab1: SelectModel[] = [];

  riders_tab1: SelectModel[];

  singlePickerOrderDate = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: new Date()
  }

  singlePickerOrderDate_filter = {
    singleDatePicker: true,
    timePicker: false,
    showDropdowns: true,
    opens: "left",
    startDate: new Date()
  }
  //

  //Modal
  modalTitle: string;
  bsModalRef: BsModalRef;
  dataModal: TruckSchedule = new TruckSchedule();

  tuckScheduleStatus_Modal: string;
  //

  //Data  
  idPrint: string;

  truckScheduleFilter: TruckScheduleFilter = new TruckScheduleFilter();
  pageSize = 10;
  totalCount = 0;

  lstData: TruckSchedule[] = [];

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
  dataListGood: any;
  //
  async ngOnInit() {
    this.loadDefaultTruckScheduleFilter();
    this.initData();
    this.loadFilter();
    this.loadFormTab1();
  }

  //#region Tab2
  loadFilter() {
    this.loadDefaultTruckScheduleFilter();
    this.loadHub();
    this.loadTruckScheduleStatus();
    this.loadTruck();
  }

  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
    this.selectedToHub = this.selectedFromHub = null;
  }

  async loadTruckScheduleStatus() {
    this.truckScheduleStatuses = await this.truckScheduleStatusService.getAllSelectModelAsync();
    this.selectedTruckScheduleStatus = null
  }

  async loadTruck() {
    this.trucks = await this.truckService.getAllSelectModelAsync();
    this.selectedTruck = null;
  }
  //

  // Data
  loadDefaultTruckScheduleFilter() {
    this.searchText = null;
    this.fromDate = this.toDate = new Date();

    this.truckScheduleFilter = new TruckScheduleFilter();

    this.truckScheduleFilter.cols = [
      Constant.classes.includes.truckSchedule.fromHub,
      Constant.classes.includes.truckSchedule.toHub,
      Constant.classes.includes.truckSchedule.truckScheduleStatus,
      Constant.classes.includes.truckSchedule.truck
    ].join(",");


    this.truckScheduleFilter.fromDate = this.getStartDate(new Date());
    this.truckScheduleFilter.toDate = this.getEndDate(new Date());
    this.truckScheduleFilter.pageNumber = 1;
    this.truckScheduleFilter.pageSize = this.pageSize;
  }

  async initData() {
    let res = await this.truckScheduleService.searchTruckSchedule(this.truckScheduleFilter);
    if (res.isSuccess) {
      this.lstData = res.data;
      this.totalCount = res.dataCount;
    }
  }

  showRiders(riders: User[]) {
    var ridersName = "";
    if (riders && riders.length > 0) {
      ridersName = riders.map(x => x.fullName).join(", ");
    }
    return ridersName;
  }
  //

  // Hàm xủ lý
  refresh() {
    this.loadFilter();
    this.initData();
  }

  getStartDate(date: Date) {
    const currentDate = moment(date).format("YYYY/MM/DD");
    return currentDate + "T01:00:00";
  }

  getEndDate(date: Date) {
    const currentDate = moment(date).format("YYYY/MM/DD");
    return currentDate + "T23:59:59";
  }

  async print(data: TruckSchedule) {
    data["fakeId"] = "id" + data.id;
    data["shipmentNumber"] = data.code;

    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHub);
    data.listGood = await this.listGoodsService.GetListGoodsByTruckScheduleIdAsync(data.id, includes);

    this.idPrint = PrintHelper.printTruckSchedule;
    console.log(data);
    
    setTimeout(() => {
      this.printFrormServiceInstance.sendCustomEvent(data);
    }, 0);
  }

  edit(data: TruckSchedule, tabset: TabsetComponent) {
    this.dataModal = Object.assign({}, data);
    if (data.riders && data.riders.length > 0) {
      this.dataModal.riderIds = data.riders.map(x => x.id);
    }
    if (data.startDatetime) {
      this.dataModal.startDatetime = this.singlePickerOrderDate.startDate = new Date(data.startDatetime);
    }
    tabset.tabs[0].active = true;
  }

  openDeleteModal(template: any, data: TruckSchedule) {
    this.dataModal = Object.assign({}, data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  async delete() {
    let res = await this.truckScheduleService.deleteAsync(this.dataModal);
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Xóa thành công"
      });
      this.initData();
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: res.message
      })
    }
    this.bsModalRef.hide();
  }

  changeFromHub() {
    this.truckScheduleFilter.fromHubId = this.selectedFromHub;
    this.initData();
  }

  changeToHub() {
    this.truckScheduleFilter.toHubId = this.selectedToHub;
    this.initData();
  }

  changeTruckScheduleStatus() {
    this.truckScheduleFilter.truckScheduleStatusId = this.selectedTruckScheduleStatus;
    this.initData();
  }

  changeTruck() {
    this.truckScheduleFilter.truckId = this.selectedTruck;
    this.initData();
  }

  selectedFromDate(value: any) {
    this.fromDate = value.start;
    this.truckScheduleFilter.fromDate = this.getStartDate(value.start);
    this.initData();
  }

  selectedToDate(value: any) {
    this.toDate = value.start;
    this.truckScheduleFilter.toDate = this.getEndDate(value.start);
    this.initData();
  }

  changeSearchText() {
    this.truckScheduleFilter.searchText = this.searchText;
    this.initData();
  }

  onPageChange(event: any) {
    this.truckScheduleFilter.pageNumber = event.first / event.rows + 1;
    this.truckScheduleFilter.pageSize = event.rows;
    setTimeout(() => {
      this.initData();
    }, 0);
  }

  //#endregion

  //#region Tab1
  async loadDropdown_Tab1() {
    await this.loadHub_tab1();
    await this.loadTruckScheduleStatus_tab1();
    await this.loadTruck_tab1();
    await this.loadRiders_tab1();
  }

  async loadHub_tab1() {
    this.hubs_tab1 = await this.hubService.getAllHubSelectModelAsync();
  }

  async loadTruckScheduleStatus_tab1() {
    this.truckScheduleStatuses_tab1 = await this.truckScheduleStatusService.getAllSelectModelAsync();
  }

  async loadTruck_tab1() {
    this.trucks_tab1 = await this.truckService.getAllSelectModelAsync();
  }

  async loadRiders_tab1() {
    this.riders_tab1 = await this.userService.getMultiselectRiderAllHubAsync();
  }
  //

  // Hàm xử lý
  async loadFormTab1() {
    await this.loadDropdown_Tab1();

    this.dataModal = new TruckSchedule();
    this.dataModal.name = this.dataModal.code = "";
    this.dataModal.truckScheduleStatus = this.truckScheduleStatuses_tab1[1].data;
    this.dataModal.truckScheduleStatusId = this.truckScheduleStatuses_tab1[1].value;
    this.dataModal.sealNumber = "";
    this.dataModal.totalBox = this.dataModal.totalWeight = this.dataModal.startKM = 0;
    this.dataModal.startDatetime = this.singlePickerOrderDate.startDate = new Date();
  }

  singleSelectOrderDate(value: any) {
    this.dataModal.startDatetime = value.start;
  }

  async save() {
    if (!this.isValidData()) return;
    if (this.dataModal.startDatetime) {
      this.dataModal.startDatetime = moment(this.dataModal.startDatetime).format("YYYY/MM/DDTHH:mm");
    }

    if (this.dataModal.id) {
      let res = await this.truckScheduleService.updateAsync(this.dataModal);
      if (res.isSuccess) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo chuyến xe thành công"
        })
        this.initData();
        this.loadFormTab1();
      }
      else {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: res.message
        })
      }
    }
    else {
      this.dataModal.code = this.dataModal.name = "LOL";
      let res = await this.truckScheduleService.createAsync(this.dataModal);
      if (res.isSuccess) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo mới thành công"
        });
        this.initData();
        this.loadFormTab1();
      }
      else {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: res.message
        })
      }
    }
  }

  isValidData() {
    let result: boolean = true;
    let messages: Message[] = [];
    this.messageService.clear();

    if (!this.dataModal.fromHubId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn TT/CN/TRẠM đi"
      });
      result = false;
    }

    if (!this.dataModal.toHubId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn TT/CN/TRẠM đến"
      });
      result = false;
    }

    if (this.dataModal.fromHubId && this.dataModal.toHubId && this.dataModal.fromHubId == this.dataModal.toHubId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Trạm đến phải khác với trạm đi"
      });
      result = false;
    }

    if (!this.dataModal.truckId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn xe"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }
  //
  //#endregion
}
