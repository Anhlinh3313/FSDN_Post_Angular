import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, DataTable, SelectItemGroup, SortEvent } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { RequestShipmentService, UserService, ShipmentService, HubService, ReportService, ServiceDVGTService, CustomerService, ServiceService, PaymentTypeService, ShipmentStatusService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { User, Hub, ServiceDVGT, Customer } from '../../../models/index';
import { PersistenceService, StorageType } from 'angular-persistence';
import { KeyValuesViewModel } from '../../../view-model/index';
import { ListReceiptMoneyService } from '../../../services/receiptMoney.service.';
import { ShipmentEmployeeKeeping } from '../../../models/shipmentEmployeeKeeping';
import { ListReceiptMoneyTypeHelper } from '../../../infrastructure/listReceiptMoneyTypeHelper';
import { Daterangepicker } from 'ng2-daterangepicker';
import { from } from 'rxjs/observable/from';
import { Shipment } from '../../../models/shipment.model';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { ExportExcelHelper } from '../../../infrastructure/exportExcel.helper.';
import { ArrayHelper } from '../../../infrastructure/array.helper';
import { SelectModel } from '../../../models/select.model';
function s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
@Component({
    selector: 'app-report-discount-customer',
    templateUrl: 'report-discount-customer.component.html',
    styles: []
})
export class ReportDiscountCustomerComponent extends BaseComponent implements OnInit {
    hub = environment;
    rowPerPage: number = 20;
    pageNum = 1;
    //
    fromDateDiscountCustomer: any;
    toDateDiscountCustomer: any;
    senderIdDiscountCustomer: any = "";
    salerIdDiscountCustomer: any = "";
    //
    selectedCustomer: number;
    selectedCustomerType: number;
    customers: SelectModel[];
    filteredCustomers: any;
    event: LazyLoadEvent;
    //
    listData: any[];
    datasource: any[];
    eventLG: LazyLoadEvent;
    datasourceLG: any[];
    listDataLG: any[];
    totalRecordsLG: number;
    columnsLG: string[] = [
        'STT',
        'Mã KH',
        'Tên KH',
        'NVKD',
        'BC Phụ Trách',
        'Bảng Giá áp dụng',
        'Xem chi tiết bảng giá (links xem file bảng giá)',
        '% giảm giá hỏa tốc',
        '% giảm giá CPN',
        '% giảm giá 48h',
        '% giảm giá đường bộ',
        '% giảm giá dịch vụ giá rẻ',
        '% giảm giá tiết kiệm',
        '% chiết khấu trước khi xuất HĐ',
        '% hoa hồng khách hàng',
        '% hoa hồng kinh doanh',
    ];
    //
    selectedSaler: any;
    lstSalers: SelectModel[] = [];
    lstSuggestionsSaler: string[] = [];
    //
    constructor(
        protected modalService: BsModalService,
        protected persistenceService: PersistenceService,
        protected messageService: MessageService,
        protected shipmentService: ShipmentService,
        protected hubService: HubService,
        protected serviceDVGTService: ServiceDVGTService,
        protected userService: UserService,
        protected customerService: CustomerService,
        protected serviceService: ServiceService,
        protected paymentTypeService: PaymentTypeService,
        protected shipmentStatusService: ShipmentStatusService,
        protected reportService: ReportService,
        public permissionService: PermissionService,
        public router: Router,
    ) {
        super(messageService, permissionService, router);
    }
    //
    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'ReportDiscountCustomer.xlsx';
    //
    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportDiscountCustomer.name;
    //
    customer: any;
    //============================
    //BEGIN
    //============================
    totalRecords: number;
    totalRecevice: number = 0;

    columnsExp: any[] = [
        { field: "id", header: 'STT' },
        { field: "code", header: 'Mã KH' },
        { field: "companyName", header: 'Tên KH' },
        { field: "salerName", header: 'NVKD' },
        { field: "hubName", header: 'BC Phụ Trách' },
        { field: "discount", header: 'Bảng Giá áp dụng' },
        { field: "", header: 'Xem chi tiết bảng giá (links xem file bảng giá)' },
        { field: "discountHT", header: '% giảm giá hỏa tốc' },
        { field: "discountCPN", header: '% giảm giá CPN' },
        { field: "discount48h", header: '% giảm giá 48h' },
        { field: "discountDB", header: '% giảm giá đường bộ' },
        { field: "discountNC", header: '% giảm giá dịch vụ giá rẻ' },
        { field: "discountTK", header: '% giảm giá tiết kiệm' },
        { field: "", header: '% chiết khấu trước khi xuất HĐ' },
        { field: "commissionCus", header: '% hoa hồng khách hàng' },
        { field: "commission", header: '% hoa hồng kinh doanh' },
    ];
    public dateRange = {
        start: moment(),
        end: moment()
    }

    ngOnInit() {
        this.initData();
    }

    async initData() {
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD");
        }

        this.fromDateDiscountCustomer = fromDate;
        this.toDateDiscountCustomer = toDate
        // this.shipmentFilterViewModel.Cols = includes;
        // this.shipmentFilterViewModel.Type = type;
        // this.shipmentFilterViewModel.OrderDateFrom = fromDate;
        // this.shipmentFilterViewModel.OrderDateTo = toDate;
        // this.shipmentFilterViewModel.PageNumber = this.pageNum;
        // this.shipmentFilterViewModel.PageSize = this.rowPerPage;
        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment() {
        let results = await this.reportService.getReportDiscountCustomerAsync(this.fromDateDiscountCustomer, this.toDateDiscountCustomer, this.senderIdDiscountCustomer, this.salerIdDiscountCustomer);
        if (results.isSuccess) {
            let shipments = results.data as any[];
            this.datasourceLG = shipments;
            this.totalRecordsLG = this.datasourceLG.length;
            this.listDataLG = this.datasourceLG.slice(0, this.rowPerPage);
            this.listData = this.datasourceLG;
            this.sumTotalReceive();
        }
    }
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.totalPriceUnpaid);
        }, 0)
    }
    loadLazyList(event: LazyLoadEvent) {
        this.eventLG = event;
        setTimeout(() => {
            if (this.datasourceLG) {
                var filterRows;

                //filter
                if (event.filters.length > 0)
                    filterRows = this.datasourceLG.filter(x =>
                        FilterUtil.filterField(x, event.filters)
                    );
                else
                    filterRows = this.datasourceLG.filter(x =>
                        FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLG)
                    );

                // sort data
                filterRows.sort(
                    (a, b) =>
                        FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
                );
                this.listDataLG = filterRows.slice(event.first, event.first + event.rows);
                this.totalRecordsLG = filterRows.length;
            }
        }, 250);
    }

    refresh() {
        this.senderIdDiscountCustomer = null;
        this.salerIdDiscountCustomer = null;
        this.initData();
    }
    public eventLog = '';

    selectedDate() {
        this.fromDateDiscountCustomer = SearchDate.formatToISODate(moment(this.fromDateDiscountCustomer).toDate());
        this.toDateDiscountCustomer = SearchDate.formatToISODate(moment(this.toDateDiscountCustomer).toDate());
    }

    formatDate(value: Date) {
        if (value) {
            let date = new Date(value);
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ": " + date.getMinutes();
        }
        return value;
    }
    //
    public exportCSV(): void {
        let datas: any[] = [];
        datas.push([
            'STT',
            'Mã KH',
            'Tên KH',
            'NVKD',
            'BC Phụ Trách',
            'Bảng Giá áp dụng',
            'Xem chi tiết bảng giá (links xem file bảng giá)',
            '% giảm giá hỏa tốc',
            '% giảm giá CPN',
            '% giảm giá 48h',
            '% giảm giá đường bộ',
            '% giảm giá dịch vụ giá rẻ',
            '% giảm giá tiết kiệm',
            '% chiết khấu trước khi xuất HĐ',
            '% hoa hồng khách hàng',
            '% hoa hồng kinh doanh',
        ])
        let i = 0;
        this.listData.forEach(item => {
            let message = "";
            datas.push([
                i + 1,
                this.listData[i].code,
                this.listData[i].salerName,
                this.listData[i].hubName,
                this.listData[i].discount,
                "",
                this.listData[i].discountHT,
                this.listData[i].discountCPN,
                this.listData[i].discount48h,
                this.listData[i].discountDB,
                this.listData[i].discountNC,
                this.listData[i].discountTK,
                "",
                this.listData[i].commissionCus,
                this.listData[i].commission,
            ])
            i++;
        })
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        const wbout: string = XLSX.write(wb, this.wopts);
        saveAs(new Blob([s2ab(wbout)]), this.fileName);
    }
    public calendarEventsHandler(e: any) {
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }
    //saler
    removeSaler(event) {
        this.salerIdDiscountCustomer = null;
    }
    changeFilter() {
        
    }
    async keyTabSaler(event) {
        let value = event.target.value;
        if (value.length >= 1) {
            let x = await this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null);
            if (x.isSuccess) {
                let data = x.data as User[];
                if (data.length > 0) {
                    let find = data.find(y => value == y.code) || data[0];
                    this.selectedSaler.push(`${find.code} ${find.name}`);
                }
            }
        }

    }
    onSelectedSaler() {
        let customer = this.lstSalers.find(y => y.label == this.selectedSaler);
        if (customer) {
            this.salerIdDiscountCustomer = customer.value;
        }
    }
    async filterSaler(event) {
        let value = event.query;
        if (value.length >= 1) {
            let x = await this.userService.getSearchByValueAsync(value, null);
            if (x) {
                this.lstSalers = [];
                this.lstSuggestionsSaler = [];
                let data = (x as User[]);
                data.map(m => {
                    this.lstSalers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                    this.lstSuggestionsSaler.push(`${m.code} ${m.name}`);
                });
            }
        }
    }
    onClearSaler() {
        this.salerIdDiscountCustomer = "";
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
                    this.senderIdDiscountCustomer = obj.id
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
                    } else {
                        this.selectedCustomer = null;
                    }
                }
            );
        } else {
            this.selectedCustomer = null;
            this.changeFilter();
        }
    }
    onClearCustomer() {
        this.senderIdDiscountCustomer = null;
    }
}