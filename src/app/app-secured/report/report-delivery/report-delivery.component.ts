import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, SelectItemGroup } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService, ServiceDVGTService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PersistenceService } from 'angular-persistence';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ReportDelivery } from '../../../models/reportDelivery.model';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';

@Component({
  selector: 'app-report-delivery',
  templateUrl: './report-delivery.component.html'
})
export class ReportDeliveryComponent extends BaseComponent implements OnInit {
  typeDelivery: string;
  isSuccessDelivery: boolean;
  constructor( protected messageService: MessageService,
    private hubService: HubService,
    private userService: UserService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportDelivery.name;

  //============================
  //BEGIN
  //============================
  txtFilterGb: any;
  rowPerPage = 20;
  totalRecords: number;
  columns: string[] = ["code", "name", "fullName", "totalListGoods", "totalListGoodsRecived", "totalShipmentDelivered", "totalShipmentDelivering",
    "totalShipmentDeliveryFaile", "totalShipmentWaiting"];

  columnsExport = [
    { field: 'code', header: 'Mã' },
    { field: 'name', header: 'Chi nhánh' },
    { field: 'fullName', header: 'Tên nhân viên' },
    { field: 'totalListGoods', header: 'Tổng bảng kê đã phân' },
    { field: 'totalListGoodsRecived', header: 'Tổng bảng kê xác nhận' },
    { field: 'totalShipmentWaiting', header: 'Tổng vận đơn chờ xác nhận' },
    { field: 'totalShipmentDelivering', header: 'Tổng vận đơn đang đi giao' },
    { field: 'totalShipmentDeliveryFaile', header: 'Tổng vận đơn giao không thành công' },
    { field: 'totalShipmentDelivered', header: 'Tổng vận đơn đã giao thành công' },
  ];

  //
  receiverHubs: SelectItemGroup[];
  selectedHub: number = null;
  receiverHub: SelectItem[];
  placeHolderReceiverHub: string = "Chọn dữ liệu";
  //

  //
  isAllowChild: boolean = false;
  //

  //
  riders: SelectItem[];
  selectedRider: number = null;
  //

  datasource: ReportDelivery[];
  listData: ReportDelivery[];
  event: LazyLoadEvent;

  public dateRange = {
    start: moment(),
    end: moment()
  }

  selectedDateFrom: any;
  selectedDateTo: any;
  //============================
  //END 
  //============================

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.selectedDateFrom = this.dateRange.start.add(0, 'd').toDate();
    this.selectedDateTo = this.dateRange.end.toDate();

    this.loadShipment();
    this.loadGroupReceiverHubs();
    this.loadRider();
  }
  //======== BEGIN METHOD ListReceiveMoney ======= 
  loadShipment(type?: string) {
    this.reportService.getReportDeliveryByListGoods(this.selectedDateFrom, this.selectedDateTo, [], this.isAllowChild, this.selectedHub, this.selectedRider).subscribe(x => {
      this.datasource = x.data as ReportDelivery[];
      this.totalRecords = this.datasource.length;
      this.listData = this.datasource.slice(0, this.rowPerPage);
    });
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        var filterRows = this.datasource;

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;
      }
    }, 250);
  }

  changeHub() {
    this.loadShipment();
  }

  changeRider() {
    this.loadShipment();
  }

  changeIsAllowChild() {
    this.loadShipment();
  }

  refresh() {
    this.loadGroupReceiverHubs();
    this.loadRider();
    this.isAllowChild = false;
    this.loadShipment();
  }

  changeFilter() {
    this.loadLazy(this.event);
  }

  public eventLog = '';

  public selectedDate(type?: string) {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.loadShipment(type);
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }

  //======== END METHOD ListReceiveMoney ======= 

  onViewSuccessDelivery() {
    if (this.isSuccessDelivery) {
      this.typeDelivery = "success";
      this.loadShipment(this.typeDelivery);
    } else {
      this.typeDelivery = null;
      this.loadShipment();
    }
  }

  async loadRider() {
    this.selectedRider = null;
    // this.riders = await this.userService.getSelectModelEmpByCurrentHubAsync();
    this.riders = await this.userService.getSelectItemRiderAllHubAsyncTransfer();
  }

  async loadGroupReceiverHubs() {
    this.receiverHubs = [];
    this.receiverHub = [];
    this.selectedHub = null;
    const hubs = await this.hubService.getAllAsync();
    if (hubs) {
      hubs.forEach(element => {
        if (element.centerHubId) {
          // get SelectItemHubs with tag Title
          this.receiverHub.push({
            label: element.name, value: element.id, title: element.centerHubId.toString()
          });
        } else {
          this.receiverHub.push({
            label: element.name, value: element.id, title: element.id.toString()
          });
        }
      });
    }

    let groupOfCenterHubs = this.receiverHub.reduce((outData, item) =>
      // group all Hubs by title
      Object.assign(outData, { [item.title]: (outData[item.title] || []).concat(item) })
      , []);

    groupOfCenterHubs.forEach(x => {
      this.receiverHubs.push({
        label: `-- ${x[0].label} --`,
        items: x,
      });
    });
  }
}
