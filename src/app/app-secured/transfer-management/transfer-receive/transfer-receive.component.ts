import { Component, OnInit, TemplateRef, ElementRef, ViewChild } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  ShipmentStatusService,
  AuthService,
  ListGoodsService,
  HubService,
  ListGoodsStatusService,
  CustomerService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User, ListGoodsFilterViewModel } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel,
  DateRangeFromTo
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";

declare var $: any;

@Component({
  selector: "app-transfer-receive",
  templateUrl: "transfer-receive.component.html",
  styles: []
})
export class TransferReceiveComponent extends InformationComponent implements OnInit {
  @ViewChild("txtShipmentRef") txtShipmentRef: ElementRef;
  listDataRightSuccessTop10: Shipment[]; // chỉ lấy 10 kết quả quét bill thành công
  localStorageAssignUpdateTransferList: string = "localStorageAssignUpdateTransferList";
  listGoodsCreated: ListGoods;
  riderLATs: SelectItem[];
  selectedRiderLAT: string;
  hub = environment;

  generalInfo: GeneralInfoModel;
  idPrint: string;
  currentUser: User;
  fromHub: any;
  toHubName: any;
  totalBox: number;
  totalCalWeight: number;
  totalWeight: number;
  senderId: number;
  totalSumPrice: number;
  txtFilterGbRight: any;
  createdPhone: string;
  shipmentStatus: string;
  createBy: string;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;
  isLazyLoadListData: boolean = true;

  txtAssignShipment: string = "";
  txtAssignPackage: string = "";
  txtFilterGbLeft: string = "";

  listGoods: any;
  dateCreate: Date;
  //tab
  isActiveTabThree: boolean;
  isActiveTabTwo: boolean;
  isActiveTabOne: boolean = true;
  txtAssignShipments: any = " ";
  isActiveTabDSHangChuyenDen: boolean = true;
  isActiveTabDSBangKeTrungChuyen: boolean;

  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  listGoodsFilterViewModel: ListGoodsFilterViewModel = new ListGoodsFilterViewModel();
  pageNum: number = 1;

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    protected generalInfoService: GeneralInfoService,
    private userService: UserService,
    protected authService: AuthService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private statusService: ShipmentStatusService,
    private listGoodsStatusService: ListGoodsStatusService,
    private listGoodsService: ListGoodsService,
    private hubService: HubService,
    private customerService: CustomerService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);

    // let includes = Constant.classes.includes.shipment.package + "," +
    //   Constant.classes.includes.shipment.currentHub + "," +
    //   Constant.classes.includes.shipment.receiveHub + "," +
    //   Constant.classes.includes.shipment.currentEmp + "," +
    //   Constant.classes.includes.shipment.shipmentStatus + "," +
    //   Constant.classes.includes.shipment.toHub + "," +
    //   Constant.classes.includes.shipment.toProvince + "," +
    //   Constant.classes.includes.shipment.fromHub + "," +
    //   Constant.classes.includes.shipment.fromProvince + "," +
    //   Constant.classes.includes.shipment.listGoods + "," +
    //   Constant.classes.includes.shipment.transferUser;
    let includes = "";

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    this.dateFrom = currentDate + "T00:00:00";
    this.dateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }

  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.transferReceive.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  listDataLAT: ListGoods[] = [];
  totalRecordsLAT: number;
  datasourceLAT: ListGoods[];

  statuesLAT: SelectItem[];
  selectedStatusLAT: number;

  transportTypesLAT: SelectItem[];
  selectedTransportTypeLAT: number;

  receiverHubsLAT: SelectItem[];
  selectedReceiverHubLAT: number;

  eventListAssigned: LazyLoadEvent;

  selectedDateFrom: Date;
  selectedDateTo: Date;

  isLazyListAssigned: boolean = true;

  txtFilterGb: any;

  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  public eventLog = "";

  itemShipmentLAT: any;

  datasourceDetail: Shipment[] = [];
  totalDetailRecords: number;
  cloneItemShipmentLATDetail: any;
  listDataDetail: Shipment[] = [];

  listShipmentNumberNotFound: string[];

  columnsLAT: string[] = [
    "code",
    "createdWhen",
    "toHub.name",
    "fromHub.name",
    "emp.fullName",
    "transportTypeId",
    "transportTypeFullName",
    "totalShipment",
    "totalReceived",
    "totalNotReceive",
    "totalReceivedError",
    "totalReceivedOther",
    "realWeight",
    "listGoodsStatus.name"
  ];

  columnsExport = [
    { field: 'code', header: 'Mã BK' },
    { field: 'createdWhen', header: 'TG tạo' },
    { field: 'fromHub.name', header: 'TT/CN/T gửi' },
    { field: 'toHub.name', header: 'TT/CN/T nhận' },
    { field: 'emp.fullName', header: 'NV vận chuyển' },
    { field: 'transportTypeFullName', header: 'HT trung chuyển' },
    { field: 'totalShipment', header: 'Tổng vận đơn' },
    { field: 'realWeight', header: 'Tổng TL ' + environment.unit },
    { field: 'listGoodsStatus.name', header: 'Trạng thái' }
  ];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "package.code",
    "currentHub.name",
    "receiveHub.name",
    "toHub.name",
    "currentEmp.fullName",
    "transferUser.fullName",
    "numPick",
    "transferAppointmentTime",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "transferNote",
    "shipmentStatus.name", "listGoods.name"
  ];
  columnsFilterRight: string[] = [
    "listGoods.name",
    "shipmentNumber",
    "package.code",
    "currentHub.name",
    "receiveHub.name",
    "toHub.name",
    "orderDate",
    "currentEmp.fullName",
    "shipmentStatus.name",
  ]
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  selectedDataRightSuccess: Shipment[];
  selectedDataRightNotInBK: Shipment[];
  selectedDataRightWrongProcess: Shipment[];
  listDataRightSuccess: Shipment[];
  listDataRightNotInBK: Shipment[];
  listDataRightWrongProcess: any[];
  //
  currentHubs: SelectItem[];
  selectedCurrentHub: number;
  //
  receiveHubs: SelectItem[];
  selectedReceiveHub: number;
  //
  toHubs: SelectItem[];
  selectedToHub: number;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  riders: SelectItem[];
  selectedRider: number;
  //
  listGoodsLeft: SelectItem[];
  selectedListGoods: number;
  //
  note: string;
  arrSelectedShipmentNumber: any;
  //
  filterTPLId: number = null;
  transportTypeId: number = null;
  statusId: number = null;
  toHubId: number = null;
  fromHubId: number = null;
  dateTo: any;
  dateFrom: any;
  //
  arrTxtAssignShipment: any[] = [];
  itemTotalReceivedLATDetail: Shipment[];
  itemTotalReceivedOtherLATDetail: Shipment[];
  itemTotalReceivedErrorLATDetail: string[];
  //
  ngOnInit() {
    this.initData();

    this.loadStatus();
    this.loadReceiverHubsLAT();
  }

  async initData() {
    this.loadCurrentUser();
    this.loadShipment();
    this.loadGeneralInfo();

    let statusList = [
      StatusHelper.storeInWarehouseTransfer,
      StatusHelper.transferLostPackage
    ];

    const statuses = await this.statusService.getByIdsAsync(statusList);
    if (statuses) {
      this.statuses = [];
      this.statuses.push({ label: "-- Chọn tình trạng --", value: null });
      statuses.forEach(element => {
        this.statuses.push({ label: element.name, value: element.id });
        this.shipmentStatus = element.name;
        if (element.id == StatusHelper.storeInWarehouseTransfer) {
          this.selectedStatus = element.id;
        }
      });
      this.selectedToHub = null;
    }

    // refresh
    this.selectedData = null;
    this.listDataRightSuccess = [];
    this.listDataRightSuccessTop10 = [];
    this.listDataRightWrongProcess = [];
    this.listDataRightNotInBK = [];
    this.arrSelectedShipmentNumber = [];
    this.loadListAssignedTransfer();
    this.getLocalStorageAssignUpdateTransferList();
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  async loadShipmentPaging() {
    let shipments: any;

    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.updateTransfer;
    // console.log(this.shipmentFilterViewModel);
    shipments = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel);
    if (shipments["isSuccess"]) {
      this.datasource = shipments["data"];
      this.totalRecords = shipments["dataCount"];
      this.listData = this.datasource;
    }
  }

  async loadShipment() {
    await this.loadShipmentPaging();

    this.loadFilter();
  }

  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];
    const id = this.authService.getUserId();
    this.currentUser = await this.userService.getAsync(id, cols);
    if (this.currentUser.hub) {
      this.fromHub = this.currentUser.hub.name;
    }
  }

  ngAfterViewInit() {
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
        var filterRows = this.datasource;

        //filter
        // if (event.filters.length > 0)
        //   filterRows = this.datasource.filter(x =>
        //     FilterUtil.filterField(x, event.filters)
        //   );
        // else
        //   filterRows = this.datasource.filter(x =>
        //     FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
        //   );

        // //Begin Custom filter
        // if (this.selectedCurrentHub) {
        //   filterRows = filterRows.filter(
        //     x => x.currentHubId === this.selectedCurrentHub
        //   );
        // }
        // if (this.selectedReceiveHub) {
        //   filterRows = filterRows.filter(
        //     x => x.receiveHubId === this.selectedReceiveHub
        //   );
        // }
        // if (this.selectedToHub) {
        //   filterRows = filterRows.filter(x => x.toHubId === this.selectedToHub);
        // }
        // if (this.selectedRider) {
        //   filterRows = filterRows.filter(
        //     x => x.currentEmpId === this.selectedRider
        //   );
        // }
        // if (this.selectedListGoods) {
        //   filterRows = filterRows.filter(
        //     x => x.listGoodsId === this.selectedListGoods
        //   );
        // }

        // // search datetime
        // if (this.txtFilterGbLeft) {
        //   let result = SearchDate.searchFullDate(this.txtFilterGbLeft);
        //   if (result) {
        //     filterRows = this.datasource.filter(x =>
        //       FilterUtil.gbFilterFiled(x, result, this.columns)
        //     );
        //   }
        //   //
        //   let res = SearchDate.searchDayMonth(this.txtFilterGbLeft);
        //   if (res) {
        //     filterRows = this.datasource.filter(x =>
        //       FilterUtil.gbFilterFiled(x, res, this.columns)
        //     );
        //   }
        // }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
        this.isLazyLoadListData = false
      }
    }, 250);
  }

  //
  loadRider() {
    this.selectedRider = null;
    this.riders = [];
    this.userService.getSelectModelRiderAllHubAsync().then(x => {
      this.riders = x;
    });
  }

  loadHub() {
    this.selectedCurrentHub = null;
    this.selectedReceiveHub = null;
    this.selectedToHub = null;

    this.currentHubs = [];
    this.receiveHubs = [];
    this.toHubs = [];

    this.hubService.getAllHubSelectModelAsync().then(x => {
      this.currentHubs = this.receiveHubs = this.toHubs = x;
    });
  }

  loadStatus() {
    this.selectedStatusLAT = null;
    this.statuesLAT = [];

    this.listGoodsStatusService.getAllSelectModelAsync().then(x => {
      this.statuesLAT = x;
    });
  }
  loadReceiverHubsLAT() {
    this.selectedReceiverHubLAT = null;
    this.receiverHubsLAT = [];

    this.hubService.getAllHubSelectModelAsync().then(x => {
      this.receiverHubsLAT = x;
    });
  }

  async loadListGood() {
    this.selectedListGoods = null;
    this.listGoodsLeft = [];
    const typeId = ListGoodsTypeHelper.detailTranfer;
    let hubId: number = null;
    if (this.currentUser) {
      if (this.currentUser.hub) {
        hubId = this.currentUser.hub.id;
      }
    }
    const data = await this.listGoodsService.getAllSelectItemListGoodsByHubIdAsync(hubId, typeId);
    if (data) {
      this.listGoodsLeft = data;
    }
  }

  //
  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    this.loadShipmentPaging();
  }

  changeRiders() {
    this.shipmentFilterViewModel.transferUserId = this.selectedRider;
    this.loadShipmentPaging();
  }

  changeCurrentHub() {
    this.shipmentFilterViewModel.CurrentHubId = this.selectedCurrentHub;
    this.loadShipmentPaging();
  }

  changeReceiveHub() {
    this.shipmentFilterViewModel.receiveHubId = this.selectedCurrentHub;
    this.loadShipmentPaging();
  }

  changeToHub() {
    this.shipmentFilterViewModel.ToHubId = this.selectedCurrentHub;
    this.loadShipmentPaging();
  }

  changeListGood() {
    this.shipmentFilterViewModel.listGoodsId = this.selectedListGoods;
    this.loadShipmentPaging();
  }

  search() {
    this.shipmentFilterViewModel.SearchText = this.txtFilterGbLeft;
    this.loadShipmentPaging();
  }
  //

  changeFilterLeft() {
    this.selectedData = null;
    this.loadLazy(this.event);
  }

  changeBangKe() {
    this.selectedData = null;
    this.listDataRightNotInBK = [];
    // this.listDataRightSuccess = [];
    this.listDataRightWrongProcess = [];
    // this.loadShipment();

    this.loadLazy(this.event);
    let listDataClone = Array.from(this.listData);
    this.listDataRightSuccess.forEach(x => {
      listDataClone.push(x);
      this.datasource.push(x);
    });
    this.listData = listDataClone;
    this.removeDataBK(this.listDataRightSuccess);

  }
  removeDataBK(listRemove: Shipment[]) {
    let listClone = Array.from(this.listDataRightSuccess);
    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRightSuccess = listClone;
    this.selectedDataRightSuccess = null;
    this.setObjectDataRight();
  }

  loadFilter() {
    this.loadRider();
    this.loadHub();
    // this.loadStatus();
    this.loadListGood();
  }

  loadFilterLeft() {
    //
    this.selectedCurrentHub = null;
    let uniqueCurrentHub = [];
    this.currentHubs = [];
    //
    this.selectedReceiveHub = null;
    let uniqueReceiveHub = [];
    this.receiveHubs = [];
    //
    this.selectedToHub = null;
    let uniqueToHub = [];
    this.toHubs = [];
    //
    this.selectedRider = null;
    let uniqueRider = [];
    this.riders = [];
    //
    this.selectedListGoods = null;
    let uniqueListGoods = [];
    this.listGoodsLeft = [];

    this.datasource.forEach(x => {
      if (uniqueCurrentHub.length === 0) {
        this.currentHubs.push({ label: "-- Chọn tất cả --", value: null });
        this.receiveHubs.push({ label: "-- Chọn tất cả --", value: null });
        this.toHubs.push({ label: "-- Chọn tất cả --", value: null });
        this.riders.push({ label: "-- Chọn tất cả --", value: null });
        this.listGoodsLeft.push({ label: "Chọn bảng kê", value: null });
      }
      //
      if (uniqueListGoods.indexOf(x.listGoodsId) === -1 && x.listGoodsId) {
        uniqueListGoods.push(x.listGoodsId);
        this.listGoodsLeft.push({
          label: (x.listGoods) ? x.listGoods.name : null,
          value: x.listGoodsId
        });
      }
      //
      if (uniqueCurrentHub.indexOf(x.currentHubId) === -1 && x.currentHubId) {
        uniqueCurrentHub.push(x.currentHubId);
        this.currentHubs.push({
          label: (x.currentHub) ? x.currentHub.name : null,
          value: x.currentHubId
        });
      }
      //
      if (uniqueReceiveHub.indexOf(x.receiveHubId) === -1 && x.receiveHubId) {
        uniqueReceiveHub.push(x.receiveHubId);
        this.receiveHubs.push({
          label: (x.receiveHub) ? x.receiveHub.name : null,
          value: x.receiveHubId
        });
      }
      //
      if (uniqueToHub.indexOf(x.toHubId) === -1 && x.toHubId) {
        uniqueToHub.push(x.toHubId);
        this.toHubs.push({
          label: (x.toHub) ? x.toHub.name : null,
          value: x.toHubId
        });
      }
      //
      if (uniqueRider.indexOf(x.currentEmpId) === -1 && x.currentEmpId) {
        uniqueRider.push(x.currentEmpId);
        this.riders.push({
          label: (x.currentEmp) ? x.currentEmp.fullName : null,
          value: x.currentEmpId
        });
        this.createBy = (x.currentEmp) ? x.currentEmp.fullName : null;
        this.createdPhone = (x.currentEmp) ? x.currentEmp.phoneNumber : null;
      }
    });
  }

  refresh() {
    this.shipmentFilterViewModel.ShipmentNumberListUnSelect = [];
    this.arrTxtAssignShipment = [];
    this.arrSelectedShipmentNumber = [];
    this.listShipmentNumberNotFound = [];
    this.loadShipment();
    // this.loadFilterLeft();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.selectedData = null;
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.removeStorage(this.localStorageRightData);
    this.listGoodsCreated = null;
    this.selectedDataRightSuccess = null;
    this.listDataRightSuccess = [];
    this.listDataRightSuccessTop10 = [];
    this.listDataRightWrongProcess = [];
    this.listDataRightNotInBK = [];
    this.note = null;
  }

  async save() {
    if (this.listDataRightSuccess.length === 0 && this.listDataRightNotInBK.length === 0 && this.listDataRightWrongProcess.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Danh sách xác nhận trống."
      });
      return;
    }

    if (!this.selectedStatus) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn tình trạng cập nhật"
      });
      return;
    } else if (
      this.selectedStatus === StatusHelper.transferLostPackage &&
      !this.note
    ) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập ghi chú"
      });
      return;
    }
    //if (this.riders.length < 2) return;
    this.onAssignUpdateTransferList();
  }

  async onAssignUpdateTransferList() {
    let shipmentIds = [];
    let notInShipmentIds = [];
    let listGoodsId = null;
    let scheduleErrorShipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    if (this.listDataRightSuccess) {
      this.listDataRightSuccess.forEach(x => {
        shipmentIds.push(x.id);
      });

    }
    if (this.listDataRightNotInBK.length > 0) {
      this.listDataRightNotInBK.forEach(x => notInShipmentIds.push(x.id));
    }
    if (this.listDataRightWrongProcess.length > 0) {
      this.listDataRightWrongProcess.forEach(x => scheduleErrorShipmentIds.push(x));
    }
    model.shipmentIds = shipmentIds;
    model.notInShipmentIds = notInShipmentIds;
    model.scheduleErrorShipmentIds = scheduleErrorShipmentIds;
    if (this.riders.length > 0) {
      model.empId = this.riders[1].value;
    } else {
      model.empId = this.authService.getUserId();
    }
    model.shipmentStatusId = this.selectedStatus;
    model.note = this.note;
    if (this.listGoodsCreated) {
      model.listGoodsId = this.listGoodsCreated.id;
    }
    // console.log(JSON.stringify(model));

    this.shipmentService.assignUpdateTransferListAsync(model).then(
      x => {
        // console.log(x);
        this.listGoodsCreated = x;
        // this.messageService.add({
        //   severity: Constant.messageStatus.success,
        //   detail: "Cập nhật thành công"
        // });
        this.refresh();
        this.refreshLAT();
        // set localStorage
        const timestamp = new Date().getTime();
        const dataStore = JSON.stringify({
          listGoodsCreated: this.listGoodsCreated,
          listDataRightSuccess: this.listDataRightSuccess,
          listDataRightSuccessTop10: this.listDataRightSuccessTop10,
          listDataRightNotInBK: this.listDataRightNotInBK,
          listDataRightWrongProcess: this.listDataRightWrongProcess,
          timestamp: timestamp
        });
        localStorage.setItem(this.localStorageAssignUpdateTransferList, dataStore);
      }
    );
  }

  refreshSessionAssign() {
    this.refreshTableRight();
    localStorage.removeItem(this.localStorageAssignUpdateTransferList);
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) { }

  async  changeAssignShipment() {
    this.txtShipmentRef.nativeElement.focus();
    this.txtShipmentRef.nativeElement.select();
    this.selectedData = [];
    this.messageService.clear();
    let txtAssignShipment = this.txtAssignShipment;

    this.txtAssignShipments = txtAssignShipment.trim();
    this.listShipmentNumberNotFound = [];
    let assignShipment: any[] = [];

    const input = InputValue.trimInput(txtAssignShipment);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.arrTxtAssignShipment = input.split(" ");

    let filterModel = Object.assign({}, this.shipmentFilterViewModel);
    filterModel.ShipmentNumberListSelect = [];
    filterModel.PageNumber = 1;
    filterModel.PageSize = this.totalRecords;

    filterModel.ShipmentNumberListSelect = this.arrTxtAssignShipment;

    let lstShipments = await this.shipmentService.postByTypeAsync(filterModel);
    let lstShipmentsSN = [];
    if (lstShipments) {
      if (lstShipments.data) {
        lstShipmentsSN = lstShipments.data.map(x => x.shipmentNumber);
        assignShipment = this.arrTxtAssignShipment.filter(x => lstShipmentsSN.includes(x));
        if (assignShipment.length > 0) {
          this.selectedData = lstShipments.data.filter(x => assignShipment.includes(x.shipmentNumber));
        }
      }
    } else {
      lstShipmentsSN = [];
    }
    this.listShipmentNumberNotFound = this.arrTxtAssignShipment.filter(x => !lstShipmentsSN.includes(x));
    // console.log(this.listShipmentNumberNotFound);

    if (assignShipment.length > 0) {
      this.arrSelectedShipmentNumber = this.arrSelectedShipmentNumber.concat(assignShipment);
      this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
      await this.loadShipmentPaging();
    }

    await this.assignChangeText();
    this.txtAssignShipment = null;

    // cập nhật
    this.save();
  }

  async assignChangeText() {
    let messageSuccessS: string = "";
    let messageSuccessNB: string = "";
    let messageSuccessWP: string = "";
    let messageWarnS: string = "";
    let messageWarnNB: string = "";
    let messageWarnInventory: string = "";
    let messageWarnWP: string = "";
    let finalTypeMessage: string = "";
    if (!this.selectedData) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn!"
      });
      return;
    }
    //
    this.messageService.clear();
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
      Constant.classes.includes.shipment.currentEmp
    ];
    //begin check box
    let listBoxIds = [];
    if (this.selectedData.length > 0) {
      this.selectedData.forEach(element => {
        if (element.packageId && listBoxIds.indexOf(element.packageId) == -1) {
          listBoxIds.push(element.packageId);
        }
      });
    }

    //check package shipment exist
    let packageShipmentExistCount = 0;
    this.datasource.forEach(element => {
      if (
        element.packageId &&
        listBoxIds.indexOf(element.packageId) != -1 &&
        this.selectedData.indexOf(element) == -1
      ) {
        packageShipmentExistCount++;
      }
      if (packageShipmentExistCount >= 1) {
        return false;
      }
    });

    if (packageShipmentExistCount >= 1) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng quét gói"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    if (this.selectedData.length > 0 && this.selectedData) {
      this.selectedData.forEach(x => {
        let find = this.listDataRightSuccess.find(ship => ship.shipmentNumber == x.shipmentNumber);
        if (find) {
        }
        else this.listDataRightSuccess.unshift(x);
      });
      messageSuccessS = "Quét thành công " + this.selectedData.length + " vận đơn" + `<br>`;
      this.selectedData = [];
    } else {
      let item = this.datasource.find(f => f.shipmentNumber == this.txtAssignShipments);
      if (item) {
        this.listDataRightSuccess.unshift(item);

        messageSuccessS = "Quét vận đơn " + item.shipmentNumber + " thành công" + `<br>`;
        // this.messageService.add({
        //   severity: Constant.messageStatus.success,
        //   detail: "Quét vận đơn " + item.shipmentNumber + " thành công"
        // });
        // SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
    }
    if (this.listShipmentNumberNotFound) {
      ///================================================///
      let duplicateS = this.listDataRightSuccess.filter(x => this.listShipmentNumberNotFound.includes(x.shipmentNumber));
      let duplicateNB = this.listDataRightNotInBK.filter(x => this.listShipmentNumberNotFound.includes(x.shipmentNumber));
      let duplicateWP = this.listDataRightWrongProcess.filter(x => this.listShipmentNumberNotFound.includes(x));
      if (!duplicateS) duplicateS = [];
      if (!duplicateNB) duplicateNB = [];
      if (!duplicateWP) duplicateWP = [];
      if (duplicateS || duplicateNB || duplicateWP) {
        if (duplicateS.length > 0) {
          let arr = duplicateS.map(x => { return x.shipmentNumber })
          const duplicateSNString = arr.join(" ");
          messageWarnS = "Đã quét mã vận đơn " + duplicateSNString + " thành công trước đó!" + `<br>`;
        }
        if (duplicateNB.length > 0) {
          let arr = duplicateNB.map(x => { return x.shipmentNumber })
          const duplicateSNString = arr.join(" ");
          messageWarnNB = "Đã quét mã vận đơn " + duplicateSNString + " sai quy trình trước đó!" + `<br>`;
        }
        if (duplicateWP.length > 0) {
          let arr = duplicateWP.map(x => { return x })
          const duplicateSNString = arr.join(" ");
          messageWarnWP = "Đã quét mã vận đơn " + duplicateSNString + " nhận lỗi trước đó!" + `<br>`;
        }
      }
      ///================================================///
      await Promise.all(this.listShipmentNumberNotFound.map(async shipmentNumber => {
        let findShipInSuccess = this.listDataRightSuccess.find(num => num.shipmentNumber == shipmentNumber);
        if (findShipInSuccess) {
        }
        else {
          // let ship = await this.shipmentService.trackingShortAsyncTransferReceive(shipmentNumber, includes);
          let ship = await this.shipmentService.getByShipmentNumberNoMessageAsync(shipmentNumber);
          if (ship) {
            if (ship.shipmentStatusName != "Giao hàng thành công" && ship.shipmentStatusName != "Trả hàng thành công") {
              let shipmentComplete: number[] = [];
              shipmentComplete.push(StatusHelper.deliveryComplete);
              shipmentComplete.push(StatusHelper.returnComplete);
              if (shipmentComplete.indexOf(ship.shipmentStatusId) != -1) {
              } else {
                let find = this.listDataRightNotInBK.find(x => x.shipmentNumber == shipmentNumber);
                if (find) {
                }
                else {
                  //this.messageService.clear();
                  const statusIds: number[] = [
                    StatusHelper.readyToDelivery,
                    StatusHelper.waitingToTransfer,
                    StatusHelper.readyToReturn,
                    StatusHelper.storeInWarehousePickup,
                    StatusHelper.storeInWarehouseTransfer,
                    StatusHelper.storeInWarehouseDelivery,
                    StatusHelper.storeInWarehouseReturnTransfer,
                    StatusHelper.storeInWarehouseReturn
                  ];
                  if (ship.isProcessError && ship.shipmentStatusId === StatusHelper.storeInWarehouseTransfer && ship.currentHubId === this.currentUser.hubId) {
                    messageWarnInventory = "Đã quét vận đơn " + shipmentNumber + " quy trình lỗi trước đó" + `<br>`;
                    //SoundHelper.getSoundMessage(Constant.messageStatus.warn);
                  } else {
                    if (ship.currentHubId === this.currentUser.hubId && statusIds.includes(ship.shipmentStatusId)) {
                      messageWarnInventory = "Vận đơn " + shipmentNumber + " đã ở kho" + `<br>`;
                      //SoundHelper.getSoundMessage(Constant.messageStatus.warn);
                    } else {
                      this.listDataRightNotInBK.unshift(ship);
                      messageSuccessNB = "Quét vận đơn " + shipmentNumber + " sai quy trình thành công" + `<br>`;
                      //SoundHelper.getSoundMessage(Constant.messageStatus.success);
                    }
                  }
                }
              }
            }
            else {
              duplicateNB.length = duplicateNB.length + 1;
              messageWarnNB = "Vận đơn " + shipmentNumber + " đã kết thúc giao hàng." + `<br>`;
              //SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            }
          }
          else {
            if (duplicateWP.length > 0) {
            }
            else {
              this.listDataRightWrongProcess.unshift(shipmentNumber);
              messageSuccessWP = "Quét vận đơn " + shipmentNumber + " lỗi thành công" + `<br>`;
              //SoundHelper.getSoundMessage(Constant.messageStatus.success);
            }

          }
        }
      }));
      if (duplicateNB.length === 0 && duplicateS.length === 0 && duplicateWP.length === 0 && messageSuccessS.length > 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      } else if (duplicateS.length > 0 || duplicateNB.length > 0 || duplicateWP.length > 0) {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      } else {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      }
      this.messageService.add({
        severity: finalTypeMessage,
        detail: messageSuccessS + messageSuccessNB + messageSuccessWP + messageWarnS + messageWarnNB + messageWarnInventory + messageWarnWP
      });
    }

    // kiểm trả và chỉ lấy ra 10 kết quả quét bill thành công
    if (!ArrayHelper.isNullOrZero(this.listDataRightSuccess)) {
      if (this.listDataRightSuccess.length <= 10) {
        this.listDataRightSuccessTop10 = this.listDataRightSuccess;
      } else {
        this.listDataRightSuccessTop10 = this.listDataRightSuccess.slice(0, 10);
      }
    }
  }

  async assign() {
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    this.arrTxtAssignShipment = this.selectedData.map(x => x.shipmentNumber);
    this.listShipmentNumberNotFound = [];

    this.arrSelectedShipmentNumber = this.arrSelectedShipmentNumber.concat(this.arrTxtAssignShipment);
    this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
    this.loadShipmentPaging();
    this.assignChangeText();
  }

  unAssign() {
    this.messageService.clear();
    if (!this.selectedDataRightSuccess || this.selectedDataRightSuccess.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    const unAssignShipments = this.selectedDataRightSuccess.map(x => x.shipmentNumber);

    this.listDataRightSuccess = this.listDataRightSuccess.filter(x => !unAssignShipments.includes(x.shipmentNumber));

    if (this.arrSelectedShipmentNumber && this.arrSelectedShipmentNumber.length > 0) {
      this.arrSelectedShipmentNumber = this.arrSelectedShipmentNumber.filter(x => !unAssignShipments.includes(x));
    }

    if (this.arrSelectedShipmentNumber.length > 0) {
      this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
      this.loadShipmentPaging();
    }

    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Quét thành công " + unAssignShipments.length + " vận đơn" + `<br>`
    });
    SoundHelper.getSoundMessage(Constant.messageStatus.success);
    this.selectedDataRightSuccess = [];
  }

  removeDataLeft(listRemove: Shipment[]) {
    let listClone = Array.from(this.listData);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = null;
    this.setObjectDataRight();
  }

  removeDataRight(listRemove: Shipment[]) {
    let listClone = Array.from(this.listDataRightSuccess);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRightSuccess = listClone;
    this.selectedDataRightSuccess = null;
    this.setObjectDataRight();
  }

  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRightSuccess.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }

    this.refresh();
    // this.refreshTableRight();
  }

  changeAssignPackage() {
    let txtAssignPackage = this.txtAssignPackage
    let assignShipment = this.listData.filter(
      x => x.package && x.package.name == txtAssignPackage
    );

    if (assignShipment.length == 0) {
      txtAssignPackage = null;
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy mã gói"
      });
      return;
    }

    if (!this.selectedListGoods) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn bảng kê!"
      });
      return;
    }

    this.selectedData = [];
    assignShipment.forEach(element => {
      this.selectedData.push(element);
    });
    this.assign();
    txtAssignPackage = null;
  }

  getLocalStorageAssignUpdateTransferList() {
    // get localStorage
    const hours = 2; // reset when storage is more than 2 hours
    const getLocalStorage = localStorage.getItem(this.localStorageAssignUpdateTransferList);
    let timestamp: number = 0;
    const now: number = new Date().getTime();
    if (getLocalStorage) {
      const data = JSON.parse(getLocalStorage);
      // console.log(data);
      timestamp = data.timestamp as number;
      if ((now - timestamp) >= hours * 60 * 60 * 1000) {
        localStorage.removeItem(this.localStorageAssignUpdateTransferList);
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Đã hết phiên làm việc, quét vận đơn để tạo BK mới!"
        });
      } else {
        this.listGoodsCreated = data.listGoodsCreated;
        this.listDataRightSuccess = data.listDataRightSuccess;
        this.listDataRightSuccessTop10 = data.listDataRightSuccessTop10;
        this.listDataRightWrongProcess = data.listDataRightWrongProcess;
        this.listDataRightNotInBK = data.listDataRightNotInBK;
      }
    }
  }

  getSelectedObjectDataRight(): Shipment[] {
    let arr = [];
    let objectDataRight = this.getObjectDataRight();

    if (objectDataRight)
      objectDataRight.filter(x => {
        if (x.key === this.selectedToHub) arr = x.values;
      });
    return arr;
  }

  getObjectDataRight(): KeyValuesViewModel[] {
    return this.getStorage(this.localStorageRightData) as KeyValuesViewModel[];
  }

  setObjectDataRight() {
    let objectDataRight = this.getObjectDataRight();
    let arrStorage = [];

    if (objectDataRight) {
      arrStorage = objectDataRight;
    }

    let index = this.findObjectDataRight(arrStorage);

    if (index === -1) {
      let obj = new KeyValuesViewModel();
      obj.key = this.selectedToHub;
      obj.values = this.listDataRightSuccess;
      arrStorage.push(obj);
    } else {
      arrStorage[index].values = this.listDataRightSuccess;
    }

    this.setStorage(this.localStorageRightData, arrStorage);
  }

  findObjectDataRight(arrStorage: KeyValuesViewModel[]): number {
    let index = -1;

    arrStorage.forEach((val, i) => {
      if (val.key === this.selectedToHub) {
        index = i;
        return;
      }
    });

    return index;
  }

  removeObjectDataRight() {
    let objectDataRight = this.getObjectDataRight();
    let arrStorage = [];

    if (objectDataRight) {
      arrStorage = objectDataRight;
    }

    let index = this.findObjectDataRight(arrStorage);

    if (index !== -1) {
      arrStorage[index].values = null;
    }

    this.setStorage(this.localStorageRightData, arrStorage);
  }

  getStorage(name: string): object {
    return this.persistenceService.get(name, StorageType.LOCAL);
  }

  setStorage(name: string, obj: object) {
    this.persistenceService.set(name, obj, { type: StorageType.LOCAL });
  }

  removeStorage(name: string) {
    this.persistenceService.remove(name, StorageType.LOCAL);
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }
  //tab one
  onSelectTabOne() {
    this.isActiveTabOne = true;
  }
  // tab two
  onSelectTabTwo() {
    this.isActiveTabOne = false;
    this.isActiveTabTwo = true;
    this.isActiveTabThree = false;
  }
  // tab three
  onSelectTabThree() {
    this.isActiveTabOne = false;
    this.isActiveTabTwo = false;
    this.isActiveTabThree = true;
  }
  onSelectTabDSHangChuyenDen() {
    this.isActiveTabDSHangChuyenDen = true;
  }
  onSelectTabDSBangKeTrungChuyen() {
    this.isActiveTabDSHangChuyenDen = false;
    this.isActiveTabDSBangKeTrungChuyen = true;
  }

  async loadListAssignedTransfer() {
    let includes = [
      Constant.classes.includes.listGoods.tpl,
      Constant.classes.includes.listGoods.listGoodsType,
      Constant.classes.includes.listGoods.listGoodsStatus,
      Constant.classes.includes.listGoods.fromHub,
      Constant.classes.includes.listGoods.toHub,
      Constant.classes.includes.listGoods.transportType,
      Constant.classes.includes.listGoods.emp,
    ];
    const typeId = ListGoodsTypeHelper.receiptTranfer;
    // this.listGoodsFilterViewModel.typeId = id;
    const data = await this.listGoodsService.getListGoodsAsync(typeId, null, null, this.toHubId, null, this.statusId, null, null, this.dateFrom, this.dateTo);
    if (data) {
      this.datasourceLAT = data.reverse();
      this.datasourceLAT = this.datasourceLAT.map(obj => {
        if (obj.transportType) {
          if (!obj.tpl) {
            const transportTypeName = obj.transportType.name;
            obj.transportTypeFullName = transportTypeName + " (NB)";
          } else {
            const transportTypeName = obj.transportType.name;
            const tplCode = obj.tpl.code;
            obj.transportTypeFullName = tplCode + " - " + transportTypeName;
          }
        } else {
          obj.transportTypeFullName = null;
        }
        return obj;
      });
      this.totalRecordsLAT = this.datasourceLAT.length;
      this.listDataLAT = this.datasourceLAT;
      this.loadFilterLAT();
    }
  }

  async loadFilterLAT() {
    // this.selectedStatusLAT = null;
    // this.statuesLAT = [];
    // this.selectedTransportTypeLAT = null;
    // this.transportTypesLAT = [];
    // this.selectedReceiverHubLAT = null;
    // this.receiverHubsLAT = [];

    // let arrCols: string[] = [];
    // arrCols = [
    //   FilterUtil.Column.listGood.listGoodsStatus,
    //   FilterUtil.Column.listGood.transportType,
    //   FilterUtil.Column.listGood.toHub,
    // ];
    // const result = FilterUtil.loadArrayFilter(this.datasourceLAT, arrCols);
    // result.forEach(x => {
    //   x.forEach(e => {
    //     if (e.title === FilterUtil.Column.listGood.transportType) {
    //       this.transportTypesLAT = x;
    //     }
    //     if (e.title === FilterUtil.Column.listGood.toHub) {
    //       this.receiverHubsLAT = x;
    //     }
    //   });
    // });

    this.riderLATs = [];
    let uniqueRiderLAT = [];
    this.selectedRiderLAT = null;

    this.datasourceLAT.forEach(x => {
      if (uniqueRiderLAT.length === 0) {
        this.riderLATs.push({ label: "-- Chọn tất cả --", value: null });
      }
      //
      if (uniqueRiderLAT.indexOf(x.empId) === -1 && x.empId) {
        uniqueRiderLAT.push(x.empId);
        this.riderLATs.push({
          label: x.fullName ? x.fullName : null,
          value: x.empId
        });
      }
    });
  }

  loadLazyListAssignedTransfer(event: LazyLoadEvent) {
    this.eventListAssigned = event;
    setTimeout(() => {
      if (this.datasourceLAT) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceLAT.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLAT.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLAT)
          );

        //Begin Custom filter
        if (this.selectedStatusLAT) {
          filterRows = filterRows.filter(
            x => x.listGoodsStatusId === this.selectedStatusLAT
          );
        }
        if (this.selectedTransportTypeLAT) {
          filterRows = filterRows.filter(x => {
            if (x.tpl) {
              return x.transportTypeId === this.selectedTransportTypeLAT - x.tplId;
            } else {
              return x.transportTypeId === this.selectedTransportTypeLAT;
            }
          });
        }
        if (this.selectedReceiverHubLAT) {
          filterRows = filterRows.filter(
            x => x.toHub.id === this.selectedReceiverHubLAT
          );
        }

        //
        if (this.selectedRiderLAT) {
          filterRows = filterRows.filter(
            x => x.empId === this.selectedRiderLAT
          );
        }

        //
        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x => moment(x.createdWhen).isBetween(this.selectedDateFrom, this.selectedDateTo));
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isAfter(this.selectedDateFrom));
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isBefore(this.selectedDateTo));
          //
        }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLAT = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecordsLAT = filterRows.length;
      }
      this.isLazyListAssigned = false;
    }, 250);
  }

  refreshLAT() {
    this.txtFilterGb = null;
    this.selectedStatusLAT = null;
    this.selectedTransportTypeLAT = null;
    this.selectedReceiverHubLAT = null;
    this.listDataLAT = [];
    this.datasourceLAT = [];
    // this.listGoodsFilterViewModel = null;
    this.loadModel();
    this.loadListAssignedTransfer();
  }

  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    this.dateFrom = value.start.toISOString();
    this.dateTo = value.end.toISOString();

    this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    this.selectedDateTo = this.requestGetPickupHistory.toDate;
    // this.loadLazyListAssignedTransfer(this.eventListAssigned);
    this.loadListAssignedTransfer();
  }
  // dateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  changeFilterLAT() {
    this.loadLazyListAssignedTransfer(this.eventListAssigned);
  }

  changeFilterLATRider() {
    this.loadLazyListAssignedTransfer(this.eventListAssigned);
  }

  async openModel(template: TemplateRef<any>, data: ListGoods = null) {
    this.itemTotalReceivedLATDetail = [];
    this.itemTotalReceivedOtherLATDetail = [];
    this.itemTotalReceivedErrorLATDetail = [];
    this.listDataDetail = [];
    this.datasourceDetail = [];
    this.totalDetailRecords = 0;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-xlg' });
    const res = await this.listGoodsService.getAsync(data.id);
    let lg: ListGoods = new ListGoods();
    if (res) {
      lg = res.data as ListGoods;
    }
    this.itemShipmentLAT = await this.onGetListGoodsId(data);
    if (this.itemShipmentLAT) {
      // load listDataRight
      if (this.itemShipmentLAT.length > 0) {
        this.cloneItemShipmentLATDetail = this.itemShipmentLAT;
        this.listDataDetail = this.itemShipmentLAT;
        this.datasourceDetail = this.itemShipmentLAT;
        // lấy ra vận đơn nhận lỗi từ note của listGoods
        if (StringHelper.isNullOrEmpty(lg.note)) {
          this.itemTotalReceivedErrorLATDetail = [];
          if (data.TotalReceivedOther === 0) {
            this.itemTotalReceivedOtherLATDetail = [];
          }
        } else {
          const indexError = lg.note.lastIndexOf("Vận đơn lỗi:");
          if (indexError !== -1) {
            // cắt lấy mã vận đơn lỗi từ note của listGoods
            const strShipmentNumberErrors: string = lg.note.substring(indexError + 12).trim();
            if (strShipmentNumberErrors !== "") {
              this.itemTotalReceivedErrorLATDetail = strShipmentNumberErrors.split(" ");
            }
          }
        }
        // lấy ra vận đơn đơn sai quy trình
        this.itemTotalReceivedOtherLATDetail = this.datasourceDetail.filter(
          x => !StringHelper.isNullOrEmpty(x.processErrorTime)
        );
        let totalReceivedOtherLATDetailId: number[] = [];
        if (this.itemTotalReceivedOtherLATDetail.length > 0) {
          totalReceivedOtherLATDetailId = this.itemTotalReceivedOtherLATDetail.map(x => x.id);
        }
        // lấy ra vận đơn đã nhận
        this.itemTotalReceivedLATDetail = this.datasourceDetail.filter(x =>
          !totalReceivedOtherLATDetailId.includes(x.id) && !this.itemTotalReceivedErrorLATDetail.includes(x.shipmentNumber)
        );
        // this.totalDetailRecords = this.datasourceDetail.length;
      }
    }

  }

  async printLAT(rowData: ListGoods) {
    this.itemShipmentLAT = await this.onGetListGoodsByID(rowData);
    if (this.itemShipmentLAT) {
      setTimeout(async () => {
        this.itemShipmentLAT["isPrintBareCode"] = true;
        this.idPrint = ListGoodsTypeHelper.printDetailTranfer;
        setTimeout(() => {
          // console.log(this.itemShipmentLAT)
          this.printFrormServiceInstance.sendCustomEvent(this.itemShipmentLAT);
        }, 500);
      }, 0);
    }
  }

  async onGetListGoodsByID(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.service);
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
    includes.push(Constant.classes.includes.shipment.deliverUser);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.receiveHub);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      this.itemShipmentLAT = [...shipments];
      // console.log(this.itemShipmentLAT);

      this.itemShipmentLAT.logoUrl = this.generalInfo.logoUrl;
      this.itemShipmentLAT.companyName = this.generalInfo.companyName;
      this.itemShipmentLAT.hotLine = this.generalInfo.hotLine;
      this.itemShipmentLAT.centerHubAddress = this.generalInfo.addressMain;
      if (data.toHubName) {
        this.itemShipmentLAT.toHubName = data.toHubName;
      }
      if (data.fromHubName) {
        this.itemShipmentLAT.fromHubName = data.fromHubName;
      }
      if (data.typeName) {
        this.itemShipmentLAT.type = "Nhận";
      } else {
        this.itemShipmentLAT.type = ListGoodsTypeHelper.detailTranferTypeName;
      }
      this.itemShipmentLAT.createdBy = this.currentUser.fullName;
      this.itemShipmentLAT.createdPhone = this.currentUser.phoneNumber;
      if (this.currentUser.hub) {
        this.itemShipmentLAT.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipmentLAT.userDepartmentName = this.currentUser.department.name;
      }
      this.itemShipmentLAT.listGoods = data.code;
      this.itemShipmentLAT.dateCreate = new Date();

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      this.senderId = 0;
      shipments.forEach(async (item, index) => {
        if (item.pickUser) {
          this.itemShipmentLAT.currentEmp = item.pickUser.fullName;
          if (item.pickUser.hub) {
            this.itemShipmentLAT.empHubName = item.pickUser.hub.name;
          }
        }
        if (item.transferUser) {
          this.itemShipmentLAT.transferUserFullName = item.transferUser.fullName;
        }

        this.stt = index + 1;
        this.itemShipmentLAT[index].stt = this.stt;
        this.totalWeight += this.itemShipmentLAT[index].weight;
        this.itemShipmentLAT.totalWeight = this.totalWeight;
        if (this.itemShipmentLAT[index].calWeight) {
          this.totalCalWeight += this.itemShipmentLAT[index].calWeight;
          this.itemShipmentLAT.totalCalWeight = this.totalCalWeight;
        }
        if (
          !this.itemShipmentLAT[index].totalBox ||
          this.itemShipmentLAT[index].totalBox === 0
        ) {
          this.itemShipmentLAT[index].totalBox = 1;
        }
        this.totalBox += this.itemShipmentLAT[index].totalBox;
        this.itemShipmentLAT.totalBox = this.totalBox;
        if (item.paymentTypeId) {
          if (item.paymentTypeId === PaymentTypeHelper.NGTTN) {
            this.itemShipmentLAT[index].sumPrice = item.totalPrice;
          }
          if (item.paymentTypeId === PaymentTypeHelper.NNTTN) {
            this.itemShipmentLAT[index].sumPrice = item.cod + item.totalPrice;
          }
          this.totalSumPrice += this.itemShipmentLAT[index].sumPrice;
          this.itemShipmentLAT.totalSumPrice = this.totalSumPrice;
        }

        this.senderId = this.itemShipmentLAT[index].senderId;
        let sender = await this.customerService.getAsync(this.senderId);
        if (sender.data) {
          this.itemShipmentLAT[index].companyFrom = sender.data["companyName"];
        }
        this.itemShipmentLAT[index].fakeId =
          "id" + shipments[index].id;
        const time = new Date();
        this.itemShipmentLAT.getFullYear = time.getFullYear();
      });
      return this.itemShipmentLAT;
    }
  }

  async onGetListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.service);
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
    includes.push(Constant.classes.includes.shipment.deliverUser);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.receiveHub);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    // let shipments = await this.onGetListGoodsByID(data);
    if (shipments) {
      this.itemShipmentLAT = shipments;
      shipments.forEach((item, index) => {
        this.itemShipmentLAT[index]["fakeId"] =
          "id" + shipments[index].id;
      });
      return shipments;
    }
  }
  changeFilterLATToHub() {
    this.toHubId = this.selectedReceiverHubLAT;
    this.loadListAssignedTransfer();
  }
  changeFilterLATStatus() {
    this.statusId = this.selectedStatusLAT;
    this.loadListAssignedTransfer();
  }
  loadModel() {
    this.listGoodsFilterViewModel.statusId = null;
    this.listGoodsFilterViewModel.toHubId = null;
    this.listGoodsFilterViewModel.createByHubId = null;
    this.listGoodsFilterViewModel.fromHubId = null;
    this.listGoodsFilterViewModel.tplId = null;
    this.listGoodsFilterViewModel.transportTypeId = null;
    this.listGoodsFilterViewModel.userId = null;
  }

  onSelectTabTotalShipment() {

  }

  onSelectTabTotalReceivedOther() {

  }

  onSelectTabTotalReceivedError() {

  }
}
