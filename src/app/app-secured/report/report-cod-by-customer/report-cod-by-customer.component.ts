import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { DataTable, LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { ShipmentService, CustomerService } from '../../../services';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { Shipment } from '../../../models';
import * as moment from 'moment';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { DateRangeFromTo } from '../../../view-model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';

// declare var jQuery: any;

function s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
@Component({
    selector: 'report-cod-by-customer',
    templateUrl: './report-cod-by-customer.component.html',
    styles: []
})

export class ReportCODByCustomerComponent extends BaseComponent implements OnInit {
    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.ReportCODByCustomer.name;
    constructor(
        public permissionService: PermissionService,
        protected messageService: MessageService,
        public router: Router,
        //serivce
        private shipmentService: ShipmentService,
        private customerService: CustomerService,
    ) {
        super(messageService, permissionService, router);
        //
        const currentDate = moment(new Date()).format("YYYY/MM/DD");
        let orderDateFrom = currentDate + "T01:00:00";
        let orderDateTo = currentDate + "T23:59:59";

        this.shipmentFilterViewModel.Cols = this.includes;
        this.shipmentFilterViewModel.Type = ShipmentTypeHelper.codrecivereadypayment;
        this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
        this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
        // this.shipmentFilterViewModel.PageNumber = 1;
        // this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    }
    //
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
    //excel
    totalRecords: number = 0;
    totalRecevice: number = 0;

    shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();

    columnNameExcel: ColumnNameExcel = new ColumnNameExcel();
    columnsName: string[] = [
        this.columnNameExcel.shipmentNumber,
        this.columnNameExcel.orderDate,
        this.columnNameExcel.weight,
        this.columnNameExcel.shipmentStatus,
        this.columnNameExcel.cod,
        this.columnNameExcel.codReturn,
        this.columnNameExcel.codDeliveryComplete,
        this.columnNameExcel.codNotDeliveryComplete,
        this.columnNameExcel.codListCustomerPaymentCOD,
        this.columnNameExcel.codNotListCustomerPaymentCOD,
        this.columnNameExcel.totalPrice,
        this.columnNameExcel.totalPriceListCustomerPaymentTotalPrice,
        this.columnNameExcel.totalPriceNotListCustomerPaymentTotalPrice,
    ];
    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'SimpleExcel.xlsx';
    //ListData
    listData: Shipment[];
    event: LazyLoadEvent;
    //selected
    sendersLS: SelectItem[];
    selectedSenderLS: number;
    //search
    txtSearchText: string = "";
    //Page
    rowPerPage = 20;
    //datetime
    requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
    public eventLog = "";

    public dateRange = {
        start: moment().hour(1).minute(0).second(0),
        end: moment().hour(23).minute(59).second(0)
    }
    //
    ngOnInit() {
        this.initData()
    }
    //LoadListData
    initData() {
        this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        this.loadShipment();
    }
    async loadShipmentPaging() {
        await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
            if (x.isSuccess) {
                let data = x.data as Shipment[];
                this.listData = data.reverse();
                this.totalRecords = x.dataCount;
                this.sumTotalReceive();
            }
        });
    }
    loadShipment() {
        this.loadShipmentPaging();
        this.loadFilter();
    }
    loadFilter() {
        this.loadSenderLS();
    }
    loadSenderLS() {
        this.sendersLS = [];
        this.customerService.getAllSelectModelAsync().then(x => {
            this.sendersLS = x;
        })
    }
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.cod + shipment.totalPrice);
        }, 0)
    }
    //Change
    changeSender() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.SenderId = this.selectedSenderLS;
        this.loadShipmentPaging();
    }
    onPageChange(event: any) {
        this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
        this.shipmentFilterViewModel.PageSize = event.rows;
        this.loadShipmentPaging();
    }
    //lazy
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.listData) {

                this.listData.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
            }
        }, 250);
    }
    //search
    search() {
        this.shipmentFilterViewModel.SearchText = this.txtSearchText;
        this.loadShipmentPaging();
    }
    //Date time
    public selectedDate() {
        this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
        this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
        this.loadShipmentPaging();
    }

    public calendarEventsHandler(e: any) {
        this.eventLog += "\nEvent Fired: " + e.event.type;
    }
    public mainInput = {
        start: moment().subtract(0, "day"),
        end: moment()
    };
    //Excel
    public exportCSV(): void {
        let datas: any[] = [];
        datas.push([
            "STT",
            this.columnNameExcel.shipmentNumber,
            this.columnNameExcel.orderDate,
            this.columnNameExcel.weight,
            this.columnNameExcel.shipmentStatus,
            this.columnNameExcel.cod,
            this.columnNameExcel.codReturn,
            this.columnNameExcel.codDeliveryComplete,
            this.columnNameExcel.codNotDeliveryComplete,
            this.columnNameExcel.codListCustomerPaymentCOD,
            this.columnNameExcel.codNotListCustomerPaymentCOD,
            this.columnNameExcel.totalPrice,
            this.columnNameExcel.totalPriceListCustomerPaymentTotalPrice,
            this.columnNameExcel.totalPriceNotListCustomerPaymentTotalPrice,
        ])
        let i = 0;
        let tongCod = 0;
        let tongCodReturn = 0;
        let codDeliveryComplete = 0;
        let codNotDeliveryComplete = 0;
        let codListCustomerPaymentCOD = 0;
        let codNotListCustomerPaymentCOD = 0;
        let totalPrice = 0;
        let totalPriceListCustomerPaymentTotalPrice = 0;
        let totalPriceNotListCustomerPaymentTotalPrice = 0;
        this.listData.forEach(item => {
            let message = "";
            tongCod += this.listData[i].cod;
            tongCodReturn += (this.listData[i].isReturn ? this.listData[i].cod : 0);
            codDeliveryComplete += (this.listData[i].shipmentStatusId == 12 ? this.listData[i].cod : 0);
            codNotDeliveryComplete += (this.listData[i].shipmentStatusId != 12 ? this.listData[i].cod : 0);
            codListCustomerPaymentCOD += (this.listData[i].listCustomerPaymentCODId ? this.listData[i].cod : 0);
            codNotListCustomerPaymentCOD += (!this.listData[i].listCustomerPaymentCODId ? this.listData[i].cod : 0);
            totalPrice += this.listData[i].totalPrice;
            totalPriceListCustomerPaymentTotalPrice += (this.listData[i].listCustomerPaymentTotalPriceId ? this.listData[i].totalPrice : 0);
            totalPriceNotListCustomerPaymentTotalPrice += (!this.listData[i].listCustomerPaymentTotalPriceId ? this.listData[i].totalPrice : 0);
            datas.push([
                i + 1,
                this.listData[i].shipmentNumber,
                this.listData[i].orderDate,
                this.listData[i].weight,
                (this.listData[i].shipmentStatus ? this.listData[i].shipmentStatus.name : ""),
                this.listData[i].cod,
                (this.listData[i].isReturn ? this.listData[i].cod : 0),
                (this.listData[i].shipmentStatusId == 12 ? this.listData[i].cod : 0),
                (this.listData[i].shipmentStatusId != 12 ? this.listData[i].cod : 0),
                (this.listData[i].listCustomerPaymentCODId ? this.listData[i].cod : 0),
                (!this.listData[i].listCustomerPaymentCODId ? this.listData[i].cod : 0),
                this.listData[i].totalPrice,
                (this.listData[i].listCustomerPaymentTotalPriceId ? this.listData[i].totalPrice : 0),
                (!this.listData[i].listCustomerPaymentTotalPriceId ? this.listData[i].totalPrice : 0),
            ])
            i++;
        })
        datas.push([
            "", "", "", "", "Tổng cộng", tongCod, tongCodReturn, codDeliveryComplete, codNotDeliveryComplete, codListCustomerPaymentCOD, codNotListCustomerPaymentCOD, totalPrice, totalPriceListCustomerPaymentTotalPrice, totalPriceNotListCustomerPaymentTotalPrice
        ])
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        const wbout: string = XLSX.write(wb, this.wopts);
        saveAs(new Blob([s2ab(wbout)]), this.fileName);
    }
    //refresh
    refresh() { }
}
export class ColumnNameExcel {
    shipmentNumber: string = "Bill/mã vận đơn";
    orderDate: string = "Ngày đi";
    weight: string = "Trọng lượng" + environment.unit;
    shipmentStatus: string = "Lộ trình";
    cod: string = "Thu hộ (COD)";
    codReturn: string = "COD (Hoàn)";
    codDeliveryComplete: string = "Đã thu COD";
    codNotDeliveryComplete: string = "Chưa thu COD";
    codListCustomerPaymentCOD: string = "Đã TT COD";
    codNotListCustomerPaymentCOD: string = "Chưa TT COD";
    totalPrice: string = "Tổng cước";
    totalPriceListCustomerPaymentTotalPrice: string = "Đã TT cước";
    totalPriceNotListCustomerPaymentTotalPrice: string = "Chưa TT cước";
}