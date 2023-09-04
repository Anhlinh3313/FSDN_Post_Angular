import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService, LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CustomerService, ProvinceService, UserService, ReportService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { Customer, Province, User } from '../../../models';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as moment from 'moment';
import { ReportByCus } from '../../../models/reportByCus.model';
import { ReportByCusFilter } from '../../../models/reportByCusFilter.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';

@Component({
    selector: 'app-report-business-analysis',
    templateUrl: 'report-business-analysis.component.html',
    styles: []
})

export class ReportBusinessAnalysisComponent extends BaseComponent implements OnInit {

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportBusinessAnalysis.name;
    // Calendar
    fromDate: any = moment(new Date()).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    //
    customers: SelectModel[];
    filteredCustomers: any;
    customer: any;
    employee: any;
    employees: any;
    selectedCustomer: number;
    selectedCustomerType: number;
    selectedDateFrom: any;
    selectedDateTo: any;
    filteredEmployees: any;
    customerChange: any;
    //
    selectedUserId: number = null;
    filterModel: ReportByCusFilter = new ReportByCusFilter();
    public dateRange = {
        start: moment(),
        end: moment()
    }
    //
    provinces: SelectItem[] = [];
    multiSelectProvinces: number[] = [];
    //
    event: LazyLoadEvent;
    columns: [];
    //
    datasource: ReportByCus[];
    listData: ReportByCus[];
    totalRecords: number;
    maxRecordExport: number;
    totalRecevice: number = 0;
    rowPerPage = 20;
    //
    columnsExp: any[] = [
        { field: "numberAutoUp", header: 'STT' },
        { field: "code", header: 'Người gửi', typeFormat: "stringNumber" },
        { field: "toProvince", header: 'Tỉnh thành đến' },
        { field: "totalShipment", header: 'Tổng cố vận đơn', typeFormat: "number", isSum: true },
        { field: "totalCOD", header: 'Tổng Số tiền COD', typeFormat: "number", isSum: true },
        { field: "totalInsured", header: 'Tổng Trị giá đơn hàng', typeFormat: "number", isSum: true },
        { field: "totalAmount", header: 'Tổng phí dịch vụ', typeFormat: "number", isSum: true },
        { field: "totalWeight", header: "Tổng trọng lượng", typeFormat: "number", isSum: true },
        { field: "totalBox", header: "Tổng Số kiện", typeFormat: "number", isSum: true },
        { field: "totalShipmentDeliveryComplete", header: "Số đơn hàng giao thành công", typeFormat: "number", isSum: true },
        { field: "l1", header: "Số đơn giao lần 1", typeFormat: "number", isSum: true },
        { field: "l2", header: "Số đơn giao lần 2", typeFormat: "number", isSum: true },
        { field: "l3", header: "Số đơn giao lần 3", typeFormat: "number", isSum: true },
        { field: "totalShipmentReturn", header: "Số đơn hoàn hàng", typeFormat: "number", isSum: true },
    ];
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //
        public reportService: ReportService,
        public customerService: CustomerService,
        public provinceService: ProvinceService,
        public userService: UserService,
    ) {
        super(messageService, permissionService, router);
    }
    ngOnInit() {
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD");
        }
        this.filterModel.dateFrom = fromDate;
        this.filterModel.dateTo = toDate;
        this.loadProvinces();
        this.loadUser();
        this.loadData();
    }
    //
    async loadData() {
        const results = await this.reportService.getReportByCus(this.filterModel)
        if (results) {
            this.datasource = results;
            this.totalRecords = results ? results.length : 0;
            this.listData = this.datasource.slice(0, this.rowPerPage);
        }
    }
    loadProvinces() {
        this.provinces = [];
        this.provinceService.getAll().subscribe(
            x => {
                let objs = x.data as Province[];
                objs.forEach(element => {
                    this.provinces.push({ label: element.name, value: element.id })
                });
            }
        )
    }
    //
    filterCustomers(event) {
        let value = event.query;
        if (value.length >= 2) {
            this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
                x => {
                    if (x.isSuccess == true) {
                        this.customers = [];
                        this.filteredCustomers = [];
                        let data = (x.data as Customer[]);
                        data.map(m => {
                            this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filteredCustomers.push(`${m.code} ${m.name}`);
                        });
                    }
                }
            );
        }
    }
    onSelectedCustomer() {
        let cloneSelectedCustomer = this.customer;
        // let index = cloneSelectedCustomer.indexOf(" -");
        // let customers: any;
        // if (index !== -1) {
        //     customers = cloneSelectedCustomer.substring(0, index);
        //     cloneSelectedCustomer = customers;
        // }
        this.customers.forEach(x => {
            let obj = x.data as Customer;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.selectedCustomer = obj.id;
                    this.changeFilter();
                }
            }
        });
    }
    async changeFilter() {
        if (this.selectedUserId) this.filterModel.listDeliveryIds = `${this.selectedUserId}`;
        else this.filterModel.listDeliveryIds = '';
        if (this.multiSelectProvinces && this.multiSelectProvinces.length > 0) this.filterModel.listProvinceIds = this.multiSelectProvinces.join(',');
        else this.filterModel.listProvinceIds = '';
    }
    changeSender() {
        let cloneSelectedCustomer = this.customerChange;
        if (this.customerChange) {
            let findCus = this.customers.find(f => f.label.indexOf(cloneSelectedCustomer) >= 0);
            if (findCus) {
                this.filterModel.senderId = findCus.value;
            }
        } else {
            this.filterModel.senderId = null;
        }
    }
    public selectedDate() {
        if (this.filterModel.dateFrom && this.filterModel.dateFrom != 'undefined') this.filterModel.dateFrom = SearchDate.formatToISODate(moment(this.filterModel.dateFrom).toDate());
        else this.filterModel.dateFrom = null;
        if (this.filterModel.dateTo && this.filterModel.dateTo != 'undefined') this.filterModel.dateTo = SearchDate.formatToISODate(moment(this.filterModel.dateTo).toDate());
        else this.filterModel.dateTo = null;
        this.loadData();
    }
    // filter Employee
    async loadUser() {
        this.employees = await this.userService.getSelectModelAllUserByCurrentHubAsync();
    }
    //
    // changeFilter() {
    //     this.loadLazy(this.event);
    // }
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.datasource) {
                var filterRows;
                if (event.filters.length > 0)
                    filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
                else
                    filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
                if (this.selectedCustomer) {
                    filterRows = filterRows.filter(
                        x => x.id === this.selectedCustomer
                    );
                }
                if (this.selectedCustomerType) {
                    filterRows = filterRows.filter(
                        x => x.customerTypeId === this.selectedCustomerType
                    );
                }
                filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
                this.listData = filterRows.slice(event.first, (event.first + event.rows))
                this.totalRecords = filterRows.length;
            }
        }, 250);
    }
    keyTabSender(event) {
        let value = event.target.value;
        if (value && value.length > 0) {
            this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
                x => {
                    if (x.isSuccess == true) {
                        this.customers = [];
                        this.filteredCustomers = [];
                        let data = (x.data as Customer[]);
                        data.map(m => {
                            this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filteredCustomers.push(`${m.code} ${m.name}`);
                        });
                        let findCus: SelectModel = null;
                        if (this.customers.length == 1) {
                            findCus = this.customers[0];
                        } else {
                            findCus = this.customers.find(f => f.data.code == value || f.label == value);
                        }
                        if (findCus) {
                            this.selectedCustomer = findCus.value;
                            this.customer = findCus.label;
                        }
                        else {
                            this.selectedCustomer = null
                        }
                        this.changeFilter();
                    } else {
                        this.selectedCustomer = null;
                        this.changeFilter();
                    }
                }
            );
        } else {
            this.selectedCustomer = null;
            this.changeFilter();
        }
    }
    //

    refresh() {
    }
    //
    async exportCSV(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_PHAN_TICH_KINH_DOANH.xlsx";
            if (this.totalRecords > 0) {
                if (this.totalRecords > this.maxRecordExport) {
                    let data: any[] = [];
                    let count = Math.ceil(this.totalRecords / this.maxRecordExport);
                    let promise = [];

                    for (let i = 1; i <= count; i++) {
                        let clone = this.filterModel;
                        // clone.PageNumber = i;
                        // clone.PageSize = this.maxRecordExport;

                        promise.push(await this.reportService.getReportByCus(clone));
                    }
                    Promise.all(promise).then(rs => {
                        rs.map(x => {
                            data = data.concat(x.data);
                        });

                        let dataE = data.reverse();
                        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp, true, true);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                } else {
                    let clone = this.filterModel;
                    // clone.PageNumber = 1;
                    // clone.PageSize = this.totalRecords;

                    this.reportService.getReportByCus(clone).then(x => {
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
