import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService, LazyLoadEvent, DataTable } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CustomerService, ReportService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as moment from 'moment';
import { ReportRevenueMonth } from '../../../models/reportRevenueMonth.model';
import { ReportByCusFilter } from '../../../models/ReportByCusFilter.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
    selector: 'app-report-monthly-revenue',
    templateUrl: 'report-monthly-revenue.component.html',
    styles: []
})

export class ReportMonthlyRevenueComponent extends BaseComponent implements OnInit {
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        public reportService: ReportService,
        //
        public customerService: CustomerService,
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportMonthlyRevenue.name;
    //
    customers: SelectModel[];
    customer: any;
    selectedDateFrom: any;
    selectedDateTo: any;
    //
    event: LazyLoadEvent;
    columns: [];
    //
    columnsExp: any[] = [
        { field: "numberAutoUp", header: 'STT' },
        { field: "name", header: 'Tên khách hàng' },
        { field: "code", header: 'Mã khách hàng', typeFormat: "stringNumber" },
        { field: "totalShipment", header: 'Tổng số bill', typeFormat: "number", isSum: true },
        { field: "totalCOD", header: 'Tổng COD', typeFormat: "number", isSum: true },
        { field: "totalInsured", header: 'Tổng giá trị HH', typeFormat: "number", isSum: true },
        { field: "totalWeight", header: 'Tổng trọng lượng', typeFormat: "number", isSum: true },
        { field: "totalBox", header: "Tổng số kiện ", typeFormat: "number", isSum: true },
        { field: "totalDefaultPrice", header: "Tổng phí vận chuyển", typeFormat: "number", isSum: true },
        { field: "totalPriceCOD", header: "Tổng phí thu hộ", typeFormat: "number", isSum: true },
        { field: "totalRemoteAreaPrice", header: "Tổng phụ phí VXVS", typeFormat: "number", isSum: true },
        // { field: "totalPriceDVGT", header: "Tổng phụ phí khác", typeFormat: "number", isSum: true },
        { field: "totalPricePay", header: "Tổng phí DV", typeFormat: "number", isSum: true },
    ];
    //
    filter: ReportByCusFilter = new ReportByCusFilter();
    datasource: ReportRevenueMonth[];
    listData: ReportRevenueMonth[];
    totalRecords: number;
    maxRecordExport: number;
    totalRecevice: number = 0;
    ngOnInit() {
    }
    //
    public selectedDate() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    }
    //
    changeFilter() {
        this.filter.dateFrom = this.selectedDateFrom;
        this.filter.dateTo = this.selectedDateTo;
        this.reportService.getReportRevenueMonth(this.filter).then(
            x => {
                this.datasource = x;
                this.loadLazy(this.event);
            }
        )
    }
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.datasource) {
                var filterRows;
                if (event.filters.length > 0)
                    filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
                else
                    filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
                filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
                this.listData = filterRows.slice(event.first, (event.first + event.rows))
                this.totalRecords = filterRows.length;
            }
        }, 250);
    }
    //
    refresh() {
    }
    //
    sumValue(datas: any[], field: string) {
        let sum = 0;
        if (datas && datas.length) datas.map(m => sum += (m[field] ? m[field] : 0));
        return Math.round(sum);
    }
    //
    async exportCSV(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_DOANH_THU_THANG.xlsx";
            if (this.totalRecords > 0) {
                // if (this.totalRecords > this.maxRecordExport) {
                //     let data: any[] = [];
                //     let count = Math.ceil(this.totalRecords / this.maxRecordExport);
                //     let promise = [];

                //     for (let i = 1; i <= count; i++) {
                //         let clone = this.filter;
                //         promise.push(await this.reportService.getReportRevenueMonth(clone));
                //     }
                //     Promise.all(promise).then(rs => {
                //         rs.map(x => {
                //             data = data.concat(x.data);
                //         });

                //         let dataE = data.reverse();
                //         var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp);
                //         ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                //     });
                // } else {
                let clone = this.filter;
                // clone.PageNumber = 1;
                // clone.PageSize = this.totalRecords;

                this.reportService.getReportRevenueMonth(clone).then(x => {
                    let data = x.reverse();
                    dt.value = data;
                    var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExp, true, true);
                    ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                });
                // }
            } else {
                dt.exportCSV();
            }
        }
    }
}