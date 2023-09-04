import { Component, OnInit } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  ListReceiptMoney,
  ListReceiptMoneyStatus
} from "../../../models/index";
import {
  ListReceiptMoneyViewModel
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ShipmentHubKeeping } from "../../../models/shipmentHubKeeping";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
declare var jQuery: any;

@Component({
  selector: "app-receive-money-from-accountant",
  templateUrl: "receive-money-from-accountant.component.html",
  styles: []
})
export class ReceiveMoneyFromAccountantComponent extends BaseComponent
  implements OnInit {
  txtFilterGb: any;
  txtFilterGbShipment: any;
  txtNote: any;
  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children
    .receiveMoneyFromAccountant.name;

  bsModalRef: BsModalRef;
  //============================
  //BEGIN Danh sách vận đơn nộp tiền
  //============================

  datasource: ShipmentHubKeeping[];
  listData: ShipmentHubKeeping[];
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
  //BEGIN Danh sách bảng kê nộp tiền về Thủ quỹ
  //============================
  selectedStatusLRM: ListReceiptMoneyStatus;
  rowPerPageLRM: 20;
  totalRecordsLRM: number;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "id",
    "code",
    "listReceiptMoneyStatus.name",
    "paidByEmp.name",
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
  //END Danh sách bảng kê nộp tiền về Thủ quỹ
  //============================
  ngOnInit() {
    this.initData();
  }

  initData() {
    this.loadShipment();
    this.loadListReceitMoney();
  }
  loadShipment() {
    this.listReceiptMoneyService.getListShipmentKeepingByHub(undefined, ListReceiptMoneyTypeHelper.TREASURER).subscribe(x => {
      let shipments = x.data as ShipmentHubKeeping[];
      this.datasource = shipments;
      this.totalRecords = this.datasource.length;
      this.listData = this.datasource.slice(0, this.rowPerPage);
    });
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
        if (this.txtFilterGbShipment) {
          let result = SearchDate.searchFullDate(this.txtFilterGbShipment);
          if (result) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGbShipment);
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
  refresh() {
    this.listData = [];
    this.loadShipment();
  }

  save() {
    // console.log(this.listData);
    if (!this.listData.length) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    let shipments = [];
    let model = new ListReceiptMoneyViewModel();

    shipments = this.listData.map(function (x) {
      return {
        id: x.id,
        cOD: x.codKeeping,
        totalPrice: x.totalPriceKeeping
      };
    });
    model.shipments = shipments;
    this.listReceiptMoneyService
      .createListReceiptMoneyToTreasurer(model)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.refresh();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo bảng kê thu tiền thành công"
        });
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
      .getListByType(
      ListReceiptMoneyTypeHelper.TREASURER,
      fromDate,
      toDate,
      includes
      )
      .subscribe(x => {
        this.datasourceLRM = x.data as ListReceiptMoney[];
        this.totalRecordsLRM = this.datasourceLRM.length;
        this.listDataLRM = this.datasourceLRM.slice(0, this.rowPerPageLRM);
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
    this.statuesLRM = [];
    this.datasourceLRM.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuesLRM.push({ label: "Chọn tất cả", value: null });
      }
      //
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
    });
    //
  }
  
  refreshLRM() {
    this.loadListReceitMoney();

    //refresh
    this.txtNote = null;
    this.txtFilterGbShipment = null;
    this.txtFilterGb = null;
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
