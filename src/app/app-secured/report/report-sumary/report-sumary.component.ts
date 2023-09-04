import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, SelectItemGroup } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService, ServiceDVGTService, CustomerService, ServiceService, PaymentTypeService, ShipmentStatusService, UploadService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer } from '../../../models/index';
import { PersistenceService } from 'angular-persistence';
import { Shipment } from '../../../models/shipment.model';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { MineTypeHelper } from '../../../infrastructure/mimeType.helper';

@Component({
    selector: 'app-report-sumary',
    templateUrl: 'report-sumary.component.html',
    styles: []
})
export class ReportSumaryComponent extends BaseComponent implements OnInit {
    allHubs: SelectModel[] = [];
    currentHubFilters: any[] = [];
    currentHubSelected: any;
    toHubFilters: any[] = [];
    toHubSelected: any;
    fromHubFilters: any[] = [];
    fromHubSelected: any;
    placeHolderHub: string;
    maxRecordExport = 200;
    hub = environment;
    unit = environment.unit;

    type: string = ShipmentTypeHelper.reportsummary;
    pageSizExcel: number = 500;
    allDatasource: Shipment[] = [];
    receiverHub: any[];
    filterRows: Shipment[];
    rowPerPage: number = 20;
    pageNum = 1;
    provinces : SelectItem[];
    shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    shipmentAllFilterViewModel: ShipmentFilterViewModel;
    typeDelivery: string;
    isSuccessDelivery: boolean;
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
        protected bsModalRef: BsModalRef,
        protected uploadService: UploadService,
        protected provinceService: ProvinceService,
        
        public permissionService: PermissionService,
        public router: Router,
    ) {
        super(messageService, permissionService, router);
    }

    fileName: string = 'ReportSummary.xlsx';

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportSumary.name;

    customer: any;
    filteredCustomers: any;

    selectedFromDate: any;
    selectedToDate: any;

    //============================
    //BEGIN
    //============================
    txtFilterGb: any;
    txtFilterShipment: any;
    totalRecords: number;
    totalRecevice: number = 0;
    columns: string[] = ["rowNum", "shipmentNumber", "orderDate", "sender.code", "sender.name", "senderPhone", "pickingAddress", "fromProvince.name",
        "fromWard.name", "receiverName", "receiverPhone", "shippingAddress", "addressNoteTo", "toProvince.name", "toWard.name", "service.name",
        "structure.name", "content", "weight", "calWeight", "totalBox", "defaultPrice", "fuelPrice",
        "otherPrice", "totalDVGT", "vatPrice", "totalPrice", "cod", "fromHub.name", "currentHub.name",
        "toHub.name", "paymentType.name", "pickUser.fullName", "startPickTime", "transferUser.fullName",
        "deliverUser.fullName", "endDeliveryTime", "endReturnTime", "endPickTime", "receiptCODCode"];
    columnsExp: any[] = [
        { field: "rowNum", header: 'STT' },
        { field: "shipmentNumber", header: 'Mã vận đơn', typeFormat: "stringNumber" },
        { field: "cusNote", header: 'Yêu cầu phục vụ' },
        { field: "note", header: 'Ghi chú' },
        { field: "orderDate", header: 'Ngày VĐ', typeFormat: "date", formatString: 'dd/MM/yyyy' },
        { field: "orderDate2", header: 'Giờ VĐ', typeFormat: "time", formatString: 'HH:mm' },
        { field: "paymentTypeName", header: 'HTTT' },
        { field: "serviceName", header: 'Dịch vụ' },
        { field: "ServiceDVGTCodes", header: 'Dịch vụ gia tăng' },
        { field: "content", header: 'Nội dung HH' },
        { field: "insured", header: "Khai gía", typeFormat: "number", sumField: "sumInsured" },
        { field: "cod", header: "COD", typeFormat: "number", sumField: "sumCOD" },
        { field: "priceCOD", header: "Cước COD", typeFormat: "number", sumCOD: "sumPriceCOD" },
        { field: "totalBox", header: "Số kiện" },
        { field: "weight", header: "Số kg", typeFormat: "number" },
        { field: "distance", header: "Số km", typeFormat: "number" },
        { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
        { field: "vatPrice", header: 'VAT', typeFormat: "number" },
        { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
        { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
        { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
        { field: "totalPrice", header: 'Tổng cước VC', typeFormat: "number", sumField: "sumTotalPrice" },
        { field: "totalPricePay", header: 'Tổng cước TT', typeFormat: "number", sumField: "sumTotalPricePay" },
        { field: "shipmentStatusName", header: 'Trạng thái' },
        { field: "senderCode", header: 'Mã khách gửi' },
        { field: "senderName", header: 'Tên người gửi' },
        { field: "senderPhone", header: 'Đt gửi' },
        { field: "companyNameFrom", header: 'CTY gửi' },
        { field: "pickingAddress", header: 'Địa chỉ gửi' },
        { field: "fromProvinceName", header: 'Tỉnh đi' },
        { field: "fromHubName", header: 'Trạm lấy' },
        { field: "fromHubRoutingName", header: 'Tuyến lấy' },
        { field: "receiverName", header: 'Tên người nhận' },
        { field: "receiverPhone", header: 'Đt nhận' },
        { field: "companyTo", header: 'CTY nhận' },
        { field: "addressNoteTo", header: 'Địa chỉ nhận chi tiết' },
        { field: "shippingAddress", header: 'Địa chỉ nhận' },
        { field: "realRecipientName", header: 'Tên người nhận thực tế' },
        { field: "receiverCode2", header: 'Mã người nhận' },
        { field: "endDeliveryTime", header: 'TG giao hàng' },
        { field: "timeCompareString", header: 'Thời gian (h)' },
        { field: "deliveryWhenOne", header: 'Thời gian giao hàng lần 1' },
        { field: "deliveryReasonOne", header: 'Lý do ko giao được lần 1' },
        { field: "deliveryWhenTwo", header: 'Thời gian giao hàng lần 2' },
        { field: "deliveryReasonTwo", header: 'Lý do ko giao được lần 2' },
        { field: "deliveryWhenThree", header: 'Thời gian giao hàng lần 3' },
        { field: "deliveryReasonThree", header: 'Lý do ko giao được lần 3' },
        { field: "toProvinceName", header: 'Tỉnh đến' },
        { field: "toDistrictName", header: 'Quận/huyện đến' },
        { field: "toWardName", header: 'Phường/xã đến' },
        { field: "kmNumber", header: 'km VSVX' },
        { field: "toHubName", header: 'Trạm giao' },
        { field: "toHubRoutingName", header: 'Tuyến giao' },
        { field: "userCode", header: 'Mã nv thao tác cuối' },
        { field: "fullName", header: 'NV thao tác cuối' },
        { field: "endPickTime", header: 'Ngày nhập kho lấy hàng' },
        { field: "inOutDate", header: 'Ngày xuất/nhập kho cuối' },
        { field: "receiptCODCode", header: 'BK nộp COD' },
        { field: "receiptCODCreatedWhen", header: 'Ngày tạo BK nộp COD', typeFormat: "date" }
    ];
    columnsExpFormat: any[] = [
        { field: "rowNum", header: 'STT' },
        { field: "shipmentNumber", header: 'Mã vận đơn', typeFormat: "stringNumber" },
        { field: "cusNote", header: 'Yêu cầu phục vụ' },
        { field: "note", header: 'Ghi chú' },
        { field: "orderDate", header: 'Ngày VĐ', typeFormat: "date", formatString: 'dd/MM/yyyy' },
        { field: "orderDate2", header: 'Giờ VĐ', typeFormat: "time", formatString: 'HH:mm' },
        { field: "paymentTypeName", header: 'HTTT' },
        { field: "serviceName", header: 'Dịch vụ' },
        { field: "ServiceDVGTCodes", header: 'Dịch vụ gia tăng' },
        { field: "content", header: 'Nội dung HH' },
        { field: "insured", header: "Khai gía", typeFormat: "number", sumField: "sumInsured" },
        { field: "cod", header: "COD", typeFormat: "number", sumField: "sumCOD" },
        { field: "priceCOD", header: "Cước COD", typeFormat: "number", sumCOD: "sumPriceCOD" },
        { field: "totalBox", header: "Số kiện" },
        { field: "weight", header: "Số kg", typeFormat: "number" },
        { field: "distance", header: "Số km", typeFormat: "number" },
        { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
        { field: "vatPrice", header: 'VAT', typeFormat: "number" },
        { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
        { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
        { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
        { field: "totalPrice", header: 'Tổng cước VC', typeFormat: "number", sumField: "sumTotalPrice" },
        { field: "totalPricePay", header: 'Tổng cước TT', typeFormat: "number", sumField: "sumTotalPricePay" },
        { field: "shipmentStatusName", header: 'Trạng thái' },
        { field: "senderCode", header: 'Mã khách gửi' },
        { field: "senderName", header: 'Tên người gửi' },
        { field: "senderPhone", header: 'Đt gửi' },
        { field: "companyNameFrom", header: 'CTY gửi' },
        { field: "pickingAddress", header: 'Địa chỉ gửi' },
        { field: "fromProvinceName", header: 'Tỉnh đi' },
        { field: "fromHubName", header: 'Trạm lấy' },
        { field: "fromHubRoutingName", header: 'Tuyến lấy' },
        { field: "receiverName", header: 'Tên người nhận' },
        { field: "receiverPhone", header: 'Đt nhận' },
        { field: "companyTo", header: 'CTY nhận' },
        { field: "addressNoteTo", header: 'Địa chỉ nhận chi tiết' },
        { field: "shippingAddress", header: 'Địa chỉ nhận' },
        { field: "realRecipientName", header: 'Tên người nhận thực tế' },
        { field: "receiverCode2", header: 'Mã người nhận' },
        { field: "endDeliveryTime", header: 'TG giao hàng', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "timeCompareString", header: 'Thời gian (h)' },
        { field: "deliveryWhenOne", header: 'Thời gian giao hàng lần 1', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonOne", header: 'Lý do ko giao được lần 1' },
        { field: "deliveryWhenTwo", header: 'Thời gian giao hàng lần 2', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonTwo", header: 'Lý do ko giao được lần 2' },
        { field: "deliveryWhenThree", header: 'Thời gian giao hàng lần 3', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "deliveryReasonThree", header: 'Lý do ko giao được lần 3' },
        { field: "toProvinceName", header: 'Tỉnh đến' },
        { field: "toDistrictName", header: 'Quận/huyện đến' },
        { field: "toWardName", header: 'Phường/xã đến' },
        { field: "kmNumber", header: 'km VSVX' },
        { field: "toHubName", header: 'Trạm giao' },
        { field: "toHubRoutingName", header: 'Tuyến giao' },
        { field: "userCode", header: 'Mã nv thao tác cuối' },
        { field: "fullName", header: 'NV thao tác cuối' },
        { field: "endPickTime", header: 'Ngày nhập kho lấy hàng', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "inOutDate", header: 'Ngày xuất/nhập kho cuối', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
        { field: "receiptCODCode", header: 'BK nộp COD' },
        { field: "receiptCODCreatedWhen", header: 'Ngày tạo BK nộp COD', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' }
    ];
    datasource: Shipment[];
    listData: Shipment[];
    event: LazyLoadEvent; statuses: SelectItem[] = [
        { label: "Tất cả", value: null },
        { label: "Chưa lấy hàng", value: 1 },
        { label: "Đã lấy hàng ", value: 2 },
        { label: "Nhập kho trung chuyển", value: 3 },
        { label: "Đang trung chuyển", value: 4 },
        { label: "Nhập kho giao hàng", value: 5 },
        { label: "Đang giao hàng", value: 6 },
        { label: "Giao không thành công", value: 8 },
        { label: "Giao thành công", value: 7 },
        { label: "Đã trả hàng", value: 200 },
        { label: "Sự cố", value: 201 },
        { label: "Đền bù", value: 202 },
        // { label: "Khác", value: 8 },
    ];
    empCurrents: any[] = [];
    empCurrent: any;
    filterEmpCurrents: any[] = [];
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
    selectedToProvince:number[]= []
    public dateRange = {
        start: moment(),
        end: moment()
    }
    //    
    dataModalImages: string[] = [];

    configImageViewer = {
        wheelZoom: true
    }
    //============================
    //END 
    //============================

    ngOnInit() {
        this.initData(this.type);
        this.loadFilter();
    }

    ngAfterViewInit() {
        (<any>$('.ui-table-wrapper')).doubleScroll();
    }


    async initData(type: string) {
        this.provinces = await this.provinceService.getAllSelectModelAsync();
    this.provinces.splice(0,1)
        this.placeHolderHub = `Chọn ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName}`;
        this.shipmentFilterViewModel = new ShipmentFilterViewModel();
        this.shipmentAllFilterViewModel = new ShipmentFilterViewModel();
        let includes: string =
            Constant.classes.includes.shipment.fromHubRouting + "," +
            Constant.classes.includes.shipment.shipmentStatus + "," +
            Constant.classes.includes.shipment.listGoods + "," +
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
        let fromDate = null;
        let toDate = null;
        if (this.dateRange) {
            fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
            toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
        }
        this.shipmentFilterViewModel.Cols = includes;
        this.shipmentFilterViewModel.Type = type;
        this.shipmentFilterViewModel.OrderDateFrom = fromDate;
        this.shipmentFilterViewModel.OrderDateTo = toDate;
        this.shipmentFilterViewModel.PageNumber = this.pageNum;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
        // this.loadShipment();

        // for export Excel
        this.shipmentAllFilterViewModel.Cols = includes;
        this.shipmentAllFilterViewModel.Type = type;
        this.shipmentAllFilterViewModel.OrderDateFrom = fromDate;
        this.shipmentAllFilterViewModel.OrderDateTo = toDate;
        this.shipmentAllFilterViewModel.PageNumber = this.pageNum;
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment(): Promise<any> {
        // const res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel);
        // if (res.isSuccess) {
        //     this.datasource = res.data as Shipment[];
        //     this.totalRecords = res.dataCount;
        //     this.shipmentAllFilterViewModel.PageSize = this.totalRecords;
        //     this.listData = this.datasource;
        //     await Promise.all(this.datasource.map(async x => {
        //         const arrObjServiceDVGTs = await this.serviceDVGTService.getByShipmentIdAsync(x.id);
        //         if (arrObjServiceDVGTs) {
        //             let obj = [];
        //             arrObjServiceDVGTs.forEach(x => {
        //                 obj.push(x.code);
        //             });
        //             x.serviceDVGTIdsCode = obj.join(", ");
        //         }
        //         return x;
        //     }));
        //     this.sumTotalReceive();
        // }

        // chuyển qua dùng proc
        this.shipmentFilterViewModel.ToProvinceIds = this.selectedToProvince.toString()
        await this.shipmentService.getReportListShipment(this.shipmentFilterViewModel).then(x => {
            if (x) {
                const data = x.data as Shipment[] || [];
                this.datasource = data;
                this.listData = this.datasource;
                this.totalRecords = this.listData.length > 0 ? data[0].totalCount : 0;
                this.shipmentAllFilterViewModel.PageSize = this.totalRecords;
                this.sumTotalReceive();
            }
        });
    }

    async loadAllShipment(arrPageNumber: number[]): Promise<Shipment[]> {
        let data: Shipment[] = [];
        await Promise.all(arrPageNumber.map(async x => {
            this.shipmentAllFilterViewModel.PageNumber = x;
            if (this.shipmentAllFilterViewModel.PageSize === 0) {
                this.shipmentAllFilterViewModel.PageSize = this.rowPerPage;
            }
            if (this.shipmentAllFilterViewModel.PageSize >= 500) {
                this.shipmentAllFilterViewModel.PageSize = 500;
            }

            this.shipmentFilterViewModel.ToProvinceIds = this.selectedToProvince.toString()
            const res = await this.shipmentService.getReportListShipment(this.shipmentAllFilterViewModel);
            if (res) {
                const arr = res.data as Shipment[];
                // arr.forEach(async x => {
                //     const arrObjServiceDVGTs = await this.serviceDVGTService.getByShipmentIdAsync(x.id);
                //     if (arrObjServiceDVGTs) {
                //         let obj = [];
                //         arrObjServiceDVGTs.forEach(x => {
                //             obj.push(x.code);
                //         });
                //         x.serviceDVGTIdsCode = obj.join(", ");
                //     }
                // });
                data = Array.from(new Set(data.concat(arr)));
            }
        }));
        return data;
    }

    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.datasource) {
                this.filterRows = this.datasource;
                // sort data
                this.filterRows.sort(
                    (a, b) =>
                        FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
                );
                this.listData = this.filterRows;
            }
        }, 250);
    }

    loadFilter() {
        this.loadFromHub();
        this.loadService();
        this.loadPaymentType();
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
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.FromHubId = this.selectedFromHub;
        this.shipmentAllFilterViewModel.FromHubId = this.selectedFromHub;
        // this.loadShipment();
    }

    changeTohub() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.ToHubId = this.selectedToHub;
        this.shipmentAllFilterViewModel.ToHubId = this.selectedToHub;
        // this.loadShipment();
    }

    changeCurrentHub() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.CurrentHubId = this.selectedCurrentHub;
        this.shipmentAllFilterViewModel.CurrentHubId = this.selectedCurrentHub;
        // this.loadShipment();
    }

    loadService() {
        this.services = [];
        this.serviceService.getAllSelectModelAsync().then(x => {
            this.services = x;
        });
    }

    changeService() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.ServiceId = this.selectedService;
        this.shipmentAllFilterViewModel.ServiceId = this.selectedService;
        // this.loadShipment();
    }

    loadPaymentType() {
        this.paymentTypes = [];
        this.paymentTypeService.getAllSelectModelAsync().then(x => {
            this.paymentTypes = x;
        });
    }

    changePaymentType() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentType;
        this.shipmentAllFilterViewModel.PaymentTypeId = this.selectedPaymentType;
        // this.loadShipment();
    }

    loadStatus() {
        this.statuses = [];
        this.shipmentStatusService.getAllSelectModelMultiSelectAsync().then(x => {
            this.statuses = x;
        });
    }

    changeStatus() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentAllFilterViewModel.groupStatusId = this.shipmentFilterViewModel.groupStatusId;
        // this.loadShipment();
    }

    loadCustomer() {
        // this.customers = [];
        // this.customerService.getAllSelectModelAsync().then(x => {
        //     this.customers = x;
        // });
    }

    changeCustomer() {
        this.shipmentFilterViewModel.PageNumber = 1;
        this.shipmentFilterViewModel.SenderId = this.selectedCustomer;
        this.shipmentAllFilterViewModel.SenderId = this.selectedCustomer;
        // this.loadShipment();
    }

    searchByShipmentNumber(value) {
        this.shipmentFilterViewModel.ShipmentNumber = value;
        this.loadShipment();
    }


    search(value) {
        this.shipmentFilterViewModel.SearchText = value;
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
        this.shipmentFilterViewModel = new ShipmentFilterViewModel();
        this.shipmentAllFilterViewModel = new ShipmentFilterViewModel();
        this.initData(this.type);
    }
    changeFilter() {
        this.loadLazy(this.event);
    }

    public eventLog = '';

    public selectedDate() {
        this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
        this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
        this.shipmentAllFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentAllFilterViewModel.OrderDateFrom).toDate());
        this.shipmentAllFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentAllFilterViewModel.OrderDateTo).toDate());
        //this.loadShipment();
    }

    private applyDate(value: any, dateInput: any) {
        dateInput.start = value.start;
        dateInput.end = value.end;
    }

    public calendarEventsHandler(e: any) {
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }

    onPageChange(event: LazyLoadEvent) {
        this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
        this.shipmentFilterViewModel.PageSize = event.rows;
        this.loadShipment();
    }

    //======== END METHOD ListReceiveMoney ======= 

    onViewSuccessDelivery() {
        this.shipmentFilterViewModel.IsSuccess = this.isSuccessDelivery;
        this.shipmentAllFilterViewModel.IsSuccess = this.isSuccessDelivery;
        // this.loadShipment();
    }

    formatDate(value: Date) {
        if (value) {
            let date = new Date(value);
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
        }
        return value;
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

    async exportCSVNew(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_TONG_HOP";
            let clone = this.shipmentFilterViewModel;
            clone.customExportFile.fileNameReport = fileName;
            clone.customExportFile.columnExcelModels = this.columnsExp;
            clone.PageNumber = 1;
            clone.PageSize = this.totalRecords;
            this.shipmentService.getReportListShipmentExport(clone);
        }
    }

    async exportCSVNewFormat(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_TONG_HOP";
            let clone = this.shipmentFilterViewModel;
            clone.customExportFile.fileNameReport = fileName;
            clone.customExportFile.columnExcelModels = this.columnsExpFormat;
            clone.PageNumber = 1;
            clone.PageSize = this.totalRecords;
            this.shipmentService.getReportListShipmentExport(clone);
        }
    }

    async exportCSV(dt: any) {
        if (dt) {
            let fileName = "BAO_CAO_TONG_HOP.xlsx";
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
                        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp, true, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                } else {
                    let clone = this.shipmentFilterViewModel;
                    clone.PageNumber = 1;
                    clone.PageSize = this.totalRecords;

                    this.shipmentService.getReportListShipment(clone).then(x => {
                        let data = x.data.reverse();
                        dt.value = data;
                        var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExp, true, false);
                        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
                    });
                }
            } else {
                dt.exportCSV();
            }
        }
    }

    sumTotalReceive() {
        this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
            return priceKeeping += (shipment.cod + shipment.totalPrice);
        }, 0);
    }

    // lọc bưu cục gửi
    eventOnSelectedFromHub() {
        let findH = this.allHubs.find(f => f.label == this.fromHubSelected);
        if (findH) {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.FromHubId = findH.value;
            // this.loadShipment();
        } else {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.FromHubId = null;
            // this.loadShipment();
        }
    }

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

    // lọc bưu cục phát
    eventOnSelectedToHub() {
        let findH = this.allHubs.find(f => f.label == this.toHubSelected);
        if (findH) {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.ToHubId = findH.value;
            // this.loadShipment();
        } else {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.ToHubId = null;
            // this.loadShipment();
        }
    }

    async eventFilterToHubs(event) {
        let value = event.query;
        if (value.length >= 1) {
            await this.hubService.getHubSearchByValueAsync(value, null).then(
                x => {
                    this.allHubs = [];
                    this.toHubFilters = [];
                    this.toHubFilters.push("-- Chọn tất cả --");
                    x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
                    this.allHubs.map(m => this.toHubFilters.push(m.label));
                }
            );
        }
    }

    // lọc bưu cục giữ
    eventOnSelectedCurrentHub() {
        let findH = this.allHubs.find(f => f.label == this.currentHubSelected);
        if (findH) {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.CurrentHubId = findH.value;
            // this.loadShipment();
        } else {
            this.shipmentFilterViewModel.PageNumber = 1;
            this.shipmentFilterViewModel.CurrentHubId = null;
            // this.loadShipment();
        }
    }

    async eventFilterCurrentHubs(event) {
        let value = event.query;
        if (value.length >= 1) {
            await this.hubService.getHubSearchByValueAsync(value, null).then(
                x => {
                    this.allHubs = [];
                    this.currentHubFilters = [];
                    this.currentHubFilters.push("-- Chọn tất cả --");
                    x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
                    this.allHubs.map(m => this.currentHubFilters.push(m.label));
                }
            );
        }
    }

    // lọc khách hàng gửi
    filterCustomers(event) {
        let value = event.query;
        if (value.length >= 1) {
            this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
                x => {
                    if (x.isSuccess == true) {
                        this.customers = [];
                        this.filteredCustomers = [];
                        this.filteredCustomers.push("-- Chọn tất cả --");
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
        // this.loadShipment();
    }

    onSelectedCustomer() {
        let cloneSelectedCustomer = this.customer;
        this.customers.forEach(x => {
            let obj = x.data as Customer;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.selectedCustomer = obj.id;
                }
            } else {
                this.selectedCustomer = null;
            }
        });
        this.changeCustomer();
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
                            this.selectedCustomer = null;
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

    async openModelImages(template: TemplateRef<any>, shipmentId: any) {
        this.dataModalImages = [];
        let data = await this.uploadService.getImageByShipmentId(shipmentId, 2)
        if (data && data.length > 0) {
            data.map(x => {
                this.dataModalImages.push('data:image/jpeg;base64,' + x.fileBase64String);
            });
            this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
        } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy ảnh ký nhận!' });
        }
    }
}