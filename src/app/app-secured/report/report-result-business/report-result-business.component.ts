import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { UserService, HubService, ReportService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportResultBusiness } from '../../../models/reportResultBusiness.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

@Component({
  selector: 'app-report-result-business',
  templateUrl: './report-result-business.component.html',
  styles: []
})
export class ReportResultBusinessComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    private userService: UserService,
    public permissionService: PermissionService,
    public router: Router,
    private provinceService: ProvinceService
  ) {
    super(messageService, permissionService, router);
  }

  // Page
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportResultBusiness.name;
  //

  // Modal
  bsModalRef: BsModalRef;
  //

  // Data
  rowPerPage = 10;
  totalRecords: number;
  columns: [
    { field: 'id', header: 'STT' },
    { field: 'salerCode', header: 'Mã NV kinh daonh' },
    { field: 'code', header: 'Mã Khách hàng' },
    { field: 'startDate', header: 'Ngày ký hđ' },
    { field: 'createdWhen', header: 'Ngày tạo mã' },
    { field: 'companyName', header: 'Tên Công ty' },
    { field: 'addressCompany', header: 'Địa chỉ' },
    { field: 'taxCode', header: 'Mã số thuế' },
    { field: 'totalShipment', header: 'Tổng bill' },
    { field: 'totalVAT', header: 'Tổng doanh thu cả VAT' }
  ];
  datasource: ReportResultBusiness[];
  listData: ReportResultBusiness[];
  event: LazyLoadEvent;

  // Dropdown
  hubs: SelectModel[];
  selectedHub: number;
  //
  provinces: SelectModel[];
  selectedProvince: number;
  //
  selectedUserId: number;
  // Date
  public dateRange = {
    start: moment(),
    end: moment()
  }
  //
  selectedDateFrom: any;
  selectedDateTo: any;
  //  
  empCurrents: any[] = [];
  empCurrent: any;
  filterEmpCurrents: any[] = [];

  ngOnInit() {
    this.selectedDateFrom = this.dateRange.start.add(0, 'd').toDate();
    this.selectedDateTo = this.dateRange.end.toDate();
    this.loadShipment();
    this.loadFilter();
  }

  refresh() {
    this.loadShipment();
  }

  //#region Load data
  async loadShipment() {
    var fromDate = null;
    var toDate = null;
    if (this.dateRange) {
      fromDate = this.dateRange.start.add(0, 'd').toJSON();
      toDate = this.dateRange.end.toJSON();
    }
    let x = await this.reportService.getReportResultBusiness(fromDate, toDate, this.selectedHub, this.selectedProvince, this.selectedUserId);
    this.datasource = x as ReportResultBusiness[];
    this.totalRecords = this.datasource.length;
    this.listData = this.datasource.slice(0, this.rowPerPage);
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
        this.listData = filterRows.slice(event.first, event.first + parseInt(event.rows.toString()));
        this.totalRecords = filterRows.length;
      }
    }, 250);
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

  changeFilter() {
  }

  public eventLog = '';

  public selectedDate() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }
  //
  filterEmpCurrent(event) {
    let value = event.query;
    if (value.length >= 1) {
        this.userService.getSearchByValueAsync(value, null).then(
            x => {
                if (x) {
                    this.empCurrents = [];
                    this.filterEmpCurrents = [];
                    this.filterEmpCurrents.push('-- Chọn tất cả --');
                    x.map(m => {
                        this.empCurrents.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                        this.filterEmpCurrents.push(`${m.code} ${m.name}`);
                    });
                }
            }
        );
    }
}
onSelectedEmpCurrent() {
    let cloneSelectedEmpCurrent = this.empCurrent;
    let findUser = this.empCurrents.find(f => f.label == cloneSelectedEmpCurrent);
    if (findUser) {
        this.selectedUserId = findUser.value;
    } else {
        this.selectedUserId = null;
    }
    this.loadShipment();
}
  //#endregion
}
