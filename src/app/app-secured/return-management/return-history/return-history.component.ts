import { Component, OnInit, TemplateRef, NgModule } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { CalendarModule } from "primeng/primeng";

import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  RequestShipmentService,
  UserService,
  ShipmentStatusService,
  ReasonService,
  ShipmentService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { Reason } from "../../../models/reason.model";
import { BrowserModule } from "@angular/platform-browser";
///////////////Daterangepicker
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { RequestGetPickupHistory } from "../../../models/requestGetPickupHistory";
import { ShipmentReturnHistory } from "../../../models/shipmentReturnHistory";
import { ShipmentGetReturnHistory } from "../../../models/shipmentGetReturnHistory.model";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
//////////////
declare var jQuery: any;

@Component({
  selector: "app-return-history",
  templateUrl: "return-history.component.html",
  styles: [
    `    
     
  `
  ]
})
export class ReturnHistoryComponent extends BaseComponent implements OnInit {
  first: number = 0;
  txtFilterGb: any;
  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private reasonService: ReasonService,
    private userService: UserService,
    private daterangepickerOptions: DaterangepickerConfig, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
    //DateRangePicker
    this.daterangepickerOptions.settings = {
      locale: { format: environment.formatDate },
      alwaysShowCalendars: false,
      ranges: {
        "Hôm nay": [moment().subtract(0, "day"), moment()],
        "1 tuần": [moment().subtract(7, "day"), moment()],
        "1 tháng trước": [moment().subtract(1, "month"), moment()],
        "3 tháng trước": [moment().subtract(4, "month"), moment()],
        "6 tháng trước": [moment().subtract(6, "month"), moment()],
        "12 tháng trước": [moment().subtract(12, "month"), moment()],
        "2 năm trước": [moment().subtract(24, "month"), moment()]
      }
    };
    //DateRangePickerEnd
  }

  //
  parentPage: string = Constant.pages.delivery.name;
  currentPage: string = Constant.pages.delivery.children.deliveryHistory.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: ShipmentReturnHistory[];
  listData: ShipmentReturnHistory[];
  //
  columns: string[] = [
    "shipmentNumber",
    "shipmentStatusName",
    "ladingScheduleCreatedWhen",
    "shipmentStatusId",
    "cusNote",
    "totalBox",
    "returnInfo",
    "numReturn",
    "returnNote",
    "returnFullName",
    "paymentTypeName",
    "calWeight",
    "weight"
  ];
  datasource: ShipmentReturnHistory[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  defaultRiders: User[];
  ridersLeft: SelectItem[];
  selectedRiderLeft: number;
  //
  reasons: SelectItem[];
  selectedReason: Reason;
  //
  ladingScheduleCreatedWhen: SelectItem[];
  selectedLadingScheduleCreatedWhen: Date[];
  //
  hubRoutings: SelectItem[];
  selectedHubRouting: string;
  //
  dateRageValue: any = new Object();
  deliveryGetReturnHistory: ShipmentGetReturnHistory = new ShipmentGetReturnHistory();

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.userService.getEmpByCurrentHub().subscribe(x => {
      this.defaultRiders = x.data as User[];
      this.loadShipment();
    });

    this.selectedData = null;
  }

  loadShipment() {
    this.shipmentService
      .getReturnHistory(
        this.deliveryGetReturnHistory.fromDate,
        this.deliveryGetReturnHistory.toDate
      )
      .subscribe(x => {
        // console.log("this.requestGetPickupHistory");
        // console.log(this.deliveryGetReturnHistory.toDate);
        // console.log(this.deliveryGetReturnHistory.fromDate);

        this.datasource = x.data as ShipmentReturnHistory[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
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
        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );
        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(
            x => x.shipmentStatusName === this.selectedStatus
          );
        }
        if (this.selectedHubRouting) {
          filterRows = filterRows.filter(
            x => x.fromHubRoutingName === this.selectedHubRouting
          );
        }
        //////DateRangePicker
        if (this.selectedDate) {
          filterRows = filterRows.filter(x =>
            moment(x.ladingScheduleCreatedWhen).isBetween(
              this.deliveryGetReturnHistory.fromDate,
              this.deliveryGetReturnHistory.toDate
            )
          );

          // console.log("this.requestGetPickupHistory");
          // console.log(this.requestGetPickupHistory.toDate);
          // console.log(this.requestGetPickupHistory.fromDate);
        }

        // search datetime
        if (this.txtFilterGb) {
          let result = SearchDate.searchFullDate(this.txtFilterGb);
          if (result) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGb);
          if (res) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columns)
            );
          }
        }

        //End Custom filter
        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  changeFilterLeft() {
    this.loadLazy(this.event);
  }

  loadFilterLeft() {
    //
    this.selectedStatus = null;
    let uniqueStatus = [];
    this.statuses = [];
    //
    this.selectedHubRouting = null;
    let uniqueHubRouting = [];
    this.hubRoutings = [];
    //
    this.ladingScheduleCreatedWhen = [];
    let uniquelLadingScheduleCreatedWhen = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
        this.hubRoutings.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatusName,
          value: x.shipmentStatusName
        });
      }
      //
      if (
        uniqueHubRouting.indexOf(x.fromHubRoutingId) === -1 &&
        x.fromHubRoutingId
      ) {
        uniqueHubRouting.push(x.fromHubRoutingId);
        this.hubRoutings.push({
          label: x.fromHubRoutingName,
          value: x.fromHubRoutingName
        });
      }
      //
      if (
        uniquelLadingScheduleCreatedWhen.indexOf(
          x.ladingScheduleCreatedWhen
        ) === -1 &&
        x.ladingScheduleCreatedWhen
      ) {
        uniquelLadingScheduleCreatedWhen.push(x.ladingScheduleCreatedWhen);
        this.ladingScheduleCreatedWhen.push({
          label: moment(x.ladingScheduleCreatedWhen).format(environment.formatDateTime),
          value: x.ladingScheduleCreatedWhen
        });

        // console.log("x.ladingScheduleCreatedWhen")
        // console.log(x.ladingScheduleCreatedWhen)
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.loadFilterLeft();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.txtFilterGb = null;
    this.first = 0;
  }

  ///////DateRangePicker
  public mainInput = {
    start: moment(),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;

    //
    this.deliveryGetReturnHistory.fromDate = moment(value.start).toDate();
    this.deliveryGetReturnHistory.toDate = moment(value.end).toDate();

    this.refresh();
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
}
