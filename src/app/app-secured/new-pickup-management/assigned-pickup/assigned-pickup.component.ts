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
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService,
  ReasonService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  Customer,
  Reason
} from "../../../models/index";
import { PersistenceService } from "angular-persistence";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { RequestDetailComponent } from "../../request-detail/request-detail.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

///////////////Daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { AssignHelper } from "../../../infrastructure/assignTime.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;

@Component({
  selector: "assigned-pickup",
  templateUrl: "assigned-pickup.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class AssignedPickupComponent extends BaseComponent
  implements OnInit {
  hub = environment;
  minutesAssigned: number = 5;
  hoursAssigned: number = 0;
  isRefusePickup: boolean;
  saveEvent: any;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
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
    private daterangepickerOptions: DaterangepickerConfig,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
    //DateRangePicker
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
  }
  parentPage: string = Constant.pages.pickupManagement.name;
  currentPage: string = Constant.pages.pickupManagement.children.assignedPickup.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment[];
  listData: Shipment[] = [];

  //
  selectedDateFrom: Date;
  selectedDateTo: Date;

  //
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;

  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  reasonsPickupCancel: Reason;
  note: string;

  //
  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
    "pickUser.fullName",
    "assignPickTime",
    "orderDate",
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
  riders: SelectItem[];
  selectedRider: number;
  //
  employees: SelectItem[];
  selectedEmployee: number;
  //
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
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

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
    this.loadReasonPickupCancel();
    this.selectedDateTo = new Date();
  }

  refresh() {
    // this.initData();
    this.loadShipment();
    this.first = 0;
    this.selectedData = null;
    this.selectedReasonPickupCancel = undefined;
    this.txtFilterGb = null;
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

    // this.requestShipmentService.getAll().subscribe(x => {
    //   this.datasource = x.data as Shipment[];
    //   this.totalRecords = this.datasource.length;
    //   this.listData = this.datasource.slice(0, this.rowPerPage);
    //   // console.log(this.datasource);
    // });

    // this.data = null;
    // this.selectedData = null;
    // this.isNew = true;

    // //refresh
    // this.selectedDateFrom = new Date(2017,0,1);
    // this.selectedDateTo = new Date();
    // this.txtFilterGb = null;
  }

  loadShipment() {
    let includes = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.toHub);
    includes.push(Constant.classes.includes.shipment.toHubRouting);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromWard);
    includes.push(Constant.classes.includes.shipment.toWard);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.sender);

    this.requestShipmentService
      .getByType(ShipmentTypeHelper.assignPickup, includes)
      .subscribe(x => {
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource;
        this.loadFilter();
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
        if (this.selectedRider) {
          filterRows = filterRows.filter(x => {
            if (x.currentEmpId) {
              return x.currentEmpId === this.selectedRider;
            } else {
              return false;
            }
          });
        }
        if (this.selectedCustomer) {
          filterRows = filterRows.filter(
            x => x.senderId === this.selectedCustomer
          );
        }
        if (this.selectedFromHubRouting) {
          filterRows = filterRows.filter(
            x => x.fromHubRoutingId === this.selectedFromHubRouting
          );
        }

        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isBetween(
              this.selectedDateFrom,
              this.selectedDateTo
            )
          );
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isAfter(this.selectedDateFrom)
          );
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isBefore(this.selectedDateTo)
          );
          //
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

  loadReasonPickupCancel() {
    this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
      this.reasonPickupCancel = x.data as ReasonService[];
    });
  }

  openModel(template: TemplateRef<any>, data: Shipment = null) {
    this.showItemShipment = data.shipmentNumber;

    this.gbModelRef = this.modalService.show(RequestDetailComponent, {
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
      Constant.classes.includes.shipment.serviceDVGT,
    ];

    this.requestShipmentService.trackingShort(this.showItemShipment.trim(), includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      }
    );
  }

  openDeleteModel(template: TemplateRef<any>) {
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    } else {
      this.modalTitle = "Hủy yêu cầu";
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  allSelect(event) {
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  delete() {
    let list = [...this.listData];
    if (!this.selectedReasonPickupCancel) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do!"
      });
      return;
    } else {
      let note = "";
      let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);

      this.selectedData.forEach(x => {
        x.reasonService = this.selectedReasonPickupCancel;
        x.shipmentStatusId = StatusHelper.pickupCancel;
        if (x.note) {
          note = `${JSON.parse(reasonNote).name}, ${x.note}`;
        } else {
          note = `${JSON.parse(reasonNote).name}`;
        }
        x.note = note;

        this.requestShipmentService.update(x).subscribe(x => {
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
    // this.refresh();
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
    this.selectedReasonPickupCancel = undefined;
  }

  changeFilter() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changeMinutes() {
    this.datasource.forEach(x => {
      if (x.shipmentStatusId === StatusHelper.assignEmployeePickup) {
        if (x.assignPickTime) {
          x.assignedPickupMinutes = this.minutesAssigned;
        }
      }
    });
  }

  changeHours() {
    this.datasource.forEach(x => {
      if (x.shipmentStatusId === StatusHelper.assignEmployeePickup) {
        if (x.assignPickTime) {
          x.assignedPickupHours = this.hoursAssigned;
        }
      }
    });
  }

  loadFilter() {
    this.selectedFromHubRouting = null;
    this.fromHubRoutings = [];
    this.selectedCustomer = null;
    this.customers = [];
    this.selectedRider = null;
    this.riders = [];

    let arrCols: string[] = [];
    arrCols = [
      FilterUtil.Column.shipment.sender,
      FilterUtil.Column.shipment.fromHubRouting,
      FilterUtil.Column.shipment.currentEmp,
    ];
    let result = FilterUtil.loadArrayFilter(this.datasource, arrCols);
    result.forEach(x => {
      x.forEach(e => {
        if (e.title === FilterUtil.Column.shipment.sender) {
          this.customers = x;
        }
        if (e.title === FilterUtil.Column.shipment.fromHubRouting) {
          this.fromHubRoutings = x;
        }
        if (e.title === FilterUtil.Column.shipment.currentEmp) {
          this.riders = x;
        }
      });
    });
  }

  // findSelectedDataIndex(): number {
  //   return this.listData.indexOf(this.selectedData);
  // }

  ///////DateRangePicker
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

    this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    this.selectedDateTo = this.requestGetPickupHistory.toDate;
    this.loadLazy(this.event);
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  lookupRowStyleClass(rowData: Shipment) {
    let resultColor: any;
    if (rowData.shipmentStatusId === StatusHelper.assignEmployeePickup) {
      if (rowData.assignPickTime) {
        let time = new Date(rowData.assignPickTime);
        let now = new Date();
        let fullYear = time.getFullYear();
        let month = time.getMonth();
        let date = time.getDate();
        let hours;
        if (rowData.assignedPickupHours) {
          hours = time.getHours() + rowData.assignedPickupHours;
        } else {
          hours = time.getHours() + AssignHelper.assignPickupHours;
        }
        let minutes;
        if (rowData.assignedPickupMinutes) {
          minutes = time.getMinutes() + rowData.assignedPickupMinutes;
        } else {
          minutes = time.getMinutes() + AssignHelper.assignPickupMinutes;
        }
        let seconds = time.getSeconds();
        let res = new Date(fullYear, month, date, hours, minutes, seconds);
        let state = moment(res).isBefore(now);
        if (state == true) {
          resultColor = 'isRefusePickupNew';
        }
      } else {
        resultColor = 'isNormal';
      }
    }
    return resultColor;
  }

}