import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as XLSX from 'xlsx';
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ReasonService,
  ShipmentStatusService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  Customer,
  Reason
} from "../../../models/index";
import {
  ListUpdateStatusViewModel,
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";
import { ReasonHelper } from "../../../infrastructure/reason.helper";

///////////////Daterangepicker
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { SelectModel } from "../../../models/select.model";
type AOA = Array<Array<any>>;

declare var jQuery: any;

@Component({
  selector: "update-delivery-status",
  templateUrl: "update-delivery-status.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class UpdateDeliveryStatusComponent extends BaseComponent
  implements OnInit {
  checkDisabledDelete: boolean;
  listDataRight: Shipment[];
  datasourceRight: Shipment[];
  totalRightRecords: number;
  selectedDataRight: Shipment[];
  datasourceRightClient: Shipment[];
  txtFilterGbLeft: string;
  unUpdateShipment: string;
  updateShipment: string;
  includes: string;
  arrSelectedShipmentNumber: string[];
  filterRows: Shipment[];
  pageNum = 1;
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  shipmentFilterViewModelRight: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  selectedEndDeliveryTime: Date;
  reviewChecked: any;
  checkSubmit: any;
  interval: any;
  isStatusDeliveryFail: boolean;
  isStatusDeliveryComplte: boolean;
  isRefusePickup: boolean;
  saveEvent: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
  txtNoteCancel: any;
  txtNoteFail: any;
  dateUpdate: Date;
  txtRealRecipientName: string;

  isActiveTabOne: boolean = true;
  isActiveTabTwo: boolean;

  // Upload excel
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  excelData: any[];
  lstDeliveryStatus: Shipment[] = [];
  lstShipment: Shipment[] = [];
  targetDataTransfer: DataTransfer;
  columnsExcel: any[] = ["stt", "shipment_number", "empid", "real_recipient_name", "end_delivery_time", "note"];

  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private reasonService: ReasonService,
    private shipmentStatusService: ShipmentStatusService,
    private authService: AuthService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string = Constant.pages.deliveryManagement.children.updateDeliveryStatus.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment[];
  listData: Shipment[];

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
  reasonsFail: SelectItem[];
  selectedReasonFail: Reason;
  //
  reasonsCancel: SelectItem[];
  selectedReasonCancel: Reason;
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
  users: SelectModel[] = [];
  userFilters: string[] = [];
  userSelected: string;
  //
  paymentTypeHelper: PaymentTypeHelper = PaymentTypeHelper;
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

  singlePickerEndDeliveryTime = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.selectedEndDeliveryTime
  };


  ngOnInit() {
    //   this.initData();
    // declare shipmentFilterViewModelLeft
    this.includes =
      Constant.classes.includes.shipment.package + "," +
      Constant.classes.includes.shipment.service + "," +
      Constant.classes.includes.shipment.shipmentStatus + "," +
      Constant.classes.includes.shipment.fromHubRouting + "," +
      Constant.classes.includes.shipment.fromHub + "," +
      Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.toHubRouting + "," +
      Constant.classes.includes.shipment.pickUser + "," +
      Constant.classes.includes.shipment.fromWard + "," +
      Constant.classes.includes.shipment.toWard + "," +
      Constant.classes.includes.shipment.toWard + "," +
      Constant.classes.includes.shipment.fromDistrict + "," +
      Constant.classes.includes.shipment.fromProvince + "," +
      Constant.classes.includes.shipment.toDistrict + "," +
      Constant.classes.includes.shipment.toProvince + "," +
      Constant.classes.includes.shipment.currentEmp + "," +
      Constant.classes.includes.shipment.sender;

    this.loadShipment();
    this.selectedEndDeliveryTime = new Date();
    this.singlePickerEndDeliveryTime.startDate = this.selectedEndDeliveryTime;
    this.loadFilter();
  }

  refresh() {
    //   this.initData();
    this.first = 0;
    this.selectedData = null;
    this.selectedDataRight = [];
    this.listDataRight = [];
    this.datasourceRight = [];
    this.totalRightRecords = 0;
    this.reasonsCancel = [];
    this.reasonsFail = [];
    this.txtNoteCancel = null;
    this.txtNoteFail = null;
    this.selectedReasonCancel = null;
    this.selectedReasonFail = null;
    this.selectedStatusUpdate = null;
    this.selectedStatus = null;
    this.selectedRider = null;
    this.selectedSenderNames = null;
    this.txtFilterGbLeft = null;
    this.shipmentFilterViewModelLeft = new ShipmentFilterViewModel();
    this.loadShipment();
  }

  ngAfterViewInit() {
  }

  onSelectTabOne() {
    this.isActiveTabOne = true;
  }
  // tab two
  onSelectTabTwo() {
    this.isActiveTabOne = false;
    this.isActiveTabTwo = true;
  }

  loadShipment() {
    this.shipmentFilterViewModelLeft.Cols = this.includes;
    this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.updateDelivery;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNum;
    this.shipmentFilterViewModelLeft.PageSize = this.rowPerPage;

    // declare shipmentFilterViewModelRight
    this.shipmentFilterViewModelRight.Cols = this.includes;
    this.shipmentFilterViewModelRight.Type = ShipmentTypeHelper.updateDelivery;

    this.arrSelectedShipmentNumber = [];
    this.datasourceRightClient = [];
    this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = [];
    this.shipmentFilterViewModelRight.ShipmentNumberListSelect = [];
    this.loadShipmentPagingLeft();
    // refresh
    this.txtFilterGbLeft = null;
    // this.txtFilterGbRight = null;
  }


  async loadShipmentPagingLeft(): Promise<Shipment[]> {
    const res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModelLeft);
    if (res) {
      const data = res.data as Shipment[];
      this.datasource = data;
      this.totalRecords = res.dataCount;
      this.listData = this.datasource;
      return this.datasource;
    }
  }

  async loadShipmentRight(): Promise<Shipment[]> {
    // console.log(JSON.stringify(this.shipmentFilterViewModelRight));
    const res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModelRight);
    if (res) {
      const data = res.data as Shipment[];
      this.datasourceRight = data;
      this.listDataRight = this.datasourceRight;
      return this.datasourceRight;
    }
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
      if (this.reviewChecked) {
        this.listData = this.selectedData;
        this.totalRecords = this.selectedData.length;
      } else if (this.datasource) {
        this.filterRows = this.datasource;
        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
        // this.listData = filterRows.slice(event.first, event.first + event.rows);
      }
    }, 250);
  }


  loadFilter() {
    this.loadShipmentStatusesLeft();
    //this.loadEmployeesLeft();
    //this.loadSendersLeft();
    this.loadStatusUpdate();
  }

  loadReasonCancel() {
    // this.reasonService.getByType(ReasonHelper.DeliverCancel).subscribe(x => {
    //   this.reasons = x.data as ReasonService[];
    // });
    this.reasonsCancel = [];
    this.reasonsCancel.push({ label: "Chọn lý do", value: null });
    this.reasonService.getByType(ReasonHelper.DeliverCancel).subscribe(x => {
      let reason = x.data as Reason[];
      reason.forEach(element => {
        this.reasonsCancel.push({ label: element.name, value: element });
      });
    });
  }

  loadReasonFail() {
    this.reasonsFail = [];
    this.reasonsFail.push({ label: "Chọn lý do", value: null });
    this.reasonService.getByType(ReasonHelper.DeliverFail).subscribe(x => {
      let reason = x.data as Reason[];
      reason.forEach(element => {
        this.reasonsFail.push({ label: element.name, value: element });
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
      Constant.classes.includes.shipment.serviceDVGT,
    ];

    this.shipmentService.trackingShort(this.showItemShipment.trim(), includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      }
    );
  }

  scanShipmentNumber(txtShipmentNumber) {
    this.selectedData = InputValue.scanShipmentNumber(txtShipmentNumber.value, this.datasource, this.selectedData, this.messageService);
    txtShipmentNumber.value = null;
    this.onChangeReview();
  }

  clearSelect() {
    this.selectedData = null;
    if (this.reviewChecked) {
      this.reviewChecked = false;
      this.onChangeReview();
    }
  }

  onChangeReview() {
    this.loadLazy(this.event);
  }

  openDeleteModel(template: TemplateRef<any>) {
    this.loadReasonCancel();
    if (ArrayHelper.isNullOrZero(this.datasourceRightClient)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Ds vận đơn trống!"
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
    if (!this.datasourceRightClient || this.datasourceRightClient.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Bảng kê chưa có vận đơn"
      });
      return;
    } else {
      this.modalTitle = "Cập nhật trạng thái";
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });

    // this.isStatusDeliveryComplte = false;
    // this.isStatusDeliveryFail = false;
    this.txtRealRecipientName = "";
  }

  allSelect(event) {
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  delete() {
    let list = [...this.listData];
    if (!this.selectedReasonCancel && (!this.txtNoteCancel || this.txtNoteCancel.trim() === "")) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do hoặc nhập ghi chú"
      });
      return;
    }

    let arr = this.datasourceRightClient.map(item => item.currentEmpId).filter((value, index, self) => self.indexOf(value) === index);
    let modelArray = [];

    arr.forEach(element => {
      let objArr = new ListUpdateStatusViewModel();
      let shipmentIds = [];
      this.datasourceRightClient.forEach(x => {
        if (x.currentEmpId === element) {
          let note = "";
          if (this.selectedReasonCancel && this.txtNoteCancel) {
            note = `${this.selectedReasonCancel.name}, ${this.txtNoteCancel}`;
          } else if (this.selectedReasonCancel) {
            note = `${this.selectedReasonCancel.name}`;
          } else if (this.txtNoteCancel) {
            note = `${this.txtNoteCancel}`;
          }
          shipmentIds.push(x.id);
          objArr.empId = this.authService.getUserId();;
          objArr.shipmentStatusId = StatusHelper.deliveryCancel;
          objArr.shipmentIds = shipmentIds;
          objArr.note = note;
        }
      });
      modelArray.push(objArr);
    });

    this.checkDisabledDelete = true;
    modelArray.forEach(x => {
      this.shipmentService.assignUpdateDeliveryList(x).subscribe(x => {
        this.checkDisabledDelete = false;
        if (!super.isValidResponse(x)) {
          return;
        }

        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Cập nhật thành công"
        });
        this.bsModalRef.hide();
        this.datasourceRightClient = [];
        this.totalRightRecords = 0;
      });
    });
  }

  async updateStatus() {
    if(this.validateUpdateStatus()==false) return;
    //updateStatus
    let modelArray = [];
    let objArr = new ListUpdateStatusViewModel();
    if (this.selectedStatusUpdate === StatusHelper.deliveryComplete) { // cập nhật giao hàng TC
      objArr.realRecipientName = this.txtRealRecipientName.trim();
      objArr.endDeliveryTime = SearchDate.formatToISODate(this.selectedEndDeliveryTime);
    } else if (this.selectedStatusUpdate === StatusHelper.deliveryFail) { // cập nhật giao hàng không TC
      console.log(this.selectedStatusUpdate);
      let note = "";
      if (this.selectedReasonFail && !StringHelper.isNullOrEmpty(this.txtNoteFail)) {
        note = `${this.selectedReasonFail.name}, ${this.txtNoteFail.trim()}`;
      } else if (this.selectedReasonFail) {
        note = `${this.selectedReasonFail.name}`;
      } else if (!StringHelper.isNullOrEmpty(this.txtNoteFail)) {
        note = `${this.txtNoteFail.trim()}`;
      }
      objArr.note = note;
    }
    objArr.empId = this.authService.getUserId();
    objArr.shipmentStatusId = this.selectedStatusUpdate;
    objArr.shipmentIds = this.datasourceRightClient.map(x => x.id);

    this.checkSubmit = true;
    const res = await this.shipmentService.assignUpdateDeliveryListAsync(objArr);

    this.checkSubmit = false;
    if (res) {
      if (res.isSuccess) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Cập nhật thành công"
        });

        this.bsModalRef.hide();
        this.datasourceRightClient = [];
        this.totalRightRecords = 0;
        this.arrSelectedShipmentNumber = [];
      }
    }
  }

   validateUpdateStatus() {
     let kt = true;
    this.datasourceRightClient = this.datasourceRightClient.filter((value, index, self) => self.indexOf(value) === index);
    if (!this.selectedStatusUpdate) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn trạng thái!"
      });
      return false;
    } else {
      if (this.selectedStatusUpdate === StatusHelper.deliveryComplete) {
        if (StringHelper.isNullOrEmpty(this.txtRealRecipientName)) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Vui lòng nhập tên người nhận thực tế!"
          });
          return false;
        }
        const currentDate = new Date();
        const state = moment(this.selectedEndDeliveryTime).isAfter(currentDate);
        if (state) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "TG nhận thực tế không được lớn hơn TG hiện tại!"
          });
          return false;
        } 
         Promise.all(this.datasourceRightClient.map( x => {
            let  inOutDate = new Date(x.inOutDate);
            if(inOutDate > this.selectedEndDeliveryTime) 
            {
              this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: "TG nhận  thực tế phải lớn hơn TG xuất kho!"
              });  
              kt = false;
            }
          })); 
          if(!kt) return false;
      }

      if (this.selectedStatusUpdate === StatusHelper.deliveryFail) {
        if (!this.selectedReasonFail && StringHelper.isNullOrEmpty(this.txtNoteFail)) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn lý do hoặc nhập ghi chú"
          });
          return false;
        }
      }
    }
    return true;  
  }

  async loadShipmentStatusesLeft() {
    this.selectedStatus = null;
    this.statuses = [];
    const data = await this.shipmentStatusService.getAllSelectModelAsync();
    if (data) {
      this.statuses = data;
    }

  }

  changeStatus() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    this.shipmentFilterViewModelLeft.ShipmentStatusId = this.selectedStatus;
    this.loadShipmentPagingLeft();
  }

  eventOnSelectedUser() {
    let findU = this.users.find(f => f.label === this.userSelected);
    //this.refresh();
    if (this.userSelected.toLowerCase() == 'chọn tất cả') {
      this.shipmentFilterViewModelLeft.PageNumber = 1;
      this.shipmentFilterViewModelLeft.currentEmpId = null;
      this.loadShipmentPagingLeft();
    } else {
      if (findU) {
        this.shipmentFilterViewModelLeft.PageNumber = 1;
        this.shipmentFilterViewModelLeft.currentEmpId = findU.value;
        this.loadShipmentPagingLeft();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy nhân viên.` });
      }
    }
  }


  //#region Event
  eventFilterUsers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          this.users = [];
          this.userFilters = [];
          this.userFilters.push(`chọn tất cả`);
          x.map(m => this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.users.map(m => this.userFilters.push(m.label));
        }
      );
    }else{
      this.userFilters = [];
      this.userFilters.push(`chọn tất cả`);
    }
  }

  // async  () {
  //   this.selectedRider = null;
  //   this.riders = [];
  //   const data = await this.userService.getSelectModelAllUserByCurrentHubAsync();
  //   if (data) {
  //     this.riders = data;
  //   }
  // }

  changeEmployee() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    this.shipmentFilterViewModelLeft.currentEmpId = this.selectedRider;
    this.loadShipmentPagingLeft();
  }


  // async loadSendersLeft() {
  //   this.selectedSenderNames = null;
  //   this.senderNames = [];
  //   const data = await this.customerService.getAllSelectModelAsync();
  //   if (data) {
  //     this.senderNames = data;
  //   }
  // }

  changeSender() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    this.shipmentFilterViewModelLeft.SenderId = this.selectedSenderNames;
    this.loadShipmentPagingLeft();
  }

  search(value) {
    this.shipmentFilterViewModelLeft.SearchText = value;
    this.loadShipmentPagingLeft();
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
    this.selectedReasonCancel = null;
    this.selectedReasonFail = null;
    this.txtNoteCancel = null;
    this.txtNoteFail = null;
    this.selectedStatusUpdate = null;
    this.selectedEndDeliveryTime = new Date();
    this.txtRealRecipientName = null;
  }

  changeStatusUpdate() {
    // if(this.selectedStatusUpdate) {
    //   this.utcTimeUpdate();
    // }
    if (this.selectedStatusUpdate === StatusHelper.deliveryComplete) {
      this.isStatusDeliveryComplte = true;
    } else {
      this.isStatusDeliveryComplte = false;
    }
    if (this.selectedStatusUpdate === StatusHelper.deliveryFail) {
      this.loadReasonFail();
      this.isStatusDeliveryFail = true;
    } else {
      this.isStatusDeliveryFail = false;
    }
  }

  // utcTimeUpdate() {
  //   this.interval = setInterval(() => {
  //     this.dateUpdate = new Date();
  //     console.log(this.dateUpdate);
  //   }, 1000);
  // }

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
      if (
        uniqueSenderName.indexOf(x.senderId) === -1 &&
        x.toHubRoutingId
      ) {
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

  singleSelectEndDeliveryTime(value: any) {
    this.selectedEndDeliveryTime = moment(value.start).toDate();
  }


  // findSelectedDataIndex(): number {
  //   return this.listData.indexOf(this.selectedData);
  // }

  // Upload excel
  onFileChange(evt: any) {
    // this.value = 0;

    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;

    if (!this.isValidChangeFile()) return;
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      /* save data */
      this.excelData = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      this.setData();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  isValidChangeFile(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.targetDataTransfer || this.myInputFilesVariable.nativeElement.value === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn file upload."
      });
      result = false;
    }
    if (this.targetDataTransfer && this.targetDataTransfer.files.length > 1) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Không thể upload nhiều file cùng lúc"
      });
      this.myInputFilesVariable.nativeElement.value = "";
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }
    return result;
  }

  clearData() {
    // this.value = 0;
    this.excelData = [];
    this.lstDeliveryStatus = [];
    this.myInputFilesVariable.nativeElement.value = "";
    this.lstShipment = [];
  }

  setData() {
    // console.log(this.excelData);
    if (this.excelData.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
      })
      return;
    }
    if (!this.isValidChangeFile()) return;
    const columns = this.excelData[0] as string[];

    this.columnsExcel.forEach(col => {
      if (columns.indexOf(col) == -1) {
        this.messageService.add({
          severity: Constant.messageStatus.error, detail: "File thiếu colum: " + col + ", vui lòng kiểm tra lại: "
        });
        return;
      }
    })

    for (let i = 0; i < this.excelData.length; i++) {
      if (i > 1) {
        const row = this.excelData[i];

        let shipment: Shipment = new Shipment();
        shipment.key = row[0];
        shipment.shipmentNumber = row[1];
        shipment["empid"] = row[2];
        shipment.realRecipientName = row[3];
        shipment.endDeliveryTime = row[4];
        shipment.note = row[5];

        this.lstDeliveryStatus.push(shipment);
      }
    }
  }

  async uploadExcel() {
    let countSuccess = 0;
    let total = this.lstDeliveryStatus.length;
    const currentUser = await this.authService.getAccountInfoAsync();
    await this.lstDeliveryStatus.forEach(async item => {
      if (item.shipmentNumber) {
        let arrEmpCode = [];
        // nếu không nhập username của nhân viên
        if (StringHelper.isNullOrEmpty(item["empid"])) {
          item["empid"] = currentUser.userName;
        }
        arrEmpCode.push(item["empid"]);

        const emp = await this.userService.getByListCodeAsync(arrEmpCode);
        const shipment = await this.shipmentService.trackingShortAsync(item.shipmentNumber, [])

        let isValidDate = true;
        let endDeliveryTime = new Date(item["endDeliveryTime"]);
        if (endDeliveryTime.toString() == "Invalid Date") {
          isValidDate = false;
          item["errorEndDeliveryTime"] = true;
          this.messageService.add({
            severity: Constant.messageStatus.error, detail: "Thời gian nhận không hợp lệ"
          });
        }
        let shipmentNumber = item["shipmentNumber"];
        let res = await this.shipmentService.getByShipmentNumber(shipmentNumber).toPromise();
        let inOutDate = new Date(res.data.inOutDate);
        if(inOutDate > endDeliveryTime)  {
          isValidDate = false;
          item["errorEndDeliveryTime"] = true;
          this.messageService.add({
            severity: Constant.messageStatus.error, 
            detail: "TG nhận  thực tế phải lớn hơn TG xuất kho!"
          });
        }else{
          // console.log("dung roi", res.data.inOutDate);
          // return;
        }
        if (emp.length == 0) {
          item["errorEmpID"] = true;
          this.messageService.add({
            severity: Constant.messageStatus.error, detail: "Không tìm thấy mã nhân viên"
          });
        }



        if (shipment && emp && isValidDate) {
          let arrShipmentID = [];
          arrShipmentID.push(shipment.id);
          let model: ListUpdateStatusViewModel = new ListUpdateStatusViewModel();
          model.currentLat = shipment.currentLat;
          model.currentLng = shipment.currentLng;
          model.deliveryOther = true;
          model.empId = emp.length > 0 ? emp[0].id : null;
          model.shipmentIds = arrShipmentID;
          model.endDeliveryTime = SearchDate.formatToISODate(endDeliveryTime);
          model.endExpectedTime = SearchDate.formatToISODate(shipment.endDeliveryTime);
          model.endTime = SearchDate.formatToISODate(shipment.endDeliveryTime);
          model.fromHubId = shipment.fromHubId;
          model.location = shipment.location;
          // model.mawb = item.;
          model.note = item.note + " (ex)";
          // model.printCodeId = item.;
          model.realRecipientName = item["realRecipientName"];
          // model.realWeight = item.;
          model.receiveHubId = shipment.receiveHubId;
          // model.sealNumber = item.;
          model.shipmentStatusId = StatusHelper.deliveryComplete;
          // model.startExpectedTime = item.;
          // model.startTime = item.;
          model.toHubId = shipment.toHubId;
          model.tplId = shipment.tplId;
          // model.transportTypeId = item.;
          // model.truckNumber = item.;

          await this.shipmentService.assignUpdateDeliveryListAsync(model).then(x => {
            if (x.isSuccess) {
              ++countSuccess;
              let index = this.lstDeliveryStatus.indexOf(item);
              this.lstDeliveryStatus.splice(index, 1);
            }
            else {
              this.messageService.add({
                severity: Constant.messageStatus.warn, detail: (x.message),
              });
            }
          });
        }
        else {
          item["errorShipmentNumber"] = true;
          this.messageService.add({
            severity: Constant.messageStatus.error, detail: "Không tìm thấy mã vận đơn"
          });
        }
      }
    });
    setTimeout(() => {
      if (countSuccess > 0) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: ("Upload thành công " + countSuccess + "/" + total + " vận đơn."),
        });
      }
    }, 1000);
  }

  onPageChange(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadShipmentPagingLeft();
  }

  update(rowData: Shipment, selectedDataRight?: Shipment[]) {
    this.changeUpdateShipment(rowData.shipmentNumber);
  }

  async changeUpdateShipment(txtUpdateShipment) {
    this.messageService.clear();
    let messageWarn: string = "";
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtUpdateShipment);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let arraySN = input.split(" ");
    if (this.arrSelectedShipmentNumber[0] === "") {
      this.arrSelectedShipmentNumber = [];
    }
    const duplicateSN = this.arrSelectedShipmentNumber.filter(x => arraySN.includes(x));
    if (duplicateSN) {
      if (duplicateSN.length > 0) {
        const duplicateSNString = duplicateSN.join(" ");
        messageWarn = "Đã quét mã vận đơn " + duplicateSNString + " trước đó!" + `<br>`;
      }
    }
    arraySN = arraySN.filter(x => !duplicateSN.includes(x));
    this.arrSelectedShipmentNumber = Array.from(new Set(this.arrSelectedShipmentNumber.concat(arraySN)));
    if (arraySN.length !== 0) {
      this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
      this.loadShipmentPagingLeft();
      this.shipmentFilterViewModelRight.ShipmentNumberListSelect = arraySN;
      await this.loadShipmentRight();
      this.datasourceRightClient = this.datasourceRight.concat(this.datasourceRightClient);
      if (this.datasourceRightClient) {
        this.totalRightRecords = this.datasourceRightClient.length;
      }
      const listAssignSN = this.datasourceRightClient.map(x => x.shipmentNumber);
      const noExistSN = this.arrSelectedShipmentNumber.filter(x => !listAssignSN.includes(x));
      if (noExistSN) {
        if (noExistSN.length > 0) {
          const noExistSNString = noExistSN.join(" ");
          messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
        }
      }
      const scanSuccesSN = arraySN.length - noExistSN.length;
      if (scanSuccesSN > 0) {
        messageSuccess = "Quét thành công " + scanSuccesSN + " vận đơn" + `<br>`;
      }
      this.arrSelectedShipmentNumber = listAssignSN;

      if (noExistSN.length === 0 && duplicateSN.length === 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
      if (noExistSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.error;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      } else {
        if (duplicateSN) {
          if (duplicateSN.length > 0) {
            finalTypeMessage = Constant.messageStatus.warn;
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          }
        }
      }
    } else {
      if (duplicateSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail: messageErr + messageWarn + messageSuccess
    });
    this.updateShipment = null;
  }

  unUpdate(rowData: Shipment, selectedDataRight?: Shipment[]) {
    this.changeUnUpdateShipment(rowData.shipmentNumber);
  }

  async changeUnUpdateShipment(txtUnUpdateShipment) {
    this.messageService.clear();
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtUnUpdateShipment);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let unAssignSN = input.split(" ");
    const noExistSN = unAssignSN.filter(x => !this.arrSelectedShipmentNumber.includes(x));
    if (noExistSN) {
      if (noExistSN.length > 0) {
        const noExistSNString = noExistSN.join(" ");
        finalTypeMessage = Constant.messageStatus.error;
        messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      }
    }
    unAssignSN = unAssignSN.filter(x => !noExistSN.includes(x));
    if (unAssignSN.length > 0) {
      this.arrSelectedShipmentNumber = this.arrSelectedShipmentNumber.filter(x => !unAssignSN.includes(x));
      this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
      this.loadShipmentPagingLeft();
      this.shipmentFilterViewModelRight.ShipmentNumberListSelect = unAssignSN;
      if (this.arrSelectedShipmentNumber.length === 0) {
        this.shipmentFilterViewModelRight.ShipmentNumberListSelect.push("");
      }
      await this.loadShipmentRight();
      const unAssignSNs = this.datasourceRight.map(x => x.id);
      unAssignSNs.forEach(y => {
        this.datasourceRightClient = this.datasourceRightClient.filter(x => x.id !== y);
      });
      if (this.datasourceRightClient) {
        this.totalRightRecords = this.datasourceRightClient.length;
      }
      messageSuccess = "Đã hủy " + this.datasourceRight.length + " vận đơn" + `<br>`;
      if ((!noExistSN || noExistSN.length === 0) && this.datasourceRight.length > 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail: messageErr + messageSuccess
    });
    this.unUpdateShipment = null;
  }
}