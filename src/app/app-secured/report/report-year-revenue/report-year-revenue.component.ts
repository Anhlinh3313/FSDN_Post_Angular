import { Component, OnInit, TemplateRef } from '@angular/core';

import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService, LazyLoadEvent } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CustomerService, ReportService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as moment from 'moment';
import { ReportRevenueYear } from '../../../models/reportRevenueYear.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
    selector: 'app-report-year-revenue',
    templateUrl: 'report-year-revenue.component.html',
    styles: []
})

export class ReportYearRevenueComponent extends BaseComponent implements OnInit {

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportYearRevenue.name;
    //
    listYear: SelectModel[] = [];
    selectedYear: any;
    selectedDateFrom: any;
    selectedDateTo: any;
    //
    event: LazyLoadEvent;
    columns: [];
    //
    columnsExp: any[] = [
        { field: "numberAutoUp", header: 'STT' },
        { field: "name", header: 'Tên Khách hàng' },
        { field: "code", header: 'Mã khách hàng', typeFormat: "stringNumber" },
        { field: "totalPrice1", header: 'Tổng phí DV tháng 1', typeFormat: "number", isSum: true },
        { field: "totalPrice2", header: 'Tổng phí DV tháng 2', typeFormat: "number", isSum: true },
        { field: "totalPrice3", header: 'Tổng phí DV tháng 3', typeFormat: "number", isSum: true },
        { field: "totalPrice4", header: 'Tổng phí DV tháng 4', typeFormat: "number", isSum: true },
        { field: "totalPrice5", header: 'Tổng phí DV tháng 5', typeFormat: "number", isSum: true },
        { field: "totalPrice6", header: 'Tổng phí DV tháng 6', typeFormat: "number", isSum: true },
        { field: "totalPrice7", header: 'Tổng phí DV tháng 7', typeFormat: "number", isSum: true },
        { field: "totalPrice8", header: 'Tổng phí DV tháng 8', typeFormat: "number", isSum: true },
        { field: "totalPrice9", header: 'Tổng phí DV tháng 9', typeFormat: "number", isSum: true },
        { field: "totalPrice10", header: 'Tổng phí DV tháng 10', typeFormat: "number", isSum: true },
        { field: "totalPrice11", header: 'Tổng phí DV tháng 11', typeFormat: "number", isSum: true },
        { field: "totalPrice12", header: 'Tổng phí DV tháng 12', typeFormat: "number", isSum: true },
        { field: "totalAmount", header: `Tổng ${this.selectedYear}`, typeFormat: "number", isSum: true },
    ];
    //
    datasource: ReportRevenueYear[];
    listData: ReportRevenueYear[];
    totalRecords: number;
    totalRecevice: number = 0;
    maxRecordExport: number;
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //
        public customerService: CustomerService,
        public reportService: ReportService
    ) {
        super(messageService, permissionService, router);
    }
    ngOnInit() {
        let gYear = (new Date()).getFullYear();
        for (let i = gYear; i > (gYear - 5); i--) {
            this.listYear.push({ value: i, label: `Năm ${i}` });
        }
        this.selectedYear = gYear;
        this.changeFilter();
    }
    //
    public selectedDate() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    }
    selectedYearr(){
        this.reportService.getReportRevenueYear(this.selectedYear).then(
            x => {
                this.datasource = x;
            }
        )
    }
    //
    changeFilter() {
        this.reportService.getReportRevenueYear(this.selectedYear).then(
            x => {
                this.datasource = x;
                this.loadLazy(this.event);
            }
        )
        this.loadLazy(this.event);
    }
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.datasource) {
                var filterRows;
                if (event.filters && event.filters.length > 0)
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
    async exportCSV(dt: any) {
        var options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
        };
        if (dt) {
            let fileName = "BAO_CAO_DOANH_THU_NAM.xlsx";
            if (this.totalRecords > 0) {
                if (this.totalRecords > this.maxRecordExport) {
                    let data: any[] = [];
                    let count = Math.ceil(this.totalRecords / this.maxRecordExport);
                    let promise = [];

                    for (let i = 1; i <= count; i++) {
                        let clone = this.selectedYear;

                        promise.push(await this.reportService.getReportRevenueYear(clone));
                    }
                    Promise.all(promise).then(rs => {
                        rs.map(x => {
                            data = data.concat(x.data);
                        });

                        let dataE = data.reverse();
                        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp, false, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                } else {
                    let clone = this.selectedYear;
                    // clone.PageNumber = 1;
                    // clone.PageSize = this.totalRecords;

                    this.reportService.getReportRevenueYear(clone).then(x => {
                        let data = x.reverse();
                        dt.value = data;
                        var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExp, true, true);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                }
            } else {
                dt.exportCSV();
            }
        }
    }

    sumValue(datas: any[], field: string) {
        let sum = 0;
        if (datas && datas.length) datas.map(m => sum += (m[field] ? m[field] : 0));
        return Math.round(sum);
    }
}
