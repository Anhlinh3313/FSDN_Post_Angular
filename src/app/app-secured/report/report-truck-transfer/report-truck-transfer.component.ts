import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { HubService, ReportService, CustomerService, ProvinceService, UserService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportTruckTransfer } from '../../../models/reportTruckTransfer.model';
import { User } from '../../../models';
import { ReportTruckTransferFilter } from '../../../models/reportTruckTransferFilter.model';
import { TruckService } from '../../../services/truck.service';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;


@Component({
  selector: 'app-report-truck-transfer',
  templateUrl: './report-truck-transfer.component.html',
  styles: []
})
export class ReportTruckTransferComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
    private provinceService: ProvinceService,
    private customerService: CustomerService,
    private userService: UserService,
    private truckService: TruckService
  ) {
    super(messageService, permissionService, router);
  }

  // Page
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportTruckTransfer.name;
  //

  // Modal
  bsModalRef: BsModalRef;
  //

  // Data
  columns: [
    { field: 'id', header: 'ID' },
    { field: 'shipmentNumber', header: 'Số vận đơn' },
    { field: 'issueDate', header: 'Ngày' },
    { field: 'issueHubName', header: 'Bưu cục/Kho xuất phát' },
    { field: 'fromProvinceName', header: 'Từ tỉnh' },
    { field: 'toProvinceName', header: 'Đến tỉnh' },
    { field: 'issueCode', header: 'Chuyến hàng' },
    { field: 'truckNumber', header: 'Số xe' },
    { field: 'totalBox', header: 'Số kiện' },
    { field: 'weight', header: 'Trọng lượng' },
    { field: 'calWeight', header: 'Trọng lượng quy đổi' },
    { field: 'totalPriceAll', header: 'Doanh thu' }
  ];

  lstData: ReportTruckTransfer[] = [];
  totalCount: number = 0;
  filterModel: ReportTruckTransferFilter = new ReportTruckTransferFilter();

  // Dropdown
  provinces: SelectModel[] = [];
  trucks: SelectModel[] = [];
  //

  // Date
  public dateRange = {
    start: moment(),
    end: moment()
  }
  //

  ngOnInit() {
    this.loadData();
    this.loadFilter();
  }

  refresh() {
    this.filterModel = new ReportTruckTransferFilter();
    this.loadData();
  }

  //#region Load data
  async loadData() {
    this.lstData = await this.reportService.getReportTruckTransfer(this.filterModel) || [];
    this.totalCount = this.lstData.length > 0 ? this.lstData[0].totalCount : 0;
  }

  async changeFilter() {
    this.filterModel.pageNumber = 1;
    this.filterModel.pageSize = 20;

  }

  onPageChange(event: any) {
    this.filterModel.pageNumber = event.first / event.rows + 1;
    this.filterModel.pageSize = event.rows;
    this.loadData();
  }
  //#endregion

  //#region Filter
  loadFilter() {
    this.loadProvince();
    this.loadTruck();
  }

  async loadProvince() {
    this.provinces = await this.provinceService.getAllSelectModelAsync();
  }

  async loadTruck() {
    this.trucks = await this.truckService.getAllSelectModelAsync();
  }

  public eventLog = '';

  public selectedDate() {
    this.filterModel.fromDate = SearchDate.formatToISODate(moment(this.filterModel.fromDate).toDate());
    this.filterModel.toDate = SearchDate.formatToISODate(moment(this.filterModel.toDate).toDate());
    this.changeFilter();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }
  //#endregion
}
