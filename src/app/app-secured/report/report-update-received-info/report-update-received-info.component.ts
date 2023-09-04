import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService } from '../../../services';
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
import { ReportPaymentEmployeesModel } from '../../../models/reportPaymentEmployees.model';
import { ReportUpdateReceiveInformationModel } from '../../../models/reportUpdateReceiveInformation.model'; 
import { ReportFilterViewModel } from '../../../models/reportFilterViewModel.model ';


@Component({
  selector: 'app-report-update-received-info',
  templateUrl: './report-update-received-info.component.html',
  styles: []
})
export class ReportUpdateReceivedInfoComponent extends BaseComponent implements OnInit {
    hub = environment; 

    constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
        private reportService: ReportService,
        private hubService: HubService,
        private userService: UserService, 
        public permissionService: PermissionService,
        public router: Router,
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportUpdateReceivedInfo.name;

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'Baocao.xlsx';

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
    datasource: any[];
    listData: ReportPickupDelivery[];
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
    columnExportCSV1 : any[] = [ 
        { field: 'currentEmpName', header: 'Tên nhân viên' },
        { field: 'totalBillIn1Hour', header: 'Tổng trong 1h' },
        { field: 'totalPercentIn1Hour', header: 'Tỷ lệ trong vòng 1h' },
        { field: 'totalBillIn12Hour', header: 'Tổng trong 12h' },
        { field: 'totalPercentIn12Hour', header: 'Tỷ lệ trong vòng 12h' },
        { field: 'totalBillIn24Hour', header: 'Tổng trong 24h' },
        { field: 'totalPercentIn24Hour', header: 'Tỷ lệ trong vòng 24h' },
        { field: 'totalBillIn36Hour', header: 'Tổng trong 36h' },
        { field: 'totalPercentIn36Hour', header: 'Tỷ lệ trong vòng 36h' },
        { field: 'totalBillIn48Hour', header: 'Tổng trong 48h' },
        { field: 'totalPercentIn48Hour', header: 'Tỷ lệ trong vòng 48h' },
        { field: 'totalBillIn48ThanHour', header: 'Tổng trên 48h' },
        { field: 'totalPercentIn48ThanHour', header: 'Tỷ lệ trên 48j' },
        { field: 'totalBillAppTC', header: 'Tổng AppTC' },
        { field: 'totalPercentAppTC', header: 'Tỷ lệ AppTC' },
        { field: 'totalBillAppTreo', header: 'Tổng App treo' },
        { field: 'totalPercentAppTreo', header: 'Tỷ lệ App Treo' },
        { field: 'totalBill', header: 'Tổng vận đơn' },
    ]
    columnExportCSV2 : any[] = [ 
        { field: 'currentEmpName', header: 'Tên nhân viên' },  
        { field: 'totalBillIn24Hour', header: 'Tổng trong 24h' },
        { field: 'totalPercentIn24Hour', header: 'Tỷ lệ trong vòng 24h' }, 
        { field: 'totalBillIn48Hour', header: 'Tổng trong 48h' },
        { field: 'totalPercentIn48Hour', header: 'Tỷ lệ trong vòng 48h' },
        { field: 'totalBillIn48ThanHour', header: 'Tổng trên 48h' },
        { field: 'totalPercentIn48ThanHour', header: 'Tỷ lệ trên 48j' },
        { field: 'totalBillAppTC', header: 'Tổng AppTC' },
        { field: 'totalPercentAppTC', header: 'Tỷ lệ AppTC' },
        { field: 'totalBillAppTreo', header: 'Tổng App treo' },
        { field: 'totalPercentAppTreo', header: 'Tỷ lệ App Treo' },
        { field: 'totalBill', header: 'Tổng vận đơn' },
    ]
    selectedDateFrom: any;
    selectedDateTo: any;
    ngOnInit() {
        this.initData();
    }

    initData() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.loadFilter();
        this.loadReport(1);
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadReport(type: number) {
        let x : any = null;
        if(type==1){
            x = await this.reportService.reportUpdateReceiveInformationAsync(this.selectedHubId, this.selectedEmpId, this.selectedDateFrom, this.selectedDateTo);
            this.datasource = x.data as ReportUpdateReceiveInformationModel[];
        }else{
            x = await this.reportService.getReportPaymentEmployeesAsync(this.selectedHubId, this.selectedEmpId, this.selectedDateFrom, this.selectedDateTo);
            this.datasource = x.data as ReportPaymentEmployeesModel[];
        }
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        //
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
    refresh(type: number) {
        this.loadReport(type);
    }
    changeHub(type:number) {
        if (this.selectedHub) this.selectedHubId = this.selectedHub;
        else this.selectedHubId = null;
        this.loadUser(this.selectedHubId);
    }
    changeUser(type: number) {
        if (this.selectedEmp) this.selectedEmpId = this.selectedEmp;
        else this.selectedEmpId = null;
    }
    public eventLog = '';

    public selectedDate(type: number) {
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

     
    async exportCSV(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_CAP_NHAT_THONG_TIN_NHAN";
            let clone = new ReportFilterViewModel();
            clone.customExportFile.fileNameReport = fileName;
            clone.DateFrom = this.selectedDateFrom;
            clone.DateTo =  this.selectedDateTo; 
            clone.HubId = this.selectedHubId;
            clone.EmpId = this.selectedEmpId;
            if(dt==1)
                {
                    clone.customExportFile.columnExcelModels = this.columnExportCSV1;
                    this.reportService.GetReportUpdateReceiveInformationExportExcel(clone);
                }
            else {
                clone.customExportFile.columnExcelModels = this.columnExportCSV2;
                this.reportService.GetReportPaymentEmployeesExportExcel(clone);
            }
        }
    }

    s2ab(s: string): ArrayBuffer {
        const buf: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    // onTabChange($event)
   async onTabChange(e){
        let index = e.index;
        console.log(index);
        if(index==1) this.loadReport(1);
        else this.loadReport(2);
    }
}