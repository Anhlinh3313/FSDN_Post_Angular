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
  ReasonService
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
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;

@Component({
  selector: "list-pickup-cancel",
  templateUrl: "list-pickup-cancel.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class ListPickupCancelComponent extends BaseComponent
  implements OnInit {
  hub = environment;

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
    super(messageService,permissionService,router);
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
  currentPage: string = Constant.pages.pickupManagement.children.listPickupCancel.name;
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
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;

  //
  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
    "pickUser.fullName",
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
    this.selectedDateTo = new Date();
  }

  refresh() {
    // this.initData();
    this.loadShipment();
    this.first = 0;
    this.selectedData = null;
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
      .getByType(ShipmentTypeHelper.pickupCancel, includes)
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
            if (x.pickUserId) {
              return x.pickUserId === this.selectedRider;
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

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
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
  }

  allSelect(event){
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  changeFilter() {
    this.selectedData = [];
    this.loadLazy(this.event);
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
      FilterUtil.Column.shipment.pickUser,
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
        if (e.title === FilterUtil.Column.shipment.pickUser) {
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

}
