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
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
function s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
@Component({
    selector: 'app-report-payment-pickup-user',
    templateUrl: 'report-payment-pickup-user.component.html',
    styles: []
})
export class ReportPaymentPickupUserComponent extends BaseComponent implements OnInit {
    hub = environment;

    type: string = ShipmentTypeHelper.reportsummary;
    pageSizExcel: number = 500;
    allDatasource: any[] = [];
    receiverHub: any[];
    filterRows: Shipment[];
    rowPerPage: number = 20;
    pageNum = 1;
    shipmentFilterViewModel: ShipmentFilterViewModel;
    shipmentAllFilterViewModel: ShipmentFilterViewModel;
    typeDelivery: string;
    isSuccessDelivery: boolean;
    //
    fromDateReport: any;
    toDateReport: any;
    hubIdReport: any;
    userIdReport: any;
    pageSize: number = 20;
    pageNumber: number = 1;
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

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'ReportPaymentPickupUser.xlsx';

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportPaymentPickupUser.name;

    customer: any;
    user: any;
    users: SelectModel[];
    selectedUser: number;
    filteredUsers: any;
    filteredCustomers: any;

    //============================
    //BEGIN
    //============================
    txtFilterGb: any;
    totalRecords: number;
    totalRecevice: number = 0;
    columns: string[] = [
        "id",
        "fromHubCode",
        "pickEmpCode",
        "pickEmpName",
        "shipmentNumber",
        "orderDate",
        "paymentTypeName",
        "totalPrice",
        "totalPriceSYS",
        "totalPricePay",
        "rePay",
        "totalPaid",
        "rePayPickup",
        "note",
        "isReturn",
        "shipmentNumberChild",
        "toHubName",
        "deliveredEmpName",
        "endDeliveryTime",
    ];
    columnsExp: any[] = [
        { field: "id", header: 'STT' },
        { field: "fromHubCode", header: 'Mã bưu cục' },
        { field: "pickEmpCode", header: 'Mã NV' },
        { field: "pickEmpName", header: 'Tên NV' },
        { field: "shipmentNumber", header: 'Số vận đơn' },
        { field: "orderDate", header: 'Ngày vận đơn' },
        { field: "paymentTypeName", header: 'HTTT' },
        { field: "totalPrice", header: 'Tiền cước' },
        { field: "totalPriceSYS", header: 'Tiền cước KS' },
        { field: "totalPricePay", header: 'Phải thu' },
        { field: "rePay", header: 'Truy thu' },
        { field: "totalPaid", header: 'Đã thu' },
        { field: "rePayPickup", header: 'Còn nợ' },
        { field: "note", header: 'Ghi chú' },
        { field: "isReturn", header: 'Trạng thái hoàn' },
        { field: "shipmentNumberChild", header: 'Số vận đơn hoàn' },
        { field: "toHubName", header: 'BC Nhận' },
        { field: "deliveredEmpName", header: 'NV giao nhận cuối' },
        { field: "endDeliveryTime", header: 'Thời gian xuất trả cuối' },
    ];
    datasource: any[];
    listData: any[];
    event: LazyLoadEvent;
    statuses: SelectItem[];
    selectedStatus: ShipmentStatus;
    selectedMultiStatus: any;
    fromHubs: SelectItemGroup[];
    selectedFromHub: number;
    toHubs: SelectItemGroup[];
    selectedToHub: number;
    currentHubs: SelectItemGroup[];
    selectedCurrentHub: number;
    services: SelectItem[];
    selectedService: number;
    paymentTypes: SelectItem[];
    selectedPaymentType: number;
    customers: SelectModel[];
    selectedCustomer: number;
    public dateRange = {
        start: moment(),
        end: moment()
    }
    //
    maxRecordExport = 200;
    //============================
    //END 
    //============================

    ngOnInit() {
        this.initData();
        this.loadFilter();
    }

    async initData() {
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD");
        }

        this.fromDateReport = fromDate;
        this.toDateReport = toDate
        // this.shipmentFilterViewModel.Cols = includes;
        // this.shipmentFilterViewModel.Type = type;
        // this.shipmentFilterViewModel.OrderDateFrom = fromDate;
        // this.shipmentFilterViewModel.OrderDateTo = toDate;
        // this.shipmentFilterViewModel.PageNumber = this.pageNum;
        // this.shipmentFilterViewModel.PageSize = this.rowPerPage;
        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment(): Promise<any> {
        // console.log(JSON.stringify(this.shipmentFilterViewModel));
        const res = await this.reportService.getReportPaymentPickupUserAsync(this.fromDateReport, this.toDateReport, this.hubIdReport, this.userIdReport, this.pageSize, this.pageNumber);
        if (res.isSuccess) {
            this.datasource = res.data as any[];
            this.totalRecords = res.data.length > 0 ? res.data[0].totalCount : 0;
            this.listData = this.datasource.slice(0, this.rowPerPage);
            this.sumTotalReceive();
        }
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

                // sort data
                filterRows.sort(
                    (a, b) =>
                        FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
                );
                this.listData = filterRows.slice(event.first, event.first + event.rows);
                this.totalRecords = this.datasource.length > 0 ? this.datasource[0].totalCount : 0;
            }
        }, 250);
    }

    loadFilter() {
        this.loadFromHub();
        // this.loadService();
        // this.loadPaymentType();
        // this.loadStatus();
        // this.loadCustomer();
    }

    async loadFromHub() {
        this.fromHubs = [];
        this.receiverHub = [];
        const hubs = await this.hubService.getAllAsync();
        if (hubs) {
            hubs.forEach(element => {
                if (element.centerHubId) {
                    // get SelectItemHubs with tag Title
                    this.receiverHub.push({
                        label: element.name, value: element.id, title: element.centerHubId.toString()
                    });
                } else {
                    this.receiverHub.push({
                        label: element.name, value: element.id, title: element.id.toString()
                    });
                }
            });
        }

        let groupOfCenterHubs = this.receiverHub.reduce((outData, item) =>
            // group all Hubs by title
            Object.assign(outData, { [item.title]: (outData[item.title] || []).concat(item) })
            , []);
        groupOfCenterHubs.forEach(x => {
            this.fromHubs.push({
                label: `-- ${x[0].label} --`,
                items: x,
            });
            this.selectedFromHub = null;
            this.toHubs = this.fromHubs;
            this.currentHubs = this.fromHubs;
        });
    }

    changeFromhub() {
        this.loadShipment();
    }

    changeTohub() {
        this.loadShipment();
    }

    changeCurrentHub() {
        this.hubIdReport = this.selectedCurrentHub;
    }

    loadService() {
        this.services = [];
        this.serviceService.getAllSelectModelAsync().then(x => {
            this.services = x;
        });
    }

    changeService() {
        this.loadShipment();
    }

    loadPaymentType() {
        this.paymentTypes = [];
        this.paymentTypeService.getAllSelectModelAsync().then(x => {
            this.paymentTypes = x;
        });
    }

    changePaymentType() {
        this.loadShipment();
    }

    loadStatus() {
        this.statuses = [];
        this.shipmentStatusService.getAllSelectModelMultiSelectAsync().then(x => {
            this.statuses = x;
        })
    }

    changeStatus() {
        this.loadShipment();
    }

    loadCustomer() {
        // this.customers = [];
        // this.customerService.getAllSelectModelAsync().then(x => {
        //     this.customers = x;
        // });
    }

    changeUser() {
    }


    search(value) {
        this.loadShipment();
    }

    refresh() {
        this.txtFilterGb = null;
        this.selectedFromHub = null;
        this.selectedToHub = null;
        this.selectedCurrentHub = null;
        this.selectedStatus = null;
        this.selectedService = null;
        this.selectedPaymentType = null;
        this.selectedCustomer = null;
        this.isSuccessDelivery = false;
        this.hubIdReport = null;
        this.userIdReport = null;
        this.initData();
    }
    changeFilter() {
        this.loadLazy(this.event);
    }

    public eventLog = '';

    public selectedDate() {
        this.fromDateReport = SearchDate.formatToISODate(moment(this.fromDateReport).toDate());
        this.toDateReport = SearchDate.formatToISODate(moment(this.toDateReport).toDate());
    }

    private applyDate(value: any, dateInput: any) {
        dateInput.start = value.start;
        dateInput.end = value.end;
    }

    public calendarEventsHandler(e: any) {
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }

    onPageChange(event: LazyLoadEvent) {
        this.pageNumber = event.first / event.rows + 1;
        this.pageSize = event.rows;
        this.loadShipment();
    }

    //======== END METHOD ListReceiveMoney ======= 

    onViewSuccessDelivery() {
        this.loadShipment();
    }

    formatDate(value: Date) {
        if (value) {
            let date = new Date(value);
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ": " + date.getMinutes();
        }
        return value;
    }
    //
    public async exportCSV() {
        let datas: any[] = [];
        datas.push([
            "id",
            "fromHubCode",
            "pickEmpCode",
            "pickEmpName",
            "shipmentNumber",
            "orderDate",
            "paymentTypeName",
            "totalPrice",
            "totalPriceSYS",
            "totalPricePay",
            "rePay",
            "totalPaid",
            "rePayPickup",
            "note",
            "isReturn",
            "shipmentNumberChild",
            "toHubName",
            "deliveredEmpName",
            "endDeliveryTime",
        ])
        let data: any[] = [];
        let count = Math.ceil(this.totalRecords / this.maxRecordExport);
        let promise = [];

        for (let i = 1; i <= count; i++) {
            var PageNumber = i;
            var PageSize = this.maxRecordExport;
            promise.push(await this.reportService.getReportPaymentPickupUserAsync(this.fromDateReport, this.toDateReport, this.hubIdReport, this.userIdReport, PageSize, PageNumber))
        }
        console.log(promise)
        await Promise.all(promise).then(async rs => {
            await rs.map(x => {
                data = data.concat(x.data);
            })
        })
        let i = 0;
        data.forEach(item => {
            let message = "";
            datas.push([
                i + 1,
                item.fromHubCode,
                item.pickEmpCode,
                item.pickEmpName,
                item.shipmentNumber,
                item.orderDate,
                item.paymentTypeName,
                item.totalPrice,
                item.totalPriceSYS,
                item.totalPricePay,
                item.rePay,
                item.totalPaid,
                item.rePayPickup,
                item.note,
                item.isReturn,
                item.shipmentNumberChild,
                item.toHubName,
                item.deliveredEmpName,
                item.endDeliveryTime,
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
    
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.totalPrice);
        }, 0)
    }

    filterUsers(event) {
        let value = event.query;
        if (value.length >= 1) {
            this.userService.getSearchByValueAsync(value, null).then(
                x => {
                    if (x) {
                        this.users = [];
                        this.filteredUsers = [];
                        let data = (x as User[]);
                        data.map(m => {
                            this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filteredUsers.push(`${m.code} ${m.name}`);
                        });
                    }
                }
            );
        }
    }

    onSelectedUser() {
        let cloneSelectedCustomer = this.user;
        let index = cloneSelectedCustomer.indexOf(" -");
        let users: any;
        if (index !== -1) {
            users = cloneSelectedCustomer.substring(0, index);
            cloneSelectedCustomer = users;
        }
        this.users.forEach(x => {
            let obj = x.data as User;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.selectedUser = obj.id;
                    this.userIdReport = this.selectedUser;
                    this.changeUser();
                }
            }
        });
    }

    keyTabUser(event) {
        let value = event.target.value;
        if (value && value.length > 0) {
            this.userService.getSearchByValueAsync(value, null).then(
                x => {
                    if (x) {
                        this.users = [];
                        this.filteredUsers = [];
                        let data = (x as User[]);
                        data.map(m => {
                            this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filteredUsers.push(`${m.code} ${m.name}`);
                        });
                        let findCus: SelectModel = null;
                        if (this.users.length == 1) {
                            findCus = this.users[0];
                        } else {
                            findCus = this.users.find(f => f.data.code == value || f.label == value);
                        }
                        if (findCus) {
                            this.selectedUser = findCus.value;
                            this.user = findCus.label;
                            this.userIdReport = this.selectedUser;
                        }
                        else {
                            this.selectedUser = null
                            this.userIdReport = this.selectedUser;
                        }
                        this.changeUser();
                    } else {
                        this.selectedUser = null;
                        this.userIdReport = this.selectedUser;
                        this.changeUser();
                    }
                }
            );
        } else {
            this.selectedUser = null;
            this.userIdReport = this.selectedUser;
            this.changeUser();
        }
    }
    onClearSender() {
        this.userIdReport = null;
        this.changeUser();
    }
}