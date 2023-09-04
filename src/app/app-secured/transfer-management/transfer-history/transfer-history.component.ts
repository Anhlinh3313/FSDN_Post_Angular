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
  ListUpdateStatusViewModel,
  DateRangeFromTo,
  LadingScheduleHistoryViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { Reason } from "../../../models/reason.model";
import { BrowserModule } from "@angular/platform-browser";
///////////////Daterangepicker
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
//////////////
declare var jQuery: any;

@Component({
  selector: "app-transfer-history",
  templateUrl: "transfer-history.component.html",
  styles: [
    `    
     
  `
  ]
})
export class TransferHistoryComponent extends BaseComponent implements OnInit {
  hub = environment;

  first: number = 0;
  txtFilterGb: any;
  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private reasonService: ReasonService,
    private shipmentStatusService: ShipmentStatusService,
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

  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.transferHistory.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: LadingScheduleHistoryViewModel[];
  listData: LadingScheduleHistoryViewModel[] = [];
  //
  columns: string[] = [
    "shipmentNumber",
    "shipmentStatusName",
    "ladingScheduleCreatedWhen",
    "shipmentStatusId",
    "orderDate",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "fromHubName",
    "fromHubRoutingName",
    "fromProvinceName",
    "fromDistrictName",
    "fromWardName",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "toHubName",
    "toHubRoutingName",
    "toProvinceName",
    "toDistrictName",
    "toWardName",
    "cusNote",
    "totalBox",
    "paymentTypeName",
    "calWeight",
    "weight"
  ];

  columnsFilter = [
     { field: 'shipmentNumber', header: 'Mã' },
     { field: 'shipmentStatusName', header: 'Tình trạng' },
     { field: 'orderDate', header: 'Ngày tạo' },
     { field: 'senderName', header: 'Tên người nhận' },
     { field: 'senderPhone', header: 'SĐT người nhận' },
     { field: 'pickingAddress', header: 'SĐT người nhận' },
     { field: 'fromHubName', header: '{{hub.centerHubSortName}}/{{hub.poHubSortName}}/{{hub.stationHubSortName}} lấy' },
     { field: 'fromHubRoutingName', header: 'Tuyến lấy' },
     { field: 'fromProvinceName', header: 'Tỉnh/Thành lấy' },
     { field: 'fromDistrictName', header: 'Quận/Huyện lấy' },
     { field: 'fromWardName', header: 'Phường/Xã lấy' },
     { field: 'receiverName', header: 'Tên người nhận' },
     { field: 'receiverPhone', header: 'SĐT người nhận' },
     { field: 'shippingAddress', header: 'Địa chỉ giao hàng' },
     { field: 'toHubName', header: '{{hub.centerHubSortName}}/{{hub.poHubSortName}}/{{hub.stationHubSortName}} lấy' },
     { field: 'toHubRoutingName', header: 'Tuyến lấy' },
     { field: 'toProvinceName', header: 'Tỉnh/Thành giao' },
     { field: 'toDistrictName', header: 'Quận/Huyện giao' },
     { field: 'toWardName', header: 'Phường/Xã giao' },
     { field: 'cusNote', header: 'Ghi chú khách hàng' },
     { field: 'totalBox', header: 'Số kiện' },
     { field: 'paymentTypeName', header: 'Hình thức thanh toán' },
     { field: 'calWeight', header: 'Trọng lượng quy đổi' },
     { field: 'weight', header: 'Khối lượng' }
  ];

  datasource: LadingScheduleHistoryViewModel[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  ladingScheduleCreatedWhen: SelectItem[];
  selectedLadingScheduleCreatedWhen: Date[];
  //
  dateRageValue: any = new Object();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  ngOnInit() {
    this.initData();
  }

  initData() {
    // console.log(this.requestGetPickupHistory.fromDate);
    // console.log(this.requestGetPickupHistory.toDate);
    this.loadShipment();
  }

  loadShipment() {
    console.log(this.requestGetPickupHistory.fromDate);
    
    this.shipmentService
      .getTransferHistory(
        this.requestGetPickupHistory.fromDate,
        this.requestGetPickupHistory.toDate
      )
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.datasource = x.data as LadingScheduleHistoryViewModel[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
      });

    //refresh
    this.txtFilterGb = null;
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
            x => x.shipmentStatusId === this.selectedStatus
          );
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
    this.ladingScheduleCreatedWhen = [];
    let uniquelLadingScheduleCreatedWhen = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatusName,
          value: x.shipmentStatusId
        });
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.first = 0;
  }

  ///////DateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;

    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    this.loadShipment();
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
}
