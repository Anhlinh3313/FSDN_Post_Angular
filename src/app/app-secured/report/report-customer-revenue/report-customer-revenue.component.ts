import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService, LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CustomerService, ReportService, ShipmentService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { Customer, Shipment } from '../../../models';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as moment from 'moment';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { MineTypeHelper } from '../../../infrastructure/mimeType.helper';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-report-customer-revenue',
    templateUrl: 'report-customer-revenue.component.html',
    styles: []
})

export class ReportCustomerRevenueComponent extends BaseComponent implements OnInit {

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportCustomerRevenue.name;
    //
    customers: SelectModel[] = [];
    customerTypes: SelectItem[];
    filteredCustomers: any;
    customer: any;
    selectedCustomer: number;
    selectedCustomerType: number;
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
    datasource: Shipment[];
    listData: Shipment[];
    totalRecords: number;
    totalRecevice: number = 0;
    maxRecordExport = 200;
    //
    columnsExpBeta: any[] = [
        { field: "rowNum", header: 'STT' },
        { field: "receiverCode2", header: 'Mã Người nhận' },
        { field: "orderDate", header: 'Giờ Gửi' },
        { field: "orderDate2", header: 'Ngày Gửi' },
        { field: "shipmentNumber", header: 'Vận Đơn' },
        { field: "cod", header: 'COD' },
        { field: "insured", header: 'Giá Trị HH' },
        { field: "totalBox", header: "Số Kiện" },
        { field: "weight", header: "Trọng Lượng" },
        { field: "receiverName", header: "Người Nhận" },
        { field: "receiverPhone", header: "SĐT Nhận" },
        { field: "toProvinceName", header: "Tỉnh Thành" },
        { field: "toDistrictName", header: "Quận Huyện" },
        { field: "toWardName", header: "Phường Xã" },
        { field: "shippingAddress", header: "ĐC Phát" },
        { field: "content", header: "Nội dung hàng hóa" },
        { field: "deliveryNote", header: "Mô tả Phát" },
        { field: "note", header: "Ghi Chú Bill" },
        { field: "shipmentStatusName", header: 'Tiến độ thực hiện đơn hàng' },
        { field: "userCode", header: 'Mã NV thao tác cuối' },
        { field: "fullName", header: 'Tên NV thao tác cuối' },
        { field: "endPickTime", header: 'Thời gian nhập kho' },
        { field: "endDeliveryTime", header: 'Thời gian giao hàng thành công'},
        { field: "realRecipientName", header: 'Người nhận hàng' },
        { field: "deliveryWhenOne", header: 'Thời gian giao hàng lần 1'},
        { field: "deliveryReasonOne", header: 'Lý do ko giao được lần 1' },
        { field: "deliveryWhenTwo", header: 'Thời gian giao hàng lần 2'},
        { field: "deliveryReasonTwo", header: 'Lý do ko giao được lần 2' },
        { field: "deliveryWhenThree", header: 'Thời gian giao hàng lần 3'},
        { field: "deliveryReasonThree", header: 'Lý do ko giao được lần 3' },
        { field: "endReturnTime", header: 'Hoàn hàng', typeFormat:'date'},
        { field: "returnReason", header: 'Lý do hoàn hàng' },
        { field: "kmNumber", header: 'Khoảng cách VSVX' },
        { field: "remoteAreasPrice", header: 'Phụ Phí VSVX' },
        { field: "priceCOD", header: 'Cước COD' },
        { field: "defaultPrice", header: 'Cước chính'},
        { field: "vatPrice", header: 'VAT' },
        { field: "fuelPrice", header: 'PPXD' },
        { field: "remoteAreasPrice", header: 'VSVX' },
        { field: "totalDVGT", header: 'Phí DVGT' },
        { field: "totalPrice", header: 'Tổng cước VC' },
        { field: "totalPricePay", header: 'Tổng cộng phí DV' },
        { field: "receiptCODCreatedWhen", header: 'Ngày BK nộp COD' },
    ];
    //
    columsExpFormat: any[] = [
        { field: "rowNum", header: 'STT', typeFormat: "number"  },
        { field: "receiverCode2", header: 'Mã Người nhận' },
        { field: "orderDate", header: 'Giờ Gửi', typeFormat: "time", formatString: 'HH:mm' },
        { field: "orderDate2", header: 'Ngày Gửi', typeFormat: "date", formatString: 'dd/MM/yyyy' },
        { field: "shipmentNumber", header: 'Vận Đơn', typeFormat: "stringNumber" },
        { field: "cod", header: 'COD', typeFormat: "number", sumField: "sumCOD" },
        { field: "insured", header: 'Giá Trị HH', typeFormat: "number", sumField: "sumInsured" },
        { field: "totalBox", header: "Số Kiện", typeFormat: "number" },
        { field: "weight", header: "Trọng Lượng", typeFormat: "number" },
        { field: "receiverName", header: "Người Nhận" },
        { field: "receiverPhone", header: "SĐT Nhận" },
        { field: "toProvinceName", header: "Tỉnh Thành" },
        { field: "toDistrictName", header: "Quận Huyện" },
        { field: "toWardName", header: "Phường Xã" },
        { field: "shippingAddress", header: "ĐC Phát" },
        { field: "content", header: "Nội dung hàng hóa" },
        { field: "deliveryNote", header: "Mô tả Phát" },
        { field: "note", header: "Ghi Chú Bill" },
        { field: "shipmentStatusName", header: 'Tiến độ thực hiện đơn hàng' },
        { field: "userCode", header: 'Mã NV thao tác cuối' },
        { field: "fullName", header: 'Tên NV thao tác cuối' },
        { field: "endPickTime", header: 'Thời gian nhập kho', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "endDeliveryTime", header: 'Thời gian giao hàng thành công', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "realRecipientName", header: 'Người nhận hàng' },
        { field: "deliveryWhenOne", header: 'Thời gian giao hàng lần 1', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonOne", header: 'Lý do ko giao được lần 1' },
        { field: "deliveryWhenTwo", header: 'Thời gian giao hàng lần 2', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonTwo", header: 'Lý do ko giao được lần 2' },
        { field: "deliveryWhenThree", header: 'Thời gian giao hàng lần 3', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonThree", header: 'Lý do ko giao được lần 3' },
        { field: "endReturnTime", header: 'Hoàn hàng', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "returnReason", header: 'Lý do hoàn hàng' },
        { field: "kmNumber", header: 'Khoảng cách VSVX', typeFormat: "number" },
        { field: "remoteAreasPrice", header: 'Phụ Phí VSVX', typeFormat: "number" },
        // { field: "priceCOD", header: 'Cước COD', typeFormat: "number", sumField: "sumPriceCOD" },
        // { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
        // { field: "vatPrice", header: 'VAT', typeFormat: "number" },
        // { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
        // { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
        // { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
        // { field: "totalPrice", header: 'Tổng cước VC', typeFormat: "number", sumField: "sumTotalPrice" },
        { field: "totalPricePay", header: 'Tổng cộng phí DV', typeFormat: "number", sumField: "sumTotalPricePay" },
        { field: "receiptCODCreatedWhen", header: 'Ngày BK nộp COD', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
    ];
    textDate: string = '';
    textUser: string = '';
    selectedCompany: string = "";
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //
        public customerService: CustomerService,
        public reportService: ReportService,
        public shipmentService: ShipmentService,
    ) {
        super(messageService, permissionService, router);

        const currentDate = moment(new Date()).format("YYYY/MM/DD");
        let orderDateFrom = currentDate ;
        let orderDateTo = currentDate ;

        this.shipmentFilterViewModel.Cols = this.includes;
        this.shipmentFilterViewModel.Type = null;
        this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
        this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
        this.shipmentFilterViewModel.isReturn = false;
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
        this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        this.loadData();
    }
    //
    async loadData() {
        await this.shipmentService.getReportListShipment(this.shipmentFilterViewModel).then(x => {
            if (x.isSuccess) {
                let data = x.data as Shipment[];
                this.listData = data.reverse();
                this.totalRecords = (data && data.length > 0) ? data[0].totalCount : 0;
                this.sumTotalReceive();
            }
        });
    }
    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.cod + shipment.totalPrice);
        }, 0)
    }
    //
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
        // let index = cloneSelectedCustomer.indexOf(" -");
        // let customers: any;
        // if (index !== -1) {
        //     customers = cloneSelectedCustomer.substring(0, index);
        //     cloneSelectedCustomer = customers;
        // }
        this.customers.forEach(x => {
            let obj = x.data as Customer;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.selectedCustomer = obj.id;
                    this.selectedCompany = obj.companyName;
                    this.changeCustomer();
                }
            }
        });
    }
    changeCustomer() {
        this.shipmentFilterViewModel.SenderId = this.selectedCustomer;
        // this.loadData();
    }
    public selectedDate() {
        this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
        this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
        // this.loadData();
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
    onPageChange(event: any) {
        this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
        this.shipmentFilterViewModel.PageSize = event.rows;
        this.loadData();
    }
    //

    refresh() {
        this.customer = '';
        this.shipmentFilterViewModel = new ShipmentFilterViewModel();

        this.shipmentFilterViewModel.Cols = this.includes;
        this.shipmentFilterViewModel.Type = null;
        this.shipmentFilterViewModel.isReturn = false;
        this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    }

    async getDataInWhile(filterViewModel: ShipmentFilterViewModel) {
        var isGetSuccess: boolean = false;
        while (isGetSuccess == false) {
            var resDataEX = await this.shipmentService.getReportListShipment(filterViewModel);
            if (resDataEX && resDataEX.isSuccess == true) {
                isGetSuccess = true;
                return resDataEX;
            }
            else {
                isGetSuccess = false;
            }
        }
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
            let fileName = "BAO_CAO_DOANH_THU_KHACH_HANG.xlsx";
            if (this.totalRecords > 0) {
                if (this.totalRecords > this.maxRecordExport) {
                    let data: any[] = [];
                    let count = Math.ceil(this.totalRecords / this.maxRecordExport);
                    let promise = [];
                    for (let i = 1; i <= count; i++) {
                        let clone = this.shipmentFilterViewModel;
                        clone.PageNumber = i;
                        clone.PageSize = this.maxRecordExport;
                        var resDataEX = await this.getDataInWhile(clone);
                        promise.push(resDataEX);
                    }
                    Promise.all(promise).then(rs => {
                        rs.map(x => {
                            data = data.concat(x.data);
                        });

                        let dataE = data.reverse();
                        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExpBeta, true, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                } else {
                    let clone = this.shipmentFilterViewModel;
                    clone.PageNumber = 1;
                    clone.PageSize = this.totalRecords;

                    this.shipmentService.getReportListShipment(clone).then(x => {
                        let data = x.data.reverse();
                        dt.value = data;
                        var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExpBeta, true, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                }
            } else {
                dt.exportCSV();
            }
        }
    }

    async exportCSVNew(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_DOANH_THU_KHACH_HANG";
            let clone = this.shipmentFilterViewModel;
            clone.customExportFile.fileNameReport = fileName;
            clone.customExportFile.columnExcelModels = this.columnsExpBeta;
            clone.PageNumber = 1;
            clone.PageSize = this.totalRecords;
            this.shipmentService.getReportListShipmentExport(this.shipmentFilterViewModel);
        }
    }
    async exportCSVNewFormat(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_DOANH_THU_KHACH_HANG";
            let clone = this.shipmentFilterViewModel;
            if(this.selectedCompany!=="") {
                this.textUser = "Khách hàng: " + this.selectedCompany; 
                clone.customExportFile.textList.push(this.textUser);
            } 
            let fday =  moment(this.shipmentFilterViewModel.OrderDateFrom).format("DD/MM/YYYY");
            let tday =  moment(this.shipmentFilterViewModel.OrderDateTo).format("DD/MM/YYYY");
            this.textDate ="Ngày báo cáo: " + fday +" đến ngày " + tday;
            clone.customExportFile.textList.push(this.textDate);
            clone.customExportFile.linkLogo = environment.postUrl + environment.urlLogo;
            clone.customExportFile.nameReport = " BÁO CÁO DOANH THU KHÁCH HÀNG";
            clone.customExportFile.fileNameReport  = fileName;
            clone.customExportFile.columnExcelModels = this.columsExpFormat;
            clone.PageNumber = 1;
            clone.PageSize = this.totalRecords;
            await this.shipmentService.getReportListShipmentExport(clone);
        }
    }
}