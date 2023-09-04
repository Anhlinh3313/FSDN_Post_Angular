import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { HubService, ReportService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportKPIBusiness } from '../../../models/reportKPIBusiness.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

@Component({
  selector: 'app-report-kpi-business',
  templateUrl: './report-kpi-business.component.html',
  styles: []
})
export class ReportKPIBusinessComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
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
  rowPerPage = 20;
  totalRecords: number;
  columns: [
    { field: 'id', header: 'STT	' },
    { field: 'code', header: 'Mã NV KD' },
    { field: 'fullName', header: 'Họ Tên NVKD	' },
    { field: 'totalCustomer', header: 'Tổng số mã khách hàng' },
    { field: 'totalPriceAll', header: 'Tổng doanh thu' },
    { field: 'percentComplete', header: '% hoàn thành kế hoạch DT' },
    { field: 'percentPayment', header: 'Tỷ lệ thu hồi công nợ đúng hạn' }
  ];
  datasource: ReportKPIBusiness[];
  listData: ReportKPIBusiness[];
  event: LazyLoadEvent;

  // Dropdown
  hubs: SelectModel[];
  selectedHub: number;
  //

  selectedDateFrom: any;
  selectedDateTo: any;

  // Date
  public dateRange = {
    start: moment(),
    end: moment()
  }
  //

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

    let x = await this.reportService.getReportKPIBusiness(this.selectedDateFrom, this.selectedDateTo, this.selectedHub);
    this.datasource = x as ReportKPIBusiness[];
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
  }

  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
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
  //#endregion
}
