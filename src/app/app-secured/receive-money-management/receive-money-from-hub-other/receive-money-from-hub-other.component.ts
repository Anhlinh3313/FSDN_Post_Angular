import { Component, OnInit, TemplateRef } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  RequestShipmentService,
  UserService,
  ShipmentService,
  HubService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  User,
  ListReceiptMoney,
  Hub,
  ListReceiptMoneyStatus
} from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel,
  ListReceiptMoneyViewModel
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ShipmentHubKeeping } from "../../../models/shipmentHubKeeping";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { Daterangepicker } from "ng2-daterangepicker";
import { from } from "rxjs/observable/from";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
declare var jQuery: any;

@Component({
  selector: "app-receive-money-from-hub-other",
  templateUrl: "receive-money-from-hub-other.component.html",
  styles: []
})
export class ReceiveMoneyFromHubOtherComponent extends BaseComponent
  implements OnInit {
    hub = environment;

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    private hubService: HubService,
    private userService: UserService,
    private authService: AuthService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
    this.userService.get(this.authService.getUserId(), ["Hub"]).subscribe(x => {
      let user = x.data as User;
      if (user.hub && user.hub.id && !user.hub.centerHubId) {
        this.loadHub(user.hub.id);
      }
    });
  }

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children
    .receiveMoneyFromHubOther.name;
  
    bsModalRef: BsModalRef;
  //============================
  //BEGIN Danh sách vận đơn nộp tiền
  //============================
  first: number = 0;
  txtFilterGbShipment: any;
  txtFilterGbLeft: any;
  txtFilterGbRight: any;
  txtNote: any;
  toHubs: SelectItem[];
  selectedToHub: Hub;
  datasource: ShipmentHubKeeping[];
  listData: ShipmentHubKeeping[];
  listDataRight: ShipmentHubKeeping[];
  selectedData: ShipmentHubKeeping[];
  selectedDataRight: ShipmentHubKeeping[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  columns: string[] = [
    "shipmentNumber",
    "createdWhen",
    "cODKeeping",
    "totalPriceKeeping",
    "senderName",
    "serviceName",
    "paymentTypeName",
    "shipmentStatusName"
  ];
  //============================
  //END Danh sách vận đơn nộp tiền
  //============================

  //============================
  //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  txtFilterGb: any;
  toHubsLRM: SelectItem[];
  selectedToHubLRM: Hub;
  selectedStatusLRM: ListReceiptMoneyStatus;
  rowPerPageLRM: 20;
  totalRecordsLRM: number;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "id",
    "listReceiptMoneyStatus.name",
    "toHub.name",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "orderDate",
    "userModified.fullName",
    "modifiedWhen"
  ];
  datasourceLRM: ListReceiptMoney[];
  listDataLRM: ListReceiptMoney[];
  eventLRM: LazyLoadEvent;
  statuesLRM: SelectItem[];
  public dateRangeLRM = {
    start: moment(),
    end: moment()
  };
  //============================
  //END Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  ngOnInit() {
    this.initData();
  }

  initData() {
    this.loadListReceitMoney();
    this.listDataRight = [];
    this.selectedData = null;
  }
  loadHub(notContaintId: number) {
    this.hubService.getCenterHub().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let hubs = x.data as Hub[];
      var itemHubs = [];
      hubs.forEach(function (value) {
        if (notContaintId && value.id !== notContaintId) {
          itemHubs.push({ label: value.name, value: value });
        }
      })
      this.toHubs = itemHubs;
      this.selectedToHub = null;
    });
  }
  changeToHub() {
    this.loadShipment(
      this.selectedToHub == null ? undefined : this.selectedToHub.id
    );
  }
  loadShipment(otherHubId: number) {
    if (otherHubId) {
      this.listReceiptMoneyService
        .getListShipmentKeepingByHub(otherHubId, ListReceiptMoneyTypeHelper.HUBOTHER)
        .subscribe(x => {
          let shipments = x.data as ShipmentHubKeeping[];
          this.datasource = shipments;
          this.totalRecords = this.datasource.length;
          this.listData = this.datasource.slice(0, this.rowPerPage);
        });
    } else {
      this.datasource = [];
      this.totalRecords = 0;
      this.listData = [];
    }
  }

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        // search datetime
        if (this.txtFilterGbLeft) {
          let result = SearchDate.searchFullDate(this.txtFilterGbLeft);
          if (result) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGbLeft);
          if (res) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columns)
            );
          }
        }
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;
        // console.log("listData", this.listData);
      }
    }, 250);
  }

  removeDataLeft(listRemove: ShipmentHubKeeping[]) {
    let listClone = Array.from(this.listData);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = [];
  }
  removeDataRight(listRemove: ShipmentHubKeeping[]) {
    let listClone = Array.from(this.listDataRight);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRight = listClone;
    this.selectedDataRight = null;
  }
  assign(rowData: ShipmentHubKeeping) {
    if (!this.selectedToHub) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn trung tâm nhận"
      });
    }
    //add Right 
    this.listDataRight = this.listDataRight.concat([rowData]);
    //remove Left
    var index = this.listData.indexOf(rowData);
    this.datasource.splice(this.datasource.indexOf(rowData), 1);
    this.listData = this.listData.filter((val, i) => i != this.listData.indexOf(rowData));
  }
  unAssign(rowData: ShipmentHubKeeping) {
    //add Left 
    this.datasource.push(rowData);
    this.listData = this.listData.concat([rowData]);
    //remove Right
    this.listDataRight = this.listDataRight.filter((val, i) => i != this.listDataRight.indexOf(rowData));
  }
  onEnterCodeLeft($this: any) {
    if ($this.value) {
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.listData.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) this.assign(rowData);
      });
      $this.value = "";
    }
  }
  onEnterCodeRight($this: any) {
    if ($this.value) {
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.listDataRight.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) this.unAssign(rowData);
      });
      $this.value = "";
    }
  }
  refresh() {
    this.listData = [];
    this.txtNote = null;
    this.selectedToHub = null;
    this.listDataRight = [];
    this.txtFilterGbLeft = null;
    this.txtFilterGbRight = null;
    this.loadShipment(undefined);
    this.first = 0;
  }
  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }
    this.refresh();
  }
  save() {
    if (!this.selectedToHub) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn Trung tâm nhận"
      });
      return;
    }
    if (!this.listDataRight.length) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    let shipments = [];
    let model = new ListReceiptMoneyViewModel();

    shipments = this.listDataRight.map(function (x) {
      return {
        id: x.id,
        cOD: x.codKeeping,
        totalPrice: x.totalPriceKeeping
      };
    });
    model.note = this.txtNote;
    model.shipments = shipments;
    model.toHubId = this.selectedToHub.id;
    this.listReceiptMoneyService
      .createListReceiptMoneyToHubOther(model)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.refresh();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo bảng kê thu tiền thành công"
        });
        this.refreshLRM()
      });
  }

  //======== BEGIN METHOD ListReceiveMoney =======
  loadListReceitMoney() {
    let includes: any = [];
    let includesListReceiptMoney = Constant.classes.includes.listReceiptMoney;
    for (var prop in Constant.classes.includes.listReceiptMoney) {
      includes.push(includesListReceiptMoney[prop]);
    }
    var fromDate = null;
    var toDate = null;
    if (this.dateRangeLRM) {
      fromDate = this.dateRangeLRM.start.add(0, "d").toJSON();
      toDate = this.dateRangeLRM.end.toJSON();
    }
    this.listReceiptMoneyService
      .getListByType(ListReceiptMoneyTypeHelper.HUBOTHER, fromDate, toDate, includes)
      .subscribe(x => {
        this.datasourceLRM = x.data as ListReceiptMoney[];
        this.totalRecordsLRM = this.datasourceLRM.length;
        this.listDataLRM = this.datasourceLRM.slice(0, this.rowPerPageLRM);
        this.listDataLRM = this.listDataLRM.sort((x,y) =>{
          const a = new Date(x.orderDate);
          const b = new Date(y.orderDate);
          if (a > b) return -1;
          return 1;
        })
        this.loadFilterLRM();
      });
  }
  loadLazyListReceiveMoney(event: LazyLoadEvent) {
    this.eventLRM = event;
    setTimeout(() => {
      if (this.datasourceLRM) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLRM)
          );
        //
        if (this.selectedStatusLRM) {
          filterRows = filterRows.filter(
            x => x.listReceiptMoneyStatusId === this.selectedStatusLRM.id
          );
        }

        // search datetime
        if (this.txtFilterGb) {
          let result = SearchDate.searchFullDate(this.txtFilterGb);
          if (result) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columnsLRM)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGb);
          if (res) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columnsLRM)
            );
          }
        }

        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLRM = filterRows.slice(
          event.first,
          event.first + event.rows
        );
        this.totalRecordsLRM = filterRows.length;
      }
    }, 250);
  }
  loadFilterLRM() {
    this.selectedStatusLRM = null;
    let uniqueStatus = [];
    this.statuesLRM = [{ label: "Chọn tất cả", value: null }];

    this.selectedToHubLRM = null;
    let uniqueToHub = [];
    this.toHubsLRM = [{ label: "Chọn tất cả", value: null }];
    this.datasourceLRM.forEach(x => {
      if (
        uniqueStatus.indexOf(x.listReceiptMoneyStatusId) === -1 &&
        x.listReceiptMoneyStatusId
      ) {
        uniqueStatus.push(x.listReceiptMoneyStatusId);
        this.statuesLRM.push({
          label: x.listReceiptMoneyStatus.name,
          value: x.listReceiptMoneyStatus
        });
      }
      //
      if (uniqueToHub.indexOf(x.fromHubId) === -1 && x.fromHubId) {
        uniqueToHub.push(x.fromHubId);
        this.toHubsLRM.push({ label: x.fromHub.name, value: x.fromHub });
      }
    });
    //
  }
  refreshLRM() {
    this.loadListReceitMoney();
    this.txtFilterGb = null;
    this.selectedToHubLRM = null;
    this.selectedStatusLRM = null;
    this.first = 0;
  }
  changeFilterLRM() {
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  lockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.lock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Khóa bảng kê thu tiền thành công"
      });
    });
  }
  unlockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.unlock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Mở khóa bảng kê thu tiền thành công"
      });
    });
  }
  cancelLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.cancel(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Hủy bảng kê thu tiền thành công"
      });
    });
  }
  viewLRM(data: ListReceiptMoney) {
    this.bsModalRef = this.modalService.show(ReceiveMoneyDetailComponent, { class: 'inmodal animated bounceInRight modal-xlg' });
    this.bsModalRef.content.loadData(data);
  }
  public eventLog = "";

  public selectedDateLRM(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    this.loadListReceitMoney();
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  //======== END METHOD ListReceiveMoney =======
}
