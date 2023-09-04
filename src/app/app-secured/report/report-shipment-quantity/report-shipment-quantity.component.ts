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
    selector: 'app-report-shipment-quantity',
    templateUrl: 'report-shipment-quantity.component.html',
    styles: []
})
export class ReportShipmentQuantityComponent extends BaseComponent implements OnInit {
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
    fromHubIdReportQuantity: any;
    fromDateReportQuantity: any;
    toDateReportQuantity: any;
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
    fileName: string = 'ReportShipmentQuantity.xlsx';

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportShipmentQuantity.name;

    customer: any;
    filteredCustomers: any;

    //============================
    //BEGIN
    //============================
    txtFilterGb: any;
    totalRecords: number;
    totalRecevice: number = 0;
    columns: string[] = ["id", "shipmentNumber", "PickupName", "Weight", "CalWeight", "TotalBox", "TotalPrice", "ShipmentNumberTo",
        "WeightTo", "CalWeightTo", "TotalBoxTo", "TotalPriceTo", "ServiceName", "COD", "ReceiverName", "ShipmentNumberExist",
        "ReasonUpdate", "CurrentHubName"];
    columnsExp: any[] = [
        { field: "id", header: 'STT' },
        { field: "shipmentNumber", header: 'Vận đơn nhận' },
        { field: "PickupName", header: 'Nhân viên nhận' },
        { field: "Weight", header: 'Trọng lượng nhận (kg)' },
        { field: "CalWeight", header: 'Trọng lượng quy đổi' },
        { field: "TotalBox", header: 'Số kiện' },
        { field: "TotalPrice", header: 'Doanh thu nhận' },
        { field: "ShipmentNumberTo", header: 'Vận đơn' },
        { field: "DeliveredName", header: 'Nhân viên giao' },
        { field: "WeightTo", header: 'Trọng lượng (kg)' },
        { field: "CalWeightTo", header: 'Trọng lượng quy đổi' },
        { field: "TotalBoxTo", header: 'Số kiện' },
        { field: "TotalPriceTo", header: 'Doanh thu' },
        { field: "ServiceName", header: 'Dịch vụ vận chuyển' },
        { field: "COD", header: 'COD' },
        { field: "ReceiverName", header: 'Tên khách nhận hàng' },
        { field: "ShipmentNumberExist", header: 'Vận đơn tồn' },
        { field: "Lý do cập nhật", header: 'ReasonUpdate' },
        { field: "CurrentHubName", header: 'Kho nhập xuất cuối' },
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

        this.fromDateReportQuantity = fromDate;
        this.toDateReportQuantity = toDate
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
        const res = await this.reportService.getReportShipmentQuantityAsync(this.fromHubIdReportQuantity, this.fromDateReportQuantity, this.toDateReportQuantity, this.pageSize, this.pageNumber);
        if (res.isSuccess) {
            this.datasource = res.data as any[];
            this.totalRecords = res.data[0].totalCount;
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
                this.totalRecords = this.datasource[0].totalCount;
            }
        }, 250);
    }

    loadFilter() {
        this.loadFromHub();
        this.loadService();
        this.loadPaymentType();
        this.loadStatus();
        this.loadCustomer();
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
        this.fromHubIdReportQuantity = this.selectedCurrentHub;
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

    changeCustomer() {
        this.loadShipment();
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
        this.fromHubIdReportQuantity = null;
        this.initData();
    }
    changeFilter() {
        this.loadLazy(this.event);
    }

    public eventLog = '';

    public selectedDate() {
        this.fromDateReportQuantity = SearchDate.formatToISODate(moment(this.fromDateReportQuantity).toDate());
        this.toDateReportQuantity = SearchDate.formatToISODate(moment(this.toDateReportQuantity).toDate());
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
    public exportCSV(): void {
        let datas: any[] = [];
        datas.push([
            'STT',
            'Vận đơn nhận',
            'Nhân viên nhận',
            'Trọng lượng nhận (kg)',
            'Trọng lượng quy đổi',
            'Số kiện',
            'Doanh thu nhận',
            'Vận đơn',
            'Nhân viên giao',
            'Trọng lượng (kg)',
            'Trọng lượng quy đổi',
            'Số kiện',
            'Doanh thu',
            'Dịch vụ vận chuyển',
            'COD',
            'Tên khách nhận hàng',
            'Vận đơn tồn',
            'ReasonUpdate',
            'Kho nhập xuất cuối',
        ])
        let i = 0;
        this.listData.forEach(item => {
            let message = "";
            datas.push([
                i + 1,
                this.listData[i].shipmentNumber,
                this.listData[i].pickupName,
                this.listData[i].weight,
                this.listData[i].calWeight,
                this.listData[i].totalBox,
                this.listData[i].totalPrice,
                this.listData[i].shipmentNumberTo,
                this.listData[i].deliveredName,
                this.listData[i].weightTo,
                this.listData[i].calWeightTo,
                this.listData[i].totalBoxTo,
                this.listData[i].totalPriceTo,
                this.listData[i].serviceName,
                this.listData[i].cod,
                this.listData[i].receiverName,
                this.listData[i].shipmentNumberExist,
                this.listData[i].reasonUpdate,
                this.listData[i].currentHubName,
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
            return priceKeeping += (shipment.cod + shipment.totalPrice);
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
                    this.changeCustomer();
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
                        this.changeCustomer();
                    } else {
                        this.selectedCustomer = null;
                        this.changeCustomer();
                    }
                }
            );
        } else {
            this.selectedCustomer = null;
            this.changeCustomer();
        }
    }
}