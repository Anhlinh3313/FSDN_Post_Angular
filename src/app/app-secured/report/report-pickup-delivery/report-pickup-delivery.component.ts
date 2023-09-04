import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { User, Hub } from '../../../models/index';
import { PersistenceService } from 'angular-persistence';
import { ReportPickupDelivery } from '../../../models/reportPickupDelivery';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportPickupDetail } from '../../../models/reportPickupDetail.model';
import { ReportDeliveryDetail } from '../../../models/reportDeliveryDetail.model';
import { ReportDeliveryFail } from '../../../models/reportDeliveryFail.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';

@Component({
    selector: 'app-report-pickup-delivery',
    templateUrl: 'report-pickup-delivery.component.html',
    styles: []
})
export class ReportPickupDeliverComponent extends BaseComponent implements OnInit {
    hub = environment;

    constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
        private shipmentService: ShipmentService,
        private hubService: HubService,
        private userService: UserService,
        private reportService: ReportService,
        public permissionService: PermissionService,
        private provinceService: ProvinceService,
        public router: Router,
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportPickupDeliver.name;

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'ReportPickupDelivery.xlsx';

    //
    sumOfTotalPickup: number;
    sumOfTotalPickupFail: number;
    sumOfTotalDelivery: number;
    sumOfTotalDeliveryFail: number;
    sumOfTotalReturn: number;

    //============================
    //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
    //============================
    rowPerPage = 20;
    totalRecords: number;
    columns: any[] = ["code", "fullName", "phoneNumber", "address",
        "hubName", "departmentName", "roleName", "totalPickup", "totalDelivery", "totalReturn"];
    datasource: ReportPickupDelivery[];
    listData: ReportPickupDelivery[];
    provinces: SelectItem[];
    selectedFromProvince: number[];
    event: LazyLoadEvent;
    emps: SelectItem[];
    selectedEmp: User;
    selectedEmpId: any = null;
    hubs: SelectItem[];
    selectedHub: Hub;
    selectedHubId: any = null;
    public dateRange = {
        start: moment(),
        end: moment()
    }

    employee_2: any;
    employees_2: any;
    filteredEmployees_2: any;
    selectedEmployee_2: number;
    //============================
    //END Danh sách bảng kê nộp tiền về TT/CN/T
    //============================

    // Modal report
    bsModalRef: BsModalRef;
    lstReportPickupDetail: ReportPickupDetail[] = [];
    lstReportDeliveryDetail: ReportDeliveryDetail[] = [];
    lstReportDeliveryFail: ReportDeliveryFail[] = [];

    columnReportPickupDetail = [
        { field: 'stt', header: 'STT' },
        { field: 'id', header: 'ID' },
        { field: 'senderName', header: 'Vận đơn ID' },
        { field: 'shipmentId', header: 'Mã vận đơn' },
        { field: 'shipmentNumber', header: 'Ngày gửi' },
        { field: 'orderDate', header: 'Địa chỉ lấy hàng' },
        { field: 'pickingAddress', header: 'Tổng cước' },
        { field: 'totalPrice', header: 'COD' },
        { field: 'cOD', header: 'Dịch vụ' },
        { field: 'serviceName', header: 'TL' },
        { field: 'weight', header: 'TL quy đổi' },
        { field: 'calWeight', header: 'Thời gian giao hàng' },
        { field: 'endPickTime', header: 'Người gửi' },
    ]

    columnReportDeliveryDetail = [
        { field: 'stt', header: 'STT' },
        { field: 'id', header: 'ID' },
        { field: 'senderName', header: 'Vận đơn ID' },
        { field: 'shipmentId', header: 'Mã vận đơn' },
        { field: 'shipmentNumber', header: 'Ngày gửi' },
        { field: 'orderDate', header: 'Địa chỉ lấy hàng' },
        { field: 'pickingAddress', header: 'Tổng cước' },
        { field: 'totalPrice', header: 'COD' },
        { field: 'cOD', header: 'Dịch vụ' },
        { field: 'serviceName', header: 'TL' },
        { field: 'weight', header: 'TL quy đổi' },
        { field: 'calWeight', header: 'Thời gian giao hàng' },
        { field: 'endPickTime', header: 'Người gửi' },
        { field: 'endDeliveryTime', header: 'Thời gian giao hàng' },
        { field: 'realRecipientName', header: 'Người nhận' },
    ]

    columnReportDeliveryFail = [
        { field: 'stt', header: 'STT' },
        { field: 'id', header: 'ID' },
        { field: 'senderName', header: 'Vận đơn ID' },
        { field: 'shipmentId', header: 'Mã vận đơn' },
        { field: 'shipmentNumber', header: 'Ngày gửi' },
        { field: 'orderDate', header: 'Địa chỉ lấy hàng' },
        { field: 'pickingAddress', header: 'Tổng cước' },
        { field: 'totalPrice', header: 'COD' },
        { field: 'cOD', header: 'Dịch vụ' },
        { field: 'serviceName', header: 'TL' },
        { field: 'weight', header: 'TL quy đổi' },
        { field: 'calWeight', header: 'Thời gian giao hàng' },
        { field: 'endPickTime', header: 'Người gửi' },
        { field: 'reasonName', header: 'Thời gian giao hàng' },
        { field: 'note', header: 'Người gửi' },
    ]
    //

    selectedDateFrom: any;
    selectedDateTo: any;
    ngOnInit() {
        this.initData();
    }

    async initData() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.provinces = await this.provinceService.getAllSelectModelAsync();
        this.provinces.splice(0,1)
        this.loadFilter();
        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment() {
        let x = await this.reportService.getReportPickupDelaveryAsync(this.selectedHubId, this.selectedEmpId, this.selectedDateFrom, this.selectedDateTo)
        this.datasource = x.data as ReportPickupDelivery[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        //
        if (this.datasource) {
            this.sumTotalEmp();
        }
    }

    sumTotalEmp() {
        this.sumOfTotalPickup = this.datasource.reduce((totalPickup, element) => {
            return totalPickup += element.totalPickup;
        }, 0);
        this.sumOfTotalPickupFail = this.datasource.reduce((totalPickupFail, element) => {
            return totalPickupFail += element.totalPickupFail;
        }, 0);
        this.sumOfTotalDelivery = this.datasource.reduce((totalDelivery, element) => {
            return totalDelivery += (element.totalDeliveredOne + element.totalDeliveredTwo + element.totalDeliveredThree);
        }, 0);
        this.sumOfTotalDeliveryFail = this.datasource.reduce((totalDeliveryFail, element) => {
            return totalDeliveryFail += element.totalDeliveryFail;
        }, 0);
        this.sumOfTotalReturn = this.datasource.reduce((totalReturn, element) => {
            return totalReturn += element.totalReturn;
        }, 0);
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
                if (this.selectedHub) {
                    filterRows = filterRows.filter(
                        x => x.hubId === this.selectedHub
                    );
                }
                if (this.selectedEmp) {
                    filterRows = filterRows.filter(
                        x => x.id === this.selectedEmp
                    );
                }
                filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
                this.listData = filterRows.slice(event.first, (event.first + event.rows))
                this.totalRecords = filterRows.length;
            }
        }, 250);
    }
    async loadFilter() {
        this.selectedHub = null;
        //this.hubs = [{ label: "Chọn tất cả", value: null }];
        this.hubs = await this.hubService.getAllHubSelectModelAsync();
        //
    }
    async loadUser(hubId: any) {
        this.selectedEmp = null;
        this.emps = await this.userService.getSelectModelAllEmpByHubIdAsync(hubId);
    }
    refresh() {
        this.loadShipment();
    }
    changeHub() {
        if (this.selectedHub) this.selectedHubId = this.selectedHub;
        else this.selectedHubId = null;
        this.loadUser(this.selectedHubId);
    }
    changeUser() {
        if (this.selectedEmp) this.selectedEmpId = this.selectedEmp;
        else this.selectedEmpId = null;
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

    exportCSV() {
        let data: any[] = [];
        data.push([
            'MÃ NHÂN VIÊN',
            'TÊN NHÂN VIÊN',
            'TỔNG COD',
            'TỔNG COD PHẢI THU',
            'TỔNG COD ĐÃ NỘP',
            'TỔNG COD KT XÁC NHẬN',
            'TÔNG COD CHƯA NỘP CTY',
            'TỔNG VĐ LẤY TC',
            'TỔNG VĐ LẤY KTC',
            'TỔNG VĐ',
            'TỔNG VĐ CHỜ XÁC NHẬN',
            'TỔNG VĐ ĐANG GIAO',
            'TỔNG VĐ GIAO TC LẦN 1',
            'TỔNG VĐ GIAO TC LẦN 2',
            'TỔNG VĐ GIAO TC LẦN 3',
            'TỔNG VĐ GIAO KTC',
            'TỔNG VĐ ĐÃ CHUYỂN HOÀN',
            'TỔNG DOANH THU NHẬN',
            'TỔNG DOANH THU TRẢ',
            'SỐ ĐIỆN THOẠI',
            'ĐỊA CHỈ',
            'TT/CN/T',
            'PHÒNG BANG',
        ]);

        this.datasource.map((shipment) => {
            let ship = Object.assign({}, shipment);
            data.push([
                ship.code,
                ship.fullName,
                ship.totalZCOD,
                ship.totalCODMustCollect,
                ship.totalSubmitCOD,
                ship.totalAcceptedCOD,
                ship.totalAwaitSubmitCOD,
                ship.totalPickup,
                ship.totalPickupFail,
                ship.totalShipment,
                ship.totalAwaitAccept,
                ship.totalDelivering,
                ship.totalDeliveredOne,
                ship.totalDeliveredTwo,
                ship.totalDeliveredThree,
                ship.totalDeliveryFail,
                ship.totalReturn,
                ship.totalPricePickup,
                ship.totalPriceDelivery,
                ship.phoneNumber,
                ship.address,
                ship.hubName,
                ship.departmentName
            ]);
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        const wbout: string = XLSX.write(wb, this.wopts);
        saveAs(new Blob([this.s2ab(wbout)]), this.fileName);
    }

    s2ab(s: string): ArrayBuffer {
        const buf: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    // filter Employee
    async filterEmployee_2(event) {
        let value = event.query;
        if (value.length >= 1) {
            let x = await this.userService.getSearchByValueAsync(value, null)
            this.employees_2 = [];
            this.filteredEmployees_2 = [];
            this.filteredEmployees_2.push(`--- TẤT CẢ ---`);
            let data = (x as User[]);
            data.map(m => {
                this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                this.filteredEmployees_2.push(`${m.code} ${m.name}`);
            });
        }
    }

    async keyTabEmployee_2(event) {
        let value = event.target.value;
        if (value && value.length > 0) {
            let x = await this.userService.getSearchByValueAsync(value, null);
            this.employees_2 = [];
            this.filteredEmployees_2 = [];
            let data = (x as User[]);
            data.map(m => {
                this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                this.filteredEmployees_2.push(`${m.code} ${m.name}`);
            });
            let findCus: SelectModel = null;
            if (this.employees_2.length == 1) {
                findCus = this.employees_2[0];
            } else {
                findCus = this.employees_2.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
                this.selectedEmp = findCus.data.id;
                this.employee_2 = findCus.label;
                this.loadLazy(this.event);
            }
        } else {
            this.messageService.clear();
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
        }
    }
    //

    //#region Report
    async openModalReportPickupDetail(template: TemplateRef<any>, data: ReportPickupDelivery) {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
        this.lstReportPickupDetail = await this.reportService.getReportPickupDetail(data.id, this.selectedDateFrom, this.selectedDateTo);

        this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
    }

    async openModalReportDeliveryDetail(template: TemplateRef<any>, data: ReportPickupDelivery) {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
        this.lstReportDeliveryDetail = await this.reportService.getReportDeliveryDetail(data.id, this.selectedDateFrom, this.selectedDateTo);

        this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
    }

    async openModalReportDeliveryFail(template: TemplateRef<any>, data: ReportPickupDelivery) {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
        this.lstReportDeliveryFail = await this.reportService.getReportDeliveryFail(data.id, this.selectedDateFrom, this.selectedDateTo);
        console.log(this.lstReportPickupDetail);

        this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
    }
    //#endregion
}