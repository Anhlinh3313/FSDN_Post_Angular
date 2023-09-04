import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { CustomerService, ReportService } from '../../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { CustomerHelper } from '../../../infrastructure/customer.helper';
import { DaterangePickerHelper } from '../../../infrastructure/daterangePicker.helper';
import { Constant } from '../../../infrastructure/constant';
import { ReportListGoodsPriceDetailCustomer } from '../../../models/abstract/reportListGoodsPriceDetailCustomer.interface';
import * as moment from "moment";
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { ExportExcelHelper } from '../../../infrastructure/exportExcel.helper.';

@Component({
  selector: 'app-report-list-goods-price-detail-customer',
  templateUrl: './report-list-goods-price-detail-customer.component.html',
})
export class ReportListGoodsPriceDetailCustomerComponent extends BaseComponent implements OnInit {
  bsModalRef: BsModalRef;
  pageNum: number = 1;
  rowPerPage: number = 10;
  onPageChangeEvent: any;
  totalRecords: number = 0;
  event: LazyLoadEvent;
  filterRows: ReportListGoodsPriceDetailCustomer[];
  datasource: ReportListGoodsPriceDetailCustomer[];
  listData: ReportListGoodsPriceDetailCustomer[];
  selectedDateTo: any;
  selectedDateFrom: any;
  selectedCustomerType: number;
  customerTypes: SelectItem[] = [];//CustomerHelper.getAllSelectItem();
  selectedCustomer: number;
  customers: SelectItem[];
  mainInput: any = DaterangePickerHelper.mainInput;
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportListGoodsPriceDetailCustomer.name;
  columnsExport = [
    { field: "orderDate", header: "Ngày", typeFormat: "date", formatString: "YYYY/MM/DD HH:mm" },
    { field: "shipmentNumber", header: "Mã vận đơn" },
    { field: "fromProvinceCode", field2: "toProvinceCode", header: "Lộ trình" },
    { field: "weight", header: "T.lượng (kg)" },
    { field: "structureName", header: "Loại" },
    { field: "defaultPrice", header: "Giá (VND)" },
    { field: "fuelPrice", header: "PXD (VND)" },
    { field: "remoteAreasPrice", header: "Phí VSVX (VND)" },
    { field: "vatPrice", header: "VAT (VND)" },
    { field: "totalDVGT", header: "DVGT (VND)" },
    { field: "otherPrice", header: "Phí khác (VND)" },
    { field: "totalPrice", header: "Cộng (VND)" },
  ];

  lstDetail: any[] = [];
  totalCountDetail: number = 0;
  currentViewCustomer: string;
  eventByCustomerDetail: LazyLoadEvent;
  filterRowByCustomerDetail: any[];
  sumOfTotalPrice: number;

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
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  loadCustomer() {
    this.customerService.getAllSelectItemAsync().then(data => {
      if (data) {
        this.customers = data;
      }
    });
  }

  loadReportListGoodsPriceDetailByCusTomer() {
    this.reportService.getReportListGoodsPriceDetailByCustomerAsync(
      this.selectedCustomerType, this.selectedCustomer, this.selectedDateFrom, this.selectedDateTo, this.rowPerPage, this.pageNum
    ).then(res => {
      if (res.isSuccess) {
        const data = res.data as ReportListGoodsPriceDetailCustomer[];
        this.datasource = data;
        this.listData = data;
        this.totalRecords = res.dataCount;
        this.sumOfTotalPrice = res.sumOfReport.sumOfTotalPriceByReportListGoodsPriceCustomer;
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

  onPageChange(event: any) {
    this.onPageChangeEvent = event;
    this.pageNum = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.rowPerPage = this.onPageChangeEvent.rows;
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  calendarEventsHandler(e: any) {
    DaterangePickerHelper.calendarEventsHandler(e);
  }

  selectedDate() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.pageNum = 1;
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  changeCustomer() {
    this.pageNum = 1;
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  changeCustomerType() {
    this.pageNum = 1;
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  exportExcelSummary() {
    const fileName: string = "Báo_cáo_bảng_kê_cước_theo_KH";
    this.reportService.getReportListGoodsPriceDetailByCustomerAsync(
      this.selectedCustomerType, this.selectedCustomer, this.selectedDateFrom, this.selectedDateTo
    ).then(res => {
      if (res.isSuccess) {
        const data = res.data as ReportListGoodsPriceDetailCustomer[];
        const dataEX = ExportExcelHelper.mapDataToExport(data, this.columnsExport);
        ExportExcelHelper.exportXLSX(dataEX, fileName);
      }
    });
  }

  refresh() {
    this.pageNum = 1;
    this.rowPerPage = 10;
    this.selectedCustomer = null;
    this.selectedCustomerType = null;
    this.loadReportListGoodsPriceDetailByCusTomer();
  }

  onScrollPTable(e: any) {
    console.log("onScrollPTable");
    console.log(e);
  }

}
