import { Component, OnInit, TemplateRef, NgModule } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CalendarModule } from 'primeng/primeng';

import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { RequestShipmentService, UserService, ShipmentStatusService, ReasonService, ShipmentService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { Shipment } from '../../../models/shipment.model';
import { User } from '../../../models/index';
import { PersistenceService, StorageType } from 'angular-persistence';
import { KeyValuesViewModel, ListUpdateStatusViewModel, LadingScheduleHistoryViewModel, DateRangeFromTo } from '../../../view-model/index';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ReasonHelper } from '../../../infrastructure/reason.helper';
import { Reason } from '../../../models/reason.model';
import { BrowserModule } from '@angular/platform-browser';
///////////////Daterangepicker
import { Daterangepicker } from 'ng2-daterangepicker';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { ShipmentGetDeliveryHistory } from '../../../models/ShipmentGetDeliveryHistory.model';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
//////////////
declare var jQuery: any;

@Component({
  selector: 'app-lading-schedule-history',
  templateUrl: 'lading-schedule-history.component.html',
  styles: [`    
     
  `]
})

export class LadingScheduleHistoryComponent extends BaseComponent implements OnInit {
  hub = environment;

  constructor(private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private reasonService: ReasonService,
    private shipmentStatusService: ShipmentStatusService,
    private userService: UserService,
    private daterangepickerOptions: DaterangepickerConfig,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
    //DateRangePicker
    this.daterangepickerOptions.settings = {
      locale: { format: environment.formatDate },
      alwaysShowCalendars: false,
      ranges: {
        'Hôm nay': [moment().subtract(0, 'day'), moment()],
        '1 tuần': [moment().subtract(7, 'day'), moment()],
        '1 tháng trước': [moment().subtract(1, 'month'), moment()],
        '3 tháng trước': [moment().subtract(4, 'month'), moment()],
        '6 tháng trước': [moment().subtract(6, 'month'), moment()],
        '12 tháng trước': [moment().subtract(12, 'month'), moment()],
        '2 năm trước': [moment().subtract(24, 'month'), moment()],
      }
    };
    //DateRangePickerEnd
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.ladingSchedule.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: LadingScheduleHistoryViewModel[];
  listData: LadingScheduleHistoryViewModel[] = [];
  //
  columns: string[] = ["shipmentNumber", "shipmentStatusName", "ladingScheduleCreatedWhen", "shipmentStatusId"];

  columnsExport = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'shipmentStatusName', header: 'Tình trạng' },
    { field: 'orderDate', header: 'Ngày tạo' },
    { field: 'senderName', header: 'Tên người nhận' },
    { field: 'senderPhone', header: 'SĐT người nhận' },
    { field: 'pickingAddress', header: 'Địa chỉ người nhận' },
    { field: 'fromHubName', header: `${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName} nhận` },
    { field: 'fromHubRoutingName', header: 'Tuyến lấy' },
    { field: 'fromProvinceName', header: 'Tỉnh/Thành lấy' },
    { field: 'fromDistrictName', header: 'Quận/Huyện lấy' },
    { field: 'fromWardName', header: 'Phường/Xã lấy' },
    { field: 'receiverName', header: 'Tên người nhận' },
    { field: 'receiverPhone', header: 'SĐT người nhận' },
    { field: 'shippingAddress', header: 'Địa chỉ giao hàng' },
    { field: 'toHubName', header: `${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName} lấy` },
    { field: 'toHubRoutingName', header: 'Tuyến lấy' },
    { field: 'toProvinceName', header: 'Tỉnh/Thành giao' },
    { field: 'toDistrictName', header: 'Quận/Huyện giao' },
    { field: 'toWardName', header: 'Phường/Xã giao' },
    { field: 'cusNote', header: 'Ghi chú khách hàng' },
    { field: 'totalBox', header: 'Số kiện' },
    { field: 'paymentTypeName', header: 'Hình thức thanh toán' },
    { field: 'calWeight', header: 'Trọng lượng quy đổi' },
    { field: 'weight', header: 'Khối lượng' },
  ]

  datasource: LadingScheduleHistoryViewModel[];
  totalRecords: number;
  totalRecevice: number = 0;
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
    this.requestGetPickupHistory.fromDate = new Date;
    this.requestGetPickupHistory.toDate = new Date;
    this.loadShipment();
  }

  loadShipment() {
    this.shipmentService.getAllHistory(
      this.requestGetPickupHistory.fromDate,
      this.requestGetPickupHistory.toDate
    ).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.datasource = x.data as LadingScheduleHistoryViewModel[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
        this.sumTotalReceive();
      }
    );
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
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(x => x.shipmentStatusId === this.selectedStatus);
        }
        //End Custom filter
        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
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
      if (uniqueStatus.indexOf(x.shipmentStatusId) === -1 && x.shipmentStatusId) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({ label: x.shipmentStatusName, value: x.shipmentStatusId });
      }
    });
  }

  refresh() {
    this.loadShipment();
  }

  ///////DateRangePicker
  public mainInput = {
    start: moment().subtract(0, 'day'),
    end: moment()
  }

  public eventLog = '';

  public selectedDate() {
    this.requestGetPickupHistory.fromDate = SearchDate.formatToISODate(moment(this.requestGetPickupHistory.fromDate).toDate());
    this.requestGetPickupHistory.toDate = SearchDate.formatToISODate(moment(this.requestGetPickupHistory.toDate).toDate());
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.weight);
    }, 0)
  }
}