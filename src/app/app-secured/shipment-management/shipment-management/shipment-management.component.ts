import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  NgZone
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as JsBarcode from "jsbarcode";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, DataTable } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  ShipmentService,
  UserService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService,
  AuthService,
  ReasonService,
  BoxService,
  ServiceDVGTService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Province,
  District,
  Ward,
  Hub,
  PrintModel,
  Boxes
} from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { Input } from "@angular/core/src/metadata/directives";
import { DetailShipmentManagementComponent } from "../detail-shipment-management/detail-shipment-management.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { GeneralInfoModel } from "../../../models/generalInfo.model";

// daterangepicker
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { RequestGetPickupHistory } from "../../../models/requestGetPickupHistory";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";
import { ServiceDVGT } from "../../../models/serviceDVGT.model";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-shipment-management",
  templateUrl: "shipment-management.component.html",
  styles: []
})
export class ShipmentManagementComponent extends BaseComponent
  implements OnInit {
  unit = environment.unit;
  filterRows: Shipment[];
  idPrint: string;
  serviceDVGTs: any[];
  selectedServiceDVGTs: any[];
  cloneSelectData: any;
  cloneSelectCode: any[];
  isListTable: boolean = true;
  isGribTable: boolean;
  colorList: string = "#183545";
  colorGrib: string;
  itemBoxes: Boxes = new Boxes();
  objSelectesServiceDVGTs: any[];
  txtFilterGb: any;
  txtToWeight: any;
  txtFromWeight: any;
  txtShipmentNumber: any;
  searchShipmentNumber: any;
  gbModelRef: BsModalRef;
  showItemShipment: any;
  isShow = true;
  arrPrintShipment: any = [];
  companyName: string;
  logoUrl: string;
  hotLine: string;
  centerHubAddress: string;
  website: string;
  policy: string;
  generatorShipmentBarcode: string;
  first: number = 0;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  pageNum = 1;
  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private serviceDVGTService: ServiceDVGTService,
    private ngZone: NgZone,
    private authService: AuthService,
    private reasonService: ReasonService,
    private boxService: BoxService,
    private daterangepickerOptions: DaterangepickerConfig,
    private generalInfoService: GeneralInfoService,
    private printFrormServiceInstance: PrintFrormServiceInstance, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
    // dateRangePicker
    this.daterangepickerOptions.settings = {
      locale: { format: environment.formatDate },
      alwaysShowCalendars: false,
      ranges: {
        "Hôm nay": [moment().subtract(0, "day"), moment()],
        "1 tuần": [moment().subtract(7, "day"), moment()],
        "1 tháng trước": [moment().subtract(1, "month"), moment()],
        "3 tháng trước": [moment().subtract(4, "month"), moment()],
        "6 tháng trước": [moment().subtract(6, "month"), moment()],
        "12 tháng trước": [moment().subtract(12, "month"), moment()],
        "2 năm trước": [moment().subtract(24, "month"), moment()]
      }
    };

    let includes: string =
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

    const currentDate = moment(new Date()).format(environment.formatDate);
    let orderDateFrom = currentDate + "T01:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.historyPickup;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = this.pageNum;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.listShipment.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  itemShipment: any = [];

  //
  selectedDateFrom: any;
  selectedDateTo: any;

  //
  columns: any[] = [
    { field: "id", header: 'ID' },
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "requestShipmentId", header: 'Mã bill tổng' },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi' },
    { field: "paymentType.name", header: 'HTTT' },
    { field: "service.name", header: 'Dịch vụ' },

    { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
    { field: "defaultPrice", header: 'Cước chính' },
    { field: "fuelPrice", header: 'PPXD' },
    { field: "remoteAreasPrice", header: 'VSVX' },
    { field: "totalDVGT", header: 'Phí DVGT' },
    { field: "vatPrice", header: 'VAT' },
    { field: "totalPrice", header: 'Tổng cước' },

    { field: "shipmentStatus.name", header: 'Trạng thái' },
    { field: "deliverUser.fullName", header: 'Nhân viên gửi' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromWard.district.province.name", header: 'Tỉnh đi' },
    { field: "fromHub.name", header: 'Trạm lấy' },
    { field: "fromHubRouting.name", header: 'Tuyến lấy' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toWard.district.province.name", header: 'Tỉnh đến' },
    { field: "toHub.name", header: 'Trạm giao' },
    { field: "toHubRouting.name", header: 'Tuyến giao' },
    // "pickUserId.name",
    // "service",
    // "fromHub",
    // "fromProvinceId",
    // "fromProvinceId.name",
    // "fromWard",
    // "fromWard.district.province",
    // "fromWardID",
    // "toProvinceId",
    // "toProvinceId.name",
    // "toHub",
    // "toWard",
    // "toWard.district.province",
    // "toWardId",
    // "toHubRouting",
    // "deliverUser",
    // "paymentType",
    // "paymentType.name",
    // "weight",
    // "sender.code",
    // "totalBox",
    // "structure",
    // "serviceDVGT",
    // "serviceDVGT.id"
  ];
  datasource: Shipment[];
  totalRecords: number = 0;
  rowPerPage: number = 20;
  event: LazyLoadEvent;

  //
  selectedData: Shipment[];
  listData: Shipment[];

  //
  exportDataFilter: Shipment[];

  //
  fromSenders: SelectItem[];
  fromSelectedSender: number;

  //
  statuses: SelectItem[];
  selectedStatus: number;

  //
  services: SelectItem[];
  selectedServices: number;

  //
  paymentTypes: SelectItem[];
  selectedPaymentType: number;

  //
  fromProvinces: SelectItem[];
  fromSelectedProvince: number;

  //
  toProvinces: SelectItem[];
  toSelectedProvince: number;

  //
  toWeight: number = 0;
  fromWeight: number = 0;

  //
  data: Shipment;

  //
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  currentDate = new Date();
  //
  reviewChecked: boolean;

  public singlePickerDateFrom = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: "01/01/2017",
  }

  public singlePickerDateTo = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentDate,
  }

  ngOnInit() {
    // this.initData();
    this.loadShipment();
    this.selectedDateTo = new Date();
    this.getGeneralInfo();
  }

  refresh() {
    // this.initData();
    this.loadShipment();
    this.first = 0;
    this.reviewChecked = false;
    this.selectedData = null;
    this.txtFilterGb = null;
    this.txtShipmentNumber = null;
    this.txtFromWeight = null;
    this.txtToWeight = null;
    this.selectedDateFrom = new Date(2017, 0, 1);
    this.selectedDateTo = new Date();
  }

  public singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  public singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  ngAfterViewInit() {
    // jQuery(document).ready(function () {
    //   jQuery('.i-checks').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green',
    //   });
    //   jQuery('.footable').footable();
    // });
  }

  initData() {
    // this.data = new Shipment();
    // this.fromSelectedCenterHub = null;

    // this.shipmentService.getAll().subscribe(x => {
    //   this.datasource = x.data as Shipment[];
    //   this.totalRecords = this.datasource.length;
    //   this.listData = this.datasource.slice(0, this.rowPerPage);
    // });

    // this.data = null;
    // this.selectedData = null;
    // this.isNew = true;

    // //refresh
    // this.txtShipmentNumber = null;
    // this.txtFromWeight = null;
    // this.txtToWeight = null;
    // this.selectedDateFrom = new Date(2017,0,1);
    // this.selectedDateTo = new Date();
  }

  async loadShipmentPaging() {

    // includes.push(Constant.classes.includes.shipment.companyFrom);
    // includes.push(Constant.classes.includes.shipment.companyTo);

    // const currentDate = moment(new Date()).format(environment.formatDate);
    // let fromDate, toDate;
    // if (selectedFromDate && selectedToDate) {
    //   fromDate = selectedFromDate;
    //   toDate = selectedToDate;
    // } else {
    //   fromDate = currentDate + "T01:00:00";
    //   toDate = currentDate + "T23:59:59";
    // }

    await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
      if (x) {
        this.listData = x.data.reverse();
        this.datasource = x.data.reverse();
        this.totalRecords = x.dataCount;
      }
    });
  }

  async loadShipment() {

    await this.loadShipmentPaging();
    this.loadFromSenders();
    this.loadShipmentStatus();
    this.loadServices();
    this.loadPaymentTypes();
    this.loadFromProvinces();
    this.loadToProvinces();

    this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
      this.reasonPickupCancel = x.data as ReasonService[];
    });

    //refresh
    // this.selectedData = null;
    // this.txtFilterGb = null;
    // this.txtShipmentNumber = null;
    // this.txtFromWeight = null;
    // this.txtToWeight = null;
    // this.selectedDateFrom = new Date(2017, 0, 1);
    // this.selectedDateTo = new Date();
  }

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

    this.event = event;
    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        //filter
        // if (event.filters.length > 0)
        //   this.filterRows = this.datasource.filter(x =>
        //     FilterUtil.filterField(x, event.filters)
        //   );
        // else
        //   this.filterRows = this.datasource.filter(x =>
        //     FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
        //   );

        // //Begin Custom filter
        // if (this.searchShipmentNumber) {
        //   this.filterRows = this.filterRows.filter(
        //     x => x.shipmentNumber === this.searchShipmentNumber
        //   );
        // }

        // if (this.fromSelectedSender) {
        //   this.filterRows = this.filterRows.filter(
        //     x => x.senderId === this.fromSelectedSender
        //   );
        // }
        // if (this.selectedStatus) {
        //   this.filterRows = this.filterRows.filter(
        //     x => {
        //       if (x.shipmentStatus) {
        //         return x.shipmentStatus.id === this.selectedStatus;
        //       } else {
        //         return false;
        //       }
        //     });
        // }
        // if (this.selectedServices) {
        //   this.filterRows = this.filterRows.filter(
        //     x => {
        //       if (x.service) {
        //         return x.service.id === this.selectedServices;
        //       } else {
        //         return false;
        //       }
        //     });
        // }
        // if (this.selectedPaymentType) {
        //   this.filterRows = this.filterRows.filter(
        //     x => {
        //       if (x.paymentType) {
        //         return x.paymentType.id === this.selectedPaymentType;
        //       } else {
        //         return false;
        //       }
        //     }
        //   );
        // }
        // if (this.fromSelectedProvince) {
        //   this.filterRows = this.filterRows.filter(
        //     x => x.fromWard.district.province.id === this.fromSelectedProvince
        //   );
        // }
        // if (this.toSelectedProvince) {
        //   this.filterRows = this.filterRows.filter(
        //     x => x.toWard.district.province.id === this.toSelectedProvince
        //   );
        // }
        // if (this.toWeight == 0) {
        //   if (typeof this.fromWeight != 'undefined' && this.fromWeight != null) {
        //     this.filterRows = this.filterRows.filter(x => x.weight >= this.fromWeight);
        //   }
        // }
        // if (this.toWeight > 0) {
        //   this.filterRows = this.filterRows.filter(x => x.weight <= this.toWeight);
        //   if (this.fromWeight > 0) {
        //     this.filterRows = this.filterRows.filter(x => (x.weight <= this.toWeight && x.weight >= this.fromWeight));
        //   }
        // }
        // if (this.selectedDateFrom && this.selectedDateTo) {
        //   //
        //   this.filterRows = this.filterRows.filter(x => moment(x.orderDate).isBetween(this.selectedDateFrom, this.selectedDateTo));
        // } else if (this.selectedDateFrom) {
        //   this.filterRows = this.filterRows.filter(x => moment(x.orderDate).isAfter(this.selectedDateFrom));
        // } else if (this.selectedDateTo) {
        //   this.filterRows = this.filterRows.filter(x => moment(x.orderDate).isBefore(this.selectedDateTo));
        //   //
        // }

        // this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvince;
        // this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvince;
        // this.shipmentFilterViewModel.SenderId = this.fromSelectedSender;
        // this.shipmentFilterViewModel.WeightFrom = this.fromWeight;
        // this.shipmentFilterViewModel.WeightTo = this.toWeight;
        // this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentType;
        // this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatus;
        // this.loadShipmentPaging();

        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
        // this.totalRecords = this.filterRows.length;
        // this.totalRecords = 500;
      }
    }, 250);
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    setTimeout(() => {
      this.loadShipmentPaging();
    }, 0);
  }

  showListTable() {
    this.colorList = "#183545";
    this.colorGrib = "#dadada";
    this.isGribTable = false;
    this.isListTable = true;
  }

  showGribTable() {
    this.colorGrib = "#183545";
    this.colorList = "#dadada";
    this.isGribTable = true;
    this.isListTable = false;
  }

  onDetailShipment(template, data: Shipment) {
    // console.log(JSON.stringify(data));
    this.showItemShipment = data.id;
    this.gbModelRef = this.modalService.show(DetailShipmentManagementComponent, {
      class: "inmodal animated bounceInRight modal-xlg"
    });
    let includes = [
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.toHubRouting,
      Constant.classes.includes.shipment.pickUser,
      Constant.classes.includes.shipment.fromWard,
      Constant.classes.includes.shipment.toWard,
      Constant.classes.includes.shipment.fromDistrict,
      Constant.classes.includes.shipment.fromProvince,
      Constant.classes.includes.shipment.toDistrict,
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.deliverUser,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.sender,
      Constant.classes.includes.shipment.structure,
      Constant.classes.includes.shipment.fromHubRouting,
      // Constant.classes.includes.shipment.serviceDVGT,
      // Constant.classes.includes.shipment.shipmentServiceDVGTs,
      // Constant.classes.includes.shipment.serviceDVGTIds,
      // Constant.classes.includes.shipment.boxes,
    ];

    this.shipmentService
      .get(this.showItemShipment, includes)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      });
  }

  // mapSaveData(obj: Shipment) {
  //   if (obj) {
  //     this.data.id = obj.id;
  //     this.data.concurrencyStamp = obj.concurrencyStamp;
  //     this.data.reasonService = this.selectedReasonPickupCancel;
  //     // this.data.shipmentStatus.name = "Hủy lấy hàng";
  //   }
  // }

  // saveClient(list: Shipment[]) {
  //   this.messageService.add({
  //     severity: Constant.messageStatus.success,
  //     detail: "Cập nhật thành công"
  //   });
  //   this.listData = list;
  //   this.data = new Shipment();
  //   this.selectedData = new Shipment();
  //   this.bsModalRef.hide();
  // }

  exportCSV(dt: DataTable) {
    if (dt) {
      if (this.totalRecords > 0) {
        let clone = this.shipmentFilterViewModel;
        clone.PageNumber = 1;
        clone.PageSize = this.totalRecords;
        console.log(clone);

        this.shipmentService.postByTypeAsync(clone).then(x => {
          let data = x.data.reverse();
          dt.value = data;
          dt.exportCSV();
        });
      }
      else {
        dt.exportCSV();
      }
    }
  }

  search(value) {
    this.shipmentFilterViewModel.SearchText = value;
    this.loadShipmentPaging();
  }

  delete() {
    // alert("123");

    // let list = [...this.listData];

    //     if (this.selectedReasonPickupCancel) {
    //       this.data.reasonService = this.selectedReasonPickupCancel;
    //       this.data.shipmentStatusId = StatusHelper.pickupCancel;

    //       let note = "";
    //       let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);
    //       // this.data.shipmentStatus.name = JSON.parse(reasonNote).name;

    //       if (data.note) {
    //         note = `${JSON.parse(reasonNote).name}, ${data.note}`;
    //       } else {
    //         note = `${JSON.parse(reasonNote).name}`;
    //       }
    //       data.note = note;
    //       this.requestShipmentService.update(this.data).subscribe(x => {
    //         if (!super.isValidResponse(x)) return;
    //         var obj = x.data as Shipment;
    //         this.mapSaveData(obj);
    //         list[this.findSelectedDataIndex()] = this.data;
    //         this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
    //         this.saveClient(list);
    //       });
    //     } else {
    //       console.log(this.selectedReasonPickupCancel);
    //     }

    //     setTimeout(() => {
    //       this.refresh();
    //     },100);
  }

  changeShipment(txtShipment) {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentNumber = txtShipment.value;
    this.loadShipmentPaging();
    // this.searchShipmentNumber = txtShipment.value;
    // this.loadLazy(this.event);
  }

  changeSender() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.SenderId = this.fromSelectedSender;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeShipmentStatus() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatus;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeServices() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ServiceId = this.selectedServices;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changePaymentType() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentType;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeFromProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvince;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeToProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvince;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeFromWeight(input: number) {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.WeightFrom = input;
    this.loadShipmentPaging();
    // setTimeout(() => {
    //   this.loadLazy(this.event);
    // }, 0);
    // this.fromWeight = input;
  }

  changeToWeight(input: number) {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.WeightTo = input;
    this.loadShipmentPaging();
    // setTimeout(() => {
    //   this.loadLazy(this.event);
    // }, 0);
    this.toWeight = input;
  }

  //

  loadFromSenders() {
    this.fromSelectedSender = null;
    let uniqueFromSelectedSender = [];
    this.fromSenders = [];

    this.datasource.forEach(x => {
      if (uniqueFromSelectedSender.length === 0) {
        this.fromSenders.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueFromSelectedSender.indexOf(x.senderId) === -1 && x.senderId) {
        uniqueFromSelectedSender.push(x.senderId);
        this.fromSenders.push({
          label: x.senderName,
          value: x.senderId
        });
      }
    });
  }

  loadShipmentStatus() {
    this.selectedStatus = null;
    let uniqueShipmentStatus = [];
    this.statuses = [];

    this.datasource.forEach(x => {
      if (uniqueShipmentStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueShipmentStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueShipmentStatus.push(x.shipmentStatusId);
        if (x.shipmentStatus) {
          this.statuses.push({
            label: x.shipmentStatus.name,
            value: x.shipmentStatus.id
          });
        }
      }
    });
  }

  loadServices() {
    this.selectedServices = null;
    let uniqueServices = [];
    this.services = [];

    this.datasource.forEach(x => {
      if (uniqueServices.length === 0) {
        this.services.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueServices.indexOf(x.serviceId) === -1 && x.serviceId) {
        uniqueServices.push(x.serviceId);
        if (x.service) {
          this.services.push({
            label: x.service.name,
            value: x.service.id
          });
        }
      }
    });
  }

  loadPaymentTypes() {
    this.selectedPaymentType = null;
    let uniquePaymentType = [];
    this.paymentTypes = [];

    this.datasource.forEach(x => {
      if (uniquePaymentType.length === 0) {
        this.paymentTypes.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniquePaymentType.indexOf(x.paymentTypeId) === -1 &&
        x.paymentTypeId
      ) {
        uniquePaymentType.push(x.paymentTypeId);
        if (x.paymentType) {
          this.paymentTypes.push({
            label: x.paymentType.name,
            value: x.paymentType.id
          });
        }
      }
    });
  }

  loadFromProvinces() {
    this.fromSelectedProvince = null;
    let uniqueFromSelectedProvince = [];
    this.fromProvinces = [];

    this.fromProvinces.push({ label: "Chọn tất cả", value: null });

    this.datasource.forEach(x => {
      if (x.fromWard &&
        uniqueFromSelectedProvince.indexOf(x.fromWard.district.province.id) ===
        -1 &&
        x.fromWard.district.province.id
      ) {
        uniqueFromSelectedProvince.push(x.fromWard.district.province.id);
        this.fromProvinces.push({
          label: x.fromWard.district.province.name,
          value: x.fromWard.district.province.id
        });
      }
    });
  }

  loadToProvinces() {
    this.toSelectedProvince = null;
    let uniqueToSelectedProvince = [];
    this.toProvinces = [];

    this.toProvinces.push({ label: "Chọn tất cả", value: null });

    this.datasource.forEach(x => {
      if (x.toWard &&
        uniqueToSelectedProvince.indexOf(x.toWard.district.province.id) ===
        -1 &&
        x.toWard.district.province.id
      ) {
        uniqueToSelectedProvince.push(x.toWard.district.province.id);
        if (x.toWard) {
          this.toProvinces.push({
            label: x.toWard.district.province.name,
            value: x.toWard.district.province.id
          });
        }
      }
    });
  }

  //

  getGeneralInfo() {
    this.generalInfoService.get().subscribe(x => {
      let general = x.data as GeneralInfoModel;
      this.companyName = general.companyName.toLocaleUpperCase();
      this.logoUrl = general.logoUrl;
      this.hotLine = general.hotLine;
      this.centerHubAddress = general.addressMain;
      this.website = general.website;
      this.policy = general.policy;
    });
  }

  allSelect(event) {
    if (event.checked) {
      this.selectedData = this.listData;
      if (this.filterRows) {
        this.selectedData = this.filterRows;
      } else {
        this.selectedData = this.datasource;
      }
    }
  }

  isValidSelectData(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedData || this.selectedData.length === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  async printShipment() {
    this.cloneSelectData = await this.sendSelectDataMultiShipment();
    this.idPrint = PrintHelper.printCreateMultiShipment;
    setTimeout(() => {
      this.printFrormServiceInstance.sendCustomEvent(this.cloneSelectData);
    }, 0);
  }

  async sendSelectDataMultiShipment(): Promise<any> {
    this.cloneSelectData = [];
    this.cloneSelectData = this.selectedData;
    const generalInfo = await this.generalInfoService.getAsync();
    this.cloneSelectData.logoUrl = generalInfo.logoUrl;
    this.cloneSelectData.companyName = generalInfo.companyName
    this.cloneSelectData.hotLine = generalInfo.hotLine;
    this.cloneSelectData.centerHubAddress = generalInfo.addressMain;
    this.cloneSelectData.policy = generalInfo.policy;
    this.cloneSelectData.website = generalInfo.website;
    const time = new Date;
    const getFullYear = time.getFullYear();
    const createdBy = this.authService.getFullName();
    await Promise.all(this.cloneSelectData.map(async item => {
      item.fakeId = "id" + item.id;
      item.createdBy = createdBy;
      const shipmentId = item.id;
      item.serviceDVGTIdsName = await this.serviceDVGTService.getNameByShipmentIdAsync(shipmentId);
      item.getFullYear = getFullYear;
      item.printTime = time;
    }));
    return this.cloneSelectData;
  }

  multiPrintShipment() {
    if (!this.isValidSelectData()) return;
    this.printShipment();
  }

  getCodeItemBox() {
    this.listData.forEach((e, i) => {
      let data = e as PrintModel;
      this.boxService.getByShipmentId(e.id).subscribe(x => {
        let boxes = x.data as Boxes;
        this.itemBoxes = boxes[0];
        if (data.id === this.listData[i].id && this.itemBoxes && this.itemBoxes.length > 0) {
          data.generatorBoxBarcode = this.itemBoxes.code as string;
        } else {
          data.generatorBoxBarcode = null;
        }
      });
    });
  }

  printCodeA4() {
    this.cloneSelectCode = this.selectedData;
    this.cloneSelectCode.forEach(item => {
      item.fakeId = "id" + item.id;
    });
    this.idPrint = PrintHelper.printCodeA4DetailShipment;
    setTimeout(() => {
      this.printFrormServiceInstance.sendCustomEvent(this.cloneSelectCode);
    }, 0);
  }

  printCodeSticker() {
    this.cloneSelectCode = this.selectedData;
    this.cloneSelectCode.forEach(item => {
      item.fakeId = "id" + item.id;
    });
    this.idPrint = PrintHelper.printCodeStickerDetailShipment;
    setTimeout(() => {
      this.printFrormServiceInstance.sendCustomEvent(this.cloneSelectCode);
    }, 0);
  }

  multiPrintCodeA4() {
    if (!this.isValidSelectData()) return;
    this.printCodeA4();
  }

  multiPrintCodeSticker() {
    if (!this.isValidSelectData()) return;
    this.printCodeSticker();
  }

  // dateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    this.selectedData = [];
    dateInput.start = value.start;
    dateInput.end = value.end;

    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(value.start).toDate());
    this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(value.end).toDate());

    // this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    // this.selectedDateTo = this.requestGetPickupHistory.toDate;
    // this.loadLazy(this.event);
    const fromDate = this.requestGetPickupHistory.fromDate.toISOString();
    const toDate = this.requestGetPickupHistory.toDate.toISOString();

    this.loadShipment();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }
  onChangeReview() {
    if (this.reviewChecked) {
      this.datasource = this.selectedData;
    }
    else {
      this.datasource = this.listData;
    }
  }
}
