import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { DaterangePickerHelper } from '../../../infrastructure/daterangePicker.helper';
import { SelectItem, LazyLoadEvent } from 'primeng/primeng';
import { CustomerService, ReportService } from '../../../services';
import { CustomerHelper } from '../../../infrastructure/customer.helper';
import * as moment from "moment";
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ReportDebtPriceDetailCustomer } from '../../../models/abstract/reportDebtPriceDetailCustomer.interface';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FilterReportDebtPriceDetailCustomerDetailModel } from '../../../models/filterReportDebtPriceDetailCustomerDetail.model';
import { SumOfReport } from '../../../models/abstract/sumOfReport.interface';
import { ExportExcelHelper } from '../../../infrastructure/exportExcel.helper.';

@Component({
  selector: 'app-report-debt-price-detail-customer',
  templateUrl: 'report-debt-price-detail-customer.component.html'
})
export class ReportDebtPriceDetailCustomerComponent extends BaseComponent implements OnInit {
  bsModalRef: BsModalRef;
  pageNum: number = 1;
  rowPerPage: number = 10;
  onPageChangeEvent: any;
  totalRecords: number = 0;
  event: LazyLoadEvent;
  filterRows: ReportDebtPriceDetailCustomer[];
  datasource: ReportDebtPriceDetailCustomer[];
  listData: ReportDebtPriceDetailCustomer[];
  selectedDateTo: any;
  selectedDateFrom: any;
  selectedCustomerType: number;
  customerTypes: SelectItem[] = [];// CustomerHelper.getAllSelectItem();
  selectedCustomer: number;
  customers: SelectItem[];
  mainInput: any = DaterangePickerHelper.mainInput;
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportDebtPriceDetailByCustomer.name;
  columnsExport = [
    { field: "code", header: "Mã KH" },
    { field: "name", header: "Tên khách hàng" },
    { field: "totalBefore", header: "Dư nợ đầu kỳ" },
    { field: "totalBefore", header: "Dư có đầu kỳ" },
    { field: "totalPrice", header: "Cước phát sinh trong kỳ" },
    { field: "totalPricePaid", header: "Cước thanh toán trong kỳ" },
    { field: "totalAfter", header: "Dư nợ cuối kỳ" },
    { field: "totalAfter", header: "Dư có cuối kỳ" },
  ];
  columnsExportDetail = [
    { field: "shipmentNumber", header: "Mã bill" },
    { field: "orderDate", header: "Ngày đi", typeFormat: "date", formatString: "YYYY/MM/DD HH:mm" },
    { field: "weight", header: "Trọng lượng" },
    { field: "fromProvinceCode", field2: "toProvinceCode", header: "Lộ trình" },
    { field: "totalPrice", header: "Dư nợ đầu kỳ" },
    { field: "totalPrice", header: "Dư Có đầu kỳ" },
    { field: "totalPrice", header: "Cước phát sinh trong kỳ" },
    { field: "totalPrice", header: "Cước thanh toán trong kỳ" },
    { field: "totalPrice", header: "Dư nợ cuối kỳ" },
    { field: "totalPrice", header: "Dư Có cuối kỳ" },
  ];

  lstDetail: any[] = [];
  totalCountDetail: number = 0;
  filterListDetail: FilterReportDebtPriceDetailCustomerDetailModel = new FilterReportDebtPriceDetailCustomerDetailModel();
  currentViewCustomer: string;
  eventByCustomerDetail: LazyLoadEvent;
  filterRowByCustomerDetail: any[];
  sumOfReport: SumOfReport;
  sumOfReportDetail: SumOfReport;

  constructor(
    private modalService: BsModalService,
    private reportService: ReportService,
    private customerService: CustomerService,
    private daterangepickerOptions: DaterangepickerConfig,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
  ) {
    super(messageService, permissionService, router);

    this.daterangepickerOptions = DaterangePickerHelper.getSettings(this.daterangepickerOptions);
  }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.selectedDateFrom = moment(new Date()).format("YYYY/MM/DD 00:00");
    this.selectedDateTo = SearchDate.formatToISODate(new Date());
    this.loadCustomer();
    this.loadReportDebtPriceDetailByCusTomer();
  }

  loadCustomer() {
    this.customerService.getAllSelectItemAsync().then(data => {
      if (data) {
        this.customers = data;
      }
    });
  }

  loadReportDebtPriceDetailByCusTomer() {
    this.reportService.getReportDebtPriceDetailByCustomerAsync(
      this.selectedCustomerType, this.selectedCustomer, this.selectedDateFrom, this.selectedDateTo, this.rowPerPage, this.pageNum
    ).then(res => {
      if (res.isSuccess) {
        const data = res.data as ReportDebtPriceDetailCustomer[];
        this.datasource = data;
        this.listData = data;
        this.totalRecords = res.dataCount;
        this.sumOfReport = res.sumOfReport;
      }
    });
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;
        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
        // this.totalRecords = this.filterRows.length;
      }
    }, 250);
  }

  loadLazyByCustomerDetail(event: LazyLoadEvent) {
    this.eventByCustomerDetail = event;
    setTimeout(() => {
      if (this.lstDetail) {
        this.filterRowByCustomerDetail = this.lstDetail;

        this.filterRowByCustomerDetail.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.lstDetail = this.filterRowByCustomerDetail;
      }
    }, 250);
  }

  async loadDataDetail() {
    let res = await this.reportService.getReportDebtPriceDetailByCustomerDetailAsync(this.filterListDetail.customerId, this.filterListDetail.fromDate, this.filterListDetail.toDate, this.filterListDetail.pageSize, this.filterListDetail.pageNumer);
    if (res.isSuccess) {
      this.lstDetail = res.data;
      this.totalCountDetail = res.dataCount;
      this.sumOfReportDetail = res["sumOfReport"];
    }
  }

  async openModel(template: TemplateRef<any>, data: ReportDebtPriceDetailCustomer) {
    this.filterListDetail = new FilterReportDebtPriceDetailCustomerDetailModel();
    this.filterListDetail.customerId = data.id;
    this.filterListDetail.fromDate = this.selectedDateFrom;
    this.filterListDetail.toDate = this.selectedDateTo;
    this.currentViewCustomer = data.code + " - " + data.name;

    await this.loadDataDetail();
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
  }

  onPageChangeDetail(event: any) {
    this.onPageChangeEvent = event;
    this.filterListDetail.pageNumer = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.filterListDetail.pageSize = this.onPageChangeEvent.rows;
    this.loadDataDetail();
  }

  onPageChange(event: any) {
    this.onPageChangeEvent = event;
    this.pageNum = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.rowPerPage = this.onPageChangeEvent.rows;
    this.loadReportDebtPriceDetailByCusTomer();
  }

  calendarEventsHandler(e: any) {
    DaterangePickerHelper.calendarEventsHandler(e);
  }

  selectedDate() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.pageNum = 1;
    this.loadReportDebtPriceDetailByCusTomer();
  }

  changeCustomer() {
    this.pageNum = 1;
    this.loadReportDebtPriceDetailByCusTomer();
  }

  changeCustomerType() {
    this.pageNum = 1;
    this.loadReportDebtPriceDetailByCusTomer();
  }

  exportExcelSummary() {
    const fileName: string = "Báo_cáo_công_nợ_cước_theo_KH_tong-hop";
    this.reportService.getReportDebtPriceDetailByCustomerAsync(
      this.selectedCustomerType, this.selectedCustomer, this.selectedDateFrom, this.selectedDateTo
    ).then(res => {
      if (res.isSuccess) {
        const data = res.data as ReportDebtPriceDetailCustomer[];
        const dataEX = ExportExcelHelper.mapDataToExport(data, this.columnsExport);
        ExportExcelHelper.exportXLSX(dataEX, fileName);
      }
    });
  }

  exportExcelDetail() {
    const fileName: string = "Báo_cáo_công_nợ_cước_theo_KH_chi_tiet";
    this.reportService.getReportDebtPriceDetailByCustomerDetailAsync(
      this.filterListDetail.customerId, this.filterListDetail.fromDate, this.filterListDetail.toDate
    ).then(res => {
      if (res.isSuccess) {
        const data = res.data;
        const dataEX = ExportExcelHelper.mapDataToExport(data, this.columnsExportDetail);
        ExportExcelHelper.exportXLSX(dataEX, fileName);
      }
    });
  }

  refresh() {
    this.pageNum = 1;
    this.rowPerPage = 10;
    this.selectedCustomer = null;
    this.selectedCustomerType = null;
    this.loadReportDebtPriceDetailByCusTomer();
  }
}
