import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService, LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CustomerService, ReportService, ShipmentService, HubService, UserService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as moment from 'moment';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { environment } from '../../../../environments/environment';
import { ReportHanldeEmployee } from '../../../models/reportHanleEmployee.model';

@Component({
    selector: 'app-report-handle-employee',
    templateUrl: 'report-handle-employee.component.html',
    styles: []
})

export class ReportHandleEmployeeComponent extends BaseComponent implements OnInit {

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportHandleEmployee.name;
    envi = environment;
    //
    fromHubSelected: any;
    customers: SelectModel[];
    fromHubFilters: any[] = [];
    //
    empCurrents: any[] = [];
    empCurrent: any;
    filterEmpCurrents: any[] = [];
    //
    listGroupStatus: SelectItem[] = [
        // { value: null, label: `-- Tất cả --` },
        { value: 1, label: `NV chưa xác nhận vđ` },
        { value: 2, label: `NV đang giữ vđ` },
        { value: 4, label: `NV chưa nộp tiền` },
        { value: 5, label: `Thủ quỷ chưa xác nhận` },
        { value: 3, label: `Kho đang giữ vđ` },];
    //
    selectedDateFrom: any;
    selectedDateTo: any;
    rowPerPage = 20;
    public dateRange = {
        start: moment(),
        end: moment()
    }
    shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    //
    event: LazyLoadEvent;
    columns: [];
    //
    allHubs: SelectModel[] = [];
    datasource: ReportHanldeEmployee[];
    listData: ReportHanldeEmployee[];
    totalRecords: number;
    totalRecevice: number = 0;
    totalMustReceivePrice: number = 0;
    totalMustReceiveCOD: number = 0;
    totalKeepingPrice: number = 0;
    totalKeepingCOD: number = 0;
    totalAwaitAcceptPrice: number = 0;
    totalAwaitAcceptCOD: number = 0;
    maxRecordExport = 200;
    //
    columnsExp: any[] = [
        { field: "shipmentNumber", header: 'Mã vận đơn' },
        { field: "senderName", header: 'Người gửi' },
        { field: "receiverName", header: 'Người nhận' },
        { field: "shippingAddress", header: 'Địa chỉ nhận' },
        { field: "insured", header: 'Giá Trị HH', typeFormat: "number" },
        { field: "cod", header: 'COD', typeFormat: "number" },
        { field: "shipmentStatusName", header: 'Tiến độ thực hiện đơn hàng' },
        { field: "lastDatetimeUpdate", header: 'Thời gian thao tác cuối' },
        { field: "timeCompare", header: 'Đã thao tác (h)' },
        { field: "userCode", header: 'Mã NV thao tác cuối' },
        { field: "userFullName", header: 'Tên NV thao tác cuối' },
        { field: "realRecipientName", header: 'Người nhận hàng' },
        { field: "endDeliveryTime", header: 'Thời gian giao hàng thành công', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
        { field: "mustReceiveCOD", header: 'COD phải thu', typeFormat: "number" },
        { field: "mustReceivePrice", header: 'Cước phải thu', typeFormat: "number" },
        { field: "keepingCOD", header: 'COD đang giữ', typeFormat: "number" },
        { field: "keepingPrice", header: 'Cước đang giữ', typeFormat: "number" },
        { field: "awaitAcceptCOD", header: 'COD đã nộp', typeFormat: "number" },
        { field: "awaitAcceptPrice", header: 'Cước đã nộp', typeFormat: "number" },
    ];
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //
        public customerService: CustomerService,
        public reportService: ReportService,
        public hubService: HubService,
        public userService: UserService
    ) {
        super(messageService, permissionService, router);

        const timeThreeMonth = moment((new Date()).setMonth((new Date().getMonth(), -3))).format("YYYY/MM/DD");
        const currentDate = moment(new Date()).format("YYYY/MM/DD");

        this.shipmentFilterViewModel.Cols = this.includes;
        this.shipmentFilterViewModel.Type = null;
        this.shipmentFilterViewModel.OrderDateFrom = timeThreeMonth;
        this.shipmentFilterViewModel.OrderDateTo = currentDate;
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    }
    includes: string =
        Constant.classes.includes.shipment.fromHubRouting + "," +
        Constant.classes.includes.shipment.shipmentStatus + "," +
        Constant.classes.includes.shipment.service + "," +
        Constant.classes.includes.shipment.fromHub + "," +
        Constant.classes.includes.shipment.toHub + "," +
        Constant.classes.includes.shipment.toHubRouting + "," +
        Constant.classes.includes.shipment.pickUser + "," +
        Constant.classes.includes.shipment.fromWard + "," +
        Constant.classes.includes.shipment.toWard + "," +
        Constant.classes.includes.shipment.fromDistrict + "," +
        Constant.classes.includes.shipment.fromProvince + "," +
        Constant.classes.includes.shipment.toDistrict + "," +
        Constant.classes.includes.shipment.toProvince + "," +
        Constant.classes.includes.shipment.deliverUser + "," +
        Constant.classes.includes.shipment.paymentType + "," +
        Constant.classes.includes.shipment.sender + "," +
        Constant.classes.includes.shipment.structure + "," +
        Constant.classes.includes.shipment.serviceDVGT + "," +
        Constant.classes.includes.shipment.boxes;
    ngOnInit() {
        this.shipmentFilterViewModel.OrderDateFrom = moment((new Date()).setMonth((new Date().getMonth() - 3))).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.groupStatusId = 1;
        this.loadData();
    }
    //
    selectEmployy(){

    }
    async loadData() {
        await this.reportService.getReportHandleEmployee(this.shipmentFilterViewModel.CurrentHubId, this.shipmentFilterViewModel.currentEmpId,
            this.shipmentFilterViewModel.isGroupEmp, this.shipmentFilterViewModel.groupStatusId, null, this.shipmentFilterViewModel.OrderDateFrom,
            this.shipmentFilterViewModel.OrderDateTo, this.shipmentFilterViewModel.PageNumber, this.shipmentFilterViewModel.PageSize).then(x => {
                if (x) {
                    let data = x;
                    this.listData = data.reverse();
                    this.totalRecords = (x && x.length > 0) ? x[0].totalCount : 0;
                    this.totalMustReceivePrice = (x && x.length > 0) ? x[0].totalMustReceivePrice : 0;
                    this.totalMustReceiveCOD = (x && x.length > 0) ? x[0].totalMustReceiveCOD : 0;
                    this.totalKeepingPrice = (x && x.length > 0) ? x[0].totalKeepingPrice : 0;
                    this.totalKeepingCOD = (x && x.length > 0) ? x[0].totalKeepingCOD : 0;
                    this.totalAwaitAcceptPrice = (x && x.length > 0) ? x[0].totalAwaitAcceptPrice : 0;
                    this.totalAwaitAcceptCOD = (x && x.length > 0) ? x[0].totalAwaitAcceptCOD : 0;
                    this.sumTotalReceive();
                }
            });
    }
    sumTotalReceive() {
        // this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
        //     return priceKeeping += (shipment.cod + shipment.totalPrice);
        // }, 0)
    }
    //
    eventOnSelectedFromHub() {
        let findH = this.allHubs.find(f => f.label == this.fromHubSelected);
        if (findH) {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.CurrentHubId = findH.value;
        } else {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.CurrentHubId = null;
        }
    }
    //
    async eventFilterFromHubs(event) {
        let value = event.query;
        if (value.length >= 1) {
            await this.hubService.getHubSearchByValueAsync(value, null).then(
                x => {
                    this.allHubs = [];
                    this.fromHubFilters = [];
                    this.fromHubFilters.push("-- Chọn tất cả --");
                    x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
                    this.allHubs.map(m => this.fromHubFilters.push(m.label));
                }
            );
        }
    }
    //
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
            this.shipmentFilterViewModel.currentEmpId = findUser.value;
        } else {
            this.shipmentFilterViewModel.currentEmpId = null;
        }
    }
    //
    public selectedDate() {
        this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
        this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
    }
    //
    changeFilter() {
        this.loadLazy(this.event);
    }
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.listData) {

                this.listData.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
            }
        }, 250);
    }
    onPageChange(event: any) {
        this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
        this.shipmentFilterViewModel.PageSize = event.rows;
        this.loadData();
    }
    //

    refresh() {
        this.shipmentFilterViewModel = new ShipmentFilterViewModel();
        this.shipmentFilterViewModel.Cols = this.includes;
        this.shipmentFilterViewModel.Type = null;
        this.shipmentFilterViewModel.isReturn = false;
        this.shipmentFilterViewModel.OrderDateFrom =  moment((new Date()).setMonth((new Date().getMonth() - 3))).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    }
    //
    async exportCSV(dt: any) {
        var options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
        };
        if (dt) {
            let fileName = "BAO_CAO_GIAM_SAT_NV.xlsx";
            if (this.totalRecords > 0) {
                if (this.totalRecords > this.maxRecordExport) {
                    let data: any[] = [];
                    let count = Math.ceil(this.totalRecords / this.maxRecordExport);
                    let promise = [];

                    for (let i = 1; i <= count; i++) {
                        let clone = this.shipmentFilterViewModel;
                        clone.PageNumber = i;
                        clone.PageSize = this.maxRecordExport;

                        promise.push(await this.reportService.getReportHandleEmployee(clone.CurrentHubId, clone.currentEmpId,
                            clone.isGroupEmp, clone.groupStatusId, null, clone.OrderDateFrom,
                            clone.OrderDateTo, clone.PageNumber, clone.PageSize));
                    }
                    Promise.all(promise).then(rs => {
                        rs.map(x => {
                            data = data.concat(x);
                        });

                        let dataE = data.reverse();
                        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp, false, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX,fileName);
                    });
                } else {
                    let clone = this.shipmentFilterViewModel;
                    clone.PageNumber = 1;
                    clone.PageSize = this.totalRecords;

                    this.reportService.getReportHandleEmployee(clone.CurrentHubId, clone.currentEmpId,
                        clone.isGroupEmp, clone.groupStatusId, null, clone.OrderDateFrom,
                        clone.OrderDateTo, clone.PageNumber, clone.PageSize).then(x => {
                        let data = x.reverse();
                        dt.value = data;
                        var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExp, false, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX,fileName);
                    });
                }
            } else {
                dt.exportCSV();
            }
        }
    }
}