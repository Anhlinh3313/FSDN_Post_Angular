import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { HubService, ReportService, CustomerService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer, Hub } from '../../../models/index';
import { ReportCustomer } from '../../../models/reportCustomer';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';

@Component({
    selector: 'app-report-customer',
    templateUrl: 'report-customer.component.html',
    styles: []
})
export class ReportCustomerComponent extends BaseComponent implements OnInit {
    constructor(protected messageService: MessageService,
        private hubService: HubService,
        private reportService: ReportService,
        public permissionService: PermissionService,
        public router: Router,
        private customerService: CustomerService
    ) {
        super(messageService, permissionService, router);
    }

    customer: any;
    filteredCustomers: any;

    selectedDateFrom: any;
    selectedDateTo: any;

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportCustomer.name;

    //============================
    //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
    //============================
    rowPerPage = 20;
    totalRecords: number;
    totalRecevice: number = 0;
    columns: ["code", "createdWhen", "", "listReceiptMoneyStatus.name",
        "paidByEmp.fullName", "totalPrice", "totalCOD", "grandTotal", "userCreated.fullName", "createdWhen", "userModified.fullName", "modifiedWhen"];
    datasource: ReportCustomer[];
    listData: ReportCustomer[];
    event: LazyLoadEvent;
    selectedCustomerId?: any;
    selectedCustomer: number;
    selectedCustomerType: number;
    customers: SelectModel[];
    customerTypes: SelectItem[];
    //
    hubs: SelectModel[] = [];
    selectedHub: string;
    selectedHubId?: any;
    filteredHubs: string[] = [];
    //
    public dateRange = {
        start: moment(),
        end: moment()
    }
    //============================
    //END Danh sách bảng kê nộp tiền về TT/CN/T
    //============================

    ngOnInit() {
        this.initData();
    }

    initData() {
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD");
        }

        this.selectedDateFrom = fromDate;
        this.selectedDateTo = toDate

        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    loadShipment() {
        this.reportService.getReportCustomer(null, this.selectedCustomerId, this.selectedDateFrom, this.selectedDateTo, this.selectedHubId)
            .subscribe(x => {
                this.datasource = x.data as ReportCustomer[];
                this.totalRecords = this.datasource.length;
                this.listData = this.datasource.slice(0, this.rowPerPage);
                this.loadFilter();
            });
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
    loadFilter() {
        this.selectedCustomer = null;
        let uniqueCustomer = [];
        this.customers = [{ label: "Chọn tất cả", value: null }];

        this.selectedCustomerType = null;
        let uniqueCustomerType = [];
        this.customerTypes = [{ label: "Chọn tất cả", value: null }];
        this.datasource.forEach(x => {
            if (uniqueCustomer.indexOf(x.id) === -1 && x.id) {
                uniqueCustomer.push(x.id);
                this.customers.push({ label: x.name, value: x.id });
            }
            //
            if (uniqueCustomerType.indexOf(x.customerTypeId) === -1 && x.customerTypeId) {
                uniqueCustomerType.push(x.customerTypeId);
                this.customerTypes.push({ label: x.customerTypeName, value: x.customerTypeId });
            }

        });
    }
    refresh() {
        this.loadShipment();
    }
    changeFilter() {
        this.loadLazy(this.event);
    }

    public eventLog = '';

    public selectedDate() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
        
    }

    private applyDate(value: any, dateInput: any) {
        dateInput.start = value.start;
        dateInput.end = value.end;
    }

    public calendarEventsHandler(e: any) {
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }

    //======== END METHOD ListReceiveMoney ======= 
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.totalPriceUnpaid);
        }, 0)
    }

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
        this.customers.forEach(x => {
            let obj = x.data as Customer;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.selectedCustomerId = obj.id;
                }
            }
        });
    }
    //
    filterHub(event) {
        let value = event.query;
        if (value.length >= 2) {
            this.hubs = [];
            this.filteredHubs = [];
            this.hubs.push({ value: null, label: `-- tất cả --`, data: null })
            this.filteredHubs.push(`-- tất cả --`);
            this.hubService.getHubSearchByValueAsync(value, null).then(
                x => {
                    if (x && x.length > 0) {
                        let data = (x as Hub[]);
                        data.map(m => {
                            this.hubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filteredHubs.push(`${m.code} ${m.name}`);
                        });
                    }
                }
            );
        }
    }

    onSelectedHub() {
        let findHub = this.hubs.find(f => f.label == this.selectedHub);
        if (findHub) {
            this.selectedHubId = findHub.value;
        }
    }
}