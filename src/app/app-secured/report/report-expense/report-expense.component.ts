import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService, AccountingAccountService } from '../../../services';
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
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ReportExpenseFilterModel } from '../../../models/reportExpenseFilter.model';

@Component({
    selector: 'app-report-costs',
    templateUrl: './report-expense.component.html',
    styles: []
})
export class ReportExpenseComponent extends BaseComponent implements OnInit {
    hub = environment;
    selectedAccounting: any;

    constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
        private shipmentService: ShipmentService,
        private hubService: HubService,
        private userService: UserService,
        private reportService: ReportService,
        public permissionService: PermissionService,
        public router: Router,
        public accountingAccountService: AccountingAccountService
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportCosts.name;

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'ReportPickupDelivery.xlsx';


    listAccountingAccount: SelectModel[];

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
    filterModel = new ReportExpenseFilterModel();
    //============================
    //END Danh sách bảng kê nộp tiền về TT/CN/T
    //============================
    empCurrents: any[] = [];
    empCurrent: any;
    filterEmpCurrents: any[] = [];
    // Modal report
    bsModalRef: BsModalRef;

    columnsExpBeta: any[] = [
        { field: 'rowNum', header: 'STT' },
        { field: 'acceptDate', header: 'Ngày', typeFormat: "date", formatString: 'DD/MM/YYYY' },
        { field: 'accountingAccountCode', header: 'Tài khoản' },
        { field: 'accountingAccountName', header: 'Tên tài khoản' },
        { field: 'note', header: 'Mô tả' },
        { field: 'moneyDifference', header: 'Tiền chênh lệch', typeFormat: "number" },
        { field: 'feeBank', header: 'Phí ngân hàng', typeFormat: "number" },
        { field: 'grandTotal', header: 'Số tiền nộp', typeFormat: "number" },
        { field: 'grandTotalReal', header: 'Nhận thực tế', typeFormat: "number" },
        { field: 'fullName', header: 'Nhân viên' }
    ]
    //

    selectedDateFrom: any = null;
    selectedDateTo: any = null;
    ngOnInit() {
        this.initData();
        this.loadAll_AccountingAccount();
    }

    initData() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(new Date()).toDate());
        this.loadFilter();
        this.load_Expense();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async load_Expense() {
        if (this.selectedDateFrom) this.filterModel.dateFrom = this.selectedDateFrom;
        if (this.selectedDateTo) this.filterModel.dateTo = this.selectedDateTo;
        this.filterModel.accountingAccountId = this.selectedAccounting;
        this.filterModel.hubId = this.selectedHub;
        let x = await this.reportService.getReportExpenseReceiveMoney(this.filterModel);
        this.datasource = x;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        // 
    }

    async loadAll_AccountingAccount() {
        const res = await this.accountingAccountService.getAll().toPromise();
        if (res.isSuccess) {
            this.listAccountingAccount = [];
            const datas = res.data as any[];

            this.listAccountingAccount.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
            datas.forEach(element => {
                this.listAccountingAccount.push({
                    label: `${element.code} - ${element.name}`,
                    data: element,
                    value: element.id
                });
            });
        }
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
        this.load_Expense();
    }
    changeHub() {
        if (this.selectedHub) this.selectedHubId = this.selectedHub;
        else this.selectedHubId = null;
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
        let fileName = "BAO_CAO_CHINH_SUA_VAN_DON";
        let clone = this.filterModel;
        clone.customExportFile.fileNameReport = fileName;
        clone.customExportFile.columnExcelModels = this.columnsExpBeta;
        this.reportService.getReportExpenseReceiveMoneyExcel(clone);

    }
    s2ab(s: string): ArrayBuffer {
        const buf: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    filterEmpCurrent(event) {
        let value = event.query;
        if (value.length >= 1) {
            this.userService.getSearchByValueAsync(value, null).then(
                x => {
                    if (x) {
                        this.empCurrents = [];
                        this.filterEmpCurrents = [];
                        this.filterEmpCurrents.push('-- Chọn tất cả --');
                        x.map(m => {
                            this.empCurrents.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
                            this.filterEmpCurrents.push(`${m.code} ${m.name}`);
                        });
                    }
                }
            );
        }
    }
    
    onSelectedEmpCurrent() {
        let cloneSelectedEmpCurrent = this.empCurrent;
        let findUser = this.empCurrents.find(f => f.label == cloneSelectedEmpCurrent);
        if (findUser) {
            this.filterModel.userId = findUser.value;
        } else {
            this.filterModel.userId = null;
        }
        // this.loadShipment();
    }

}