import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { HubService, ReportService, CustomerService, ProvinceService, UserService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer, User } from '../../../models/index';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { ReportLadingSchedule } from '../../../models/reportLadingSchedule.model';
import { ReportLadingScheduleFilter } from '../../../models/reportLadingScheduleFilter.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

@Component({
  selector: 'app-report-lading-schedule',
  templateUrl: './report-lading-schedule.component.html',
  styles: []
})
export class ReportLadingScheduleComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
    private provinceService: ProvinceService,
    private customerService: CustomerService,
    private userService: UserService
  ) {
    super(messageService, permissionService, router);
  }

  // Page
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportLadingSchedule.name;
  //

  // Modal
  bsModalRef: BsModalRef;
  //

  // Data
  columns: [
    { field: 'fromProvinceName', header: 'Từ tỉnh' },
    { field: 'toProvinceName', header: 'Đến tỉnh' },
    { field: 'customerTypeName', header: 'Loại khách hàng' },
    { field: 'shipmentNumber', header: 'Số vận đơn' },
    { field: 'orderDate', header: 'Ngày vận đơn' },
    { field: 'thoiGianNhapKho', header: 'Thời gian nhập kho(nhận)' },
    { field: 'thoiGianXuatKho', header: 'Thời gian xuất kho(giao)' },
    { field: 'deliverUserName', header: 'Nhân viên giao hàng' },
    { field: 'realRecipientName', header: 'Tên người nhận' },
    { field: 'endDeliveryTime', header: 'Thời gian giao hàng Hình ảnh' },
    { field: 'isReturn', header: 'Hoàn trả hàng' },
    { field: 'shipmentTypeName', header: 'Chuyển hoàn chứng từ' },
    { field: 'relativeShipmentNumber', header: 'Vận đơn liên quan' },
    { field: 'maBangKeTienCuocDaNop', header: 'Tiền cước đã nộp' },
    { field: 'maBangKeCODDaNop', header: 'COD đã nộp' },
    { field: 'deliveryDate', header: 'Deadline giao hàng' },
    { field: 'kPI', header: 'KPI' }
  ];

  lstData: ReportLadingSchedule[] = [];
  totalCount: number = 0;
  filterModel: ReportLadingScheduleFilter = new ReportLadingScheduleFilter();

  // Dropdown
  hubs: SelectModel[] = [];
  provinces: SelectModel[] = [];

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;
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
    this.filterModel = new ReportLadingScheduleFilter();
    this.loadData();
  }

  //#region Load data
  async loadData() {
    this.lstData = await this.reportService.getReportLadingSchedule(this.filterModel) || [];
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
    this.loadHub();
    this.loadProvince();
  }

  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
  }

  async loadProvince() {
    this.provinces = await this.provinceService.getAllSelectModelAsync();
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

  // filter Employee
  async filterEmployee_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;
    let index = cloneSelectedUser.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedUser.substring(0, index);
      cloneSelectedUser = users;
    }
    this.employees_2.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.deliveryUserId = x.value;
          this.changeFilter();
        }
      }
    });
  }

  async keyTabEmployee_2(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees_2.length == 1) {
        findCus = this.employees_2[0];
      } else {
        findCus = this.employees_2.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.deliveryUserId = findCus.data.id;
        this.employee_2 = findCus.label;
        this.changeFilter();
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //
  //#endregion
}
