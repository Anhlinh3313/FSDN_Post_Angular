import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from 'moment';
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, AutoComplete } from "primeng/primeng";
import {
  RequestShipmentService,
  UserService,
  ShipmentService,
  AuthService,
  ListGoodsService,
  ServiceService,
  HubService,
  ProvinceService,
  CustomerService,
  PackageService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  DateRangeFromTo
} from "../../../view-model/index";
///////////////Daterangepicker
import { AssignShipmentWarehousing } from "../../../models/assignShipmentWarehousing.model";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { Table } from "primeng/table";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { CreateListGoods, User, Hub, Customer } from "../../../models";
import { SelectModel } from "../../../models/select.model";
import { GetListWarehousingFilter } from "../../../models/getListWarehousingFilter.model";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";
//////////////

@Component({
  selector: "app-warehousing",
  templateUrl: "warehousing.component.html",
  styles: []
})
export class WarehousingComponent extends BaseComponent implements OnInit {
  txtPackageCode: string;
  envir = environment;
  dateRange = {
    start: moment(),
    end: moment()
  };
  listShipmentWarehousedOnTabOne: Shipment[] = []; // hiện danh sách bill nhập kho thành công khi quét bill ở tab nhập kho lấy hàng
  listShipmentByListGoodsId: Shipment[]; // hiện ds bill đã nhập kho của nút xem trong tab ds bk nhập kho
  //
  filterModel: GetListWarehousingFilter = new GetListWarehousingFilter();
  //
  lstService: SelectModel[] = [];
  lstProvince: SelectModel[] = [];
  //
  inputNote: string = null;
  //
  hub: any;
  hubs: any;
  filteredHubs: any;
  selectedHub: number;

  toHub: any;
  toHubs: any;
  filteredToHubs: any;
  selectedToHub: number;
  //
  listDataLG: ListGoods[];
  datasourceLG: ListGoods[];
  totalRecordsLG: number;
  localStorageListGoodsWP: string = "localStorageListGoodsWP"; // local storage BK NK lấy hàng
  localStorageListGoodsWD: string = "localStorageListGoodsWD"; // local storage BK NK giao hàng
  typeScanListGoodsWarehouse: number;
  listGoodsWDCreated: ListGoods; // mã bk nhập kho giao hàng
  selectedUserByCurrentHubLgWarehouse: number;
  txtFilterGb_ListGoodsWarehouse: string;
  unit = this.envir.unit;
  txtScanShipmentBillTongBaoPhat: string;
  txtScanShipmentBillTong: string;
  txtShipmentNumber: any[];
  txtNote: string;
  bsModalRefNote: BsModalRef;
  isNoteWarehouse: boolean;
  isRecovery: boolean;
  listGoodsWPCreated: ListGoods; // mã bk nhập kho lấy hàng
  //
  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;

  toUsers: any;
  selectedToUser: number;
  //
  lstListGoodsReceive: SelectModel[] = [];
  @ViewChild("atcSenderCode") atcSenderCodeRef: AutoComplete;
  customerChange: any;
  filteredCustomers: any[] = [];
  customers: SelectModel[] = [];
  isSuccessScanPackge: boolean;
  totalCountLSByScanPackage: number = 0;
  percentScanPackage: number = 0;
  isCheckScanPackage: boolean;
  listError: any;
  listShipmentByScanPackage: any;
  totalScanShipOfPackageFail: number = 0;
  totalScanShipOfPackageSuccess: number = 0;
  rowPerPage: number = this.envir.pageSize;
  rowPerPageRight: number = this.envir.pageSize;
  onPageChangeEvent: any;

  constructor(
    private packageService: PackageService,
    private listGoodsService: ListGoodsService,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private serviceService: ServiceService,
    private userService: UserService,
    private requestShipmentService: RequestShipmentService, public permissionService: PermissionService, public router: Router,
    private hubService: HubService,
    private provinceService: ProvinceService,
    protected customerService: CustomerService,
  ) {
    super(messageService, permissionService, router);
  }

  // BILL TỔNG
  @ViewChild("templateBillTong") templateBillTong: any;
  @ViewChild("txtAssignRequest")
  txtAssignRequestRef: ElementRef;
  bsModalRef_BillTong: BsModalRef;
  data: RequestShipment;
  @ViewChild('txtAssignShipmentBillTong')
  txtAssignShipmentBillTong: ElementRef;
  //

  listUserByCurrentHub: SelectItem[] = [];
  // selectedUserByCurrentHub: any;

  //
  countWarehousing_Success: number = 0;
  totalPackageRight: number = 0;
  totalShipmentInPackageRight: number = 0;
  totalBoxsRight: number = 0;
  txtFilterGb_ShipmentKeeping: any;
  datasource_ShipmentKeeping: Shipment[] = [];
  totalRecords_ShipmentKeeping: number = 0;
  totalBoxsLeft: number = 0;
  totalShipmentInPackageLeft: number = 0;
  totalPackageLeft: number = 0;
  event_ShipmentKeeping: LazyLoadEvent;

  listShipment: Shipment[] = [];
  selectedData: Shipment[] = [];
  //
  textNhapBillThuongThanhCong: string = "";
  //

  listNhapKhoBaoPhat: any[];

  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.warehousing.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  //
  columns: string[] = [
    "shipmentNumber",
    "shipmentStatusName",
    "shipmentStatus.name",
    "numDeliver",
    "ladingScheduleCreatedWhen",
    "shipmentStatusId",
    "orderDate",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "fromHubName",
    "fromHubRoutingName",
    "fromProvinceName",
    "fromDistrictName",
    "fromWardName",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "toHubName",
    "toHubRoutingName",
    "toProvinceName",
    "toDistrictName",
    "toWardName",
    "cusNote",
    "totalBox",
    "paymentTypeName",
    "calWeight",
    "weight",
    "deliveryNote"
  ];

  columnsExport_ShipmentKeeping: any = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'orderDate', header: 'Ngày gửi', typeFormat: "date", formatString: 'dd/MM/yyyy HH:mm' },
    { field: 'shipmentStatus.name', header: 'Trạng thái' },
    { field: 'numDeliver', header: 'Số lần giao lại' },
    { field: 'senderName', header: 'Tên người gửi' },
    { field: 'cusDepartment.name', header: 'Phòng ban' },
    { field: 'senderPhone', header: 'SĐT người gửi' },
    { field: 'pickingAddress', header: 'Địa chỉ gửi' },
    { field: 'receiverName', header: 'Tên người nhận' },
    { field: 'receiverPhone', header: 'SĐT người nhận' },
    { field: 'shippingAddress', header: 'Địa chỉ giao hàng' },
    { field: 'cusNote', header: 'Ghi chú khách hàng' },
    { field: 'totalBox', header: 'Số kiện' },
    { field: 'deliveryNote', header: 'Ghi chú giao hàng' },
    { field: 'calWeight', header: 'Trọng lượng quy đổi' },
    { field: 'weight', header: 'Khối lượng' },
  ];

  columnsLG: string[] = [
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

  columnsExportListGoodsWarehouse = [
    { field: "code", header: "Mã BK" },
    { field: "createdWhen", header: "TG tạo" },
    { field: "fromHub.name", header: "TT/CN/T nhập kho" },
    { field: "emp.fullName", header: "NV nhập kho" },
    { field: "totalShipment", header: "Tổng vđ nhập kho" },
    { field: "realWeight", header: "Tổng TL " + this.envir.unit },
    { field: "listGoodsStatus.name", header: "Trạng thái" }
  ];
  //
  //
  ladingScheduleCreatedWhen: SelectItem[];
  selectedLadingScheduleCreatedWhen: Date[];
  //
  dateRageValue: any = new Object();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  typeWareHousing: SelectModel[] = [
    { label: "NK hàng đã nhận", data: null, value: null },
    { label: "NK mới nhận & giao lại", data: null, value: 1 },
    { label: "NK hàng trung chuyển", data: null, value: 2 },
    { label: "NK hàng mới tạo", data: null, value: 3 }
  ]

  listPrioritize: SelectModel[] = [
    { label: "-- Tất cả --", data: null, value: null },
    { label: "VĐ ưu tiên", data: null, value: true },
  ]

  listTypeShipment: SelectModel[] = [
    { label: "NV đã nhận", data: null, value: false },
    { label: "Đơn hàng mới", data: null, value: true },
    { label: "NV đã nhận & Đơn hàng mới", data: null, value: null },
  ]


  listIsNullHubRouting: SelectModel[] = [
    { label: "-- Tất cả --", data: null, value: false },
    { label: "Chưa phân tuyến", data: null, value: true },
  ]

  @ViewChild("dt") dt: Table;
  @ViewChild("dtShipmentKeeping") dtShipmentKeeping: Table;
  @ViewChild("dtNhapKhoBaoPhat") dtNhapKhoBaoPhat: Table;

  ngOnInit() {
    this.initData();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }


  initData() {
    this.filterModel.pageSize = 100;
    this.getListShipmentKeeping();
    this.getAllUserByCurrentHub();
    this.getLocalStorageListGoodsWP();
    this.getLocalStorageListGoodsWD();
    this.getService();
    this.getProvince();
    this.getListGoodsReceive();
  }

  async getService() {
    this.lstService = await this.serviceService.getAllSelectModelAsync();
  }

  async getProvince() {
    this.lstProvince = await this.provinceService.getAllSelectModelAsync();
  }

  async getListGoodsReceive() {
    if (!this.filterModel.hubId) this.filterModel.hubId = null;
    this.lstListGoodsReceive = await this.listGoodsService.getListGoodsReceiveMulselect(this.filterModel.hubId);
  }

  getLocalStorageListGoodsWP() {
    // get localStorage
    const hours: number = 2; // reset when storage is more than 2 hours
    const getLocalStorage: any = localStorage.getItem(this.localStorageListGoodsWP);
    let timestamp: number = 0;
    const now: number = new Date().getTime();
    if (getLocalStorage) {
      const data: any = JSON.parse(getLocalStorage);
      timestamp = data.timestamp as number;
      if ((now - timestamp) >= hours * 60 * 60 * 1000) {
        localStorage.removeItem(this.localStorageListGoodsWP);
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Đã hết phiên nhập kho lấy hàng, quét vận đơn để tạo BK mới!"
        });
      } else {
        this.listGoodsWPCreated = data.listGoodsCreated;
      }
    }
  }

  getLocalStorageListGoodsWD() {
    // get localStorage
    const hours: number = 2; // reset when storage is more than 2 hours
    const getLocalStorage: any = localStorage.getItem(this.localStorageListGoodsWD);
    let timestamp: number = 0;
    const now: number = new Date().getTime();
    if (getLocalStorage) {
      const data: any = JSON.parse(getLocalStorage);
      timestamp = data.timestamp as number;
      if ((now - timestamp) >= hours * 60 * 60 * 1000) {
        localStorage.removeItem(this.localStorageListGoodsWD);
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Đã hết phiên nhập kho giao hàng, quét vận đơn để tạo BK mới!"
        });
      } else {
        this.listGoodsWDCreated = data.listGoodsCreated;
      }
    }
  }

  getAllUserByCurrentHub() {
    this.userService.getAllUserByCurrentHubAsync().then(data => {
      this.listUserByCurrentHub.push({ value: null, label: "Chọn nhân viên" });
      data.forEach(item => {
        this.listUserByCurrentHub.push({ value: item.id, label: item.code + " - " + item.fullName });
      });
    });
  }

  exportCSV() {
    this.dtShipmentKeeping.value = this.listShipment;
    this.dtShipmentKeeping.exportCSV();
  }

  selectedDate() {
    if (this.filterModel.dateFrom && this.filterModel.dateFrom != 'undefined') this.filterModel.dateFrom = SearchDate.formatToISODate(moment(this.filterModel.dateFrom).toDate());
    else this.filterModel.dateFrom = null;
    if (this.filterModel.dateTo && this.filterModel.dateTo != 'undefined') this.filterModel.dateTo = SearchDate.formatToISODate(moment(this.filterModel.dateTo).toDate());
    else this.filterModel.dateTo = null;
    this.getListShipmentKeeping();
  }

  async getListShipmentKeeping() {
    this.listShipment = await this.shipmentService.getListWarehousing(this.filterModel) || [];
    this.totalRecords_ShipmentKeeping = this.listShipment.length > 0 ? this.listShipment[0].totalCount : 0;
    this.totalBoxsLeft = this.listShipment.length > 0 ? this.listShipment[0].totalBoxs : 0;
    this.totalPackageLeft = this.listShipment.length > 0 ? this.listShipment[0].totalPackage : 0;
    this.totalShipmentInPackageLeft = this.listShipment.length > 0 ? this.listShipment[0].totalShipmentInPackage : 0;
  }

  async changeFilter() {
    if (this.onPageChangeEvent) {
      this.filterModel.pageNumber = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
      this.filterModel.pageSize = this.onPageChangeEvent.rows;
    } else {
      this.filterModel.pageSize = this.rowPerPage;
      this.filterModel.pageNumber = 1;
    }
    this.getListShipmentKeeping();
  }

  onPageChange(event: any) {
    this.onPageChangeEvent = event;
    this.filterModel.pageNumber = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.filterModel.pageSize = this.onPageChangeEvent.rows;
    this.getListShipmentKeeping();
  }
  //

  scaneShipmentNumber(txtAssignShipment: any, template: TemplateRef<any>) {
    this.txtAssignShipmentBillTong.nativeElement.focus();
    this.txtAssignShipmentBillTong.nativeElement.select();
    if (!txtAssignShipment.value || txtAssignShipment.value.trim() === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng nhập mã vận đơn!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.checkNoteWareHouse(txtAssignShipment, template);
  }

  checkNoteWareHouse(txtAssignShipment: any, template: TemplateRef<any>) {
    if (txtAssignShipment.length !== 0) {
      this.txtShipmentNumber = txtAssignShipment;
    }
    this.processScanShipmentNumber(this.txtShipmentNumber);
  }

  async processScanShipmentNumber(txtAssignShipment: any) {
    this.messageService.clear();

    let model: AssignShipmentWarehousing = new AssignShipmentWarehousing();
    if (this.inputNote) model.note = this.inputNote;
    model.typeWarehousing = ListGoodsTypeHelper.receiptPickup;
    if (this.listGoodsWPCreated) {
      model.listGoodsId = this.listGoodsWPCreated.id;
    } else {
      let modelListGoods: CreateListGoods = new CreateListGoods();
      modelListGoods.typeWarehousing = model.typeWarehousing;
      await this.listGoodsService.createListGoodsAsync(modelListGoods).then(
        x => {
          if (x.isSuccess == true) {
            this.listGoodsWPCreated = x.data as ListGoods;
            model.listGoodsId = this.listGoodsWPCreated.id;
          } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo bảng kê nhập kho không thành công [BKLH].' });
            return;
          }
        }
      )
    }

    txtAssignShipment.value.trim().split(" ").forEach(element => {
      model.ShipmentNumber = element.trim();
      if (this.txtNote) {
        model.note = this.txtNote;
      }
      // console.log(JSON.stringify(model));
      this.shipmentService.receiptWarehousingAsync(model).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            this.txtShipmentNumber = null;
            this.txtNote = null;
            this.txtScanShipmentBillTong = null;
            this.txtScanShipmentBillTongBaoPhat = null;
            // this.addShipmentSuccess(x.data as Shipment);
            // this.countWarehousing_Success++;
            return
          } else {
            if (x.message == "RequestShipment") {
              this.scaneRequestShipmet(x.data);
            } else {
              // set localStorage
              const timestamp: any = new Date().getTime();
              const dataStore: any = JSON.stringify({
                listGoodsWPCreated: this.listGoodsWPCreated,
                timestamp: timestamp
              });
              localStorage.setItem(this.localStorageListGoodsWP, dataStore);

              this.messageService.add({
                severity: Constant.messageStatus.success, detail: "Nhập kho thành công",
              });
              SoundHelper.getSoundMessage(Constant.messageStatus.success);
              this.txtShipmentNumber = null;
              if (this.isNoteWarehouse && this.bsModalRefNote) {
                this.bsModalRefNote.hide();
              }
              this.txtNote = null;
              this.txtScanShipmentBillTong = null;
              this.txtScanShipmentBillTongBaoPhat = null;
              let ship = x.data as Shipment;
              this.addShipmentSuccess(ship);
              this.countWarehousing_Success++;
              this.totalBoxsRight = this.totalBoxsRight + ship.totalBox;
            }
          }
        });
    });
  }

  onClickScanPackage(template: TemplateRef<any>) {
    this.isSuccessScanPackge = false;
    this.totalCountLSByScanPackage = 0;
    this.percentScanPackage = 0;
    this.isCheckScanPackage = false;
    this.listError = null;
    this.listShipmentByScanPackage = null;
    this.totalScanShipOfPackageFail = 0;
    this.totalScanShipOfPackageSuccess = 0;

    setTimeout(() => {
      var atcScanPackageCode = $("#atcScanPackageCode");
      atcScanPackageCode.focus();
      atcScanPackageCode.select();
    }, 0);
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  async evenScanePackageCode() {
    this.messageService.clear();
    this.isSuccessScanPackge = false;

    if (StringHelper.isNullOrEmpty(this.txtPackageCode)) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Mã ${this.envir.pack} trống. Vui lòng Scan Mã ${this.envir.pack}` });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.txtPackageCode = null;
      return;
    }

    //
    let packageCode = this.txtPackageCode.trim();

    // api scan mã gói hoặc số Seal => check gói đã đóng và lấy ra ds vận đơn
    const res = await this.packageService.getShipmentByPackageCodeOrSealAsync(packageCode, 1, 1, 1000);
    if (res) {
      if (res.isSuccess) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Quét thành công!` });
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);

        this.isSuccessScanPackge = true;

        if (!ArrayHelper.isNullOrZero(res.data as any[])) {
          const ships = res.data;
          this.listShipmentByScanPackage = ships;
          this.totalCountLSByScanPackage = ships[0].totalCount;
        }
      }
    }

    this.txtPackageCode = null;
  }

  async comfirmScanPackage() {
    this.isCheckScanPackage = true;
    this.listError = null;
    this.totalScanShipOfPackageSuccess = 0;
    this.totalScanShipOfPackageFail = 0;
    this.percentScanPackage = 0;
    let cloneCountShipmentByScanPackage: number = 0;

    // scan từng mã vận đơn của gói
    if (this.isSuccessScanPackge) {
      if (!ArrayHelper.isNullOrZero(this.listShipmentByScanPackage)) {
        cloneCountShipmentByScanPackage = Object.assign({}, this.listShipmentByScanPackage).length;
        let model: AssignShipmentWarehousing = new AssignShipmentWarehousing();
        model.typeWarehousing = ListGoodsTypeHelper.receiptPickup;
        if (this.listGoodsWPCreated) {
          model.listGoodsId = this.listGoodsWPCreated.id;
        } else {
          let modelListGoods: CreateListGoods = new CreateListGoods();
          modelListGoods.typeWarehousing = model.typeWarehousing;
          await this.listGoodsService.createListGoodsAsync(modelListGoods).then(
            x => {
              if (x.isSuccess == true) {
                this.listGoodsWPCreated = x.data as ListGoods;
                model.listGoodsId = this.listGoodsWPCreated.id;
              } else {
                this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo bảng kê nhập kho không thành công [BKNK].' });
                return;
              }
            }
          );
        }

        model.isPackage = true;
        if (this.txtNote) {
          model.note = this.txtNote.trim();
        }

        this.listShipmentByScanPackage.forEach(async e => {
          model.ShipmentNumber = e.shipmentNumber.trim();
          if (this.inputNote) model.note = this.inputNote;

          await this.shipmentService.receiptWarehousingAsync(model).then(
            async u => {
              if (u.isSuccess == true) {
                this.totalScanShipOfPackageSuccess++;
                this.percentScanPackage = Math.ceil(this.totalScanShipOfPackageSuccess * 100 / this.totalCountLSByScanPackage);

                // cập nhật lại số lượng vận đơn trong gói của table bên trái và phải
                this.totalBoxsLeft = this.totalBoxsLeft - e.totalBox;
                this.totalShipmentInPackageLeft--;
                this.totalBoxsRight = this.totalBoxsRight + e.totalBox;
                this.totalShipmentInPackageRight++;

                // add client
                this.listShipmentWarehousedOnTabOne.unshift(e);
                this.countWarehousing_Success++;
                if (this.listShipmentWarehousedOnTabOne.length >= 10) {
                  this.listShipmentWarehousedOnTabOne.splice(0, 1);
                }
                // remove client
                let findLeft = this.listShipment.findIndex(f => f.id == e.id);
                if (findLeft || findLeft == 0) {
                  this.listShipment.splice(findLeft, 1);
                  this.totalRecords_ShipmentKeeping--;
                }
              } else {
                this.totalScanShipOfPackageFail++;
                if (this.listError) this.listError += `, ${e.shipmentNumber}`;
                else this.listError = e.shipmentNumber;
              }
            }
          );

          // cập nhật lại số lượng gói của table bên trái và bên phải
          if (this.percentScanPackage === 100) {
            this.totalPackageLeft--;
            this.totalPackageRight++;
          }
        });
      }

    }

    this.listShipmentByScanPackage = null;
  }

  noneScanPackage() {
    this.bsModalRef.hide();
  }

  //filter Customers
  async filterCustomers(event) {
    let value = event.query;
    if (value.length >= 2) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            Promise.all(data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m });
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            }));
            this.customers.push({ value: null, label: `-- Tất cả --` });
            this.filteredCustomers.push(`-- Tất cả --`);
          }
        }
      );
    }
  }

  changeSender() {
    let cloneSelectedCustomer = this.customerChange;
    if (this.customerChange) {
      let findCus = this.customers.find(f => f.label.indexOf(cloneSelectedCustomer) >= 0);
      if (findCus) {
        this.filterModel.senderId = findCus.value;
      }
    } else {
      this.filterModel.senderId = null;
    }
    this.getListShipmentKeeping();
  }

  async warehousingFast() {
    this.messageService.clear();
    if (!this.selectedData || !this.selectedData.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn vận đơn nhập kho nhanh' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let model: AssignShipmentWarehousing = new AssignShipmentWarehousing();
    if (this.inputNote) model.note = this.inputNote;
    model.typeWarehousing = ListGoodsTypeHelper.receiptPickup;
    if (this.listGoodsWPCreated) {
      model.listGoodsId = this.listGoodsWPCreated.id;
    } else {
      let modelListGoods: CreateListGoods = new CreateListGoods();
      modelListGoods.typeWarehousing = model.typeWarehousing;
      await this.listGoodsService.createListGoodsAsync(modelListGoods).then(
        x => {
          if (x.isSuccess == true) {
            this.listGoodsWPCreated = x.data as ListGoods;
            model.listGoodsId = this.listGoodsWPCreated.id;
          } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo bảng kê nhập kho không thành công [BKLH].' });
            return;
          }
        }
      )
    }
    this.selectedData.map(map => {
      model.ShipmentNumber = map.shipmentNumber;
      if (this.txtNote) {
        model.note = this.txtNote;
      }
      // console.log(JSON.stringify(model));
      this.shipmentService.receiptWarehousingAsync(model).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            this.txtShipmentNumber = null;
            this.txtNote = null;
            this.txtScanShipmentBillTong = null;
            this.txtScanShipmentBillTongBaoPhat = null;
            // this.addShipmentSuccess(x.data as Shipment);
            // this.countWarehousing_Success++;
            return
          } else {
            if (x.message == "RequestShipment") {
              this.scaneRequestShipmet(x.data);
            } else {
              // set localStorage
              const timestamp: any = new Date().getTime();
              const dataStore: any = JSON.stringify({
                listGoodsWPCreated: this.listGoodsWPCreated,
                timestamp: timestamp
              });
              localStorage.setItem(this.localStorageListGoodsWP, dataStore);

              this.messageService.add({
                severity: Constant.messageStatus.success, detail: "Nhập kho thành công",
              });
              SoundHelper.getSoundMessage(Constant.messageStatus.success);
              this.txtShipmentNumber = null;
              if (this.isNoteWarehouse && this.bsModalRefNote) {
                this.bsModalRefNote.hide();
              }
              this.txtNote = null;
              this.txtScanShipmentBillTong = null;
              this.txtScanShipmentBillTongBaoPhat = null;
              let ship = x.data as Shipment;
              this.addShipmentSuccess(ship); // thêm vận đơn nhập kho thành công vào bảng bên phải

              // thêm số lượng vào table bên phải khi nhập kho thành công
              this.countWarehousing_Success++;
              this.totalBoxsRight = this.totalBoxsRight + ship.totalBox;
            }
          }
        });
    });
  }

  addShipmentSuccess(shipment: Shipment) {
    if (this.listShipmentWarehousedOnTabOne.length >= 10) {
      this.listShipmentWarehousedOnTabOne.splice(0, 1);
    }
    this.listShipmentWarehousedOnTabOne.unshift(shipment);
    if (this.listShipment) {
      let findIndexS = this.listShipment.findIndex(f => f.id == shipment.id);
      if (findIndexS || findIndexS == 0) {
        if (findIndexS >= 0) {
          this.listShipment.splice(findIndexS, 1);
          // trừ số liệu table bên trái khi nhập kho thành công
          if (this.totalRecords_ShipmentKeeping) {
            this.totalRecords_ShipmentKeeping--;
            this.totalBoxsLeft = this.totalBoxsLeft - shipment.totalBox;
          };
        }
      }
      //remove select data
      let findSelectLeft = this.selectedData.findIndex(f => f.id == shipment.id);
      if (findSelectLeft || findSelectLeft == 0) {
        this.selectedData.splice(findSelectLeft, 1);
      }
    }
  }

  openModelNote(template: TemplateRef<any>) {
    this.modalTitle = "Ghi chú nhập kho";
    this.bsModalRefNote = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  calendarEventsHandler(e: any) {
    DaterangePickerHelper.calendarEventsHandler(e);
  }

  refresh() {
    this.txtFilterGb_ShipmentKeeping = null;
    this.txtShipmentNumber = null;
    this.txtNote = null;
    this.employee = null;
    this.hub = null;
    this.toHub = null;

    this.filterModel = new GetListWarehousingFilter();
    this.getListShipmentKeeping();
  }

  public eventLog = "";

  // BILL TỔNG
  async scaneRequestShipmet(requestShipment: any) {
    this.data = requestShipment as RequestShipment;;
    if (this.data.shipmentStatusId == StatusHelper.pickupComplete) {
      if (this.data.calWeightAccept == 0) this.data.calWeightAccept = this.data.calWeight ? this.data.calWeight : 0;
      if (this.data.countShipmentAccept == 0) this.data.countShipmentAccept = this.data.totalChildShipment ? this.data.totalChildShipment : 0;
      if (this.data.weightAccept == 0) this.data.weightAccept = this.data.weight ? this.data.weight : 0;
      if (this.data.totalBoxAccept == 0) this.data.totalBoxAccept = this.data.totalBox;
    }
    this.txtShipmentNumber = null;
    this.txtScanShipmentBillTong = null;
    this.txtScanShipmentBillTongBaoPhat = null;

    this.bsModalRef_BillTong = this.modalService.show(this.templateBillTong, {
      class: "inmodal animated bounceInRight modal-lg modal-full"
    });
  }

  async clickSaveChange() {
    if (!this.data) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bill tổng!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (this.data.shipmentStatusId != StatusHelper.pickupComplete) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Trạng thái bill tổng không được phép nhập kho!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (this.data.countShipmentAccept <= 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Số vận đơn xác nhận không hợp lệ!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (this.data.weightAccept < 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Trọng lượng xác nhận không hợp lệ!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (this.data.totalBoxAccept < 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Số kiện xác nhận không hợp lệ!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    // if (this.data.totalBoxAccept < this.data.countShipmentAccept) {
    //   this.messageService.add({
    //     severity: Constant.messageStatus.warn, detail: 'Số kiện xác nhận phải lớn hơn hoặc bằng số vận đơn!',
    //   })
    //   return;
    // }
    if (!this.data.calWeightAccept) {
      this.data.calWeightAccept = 0;
    }
    if (!this.data.calWeight) {
      this.data.calWeight = 0;
    }

    // console.log(JSON.stringify(this.data));

    const data = await this.requestShipmentService.acceptCompleteByWarehousingAsync(this.data);
    if (!data) {
      this.messageService.add({
        severity: Constant.messageStatus.error, detail: 'Xác nhận nhập kho bill tổng thất bại!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.error);
      this.txtScanShipmentBillTong = null;
      this.txtScanShipmentBillTongBaoPhat = null;
      return;
    } else {
      let shipment: Shipment = new Shipment();
      shipment.id = this.data.id;
      shipment.shipmentNumber = this.data.shipmentNumber;
      shipment.orderDate = this.data["orderDate"];
      shipment.senderName = this.data.senderName;
      shipment.senderPhone = this.data.senderPhone;
      shipment.pickingAddress = this.data.pickingAddress;
      shipment.receiverName = this.data.receiverName;
      shipment.receiverPhone = this.data.receiverPhone;
      shipment.shippingAddress = this.data.shippingAddress;
      shipment.cusNote = this.data.cusNote;
      shipment.totalBox = this.data.totalBox;
      shipment["deliveryNote"] = this.data.deliveryNote;
      shipment.calWeight = this.data.calWeight ? this.data.calWeight : 0;
      shipment.weight = this.data.weight;
      shipment["isBillTong"] = true;

      this.messageService.add({
        severity: Constant.messageStatus.success, detail: 'Xác nhận nhập kho bill tổng thành công!',
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.success);

      this.addShipmentSuccess(shipment);
      this.data = null;
      this.txtScanShipmentBillTong = null;
      this.txtScanShipmentBillTongBaoPhat = null;
      // this.txtAssignRequestRef.nativeElement.value = "";
      // this.txtAssignRequestRef.nativeElement.focus();
    }
    this.bsModalRef_BillTong.hide();
  }
  //

  colorRow(rowData) {
    if (rowData.isBillTong) {
      return 'blue';
    } else {
      if (rowData.shipmentStatusId === StatusHelper.deliveryFail) {
        return '#ff9600';
      } else if (rowData.shipmentStatusId === StatusHelper.deliveryComplete) {
        return '#1c84c6';
      } else if (!rowData.toHubRoutingName) {
        return 'red';
      }
    }
  }

  onNoteWarehouse() {

  }

  refreshSessionListGoodsWP() {
    this.messageService.clear();
    this.listGoodsWPCreated = null;// remove local storage
    localStorage.removeItem(this.localStorageListGoodsWP);
    this.listShipmentWarehousedOnTabOne = [];
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Làm mới thành công BKLH' });
  }

  refreshSessionListGoodsWD() {
    this.messageService.clear();
    this.listGoodsWDCreated = null;// remove local storage
    localStorage.removeItem(this.localStorageListGoodsWD);
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Làm mới thành công BKBP' });
  }

  async openModel(template: TemplateRef<any>, listGoods: ListGoods) {
    this.listShipmentByListGoodsId = [];
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
    this.listShipmentByListGoodsId = await this.onGetListGoodsId(listGoods);
  }

  async onGetListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.cusDepartment);

    let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      this.listShipmentByListGoodsId = shipments;
      shipments.forEach((item, index) => {
        this.listShipmentByListGoodsId[index]["fakeId"] =
          "id" + shipments[index].id;
      });
      return shipments;
    }
  }

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    let index = cloneSelectedUser.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedUser.substring(0, index);
      cloneSelectedUser = users;
    }
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.userId = x.value;
          this.changeFilter();
        }
      }
    });
  }

  async keyTabEmployee(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees.length == 1) {
        findCus = this.employees[0];
      } else {
        findCus = this.employees.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.userId = findCus.data.id;
        this.employee = findCus.label;
      } else {
        this.filterModel.userId = null;
      }
      this.changeFilter();
    } else {
      this.filterModel.userId = null;
      this.changeFilter();
    }
  }
  //

  //filter Hub
  async filterHub(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null)
      this.hubs = [];
      this.filteredHubs = [];
      this.filteredHubs.push(`-- Chọn tất cả --`);
      let data = (x as Hub[]);
      data.map(m => {
        this.hubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredHubs.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedHub() {
    let cloneSelectedHub = this.hub;
    let fintHub = this.hubs.find(f => f.label == cloneSelectedHub);
    if (fintHub) {
      this.filterModel.hubId = fintHub.value;
      this.changeFilter();
    } else {
      this.filterModel.hubId = null;
      this.changeFilter();
    }
    this.getListGoodsReceive();
  }

  async keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null);
      this.hubs = [];
      this.filteredHubs = [];
      let data = (x as Hub[]);
      data.map(m => {
        this.hubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredHubs.push(`${m.code} ${m.name}`);
      });
      let findHub: SelectModel = null;
      if (this.hubs.length == 1) {
        findHub = this.hubs[0];
      } else {
        findHub = this.hubs.find(f => f.data.code == value || f.label == value);
      }
      if (findHub) {
        this.filterModel.hubId = findHub.data.id;
        this.hub = findHub.label;
      }
      this.changeFilter();
      this.getListGoodsReceive();
    } else {
      this.filterModel.hubId = null;
      this.changeFilter();
      this.getListGoodsReceive();
    }
  }
  //

  async loadUserByHubId() {
    this.toUsers = await this.userService.getSelectModelEmpByHubIdAsync(this.filterModel.toHubId);
  }

  //filter To Hub
  async filterToHub(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null)
      this.toHubs = [];
      this.filteredToHubs = [];
      let data = (x as Hub[]);
      data.map(m => {
        this.toHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredToHubs.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedToHub() {
    let cloneSelectedHub = this.toHub;
    let findHub = this.toHubs.find(f => f.label == cloneSelectedHub);
    if (findHub) {
      this.filterModel.toHubId = findHub.value;
      this.changeFilter();
      this.loadUserByHubId();
    } else {
      this.filterModel.toHubId = null;
      this.changeFilter();
      this.loadUserByHubId();
    }
  }

  async keyTabSenderToHub(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null);
      this.toHubs = [];
      this.filteredToHubs = [];
      let data = (x as Hub[]);
      data.map(m => {
        this.toHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredToHubs.push(`${m.code} ${m.name}`);
      });
      let findHub: SelectModel = null;
      if (this.toHubs.length == 1) {
        findHub = this.toHubs[0];
      } else {
        findHub = this.toHubs.find(f => f.data.code == value || f.label == value);
      }
      if (findHub) {
        this.filterModel.toHubId = findHub.data.id;
        this.toHub = findHub.label;
      }
      this.changeFilter();
      this.loadUserByHubId();

    } else {
      this.filterModel.toHubId = null;
      this.changeFilter();
      this.loadUserByHubId();
    }
  }
  //

  async exportExcel() {
    if (this.totalRecords_ShipmentKeeping) {
      let fileName = "NHAP_KHO";
      let clone = JSON.parse(JSON.stringify(this.filterModel));
      clone.customExportFile.fileNameReport = fileName;
      clone.customExportFile.columnExcelModels = this.columnsExport_ShipmentKeeping;
      clone.pageNumber = 1;
      clone.pageSize = this.totalRecords_ShipmentKeeping;
      await this.shipmentService.getListWarehousingExportExcel(clone);
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu',
      });
    }
  }
}
