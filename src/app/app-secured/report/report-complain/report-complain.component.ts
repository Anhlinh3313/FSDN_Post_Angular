import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { UserService, ShipmentService, HubService, ReportService, ServiceDVGTService, CustomerService, ServiceService, PaymentTypeService, ShipmentStatusService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PersistenceService } from 'angular-persistence';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
declare var jQuery: any;

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ComplainFilter } from '../../../models/complainFilter.model';
import { User } from '../../../models';
function s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
@Component({
    selector: 'app-report-complain',
    templateUrl: 'report-complain.component.html',
    styles: []
})
export class ReportComplainComponent extends BaseComponent implements OnInit {
    hub = environment;
    rowPerPage: number = 20;
    pageNum = 1;
    //
    fromDateComplain: any;
    toDateComplain: any;
    salerIdComplain: any = "";
    handleEmpIdComplain: any = "";
    isCompensationComplain: any = "";
    pageSize: number = 20;
    pageNumber: number = 1;
    //
    datasource: any[];
    listData: any[];
    //
    textCompleted: string;
    isCompleted: boolean;
    //
    shipmentComplainFilter: ComplainFilter = new ComplainFilter();
    //
    selectedSaler: any;
    lstSalers: SelectModel[] = [];
    lstSuggestionsSaler: string[] = [];
    //
    selectedHandleEmp: any;
    lstHandleEmps: SelectModel[] = [];
    lstSuggestionsHandleEmp: string[] = [];
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
    fileName: string = 'ReportComplain.xlsx';
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
        { field: "customerCode", header: 'Mã khách hàng' },
        { field: "orderDate", header: 'Ngày Vận Đơn' },
        { field: "shipmentNumber", header: 'Số Vận Đơn' },
        { field: "fromProvinceName", header: 'Từ Tỉnh' },
        { field: "toProvinceName", header: 'Đến Tỉnh' },
        { field: "shippingAddress", header: 'Địa chỉ đến' },
        { field: "receiverName", header: 'Tên người nhận' },
        { field: "receiverPhone", header: 'Số ĐT người nhận' },
        { field: "weight", header: 'Trọng Lượng thực' },
        { field: "calWeight", header: 'Trọng Lượng Qui Đổi' },
        { field: "cod", header: 'Số Tiền COD' },
        { field: "defaultPrice", header: 'Cước' },
        { field: "totalDVGT", header: 'Phụ Phí' },
        { field: "priceCOD", header: 'Phí COD' },
        { field: "totalPriceAll", header: 'Tổng Cước Phí' },
        { field: "complainTypeName", header: 'Lý Do Khiếu Nại' },
        { field: "complainContent", header: 'Ý kiến khách hàng' },
        { field: "complainStatusName", header: 'Kết quả giải quyết' },
        { field: "isCompensation", header: 'Đền bù' },
        { field: "handleEmpFullName", header: 'Người xử lý' },
        { field: "endDate", header: 'Thời gian kết thúc' },
        { field: "compensationValue", header: 'Số tiền đền bù' },
    ];
    public dateRange = {
        start: moment(),
        end: moment()
    }

    ngOnInit() {
        this.initData();
    }

    async initData() {
        this.textCompleted = "Tất cả";
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD");
        }

        this.fromDateComplain = fromDate;
        this.toDateComplain = toDate
        this.loadShipment();
    }
    onPageChange(event: any) {
        this.pageNumber = event.first / event.rows + 1;
        this.pageSize = event.rows;
        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment() {
        let results = await this.reportService.getReportComplainAsync(this.fromDateComplain, this.toDateComplain, this.pageSize, this.pageNumber, this.salerIdComplain, this.handleEmpIdComplain, this.isCompensationComplain);
        if (results.isSuccess) {
            this.datasource = results.data as any[];
            if (results.data[0]) this.totalRecords = results.data[0].totalCount;
            this.listData = this.datasource;
            this.sumTotalReceive();
        }
    }
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.totalPriceUnpaid);
        }, 0)
    }
    refresh() {
        this.initData();
    }
    public eventLog = '';

    public selectedDate() {
        this.fromDateComplain = SearchDate.formatToISODate(moment(this.fromDateComplain).toDate());
        this.toDateComplain = SearchDate.formatToISODate(moment(this.toDateComplain).toDate());
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
            'Mã khách hàng',
            'Ngày Vận Đơn',
            'Số Vận Đơn',
            'Từ Tỉnh',
            'Đến Tỉnh',
            'Địa chỉ đến',
            'Tên người nhận',
            'Số ĐT người nhận',
            'Trọng Lượng thực',
            'Trọng Lượng Qui Đổi',
            'Số Tiền COD',
            'Cước',
            'Phụ Phí',
            'Phí COD',
            'Tổng Cước Phí',
            'Lý Do Khiếu Nại',
            'Ý kiến khách hàng',
            'Kết quả giải quyết',
            'Đền bù',
            'Người xử lý',
            'Thời gian kết thúc',
            'Số tiền đền bù',
        ])
        let i = 0;
        this.listData.forEach(item => {
            let message = "";
            datas.push([
                i + 1,
                this.listData[i].customerCode,
                this.listData[i].orderDate,
                this.listData[i].shipmentNumber,
                this.listData[i].fromProvinceName,
                this.listData[i].toProvinceName,
                this.listData[i].shippingAddress,
                this.listData[i].receiverName,
                this.listData[i].receiverPhone,
                this.listData[i].weight,
                this.listData[i].calWeight,
                this.listData[i].cod,
                this.listData[i].defaultPrice,
                this.listData[i].totalDVGT,
                this.listData[i].priceCOD,
                this.listData[i].totalPriceAll,
                this.listData[i].complainTypeName,
                this.listData[i].complainContent,
                this.listData[i].complainStatusName,
                this.listData[i].isCompensation,
                this.listData[i].handleEmpFullName,
                this.listData[i].endDate,
                this.listData[i].compensationValue,
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
        this.salerIdComplain = null;
        this.changeFilter();
    }
    changeFilter() {
        this.pageNumber = 1;
        this.pageSize = 20;
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
                    this.changeFilter();
                }
            }
        }

    }
    onSelectedSaler() {
        let customer = this.lstSalers.find(y => y.label == this.selectedSaler);
        if (customer) {
            this.salerIdComplain = customer.value;
        }
        this.changeFilter();
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
        this.salerIdComplain = "";
        this.changeFilter();
    }
    //handleEmp
    changeFilterHandleEmp() {
        this.pageNumber = 1;
        this.pageSize = 20;
        this.initData();
    }
    async keyTabHandleEmp(event) {
        let value = event.target.value;
        if (value.length >= 1) {
            let x = await this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null);
            if (x.isSuccess) {
                let data = x.data as User[];
                if (data.length > 0) {
                    let find = data.find(y => value == y.code) || data[0];
                    this.selectedHandleEmp.push(`${find.code} ${find.name}`);
                    this.shipmentComplainFilter.customerIds.push(find.id);

                    this.changeFilter();
                }
            }
        }
    }
    onSelectedHandleEmp() {
        let customer = this.lstHandleEmps.find(y => y.label == this.selectedHandleEmp);
        if (customer) {
            this.handleEmpIdComplain = customer.value;
        }
        this.changeFilter();
    }
    async filterHandleEmp(event) {
        let value = event.query;
        if (value.length >= 1) {
            let x = await this.userService.getSearchByValueAsync(value, null);
            if (x) {
                this.lstHandleEmps = [];
                this.lstSuggestionsHandleEmp = [];
                let data = (x as User[]);
                data.map(m => {
                    this.lstHandleEmps.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                    this.lstSuggestionsHandleEmp.push(`${m.code} ${m.name}`);
                });
            }
        }
    }
    onClearHandleEmp() {
        this.handleEmpIdComplain = "";
        this.changeFilter();
    }
    //
    onChangeIsCompleted() {
        if (this.isCompensationComplain == null) {
            this.textCompleted = "Đã xữ lý";
            this.isCompensationComplain = true;
            this.pageNumber = 1;
            this.pageSize = 20;
            return false;
        }
        if (this.isCompensationComplain == true) {
            this.textCompleted = "Chờ xữ lý";
            this.isCompensationComplain = false;
            this.pageNumber = 1;
            this.pageSize = 20;
            return false;
        }
        if (this.isCompensationComplain == false) {
            this.textCompleted = "Tất cả";
            this.isCompensationComplain = null;
            this.pageNumber = 1;
            this.pageSize = 20;
            return false;
        }
    }
}