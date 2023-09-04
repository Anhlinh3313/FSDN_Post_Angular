import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { RequestShipmentService, UserService, ShipmentService, HubService, ReportService, CustomerService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { User, Hub, Customer, CustomerType } from '../../../models/index';
import { PersistenceService, StorageType } from 'angular-persistence';
import { KeyValuesViewModel } from '../../../view-model/index';
import { ListReceiptMoneyService } from '../../../services/receiptMoney.service.';
import { ShipmentEmployeeKeeping } from '../../../models/shipmentEmployeeKeeping';
import { ListReceiptMoneyTypeHelper } from '../../../infrastructure/listReceiptMoneyTypeHelper';
import { Daterangepicker } from 'ng2-daterangepicker';
import { from } from 'rxjs/observable/from';
import { Shipment } from '../../../models/shipment.model';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { ReportPayablesAndReceivablesByCustomer } from '../../../models/reportPayablesAndReceivablesByCustomer';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

@Component({
    selector: 'app-report-payables-and-receivables-customer',
    templateUrl: 'report-payables-and-receivables-customer.component.html',
    styles: []
})
export class ReportPayablesAndReceivablesByCustomerComponent extends BaseComponent implements OnInit {
    constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
        private shipmentService: ShipmentService,
        private hubService: HubService,
        private userService: UserService,
        private reportService: ReportService,
        public permissionService: PermissionService,
        public router: Router,
        private customerService: CustomerService
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportCustomer.name;

    selectedDateFrom: any;
    selectedDateTo: any;

    //============================
    //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T

    customer: any;
    filteredCustomers: any;
    //============================
    selectedFromHub: Hub;
    rowPerPage = 20;
    totalRecords: number;
    columns: ["code", "createdWhen", "totalPrice", "customerTypeName", "totalCOD", "totalPricePaid", "totalCODPaid",
        "totalBefore", "totalAfter", "phoneNumber", "email", "taxCode", "companyName"];

    columnsExport = [
        { field: 'stt', header: 'STT' },
        { field: 'code', header: 'Mã khách hàng' },
        { field: 'name', header: 'Tên khách hàng' },
        { field: 'phoneNumber', header: 'Số điện thoại' },
        { field: 'totalBefore', header: 'Khách nợ' },
        { field: 'totalBefore', header: 'Nợ khách' },
        { field: 'totalPrice', header: 'Tổng cước' },
        { field: 'totalPricePaid', header: 'Tổng cước đã thanh toán' },
        { field: 'totalCOD', header: 'Tổng cod' },
        { field: 'totalCODPaid', header: 'Tổng cod đã thanh toán' },
        { field: 'totalAfter', header: 'Khách nợ' },
        { field: 'totalAfter', header: 'Nợ khách' },
    ]

    datasource: ReportPayablesAndReceivablesByCustomer[];
    listData: ReportPayablesAndReceivablesByCustomer[];
    event: LazyLoadEvent;
    selectedCustomer: number;
    selectedCustomerType: number;
    customers: SelectModel[];
    customerTypes: SelectItem[];
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
        this.selectedDateFrom = this.dateRange.start.add(0, 'd').toDate();
        this.selectedDateTo = this.dateRange.end.toDate();

        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    loadShipment() {
        this.reportService.getReportPayablesAndReceivablesByCustomer(null, null, this.selectedDateFrom, this.selectedDateTo)
            .subscribe(x => {
                this.datasource = x.data as ReportPayablesAndReceivablesByCustomer[];
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

                // console.log("selected", this.selectedCustomer);

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
        // this.customers = [{ label: "Chọn tất cả", value: null }];

        this.selectedCustomerType = null;
        let uniqueCustomerType = [];
        this.customerTypes = [{ label: "Chọn tất cả", value: null }];
        this.datasource.forEach(x => {
            if (uniqueCustomer.indexOf(x.id) === -1 && x.id) {
                uniqueCustomer.push(x.id);
                // this.customers.push({ label: x.name, value: x.id });
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
        let index = cloneSelectedCustomer.indexOf(" -");
        let customers: any;
        if (index !== -1) {
            customers = cloneSelectedCustomer.substring(0, index);
            cloneSelectedCustomer = customers;
        }
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

    //======== END METHOD ListReceiveMoney ======= 
}