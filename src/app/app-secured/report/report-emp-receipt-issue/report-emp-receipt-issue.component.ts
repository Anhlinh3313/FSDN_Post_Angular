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
import { User } from '../../../models';
import { TruckService } from '../../../services/truck.service';
import { ReportEmpReceiptIssue } from '../../../models/reportEmpReceiptIssue.model';
import { ReportEmpReceiptIssueFilter } from '../../../models/reportEmpReceiptIssueFilter.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { LazyLoadEvent } from 'primeng/primeng';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;


@Component({
  selector: 'app-report-emp-receipt-issue',
  templateUrl: './report-emp-receipt-issue.component.html',
  styles: []
})
export class ReportEmpReceiptIssueComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
    private userService: UserService,
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
    { field: 'issueHubName', header: 'Bưu cục/Kho nhận' },
    { field: 'fromProvinceName', header: 'Từ tỉnh' },
    { field: 'toProvinceName', header: 'Đến tỉnh' },
    { field: 'issueCode', header: 'Chuyến hàng' },
    { field: 'truckNumber', header: 'Số xe' },
    { field: 'totalBox', header: 'Số kiện' },
    { field: 'weight', header: 'Trọng lượng' },
    { field: 'calWeight', header: 'Trọng lượng quy đổi' },
    { field: 'totalPriceAll', header: 'Doanh thu' }
  ];

  datasource: ReportEmpReceiptIssue[];
  lstData: ReportEmpReceiptIssue[];
  event: LazyLoadEvent;
  totalCount: number = 0;
  filterModel: ReportEmpReceiptIssueFilter = new ReportEmpReceiptIssueFilter();

  // Dropdown
  hubs: SelectModel[] = [];

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
    this.filterModel = new ReportEmpReceiptIssueFilter();
    this.loadData();
  }

  //#region Load data
  async loadData() {
    this.lstData = await this.reportService.getReportEmpReceiptIssue(this.filterModel) || [];
    this.totalCount = this.lstData.length;
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

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
        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.lstData = filterRows.slice(event.first, event.first + parseInt(event.rows.toString()));
        this.totalCount = filterRows.length;
      }
    }, 250);
  }

  async changeFilter() {
  }
  //#endregion

  //#region Filter
  loadFilter() {
    this.loadHub();
  }

  async loadHub() {
    this.hubs = await this.hubService.getAllSelectModelAsync();
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
          this.filterModel.userId = x.value;
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
        this.filterModel.userId = findCus.data.id;
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

