import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService,
  RequestShipmentService,
  ReasonService,
  CustomerService,
  ShipmentStatusService,
  HubService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  Reason
} from "../../../models/index";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { DetailRequestShipmentComponent } from "../detail-request-shipment/detail-request-management.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";

// daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { RequestShipmentFilterViewModel } from "../../../models/abstract/requestShipmentFilterViewModel.interface";
import { RequestShipmentModelByProc } from "../../../models/abstract/requestShipmentModelByProc.interface";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { SelectModel } from "../../../models/select.model";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";


@Component({
  selector: "app-request-management",
  templateUrl: "request-management.component.html",
  styles: [
    `
    agm-map {
      height: 200px;
    }
  `
  ]
})
export class RequestManagementComponent extends BaseComponent
  implements OnInit, AfterViewChecked {
  pageNum: number = 1;
  requestShipFilterViewModel: RequestShipmentFilterViewModel = new Object() as RequestShipmentFilterViewModel;
  unit = environment.unit;
  // centerPoStationHub = environment.centerPoStationHub;
  stationHub: string = `${environment.centerHubSortName}/${environment.poHubSortName}/${environment.stationHubSortName}`;
  isListTable: boolean = true;
  isGribTable: boolean;
  colorList: string = "#183545";
  colorGrib: string;
  checkSubmit: boolean;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: number;
  gbModelRef: BsModalRef;
  first: number = 0;
  onPageChangeEvent: any;
  shipmentFilterViewModel: any;
  filterRows: RequestShipmentModelByProc[];
  constructor(
    private hubService: HubService,
    private shipmentStatusService: ShipmentStatusService,
    private customerService: CustomerService,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private userService: UserService,
    private requestShipmentService: RequestShipmentService,
    private daterangepickerOptions: DaterangepickerConfig,
    private reasonService: ReasonService,
    public permissionService: PermissionService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    public router: Router) {
    super(messageService, permissionService, router);
    // dateRangePicker
    this.daterangepickerOptions = DaterangePickerHelper.getSettings(this.daterangepickerOptions);
  }
  parentPage: string = Constant.pages.request.name;
  currentPage: string = Constant.pages.request.children.listRequest.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: RequestShipmentModelByProc;
  listData: RequestShipmentModelByProc[];

  lstHub: SelectModel[] = [];
  usInfo: User;
  //
  selectedDateFrom: any;
  selectedDateTo: any;

  //
  selectedPickUser: User;
  pickUser: User[];
  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: any[] = [];
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
  datasource: RequestShipmentModelByProc[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  sumCountShipmentAccept: number;
  sumTotalShipmentFilledUp: number;
  sumTotalShipmentNotFill: number;
  //
  lateHours: number = 5;
  //
  data: Shipment;
  //
  customers: SelectModel[];
  selectedCustomer: number;
  //
  statuses: SelectItem[] = [{ value: "all", label: "--- Chọn tất cả ---" },
  { value: "waitingforpickup", label: "Chờ phân lệnh" },
  { value: "assignpickup", label: "Đã phân lệnh" },
  { value: "picking", label: "Đang lấy hàng" },
  { value: "pickupcomplete", label: "Lấy thành công" },
  { value: "pickupcancel", label: "Hủy lấy hàng" },
  ];
  selectedStatus: string;
  //
  customer: any;
  filteredCustomers: any;
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
  fromHubs: SelectItem[];
  fromSelectedHub: number;
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
  public zoom: number;
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;

  //
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  currentDate = new Date();

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

  async ngOnInit() {
    await this.loadHub();
    this.initData();
  }

  async loadHub() {
    this.usInfo = await this.authService.getAccountInfoAsync();
    this.fromSelectedHub = this.usInfo.hub.centerHubId && this.usInfo.hub.poHubId ? this.usInfo.hubId : null;

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

  ngAfterViewChecked() {
    this.currentDate = new Date();
    this.cdRef.detectChanges();
  }

  initData() {
    this.requestShipFilterViewModel.pageSize = this.rowPerPage;
    this.requestShipFilterViewModel.pageNumber = this.pageNum;
    this.loadRequestShipment();
    this.loadCustomer();
    this.loadStatus();
    this.loadFromHubs();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }
  
  async loadCustomer() {
    // const data = await this.customerService.getAllSelectItemAsync();
    // if (data) {
    //   this.customers = data;
    // }
  }

  async loadStatus() {
    // const data = await this.shipmentStatusService.getAllSelectModelAsync();
    // if (data) {
    //   this.statuses = data;
    // }
  }

  async loadFromHubs() {
    const data = await this.hubService.getSelectItemAsync();
    if (data) {
      this.fromHubs = data;
    }
  }

  refresh() {
    this.requestShipFilterViewModel.pageSize = this.rowPerPage;
    this.requestShipFilterViewModel.pageNumber = this.pageNum;
    this.loadRequestShipment();
    this.first = 0;

    //refresh
    this.selectedData = null;
    this.fromSelectedHub = null;
    this.selectedStatus = null;
    this.selectedDateFrom = moment(new Date()).format("YYYY/MM/DD 00:00");
    this.selectedDateTo = SearchDate.formatToISODate(new Date());
    this.txtFilterGb = null;
  }

  singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  loadRequestShipment() {
    if (!this.selectedDateFrom) {// load ngày hiện tại
      this.selectedDateFrom = moment(new Date()).format("YYYY/MM/DD 00:00");
    }
    if (!this.selectedDateTo) {// load ngày hiện tại
      this.selectedDateTo = SearchDate.formatToISODate(new Date());
    }
    this.requestShipFilterViewModel.orderDateFrom = this.selectedDateFrom;
    this.requestShipFilterViewModel.orderDateTo = this.selectedDateTo;
    this.requestShipFilterViewModel.fromHubId = this.fromSelectedHub;
    this.requestShipFilterViewModel.senderId = this.selectedCustomer;
    this.requestShipFilterViewModel.type = this.selectedStatus;
    this.requestShipmentService.postByTypeByProc(this.requestShipFilterViewModel).subscribe(res => {
      this.datasource = res.data as RequestShipmentModelByProc[];
      if (this.datasource) {
        this.totalRecords = res.dataCount;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.sumCountShipmentAccept = res.sumOfRequestShipment.sumCountShipmentAccept;
        this.sumTotalShipmentFilledUp = res.sumOfRequestShipment.sumTotalShipmentFilledUp;
        this.sumTotalShipmentNotFill = res.sumOfRequestShipment.sumTotalShipmentNotFill;
      }
    });

    // this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
    //   this.reasonPickupCancel = x.data as ReasonService[];
    // });
  }

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
          this.selectedCustomer = obj.id;
          this.loadRequestShipment();
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
              this.selectedCustomer = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.selectedCustomer = null
            }
            this.loadRequestShipment();
          } else {
            this.selectedCustomer = null;
            this.loadRequestShipment();
          }
        }
      );
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
    }
  }

  onPageChange(event: any) {
    this.onPageChangeEvent = event;
    this.requestShipFilterViewModel.pageNumber = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.requestShipFilterViewModel.pageSize = this.onPageChangeEvent.rows;
    this.loadRequestShipment();
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        //Begin Custom filter

        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
      }
    }, 250);
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

  openModel(template: TemplateRef<any>, data: Shipment = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Shipment();
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-lg"
    });
  }

  onDetailRequestShipment(template, data: Shipment) {
    // console.log(data.shipmentNumber);
    this.showItemShipment = data.id;

    this.gbModelRef = this.modalService.show(DetailRequestShipmentComponent, {
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
      Constant.classes.includes.shipment.sender,

      Constant.classes.includes.shipment.fromHubRouting,
      Constant.classes.includes.shipment.toHubRouting,
      Constant.classes.includes.shipment.pickUser
    ];

    this.requestShipmentService
      .get(this.showItemShipment, includes)
      .subscribe(x => {
        // console.log(x);
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      });
  }

  openDeleteModel(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Hủy yêu cầu";
      this.isNew = false;
      this.selectedData = data;
      this.data = this.clone(data);
      this.selectedReasonPickupCancel = data.reasonService;
    } else {
      this.isNew = true;
      this.data = new Shipment();
      this.selectedData = new Shipment;
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openModelPickUser(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Phân NVLH";
      this.isNew = false;

      this.selectedData = data;
      this.data = this.clone(data);
      this.selectFromHubs = data.fromHubId;

      if (!this.selectFromHubs) {
        this.userService.getEmpByCurrentHub().subscribe(x => {
          if (!super.isValidResponse(x)) return;
          // this.pickUser.forEach(x => {
          //   if(x.hubId){
          //     console.log("name: " + x.fullName + "pickupUser Hub: " + x.hubId);
          //   }
          // });

          if (data.pickUser) {
            this.selectedPickUser = data.pickUser as User;
            this.pickUser = x.data as User[];
          } else {
            this.selectedPickUser = null;
            let data = x.data as User[];
            this.pickUser = [];
            this.pickUser.push(new User());
            data.forEach(x => {
              this.pickUser.push(x);
            });
            // console.log(this.pickUser);
          }
        });
      } else {
        this.userService.getEmpByHubId(this.selectFromHubs).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          // this.pickUser = x.data as User[];
          // console.log(this.pickUser);

          if (data.pickUser) {
            this.selectedPickUser = data.pickUser as User;
            this.pickUser = x.data as User[];
          } else {
            this.selectedPickUser = new User();
            let data = x.data as User[];
            this.pickUser = [];
            // this.pickUser.push(new User());
            data.forEach(x => {
              this.pickUser.push(x);
            });
            // console.log(this.pickUser);
          }
        });
      }

    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Shipment();
      this.selectedPickUser = new User;
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openModelLost(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Mất hàng";
      this.isNew = false;
      this.selectedData = data;
      this.data = this.clone(data);
      this.lostPackageNote = data.note;
    } else {
      this.isNew = true;
      this.data = new Shipment();
      this.selectedData = new Shipment;
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  save(data: RequestShipmentModelByProc) {
    let list = [...this.listData];
    if (this.isNew) {
      if (data.shipmentStatusName === "Yêu cầu mới") {
        this.requestShipmentService.create(this.data).subscribe(x => {
          if (!this.isValidResponse(x)) return;
          var obj = x.data as Shipment;
          this.mapSaveData(obj);
          list.push(this.data);
          this.datasource.push(this.data);
          this.saveClient(list);
        });
      } else {
        return;
      }
    } else {
      if (data.shipmentStatusName === "Yêu cầu mới") {
        this.requestShipmentService.update(this.data).subscribe(x => {
          if (!this.isValidResponse(x)) return;
          var obj = x.data as Shipment;
          this.mapSaveData(obj);
          list[this.findSelectedDataIndex()] = this.data;
          this.datasource[
            this.datasource.indexOf(this.selectedData)
          ] = this.data;
          this.saveClient(list);
        });
      } else {
        return;
      }
    }
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
      }
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  saveClient(list: RequestShipmentModelByProc[]) {
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Cập nhật thành công"
    });
    this.listData = list;
    this.data = new Shipment();
    this.selectedData = new Shipment();
    this.bsModalRef.hide();
  }

  delete(data: Shipment) {
    let list = [...this.listData];

    if (this.selectedReasonPickupCancel) {
      this.checkSubmit = true;
      this.data.reasonService = this.selectedReasonPickupCancel;
      this.data.shipmentStatusId = StatusHelper.pickupCancel;

      let note = "";
      let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);
      // this.data.shipmentStatus.name = JSON.parse(reasonNote).name;

      if (data.note) {
        note = `${JSON.parse(reasonNote).name}, ${data.note}`;
      } else {
        note = `${JSON.parse(reasonNote).name}`;
      }
      data.note = note;
      this.requestShipmentService.update(this.data).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
        var obj = x.data as Shipment;
        this.mapPickupCancelData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    } else {
      // console.log(this.selectedReasonPickupCancel);
    }
    // this.refresh();
  }

  mapPickupCancelData(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
      }
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.reasonService = this.selectedReasonPickupCancel;
    }
  }

  updateLostPackge(data: Shipment) {
    // alert(this.lostPackageNote);
    let list = [...this.listData];


    if (this.lostPackageNote && this.lostPackageNote.toString().trim() !== "") {
      this.checkSubmit = true;
      this.data.note = this.lostPackageNote;
      this.data.shipmentStatusId = StatusHelper.pickupLostPackage;
      let note = "";
      if (data.note) {
        note = `${this.lostPackageNote}, ${data.note}`;
      } else {
        note = `${this.lostPackageNote}`;
      }
      data.note = note;
      // console.log(data.note);
      this.requestShipmentService.update(this.data).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
        var obj = x.data as Shipment;
        this.mapSaveLostPackage(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng nhập lý do mất hàng!"
      });
    }

    // this.refresh();
  }

  choicePickupUser(data: Shipment) {
    // console.log(this.selectedData);
    let list = [...this.listData];

    if (typeof this.selectedPickUser.fullName === "undefined") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn NVLH!"
      });
    } else {
      // console.log(this.selectedPickUser);
      this.checkSubmit = true;
      this.data.pickUser = this.selectedPickUser;
      this.data.pickUserId = this.selectedPickUser.id;
      this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
      this.data.pickUser.fullName = this.selectedPickUser.fullName;
      this.data.currentEmpId = this.selectedPickUser.id;

      this.requestShipmentService.update(this.data).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
        var obj = x.data as Shipment;
        this.mapSavePickupUser(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
    // this.refresh();
  }

  mapSaveLostPackage(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
        this.data.concurrencyStamp = obj.concurrencyStamp;
        this.data.note = this.lostPackageNote;
        // this.data.shipmentStatus.name = "Mất hàng khi lấy hàng";
        this.data.shipmentStatusId = StatusHelper.pickupLostPackage;
      }
    }
  }

  mapSavePickupUser(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
        this.data.concurrencyStamp = obj.concurrencyStamp;
        this.data.pickUser.fullName = this.selectedPickUser.fullName;
        this.data.pickUserId = this.selectedPickUser.id;
        this.data.currentEmpId = this.selectedPickUser.id;
        this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
      }

    }
  }

  changeFromHub() {
    this.loadRequestShipment();
  }

  changeShipmentStatus() {
    this.loadRequestShipment();
  }

  changeCustomer() {
    this.loadRequestShipment();
  }

  // dateRangePicker
  mainInput = DaterangePickerHelper.mainInput;
  public eventLog = "";

  public selectedDate() {
    // this.selectedData = [];
    // dateInput.start = value.start;
    // dateInput.end = value.end;

    // //
    // this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    // this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    // this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    // this.selectedDateTo = this.requestGetPickupHistory.toDate;
    this.loadRequestShipment();
  }

  calendarEventsHandler(e: any) {
    this.eventLog = "\nEvent Fired: " + e.event.type;
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  getTimeLeft(orderDate: string, rowData: Shipment) {
    if (orderDate) {
      var now = this.currentDate.getTime();
      var distance = now - new Date(orderDate).getTime();

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance > 0) {
        if (days * 24 + hours > this.lateHours) {
          let findIndex = this.listData.findIndex(x => x.id == rowData.id);
          if (findIndex != -1) {
            this.listData[findIndex].isTooLate = true;
          }
        }
        return days + " ngày " + hours + " giờ " + minutes + " phút ";
      }
      else {
        return days * -1 + " ngày " + hours * -1 + " giờ " + minutes * -1 + " phút ";
      }
    }
    else {
      return "";
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
  }
}
