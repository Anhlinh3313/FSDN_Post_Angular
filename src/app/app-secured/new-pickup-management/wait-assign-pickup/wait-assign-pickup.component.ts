import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  AfterContentInit
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
  HubService,
  RequestShipmentService,
  ReasonService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  Reason
} from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  ListUpdateStatusViewModel,
  Marker,
  ShipmentReportEmpViewModel
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { RequestDetailComponent } from "../../request-detail/request-detail.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

///////////////Daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { SelectModel } from "../../../models/select.model";
import { HubConnection } from "@aspnet/signalr";
import { SignalRService } from "../../../services/signalR.service";
import { RequestShipmentFilterViewModel } from "../../../models/abstract/requestShipmentFilterViewModel.interface";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";

declare var jQuery: any;
declare var $: any;

@Component({
  selector: "wait-assign-pickup",
  templateUrl: "wait-assign-pickup.component.html",
  styles: [
    `
    agm-map {
      height: 200px;
    }
  `
  ]
})
export class WaitAssignPickupComponent extends BaseComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, AfterContentInit {

  // Googlea map
  markers: Marker[];
  lat: number;
  lng: number;
  zoom: number;
  infoWindowOpen: boolean = false;

  reportEmp: ShipmentReportEmpViewModel;

  usInfo: User = new User();

  hubConnection: HubConnection;

  lstHub: SelectModel[] = [];
  //

  employee_3: any;
  employees_3: any;
  filteredEmployees_3: any;
  selectedEmployee_3: number;

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;

  customer: any;
  filteredCustomers: any;

  unit = environment.unit;
  hub = environment;
  companyName = environment.namePrint;

  noteCancel: string = null;
  reviewChecked: boolean;
  checkSubmitAndPrint: boolean;
  checkSubmit: boolean;
  objPickUsers: User[];
  saveEvent: any;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
  widthFrozen: string = "419px";
  unFrozenWidth: string = "671px";
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;
  listGoods: any;
  dateCreate: Date;
  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private reasonService: ReasonService,
    private daterangepickerOptions: DaterangepickerConfig,
    public permissionService: PermissionService,
    public router: Router,
    private signalRService: SignalRService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
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
  currentPage: string = Constant.pages.pickupManagement.children.waitAssignPickup.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment[] = [];
  listData: Shipment[] = [];

  //
  selectedDateFrom: any;
  selectedDateTo: any;

  //
  // selectedPickUser: User;
  // pickUser: User[];

  //
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;

  pickUser: SelectModel[];
  selectedPickUser: number;

  listUser: SelectItem[];
  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  reasonsPickupCancel: Reason;
  note: string;

  //
  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
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
  filterModel: RequestShipmentFilterViewModel = new RequestShipmentFilterViewModel();
  //
  data: Shipment;
  //
  customers: SelectModel[];
  selectedCustomer: Customer;
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  //
  vehicleTypes: SelectItem[] = [{ value: null, label: '--- Chọn tất cả ---' }, { value: "bike", label: 'Xe máy' }, { value: "car", label: 'Xe ô tô' }];
  selectedvehicleType: number;
  //
  sort: SelectItem[] = [{ value: true, label: 'Mới nhất' }, { value: false, label: 'Cũ nhất' }];
  pickupTypes: SelectItem[] = [{ value: null, label: 'Tất cả' }, { value: 1, label: 'Yêu cầu mới' }, { value: 2, label: 'Từ chối lấy hàng' }, { value: 3, label: 'Lấy không thành công' }, { value: 4, label: 'Quá 4 tiếng lấy hàng' }];
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
  employees: SelectItem[];
  selectedEmployee: number;
  //
  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;

  numberSetup: number = 300;
  numberCount: number = 0;
  setInterval = null;

  currentDate: Date;
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

  // Google map
  async loadInit() {
    this.zoom = 12;
    this.lat = 21.019614;
    this.lng = 105.841513;

    await this.loadPickupUser();

    this.selectedPickUser = null;
    this.showRiders();
  }

  showRiders() {
    this.markers = [];

    this.pickUser.forEach(user => {
      if (user && user.data) {
        let element = user.data;
        var dateDiff = moment(new Date).diff(element.lastUpdateLocationTime, 'minutes');
        var icon = 'assets/images/maps/user-placeholder-offline.png';
        var isOnline: boolean = false;
        element.typeMap = 0;

        if (0 <= dateDiff && dateDiff <= 2) {
          icon = 'assets/images/maps/user-placeholder-online.png';
          element.typeMap = 1;
          isOnline = true;
        }

        if (element.id === this.selectedPickUser) {
          icon = 'assets/images/maps/user-placeholder-tracing.png';
          this.zoom = 17;
          this.lat = element.currentLat;
          this.lng = element.currentLng;
          element.typeMap = 2;

          // check có chặn hay không nếu không có vị trí nv
          // if (this.companyName !== "Shipnhanh") {
          //   if (!element.currentLat || !element.currentLng) {
          //     this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không xác định được vị trí giao nhận" });
          //     this.loadInit();
          //   }
          // }
        }

        this.markers.push({
          id: element.id,
          lat: element.currentLat,
          lng: element.currentLng,
          label: '',
          draggable: false,
          icon: icon,
          isOnline: isOnline,
          data: element,
        });
      }
    });
  }

  async hubConnect() {
    this.hubConnection = await this.signalRService.Connect();

    this.hubConnection.on("UpdatePosition", res => {
      let user = res.user as User;
      let findDataRider = this.pickUser.find(x => x.value == user.id);
      if (findDataRider && findDataRider.data) {
        let findRider = findDataRider.data;
        if (findRider) {
          findRider.currentLat = user.currentLat;
          findRider.currentLng = user.currentLng;
          findRider.lastUpdateLocationTime = user.lastUpdateLocationTime;

          let findMarker = this.markers.find(x => x.id == findRider.id);
          findMarker.lat = user.currentLat;
          findMarker.lng = user.currentLng;

          this.markers = this.markers.filter(x => x.id != findRider.id);
          this.markers.push(findMarker);

          // Map di chuyển theo nhân viên đang chọn
          if (this.selectedPickUser == findRider.id) {
            this.lat = user.currentLat;
            this.lng = user.currentLng;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.signalRService.Disconnect();
    this.clearNumberCount();
  }

  loadShipmentReportByEmpId() {
    var date = new Date();
    var m = date.getMonth();
    var y = date.getFullYear();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);

    this.shipmentService.getShipmentReportByEmpId(this.selectedPickUser, firstDay, lastDay).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.reportEmp = x.data as ShipmentReportEmpViewModel;
      }
    );
  }
  //

  getTimeLeft(orderDate: string, rowData: Shipment) {
    if (orderDate) {
      var now = this.currentDate.getTime();
      var houreNow = this.currentDate.getHours();
      var create = new Date(orderDate).getTime();
      var distance = now - create;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (hours > 4 || days > 0 || houreNow >= 17) {
        let findIndex = this.listData.findIndex(x => x.id == rowData.id);
        if (findIndex != -1) {
          this.listData[findIndex].isQua4Tieng = true;
        }
      }

      return days + " ngày " + hours + " giờ " + minutes + " phút ";
    }
    else {
      return "";
    }
  }

  // Đếm ngược to refresh
  @HostListener('document:mousemove', ['$event']) onMouseMove(e) {
    if (this.numberSetup) {
      this.setupNumberCount();
    }
  };

  @HostListener('document:keypress', ['$event']) onKeypress(e) {
    if (this.numberSetup) {
      this.setupNumberCount();
    }
  }

  setTimeoutToRefresh() {
    if (this.numberSetup <= 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập số giây hợp lệ"
      });
    }
    else {
      this.setupNumberCount();
    }
  }

  setupNumberCount() {
    this.clearNumberCount();
    this.persistenceService.set("numberSetup", this.numberSetup, { type: StorageType.LOCAL });
    let numberSetup = this.numberSetup;
    let i = 0;
    this.setInterval = setInterval(() => {
      i++;
      this.numberCount = i;
      if (i == numberSetup) {
        i = 0;
        this.refresh();
      }
    }, 1000)
  }

  clearNumberCount() {
    clearInterval(this.setInterval);
  }
  //

  loadRiderNameByID() {
    if (this.pickUser) {
      let rider = this.pickUser.find(x => x.value == this.selectedPickUser);
      return rider ? rider.data.code + " - " + rider.data.fullName : "";
    }
    else
      return "";
  }

  async ngOnInit() {
    if (!this.filterModel.orderDateFrom) this.filterModel.orderDateFrom = SearchDate.formatToISODate(new Date());
    if (!this.filterModel.orderDateTo) this.filterModel.orderDateTo = SearchDate.formatToISODate(new Date());
    // this.initData();
    await this.loadHub();
    this.loadShipment();
    this.loadFilter();

    // await this.loadPickupUser();
    this.loadReasonPickupCancel();
    this.selectedDateTo = new Date();
    $("#print-section").hide();

    this.loadInit();
    this.hubConnect();

    this.numberSetup = this.persistenceService.get("numberSetup", StorageType.LOCAL);
    if (this.numberSetup) {
      this.setupNumberCount();
    }
  }

  refresh() {
    // this.initData();
    this.loadShipment();
    this.first = 0;
    this.selectedData = null;
    this.selectedPickUser = null;
    this.selectedReasonPickupCancel = undefined;
    this.txtFilterGb = null;
    this.reviewChecked = false;
  }

  public singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  public singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  changePickUser() {
    this.loadShipmentReportByEmpId();
    this.showRiders();
  }

  ngAfterViewChecked() {
    this.currentDate = new Date();
    this.cdRef.detectChanges();
  }

  async ngAfterContentInit() {
  }

  async ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  initData() {
  }

  async loadShipment() {
    this.filterModel.orderDateFrom = SearchDate.formatToISODate(this.filterModel.orderDateFrom);
    this.filterModel.orderDateTo = SearchDate.formatToISODate(this.filterModel.orderDateTo);
    this.filterModel.type = ShipmentTypeHelper.waitingForPickup;

    const res = await this.requestShipmentService.postByTypeByProcAsync(this.filterModel);
    if (!this.isValidResponse(res)) return;
    this.datasource = res.data;
    this.listData = this.datasource;
    this.totalRecords = res.dataCount;
  }

  onPageChange(event: any) {
    this.filterModel.pageNumber = event.first / event.rows + 1;
    this.filterModel.pageSize = event.rows;
    this.loadShipment();
  }


  newReuqest() { this.filterModel.pickupType = 1; this.loadShipment(); }
  rejectPickup() { this.filterModel.pickupType = 2; this.loadShipment(); }
  failPickup() { this.filterModel.pickupType = 3; this.loadShipment(); }
  tooLate() { this.filterModel.pickupType = 4; this.loadShipment(); }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.reviewChecked) {
        this.listData = this.selectedData;
        this.totalRecords = this.selectedData.length;
      } else if (this.datasource) {
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
              return x.shipmentStatus.id === this.selectedStatus;
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

        if (this.selectedvehicleType) {
          filterRows = filterRows.filter(x => {
            if (this.selectedvehicleType == 1) {
              return (x.length * x.width * x.height) > (80 * 60 * 50) || x.weight > 60;
            }
            else {
              return (x.length * x.width * x.height) <= (80 * 60 * 50) || x.weight <= 60;
            }
          }
          );
        }

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;
      }
    }, 250);
  }

  async loadPickupUser() {
    this.selectedPickUser = null;
    this.pickUser = [];
    this.objPickUsers = [];

    let users = await this.userService.getEmpByCurrentHubAsync();

    await users.forEach(element => {
      this.pickUser.push({ label: `${element.code} - ${element.fullName}`, value: element.id, data: element });
      this.objPickUsers.push(element);
    });
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
    this.noteCancel = null;
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  allSelect(event) {
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  assignPickUser() {
    if (!this.isValidAssignPickUser()) return;
    this.choicePickupUser();
  }

  assignPickUserAndrint() {
    if (!this.isValidAssignPickUser()) return;
    this.choicePickupUserAndPrint();
  }

  isValidAssignPickUser(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedData || this.selectedData.length === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      result = false;
    }
    if (!this.selectedPickUser) {
      messages.push({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn NV!"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  delete() {
    if (!this.selectedReasonPickupCancel) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do!"
      });
      return;
    } else {
      if (this.selectedReasonPickupCancel.isMustInput) {
        if (!this.noteCancel) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "vui lòng nhập ghi chú hủy!"
          });
          return;
        }
      }
      let note = "";
      let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);

      this.selectedData.forEach(x => {
        x.reasonService = this.selectedReasonPickupCancel;
        x.shipmentStatusId = StatusHelper.pickupCancel;
        note = `${JSON.parse(reasonNote).name}`;
        if (this.noteCancel) note += `, ghi chú: ${this.noteCancel}`;
        x.note = note;

        this.requestShipmentService.pickupCancel(x).subscribe(x => {
          if (!super.isValidResponse(x)) return;

          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Hủy lấy hàng thành công"
          });
          this.bsModalRef.hide();
          this.removeSelectedData(this.selectedData);
        });
      });
    }
    // this.refresh();
  }

  choicePickupUser() {
    let list = [...this.listData];

    this.checkSubmit = true;
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedData.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedPickUser;
    model.shipmentStatusId = StatusHelper.assignEmployeePickup;
    model.shipmentIds = shipmentIds;

    this.requestShipmentService.assignPickupList(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      this.removeSelectedData(this.selectedData);
    });
  }

  choicePickupUserAndPrint() {
    let list = [...this.listData];

    this.checkSubmitAndPrint = true;
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedData.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedPickUser;
    model.shipmentStatusId = StatusHelper.assignEmployeePickup;
    model.shipmentIds = shipmentIds;

    // let popUpWin = this.createPopupWin();
    this.requestShipmentService.assignPickupList(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.checkSubmitAndPrint = InputValue.checkSubmit(this.checkSubmitAndPrint);
      // this.listGoods = x.data as ListGoods;
      // if (this.listGoods) {
      //   // setup print
      //   this.itemShipment = [...this.selectedData];
      //   this.itemShipment.type = "NHẬN HÀNG";
      //   this.itemShipment.shipmentStatus = this.selectedData[0].shipmentStatus.name;
      //   this.objPickUsers.forEach(x => {
      //     if (x.id === this.selectedPickUser) {
      //       this.itemShipment.createdBy = x.fullName;
      //       this.itemShipment.createdPhone = x.phoneNumber;
      //     }
      //   });
      // this.generalInfoService.get().subscribe(x => {
      //   let general = x.data as GeneralInfoModel;
      //   this.itemShipment.companyName = general.companyName.toLocaleUpperCase();
      //   this.itemShipment.logoUrl = general.logoUrl;
      //   this.itemShipment.hotline = general.hotLine;
      //   this.itemShipment.centerHubAddress = general.addressMain;
      // });
      //   this.itemShipment.listGoods = this.listGoods.code;
      //   this.itemShipment.createdHub = this.listGoods.createdByHub.name;
      //   this.dateCreate = new Date();

      //   JsBarcode("#listGoods", this.itemShipment.listGoods, {
      //     format: "CODE128",
      //     height: 40,
      //     width: 2,
      //     displayValue: false
      //   });

      //   this.selectedData.forEach((item, index) => {
      //     this.stt = index + 1;
      //     this.itemShipment[index].stt = this.stt;

      //     JsBarcode(
      //       "#" + this.selectedData[index].shipmentNumber,
      //       this.selectedData[index].shipmentNumber,
      //       {
      //         format: "CODE128",
      //         height: 30,
      //         width: 1,
      //         displayValue: false
      //       }
      //     );
      //   });

      //   this.print(popUpWin);
      // }
      // popUpWin.close();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      this.removeSelectedData(this.selectedData);
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
    this.selectedPickUser = null;
    this.selectedReasonPickupCancel = undefined;
    this.employee_3 = null;
  }

  changeFilter() {
    this.selectedData = [];
    this.loadShipment();
  }

  async scanShipmentNumber(txtShipmentNumber) {
    this.filterModel.shipmentNumber = txtShipmentNumber.value;
    this.filterModel.pageNumber = 1;
    this.filterModel.pageSize = 10;
    this.loadShipment();
  }

  onChangeReview() {
    this.loadLazy(this.event);
  }

  clearSelect() {
    this.selectedData = null;
    if (this.reviewChecked) {
      this.reviewChecked = false;
      this.onChangeReview();
    }
  }

  loadFilter() {
    this.loadCustomer();
    this.loadUser();
  }

  async loadHub() {
    this.usInfo = await this.authService.getAccountInfoAsync();
    this.filterModel.fromHubId = this.usInfo.hub.centerHubId && this.usInfo.hub.poHubId ? this.usInfo.hubId : null;

    if (this.usInfo.hub.centerHubId && !this.usInfo.hub.poHubId) {
      this.lstHub = await this.hubService.getSelectModelStationHubByPoIdAsync(this.usInfo.hubId);
    }
    else if (!this.usInfo.hub.centerHubId) {
      let dataHub = await this.hubService.getAllSelectModelAsync();
      this.lstHub.push(dataHub[0]);
      dataHub.map((x, index) => {
        if (index > 0) {
          if (x.data.centerHubId == this.usInfo.hubId) {
            this.lstHub.push(x);
          }
        }
      })
    }
    else if (this.usInfo.hub.centerHubId && this.usInfo.hub.poHubId) {
      this.lstHub.push({ label: this.usInfo.hub.name, value: this.usInfo.hubId, data: this.usInfo.hub });
    }
  }

  async loadCustomer() {
    this.customers = await this.customerService.getAllSelectItemAsync();
  }

  async loadUser() {
    this.listUser = await this.userService.getSelectModelRiderAllHubAsync();
  }

  ///////DateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate() {
    this.selectedData = [];
    this.loadShipment();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  lookupRowStyleClass(rowData: Shipment) {
    let result: any;
    if (rowData.shipmentStatusId === StatusHelper.pickupFail) {
      result = 'isPickupFail';
    }
    if (rowData.shipmentStatusId === StatusHelper.refusePickup) {
      result = 'isRefusePickup';
    }
    if (rowData.shipmentStatusId === StatusHelper.newRequest) {
      result = 'isNewRequest';
    }
    return result;
  }

  createPopupWin(): Window {
    return window.open(
      "",
      "_blank",
      "top=0,left=0,height=100%,width=auto,time=no"
    );
  }

  print(popupWin) {
    setTimeout(() => {
      let printContents;
      printContents = document.getElementById("print-section").innerHTML;
      // popupWin = window.open(
      //   "",
      //   "_blank",
      //   "top=0,left=0,height=100%,width=auto,time=no"
      // );
      popupWin.document.open();
      popupWin.document.write(
        "<!DOCTYPE html><html><head>  " +
        '<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css" ' +
        'media="screen,print">' +
        '<link rel="stylesheet" href="/assets/css/layout.css" media="screen,print">' +
        "<style>@page { size: auto;  margin: 0mm; }</style>" +
        '</head><body onload="window.print()"><div class="reward-body">' +
        printContents +
        "</div></html>"
      );
      popupWin.document.close();
    }, 1000);
  }

  // filter Employee
  async filterEmployee_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.employees_2.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.pickUserId = x.value;
          this.selectedData = [];
          this.loadShipment();
        }
      }
    });
  }

  async keyTabEmployee_2(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees_2.length == 1) {
        findCus = this.employees_2[0];
      } else {
        findCus = this.employees_2.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.pickUserId = findCus.data.id;
        this.employee_2 = findCus.label;
        this.selectedData = [];
        this.loadShipment();
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //

  // filter Employee 3
  async filterEmployee_3(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees_3 = [];
      this.filteredEmployees_3 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_3.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_3.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee_3() {
    let cloneSelectedUser = this.employee_3;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.employees_3.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.selectedPickUser = x.value;
          this.changePickUser();
        }
      }
    });
  }

  async keyTabEmployee_3(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_3 = [];
      this.filteredEmployees_3 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_3.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_3.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees_3.length == 1) {
        findCus = this.employees_3[0];
      } else {
        findCus = this.employees_3.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.selectedPickUser = findCus.data.id;
        this.employee_3 = findCus.label;
        this.changePickUser();
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
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
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (cloneSelectedCustomer === x.label) {
          this.filterModel.senderId = obj.id;
          this.selectedData = [];
          this.loadShipment();
        }
      }
    });
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
              this.filterModel.senderId = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.filterModel.senderId = null
            }
            this.selectedData = [];
            this.loadShipment();
          } else {
            this.filterModel.senderId = null;
            this.selectedData = [];
            this.loadShipment();
          }
        }
      );
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
    }
  }


  async onEnterSearchGB(shipmentNumber) {
    this.bsModalRef = this.modalService.show(ShipmentDetailComponent, { class: 'inmodal animated bounceInRight modal-1000' });
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
      Constant.classes.includes.shipment.listGoods,
      Constant.classes.includes.shipment.fromHubRouting,
      Constant.classes.includes.shipment.toHubRouting,
    ];
    this.requestShipmentService.trackingShort(shipmentNumber.trim(), includes).subscribe(
      x => {
        if (x.isSuccess == false) return;
        this.bsModalRef.content.loadData(x.data as Shipment, 0, true);
      }
    );

    // const data = await this.shipmentService.getByShipmentNumberAsync(shipmentNumber.trim());
    // if (data) {
    //   const ladingSchedule = await this.shipmentService.getGetLadingScheduleAsync(data.id);
    //   if (ladingSchedule) {
    //     data.ladingSchedules = ladingSchedule;
    //   }
    //   this.bsModalRef.content.loadData(data, 1, true);
    // }
  }
}
