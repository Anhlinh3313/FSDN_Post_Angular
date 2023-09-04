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
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, CheckboxModule } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService,
  ReasonService,
  ShipmentStatusService
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
  Customer,
  Province,
  District,
  Ward,
  Hub,
  Reason
} from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";
import { RequestDetailComponent } from "../../request-detail/request-detail.component";
import { DetailRequestShipmentComponent } from "../../request-management/detail-request-shipment/detail-request-management.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

///////////////Daterangepicker
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { RequestGetPickupHistory } from "../../../models/requestGetPickupHistory";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { AssignHelper } from "../../../infrastructure/assignTime.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { IdViewModel } from "../../../view-model/id.viewModel";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { ArrayHelper } from "../../../infrastructure/array.helper";

declare var jQuery: any;

@Component({
  selector: "list-delivery-cancel",
  templateUrl: "list-delivery-cancel.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class ListDeliveryCancelComponent extends BaseComponent
  implements OnInit {
  isRefusePickup: boolean;
  saveEvent: any;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
  txtNote: any;
  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private reasonService: ReasonService,
    private ngZone: NgZone,
    private shipmentStatusService: ShipmentStatusService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string = Constant.pages.deliveryManagement.children
    .listDeliveryCancel.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment[];
  listData: Shipment[];

  //
  selectedDateFrom: Date;
  selectedDateTo: Date;

  //
  senderNames: SelectItem[];
  selectedSenderNames: number;

  //
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;
  //
  toHubRoutings: SelectItem[];
  selectedToHubRouting: number;
  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  reasonsPickupCancel: Reason;
  note: string;
  //
  reasons: SelectItem[];
  selectedReason: Reason;
  // selectedReason: ReasonService;
  // reasons: ReasonService[];
  // reasons: Reason;

  //
  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
    "assignDeliveryTime",
    "currentEmp.fullName",
    "orderDate",
    "totalPrice",
    "numPick",
    "cod",
    "deliveryupAppointmentTime",
    "cusNote",
    "receiverName",
    "receiverPhone",
    "deliveryAddress",
    "deliveryNote",
    "fromHubRouting.name",
    "senderName",
    "senderPhone",
    "companyFrom",
    "pickingAddress",
    "fromHub.name",
    "fromHub",
    "fromProvinceId.name",
    "fromWard",
    "fromWard.district.province",
    "fromWardID",
    "shipmentStatus.name",
    "receiverName",
    "receiverPhone",
    "companyTo",
    "shippingAddress",
    "toProvinceId",
    "toProvinceId.name",
    "toHub",
    "toHub.name",
    "toWard",
    "toWard.district.province",
    "toWardId",
    "toHubRouting"
  ];
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //

  //
  data: Shipment;
  //
  customers: SelectItem[];
  selectedCustomer: Customer;
  //
  fromProvinces: SelectItem[];
  fromSelectedProvince: number;
  //
  fromDistricts: SelectItem[];
  fromSelectedDistrict: number;
  //
  fromWards: SelectItem[];
  fromSelectedWard: number;
  //
  fromCenterHubs: SelectItem[];
  fromSelectedCenterHub: number;
  //
  fromPoHubs: SelectItem[];
  fromSelectedPoHub: number;
  //
  fromStationHubs: SelectItem[];
  fromSelectedStationHub: number;

  //
  toProvinces: SelectItem[];
  toSelectedProvince: number;
  //
  toDistricts: SelectItem[];
  toSelectedDistrict: number;
  //
  toWards: SelectItem[];
  toSelectedWard: number;
  //
  toCenterHubs: SelectItem[];
  toSelectedCenterHub: number;
  //
  toPoHubs: SelectItem[];
  toSelectedPoHub: number;
  //
  toStationHubs: SelectItem[];
  toSelectedStationHub: number;
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  riders: SelectItem[];
  selectedRider: number;
  //
  employees: SelectItem[];
  selectedEmployee: number;
  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  defaultStatusesRight: ShipmentStatus[];
  statusesUpdate: SelectItem[];
  selectedStatusUpdate: number;
  //
  paymentTypeHelper: any = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;

  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  public zoom: number;
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;

  currentDate = new Date();

  ngOnInit() {
    //   this.initData();
    this.loadShipment();
    this.selectedDateTo = new Date();
  }

  refresh() {
    //   this.initData();
    this.loadShipment();
    this.first = 0;
    this.selectedData = null;
    this.reasons = [];
    this.txtNote = null;
    this.selectedReason = null;
    this.selectedStatusUpdate = null;
    this.txtFilterGb = null;
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

  // initData() {
  //   // this.data = new Shipment();
  //   // this.fromSelectedCenterHub = null;

  //   this.requestShipmentService.getAll().subscribe(x => {
  //     this.datasource = x.data as Shipment[];
  //     this.totalRecords = this.datasource.length;
  //     this.listData = this.datasource.slice(0, this.rowPerPage);
  //     // console.log(this.datasource);
  //   });

  //   this.data = null;
  //   this.selectedData = null;
  //   this.isNew = true;

  //   //refresh
  //   this.selectedDateFrom = new Date(2017,0,1);
  //   this.selectedDateTo = new Date();
  //   this.txtFilterGb = null;
  // }

  loadShipment() {
    let includes: string =
    Constant.classes.includes.shipment.service + "," +
    Constant.classes.includes.shipment.shipmentStatus + "," +
    Constant.classes.includes.shipment.fromHubRouting + "," +
    Constant.classes.includes.shipment.shipmentStatus + "," +
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
    Constant.classes.includes.shipment.currentEmp;

    let shipmentFilterViewModel = new ShipmentFilterViewModel();
    shipmentFilterViewModel.Type = ShipmentTypeHelper.deliveryCancel;
    shipmentFilterViewModel.Cols = includes;

    this.datasource = [];
    this.listData = [];
    this.shipmentService
      .postByType(shipmentFilterViewModel)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        if (!ArrayHelper.isNullOrZero(this.datasource)) {
          this.totalRecords = this.datasource.length;
          this.listData = this.datasource;
          this.loadToHubRouting();
          this.loadRider();
          this.loadShipmentStatus();
          this.loadSenderName();
          this.loadReason();
          this.loadStatusUpdate();
        }
      });
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
        var filterRows;

        //filter
        if (event.filters.length > 0) {
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        } else {
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );
        }

        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(x => {
            if (x.shipmentStatus) {
              return x.shipmentStatus.name === this.selectedStatus;
            } else {
              return false;
            }
          });
        }

        if (this.selectedRider) {
          filterRows = filterRows.filter(x => {
            if (x.currentEmpId) {
              return x.currentEmpId === this.selectedRider;
            } else {
              return false;
            }
          });
        }

        if (this.selectedToHubRouting) {
          filterRows = filterRows.filter(
            x => x.toHubRoutingId === this.selectedToHubRouting
          );
        }

        if (this.selectedSenderNames) {
          filterRows = filterRows.filter(
            x => x.senderId === this.selectedSenderNames
          );
        }

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
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
        this.statuses.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatus.name
        });
      }
    });
  }

  loadReason() {
    // this.reasonService.getByType(ReasonHelper.DeliverCancel).subscribe(x => {
    //   this.reasons = x.data as ReasonService[];
    // });
    this.reasons = [];
    this.reasons.push({ label: "Chọn lý do", value: null });
    this.reasonService.getByType(ReasonHelper.DeliverCancel).subscribe(x => {
      let reason = x.data as Reason[];
      reason.forEach(element => {
        this.reasons.push({ label: element.name, value: element });
      });
    });
  }

  openModel(template: TemplateRef<any>, data: Shipment = null) {
    this.showItemShipment = data.shipmentNumber;

    this.gbModelRef = this.modalService.show(ShipmentDetailComponent, {
      class: "inmodal animated bounceInRight modal-lg"
    });
    let includes = [
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.fromWard,
      Constant.classes.includes.shipment.fromDistrict,
      Constant.classes.includes.shipment.fromProvince,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toWard,
      Constant.classes.includes.shipment.toDistrict,
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.serviceDVGT
    ];

    this.shipmentService
      .trackingShort(this.showItemShipment.trim(), includes)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      });
  }

  openDeleteModel(template: TemplateRef<any>) {
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    } else {
      this.modalTitle = "Hủy vận đơn";
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openUpdateStatusModel(template: TemplateRef<any>) {
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    } else {
      this.modalTitle = "Cập nhật trạng thái";
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  delete() {
    let list = [...this.listData];
    if (!this.selectedReason && !this.txtNote) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do hoặc nhập ghi chú"
      });
      return;
    }

    let arr = this.selectedData
      .map(item => item.currentEmpId)
      .filter((value, index, self) => self.indexOf(value) === index);
    let modelArray = [];
    arr.forEach(element => {
      let objArr = new ListUpdateStatusViewModel();
      let shipmentIds = [];
      this.selectedData.forEach(x => {
        if (x.currentEmpId === element) {
          let note = "";
          if (this.selectedReason && this.txtNote) {
            note = `${this.selectedReason.name}, ${this.txtNote}`;
          } else if (this.selectedReason) {
            note = `${this.selectedReason.name}`;
          } else if (this.txtNote) {
            note = `${this.txtNote}`;
          }
          shipmentIds.push(x.id);
          objArr.empId = x.currentEmpId;
          objArr.shipmentStatusId = StatusHelper.deliveryCancel;
          objArr.shipmentIds = shipmentIds;
          objArr.note = note;
        }
      });
      modelArray.push(objArr);
    });

    modelArray.forEach(x => {
      this.shipmentService.assignUpdateDeliveryList(x).subscribe(x => {
        if (!super.isValidResponse(x)) return;

        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Cập nhật thành công"
        });
        this.bsModalRef.hide();
        this.removeSelectedData(this.selectedData);
      });
    });
  }

  updateStatus() {
    let list = [...this.listData];
    if (!this.selectedStatusUpdate) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn trạng thái!"
      });
      return;
    }
    //updateStatus
    let arr = this.selectedData
      .map(item => item.currentEmpId)
      .filter((value, index, self) => self.indexOf(value) === index);
    let modelArray = [];
    arr.forEach(element => {
      let objArr = new ListUpdateStatusViewModel();
      let shipmentIds = [];
      this.selectedData.forEach(x => {
        if (x.currentEmpId === element) {
          let note = "";
          if (this.selectedStatusUpdate) {
            shipmentIds.push(x.id);
            objArr.empId = x.currentEmpId;
            objArr.shipmentStatusId = this.selectedStatusUpdate;
            objArr.shipmentIds = shipmentIds;
          }
        }
      });
      modelArray.push(objArr);
    });

    modelArray.forEach(x => {
      // console.log(x);
      // this.shipmentService.assignUpdateDeliveryList(x).subscribe(x => {
      //   if (!super.isValidResponse(x)) return;

      //   this.messageService.add({
      //     severity: Constant.messageStatus.success,
      //     detail: "Cập nhật thành công"
      //   });
      //   this.bsModalRef.hide();
      //   this.removeSelectedData(this.selectedData);
      // });
    });
  }

  removeSelectedData(listRemove: Shipment[]) {
    let listClone = Array.from(this.listData);
    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = null;
    this.selectedReason = null;
    this.txtNote = null;
    this.selectedStatusUpdate = null;
  }

  changeShipmentStatus() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changeToHubRouting() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changeRider() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changeSenderName() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  // changeStatusUpdate() {
  //   this.selectedData = [];
  //   this.loadLazy(this.event);
  // }

  loadToHubRouting() {
    this.selectedToHubRouting = null;
    let uniqueHubRouting = [];
    this.toHubRoutings = [];

    this.datasource.forEach(x => {
      if (uniqueHubRouting.length === 0) {
        this.toHubRoutings.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueHubRouting.indexOf(x.toHubRoutingId) === -1 &&
        x.toHubRoutingId
      ) {
        uniqueHubRouting.push(x.toHubRoutingId);
        this.toHubRoutings.push({
          label: x.toHubRouting.name,
          value: x.toHubRoutingId
        });
      }
    });
  }

  loadRider() {
    this.selectedRider = null;
    let uniqueRider = [];
    this.riders = [];
    this.datasource.forEach(x => {
      if (uniqueRider.length === 0) {
        this.riders.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueRider.indexOf(x.currentEmpId) === -1 && x.currentEmpId) {
        uniqueRider.push(x.currentEmpId);
        this.riders.push({
          label: x.currentEmp.fullName,
          value: x.currentEmpId
        });
      }
    });
    let uniqueRiders = FilterUtil.removeDuplicates(this.riders, "label");
    this.riders = uniqueRiders;
  }

  loadSenderName() {
    this.selectedSenderNames = null;
    let uniqueSenderName = [];
    this.senderNames = [];

    this.datasource.forEach(x => {
      if (uniqueSenderName.length === 0) {
        this.senderNames.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueSenderName.indexOf(x.senderId) === -1 && x.toHubRoutingId) {
        uniqueSenderName.push(x.senderId);
        this.senderNames.push({
          label: x.senderName,
          value: x.senderId
        });
      }
    });
  }

  loadStatusUpdate() {
    this.statusesUpdate = [];
    this.statusesUpdate.push({ label: "Chọn Tình trạng", value: null });
    let statusIds = [];
    statusIds.push(StatusHelper.deliveryComplete);
    statusIds.push(StatusHelper.deliveryFail);

    this.shipmentStatusService.getByIds(statusIds).subscribe(x => {
      this.defaultStatusesRight = x.data as ShipmentStatus[];
      this.defaultStatusesRight.forEach(element => {
        this.statusesUpdate.push({ label: element.name, value: element.id });
      });
    });
  }

  allSelect(event){
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  // findSelectedDataIndex(): number {
  //   return this.listData.indexOf(this.selectedData);
  // }
}
