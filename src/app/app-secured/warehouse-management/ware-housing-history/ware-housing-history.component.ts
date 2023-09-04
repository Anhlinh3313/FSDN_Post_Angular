import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";

import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  RequestShipmentService,
  UserService,
  ShipmentService,
  AuthService,
  ListGoodsService,
  CustomerService,
  ReportService,
  HubService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  DateRangeFromTo
} from "../../../view-model/index";
///////////////Daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { AssignShipmentWarehousing } from "../../../models/assignShipmentWarehousing.model";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { Table } from "primeng/table";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { ListGoodsTypeService } from "../../../services/listGoodsType.service";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { CreateListGoods, User, Customer, Hub } from "../../../models";
import { SelectModel } from "../../../models/select.model";
import { ExportAnglar5CSV } from "../../../infrastructure/exportAngular5CSV.helper";
import { Angular5Csv } from "angular5-csv/Angular5-csv";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";

@Component({
  selector: 'app-ware-housing-history',
  templateUrl: './ware-housing-history.component.html',
  styles: []
})
export class WareHousingHistoryComponent extends BaseComponent implements OnInit {
  createdHubId: number;
  hub: any;
  hubs: any;
  filteredHubs: any;
  selectedHub: number;
  public dateRange = {
    start: moment(),
    end: moment()
  };
  isSuccessScanTabOne: boolean;
  isSuccessScanTabTwo: boolean;
  companyName = environment.namePrint;
  listShipmentWarehousedOnTabTwo: Shipment[] = []; // hiện danh sách bill nhập kho thành công khi quét bill ở tab nhập kho giao hàng
  listShipmentWarehousedOnTabOne: Shipment[] = []; // hiện danh sách bill nhập kho thành công khi quét bill ở tab nhập kho nhận hàng
  listShipmentByListGoodsId: Shipment[]; // hiện ds bill đã nhập kho của nút xem trong tab ds bk nhập kho
  listDataLG: ListGoods[];
  datasourceLG: ListGoods[];
  totalRecordsLG: number;
  maxTotalRecordsLG: number = 200
  localStorageListGoodsWP: string = "localStorageListGoodsWP"; // local storage BK NK lấy hàng
  localStorageListGoodsWD: string = "localStorageListGoodsWP"; // local storage BK NK giao hàng
  typeScanListGoodsWarehouse: number;
  listGoodsWDCreated: ListGoods; // mã bk nhập kho giao hàng
  selectedUserByCurrentHubLgWarehouse: number;
  txtFilterGb_ListGoodsWarehouse: string;
  selectedTypesListGoodsWarehouse: number;
  typesListGoodsWarehouse: SelectItem[];
  filterDateTo_NKBP: any;
  filterDateFrom_NKBP: any;
  mainInput: any;
  mainInputBK: any;
  unit = environment.unit;
  envir = environment;
  txtScanShipmentBillTongBaoPhat: string;
  txtScanShipmentBillTong: string;
  txtShipmentNumber: any[];
  txtNote: string;
  bsModalRefNote: BsModalRef;
  isNoteWarehouse: boolean;
  isRecovery: boolean;
  listGoodsWPCreated: ListGoods; // mã bk nhập kho lấy hàng
  dateFromCreateLG: any;
  dateToCreateLG: any;
  eventLG: LazyLoadEvent;
  constructor(
    private listGoodsService: ListGoodsService,
    private listGoodsTypeService: ListGoodsTypeService,
    private daterangepickerOptions: DaterangepickerConfig,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private requestShipmentService: RequestShipmentService, public permissionService: PermissionService, public router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    private reportService: ReportService,
    private hubService: HubService,
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
  @ViewChild('txtAssignShipmentBillTongBaoPhat')
  txtAssignShipmentBillTongBaoPhat: ElementRef;
  //

  listUserByCurrentHub: SelectItem[] = [];
  selectedUserByCurrentHub: any;
  selectedUserByCurrentHub_NKBP: any;
  //
  employee: any;
  employees: any;
  filteredEmployees: any;
  //
  customer: any;
  customers: SelectModel[];
  filteredCustomers: any;
  selectedCustomer: number = null;
  //
  pageNum: number = 1;
  //
  lstType: SelectModel[] = [
    { label: "-- Chọn dữ liệu --", data: null, value: null },
    { label: "Nhập kho lấy hàng", data: null, value: 2 },
    { label: "Nhập kho giao hàng", data: null, value: 7 },
    { label: "Nhập kho trung chuyển --", data: null, value: 9 },
  ]
  selectedType: number = null;
  listGoodsCode: string = null;
  //
  countWarehousing_ShipmentKeeping: number = 0;
  txtFilterGb_ShipmentKeeping: any;
  datasource_ShipmentKeeping: Shipment[] = [];
  totalRecords_ShipmentKeeping: number;
  event_ShipmentKeeping: LazyLoadEvent;

  listShipment: any[] = [];
  //
  textNhapBillThuongThanhCong: string = "";
  //
  countWarehousing_NhapKhoBaoPhat: number = 0;
  txtFilterGb_NhapKhoBaoPhat: any;
  datasource_NhapKhoBaoPhat: Shipment[] = [];
  totalRecords_NhapKhoBaoPhat: number;
  event_NhapKhoBaoPhat: LazyLoadEvent;

  listNhapKhoBaoPhat: any[];

  selectedTab: number = 1;
  tabIndex: number;

  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.wareHousingHistory.name;
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

  columnsExport_ShipmentKeeping = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'orderDate', header: 'Ngày gửi' },
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
    { field: "orderDate", header: "Ngày", formatString: 'YYYY/MM/DD HH:mm' },
    { field: "shipmentNumber", header: "Mã vận đơn" },
    { field: "senderCode", header: "Mã người gửi" },
    { field: "senderName", header: "Tên người gửi" },
    { field: "companyFrom", header: "Công ty gửi" },
    { field: "senderPhone", header: "SĐT gửi" },
    { field: "addressNoteFrom", header: "Địa chỉ gửi" },
    { field: "pickingAddress", header: "Địa chỉ lấy hàng" },
    { field: "receiverName", header: "Tên người nhận" },
    { field: "companyTo", header: "Công ty nhận" },
    { field: "receiverPhone", header: "SĐT nhận" },
    { field: "addressNoteTo", header: "Địa chỉ nhận" },
    { field: "cOD", header: "COD" },
    { field: "totalBox", header: "Số kiện" },
    { field: "weight", header: "TL" },
    { field: "calWeight", header: "TL quy đổi" },
    { field: "serviceName", header: "Tên dịch vụ" },
    { field: "defaultPrice", header: "Số tiền" },
    { field: "totalDVGT", header: "DVGT" },
    { field: "priceCOD", header: "Số tiền COD" },
    { field: "totalPrice", header: "Tổng tiền" },
    { field: "content", header: "Nội dung" },
    { field: "cusNote", header: "Ghi chú KH" },
    { field: "note", header: "Ghi chú" },
    { field: "fromProvinceName", header: "Từ tỉnh/thành" },
    { field: "fromDistrictName", header: "Từ quận/huyện" },
    { field: "toProvinceName", header: "Đến tỉnh/thành" },
    { field: "toDistrictName", header: "Đến quận/huyện" },
  ];

  rowPerPage: number = 20;
  searchText: string = '';
  //
  //
  ladingScheduleCreatedWhen: SelectItem[];
  selectedLadingScheduleCreatedWhen: Date[];
  //
  dateRageValue: any = new Object();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  currentUser: User;

  @ViewChild("dt") dt: Table;
  @ViewChild("dtShipmentKeeping") dtShipmentKeeping: Table;
  @ViewChild("dtNhapKhoBaoPhat") dtNhapKhoBaoPhat: Table;

  ngOnInit() {
    this.mainInput = DaterangePickerHelper.mainInput;
    this.mainInputBK = DaterangePickerHelper.mainInput;
    this.daterangepickerOptions = DaterangePickerHelper.getSettings(this.daterangepickerOptions);
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    //
    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
      fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
      toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }
    this.filterDateFrom_NKBP = currentDate + "T00:00:00";
    this.filterDateTo_NKBP = currentDate + "T23:59:59";
    this.dateFromCreateLG = fromDate;
    this.dateToCreateLG = toDate;
    this.initData();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  initData() {
    this.getAllUserByCurrentHub();
    this.getLocalStorageListGoodsWP();
    this.getLocalStorageListGoodsWD();
    this.authService.getAccountInfoAsync().then(
      x => {
        if (x) {
          this.currentUser = x;
          this.loadListGoodsWarehouse();
        }
      }
    )
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

  async loadListGoodsWarehouse() {
    if (this.currentUser) {
      this.selectedTypesListGoodsWarehouse = this.selectedTypesListGoodsWarehouse ? this.selectedTypesListGoodsWarehouse : null;
      const data = await this.reportService.getReportListGoodsShipment(
        this.selectedType,
        this.createdHubId ? this.createdHubId : this.currentUser.hubId,
        null,
        null,
        this.selectedUserByCurrentHubLgWarehouse,
        null,
        null,
        null,
        this.selectedCustomer,
        this.dateFromCreateLG,
        this.dateToCreateLG,
        this.searchText,
        this.pageNum,
        this.rowPerPage,
        this.listGoodsCode
      );
      if (data) {
        this.listDataLG = data.reverse() as ListGoods[] || [];
        this.totalRecordsLG = this.listDataLG.length ? this.listDataLG[0].totalCount : 0;
      }
    } else {
      this.authService.getAccountInfoAsync().then(
        x => {
          if (x) {
            this.currentUser = x;
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Lấy thông tin đăng nhập lỗi, đang lấy lại!"
            });
            return false;
          }
        }
      );
    }
  }

  public selectedDate() {
    this.dateFromCreateLG = SearchDate.formatToISODate(moment(this.dateFromCreateLG).toDate());
    this.dateToCreateLG = SearchDate.formatToISODate(moment(this.dateToCreateLG).toDate());
    this.loadListGoodsWarehouse();
  }

  getAllUserByCurrentHub() {
    this.userService.getAllUserByCurrentHubAsync().then(data => {
      this.listUserByCurrentHub.push({ value: null, label: "Chọn nhân viên" });
      data.forEach(item => {
        this.listUserByCurrentHub.push({ value: item.id, label: item.code + " - " + item.fullName });
      });
    });
  }

  changeUserByCurrentHub() {
    this.getListShipmentKeeping();
  }

  async exportCSV(dt) {
    var options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      noDownload: false,
      // headers: ["First Name", "Last Name", "ID"]
    };

    let fileName = "DANH_SACH_NHAP_KHO.xlsx";
    if (this.totalRecordsLG > 0) {
      if (this.totalRecordsLG > this.maxTotalRecordsLG) {
        let data: any[] = [];
        let count = Math.ceil(this.totalRecordsLG / this.maxTotalRecordsLG);
        let promise = [];

        for (let i = 1; i <= count; i++) {
          let pageNum = i;
          let pageSize = this.maxTotalRecordsLG;

          promise.push(await this.reportService.getReportListGoodsShipment(
            this.selectedType,
            this.createdHubId ? this.createdHubId : this.currentUser.hubId,
            null,
            null,
            this.selectedUserByCurrentHubLgWarehouse,
            null,
            null,
            null,
            this.selectedCustomer,
            this.dateFromCreateLG,
            this.dateToCreateLG,
            this.searchText,
            pageNum,
            pageSize,
            this.listGoodsCode ? this.listGoodsCode : null
          ))
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExportListGoodsWarehouse, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      }
      else {
        let pageNum = 1;
        let pageSize = this.maxTotalRecordsLG;

        let x = await this.reportService.getReportListGoodsShipment(
          this.selectedType,
          this.createdHubId ? this.createdHubId : this.currentUser.hubId,
          null,
          null,
          this.selectedUserByCurrentHubLgWarehouse,
          null,
          null,
          null,
          this.selectedCustomer,
          this.dateFromCreateLG,
          this.dateToCreateLG,
          this.searchText,
          pageNum,
          pageSize,
          this.listGoodsCode ? this.listGoodsCode : null
        )

        let data = x.reverse();
        dt.value = data;
        var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExportListGoodsWarehouse, false, false);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    }
  }

  async getListShipmentKeeping() {

    this.listShipment = [];
    let isRecovery: boolean;
    if (this.isRecovery) {
      isRecovery = true;
    } else {
      isRecovery = false;
    }

    let includes = [];
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.cusDepartment);

    this.selectedUserByCurrentHub = this.selectedUserByCurrentHub ? this.selectedUserByCurrentHub : null;
    let listShipmentKeeping = await this.shipmentService.getListShipmentKeepingByUserIdAsync(this.selectedUserByCurrentHub, isRecovery, true, null, null, includes);
    let listRequestShipmentKeeping = await this.requestShipmentService.getListRequestShipmentKeepingAsync(this.selectedUserByCurrentHub, isRecovery, includes);

    if (listShipmentKeeping && listShipmentKeeping.length > 0) {
      listShipmentKeeping.map(item => {
        item["isBillTong"] = false;
      });
    }

    if (listRequestShipmentKeeping && listRequestShipmentKeeping.length > 0) {
      listRequestShipmentKeeping.map(item => {
        item["isBillTong"] = true;
      });
    }

    this.listShipment = this.listShipment.concat(listShipmentKeeping);
    this.listShipment = this.listShipment.concat(listRequestShipmentKeeping);
    //this.listShipment = this.listShipment.filter(x => x.shipmentStatusId == 3);
    this.datasource_ShipmentKeeping = this.listShipment;
    this.totalRecords_ShipmentKeeping = this.datasource_ShipmentKeeping.length;
    this.listShipment = this.datasource_ShipmentKeeping.slice(0, this.rowPerPage);
    this.countWarehousing_ShipmentKeeping = this.totalRecords_ShipmentKeeping;
  }

  loadLazy_ShipmentKeeping(event: LazyLoadEvent) {
    this.event_ShipmentKeeping = event;
    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource_ShipmentKeeping) {
        var filterRows;
        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource_ShipmentKeeping.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource_ShipmentKeeping.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        // search datetime
        // if (this.txtFilterGb_ShipmentKeeping) {
        //   let result = SearchDate.searchFullDate(this.txtFilterGb_ShipmentKeeping);
        //   if (result) {
        //     filterRows = this.datasource_ShipmentKeeping.filter(x =>
        //       FilterUtil.gbFilterFiled(x, result, this.columns)
        //     );
        //   }
        //   //
        //   let res = SearchDate.searchDayMonth(this.txtFilterGb_ShipmentKeeping);
        //   if (res) {
        //     filterRows = this.datasource_ShipmentKeeping.filter(x =>
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
        this.listShipment = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords_ShipmentKeeping = filterRows.length;
        this.countWarehousing_ShipmentKeeping = this.totalRecords_ShipmentKeeping;
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  // Nhập kho giao hàng
  changeUserByCurrentHub_NKBP() {
    this.isSuccessScanTabTwo = false;
    this.getListNhapKhoBaoPhat();
  }

  changeSelectedOrderdate_NKBP() {
    this.getListNhapKhoBaoPhat();
  }

  async getListNhapKhoBaoPhat() {
    this.listNhapKhoBaoPhat = [];
    let isRecovery: boolean;
    if (this.isRecovery) {
      isRecovery = true;
    } else {
      isRecovery = false;
    }

    let includes = [];
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.cusDepartment);

    this.selectedUserByCurrentHub_NKBP = this.selectedUserByCurrentHub_NKBP ? this.selectedUserByCurrentHub_NKBP : null;
    let listShipmentKeeping = await this.shipmentService.getListShipmentKeepingByUserIdAsync(this.selectedUserByCurrentHub_NKBP, isRecovery, false, this.filterDateFrom_NKBP, this.filterDateTo_NKBP, includes);
    //let listRequestShipmentKeeping = await this.requestShipmentService.getListRequestShipmentKeepingAsync(this.selectedUserByCurrentHub_NKBP, isRecovery, this.filterDateFrom_NKBP, this.filterDateTo_NKBP, includes);
    // if (listShipmentKeeping && listShipmentKeeping.length > 0) {
    //   listShipmentKeeping.forEach(item => {
    //     item["isBillTong"] = false;
    //   });
    // }
    // if (listRequestShipmentKeeping && listRequestShipmentKeeping.length > 0) {
    //   listRequestShipmentKeeping.forEach(item => {
    //     item["isBillTong"] = true;
    //   });
    // }
    this.listNhapKhoBaoPhat = this.listNhapKhoBaoPhat.concat(listShipmentKeeping);
    //this.listNhapKhoBaoPhat = this.listNhapKhoBaoPhat.concat(listRequestShipmentKeeping);
    this.listNhapKhoBaoPhat = this.listNhapKhoBaoPhat.filter(x =>
      (x.shipmentStatusId == StatusHelper.delivering ||
        x.shipmentStatusId == StatusHelper.deliveryComplete ||
        x.shipmentStatusId == StatusHelper.deliveryFail ||
        x.shipmentStatusId == StatusHelper.returning ||
        x.shipmentStatusId == StatusHelper.returnFail
      )
    );

    this.datasource_NhapKhoBaoPhat = this.listNhapKhoBaoPhat;
    this.totalRecords_NhapKhoBaoPhat = this.datasource_NhapKhoBaoPhat.length;
    this.listNhapKhoBaoPhat = this.datasource_NhapKhoBaoPhat.slice(0, this.rowPerPage);
    this.countWarehousing_NhapKhoBaoPhat = this.totalRecords_NhapKhoBaoPhat;
  }

  loadLazy_NhapKhoBaoPhat(event: LazyLoadEvent) {
    this.event_NhapKhoBaoPhat = event;
    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource_NhapKhoBaoPhat) {
        var filterRows;
        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource_NhapKhoBaoPhat.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource_NhapKhoBaoPhat.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        // search datetime
        // if (this.txtFilterGb_ShipmentKeeping) {
        //   let result = SearchDate.searchFullDate(this.txtFilterGb_ShipmentKeeping);
        //   if (result) {
        //     filterRows = this.datasource_ShipmentKeeping.filter(x =>
        //       FilterUtil.gbFilterFiled(x, result, this.columns)
        //     );
        //   }
        //   //
        //   let res = SearchDate.searchDayMonth(this.txtFilterGb_ShipmentKeeping);
        //   if (res) {
        //     filterRows = this.datasource_ShipmentKeeping.filter(x =>
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
        this.listNhapKhoBaoPhat = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords_NhapKhoBaoPhat = filterRows.length;
        this.countWarehousing_NhapKhoBaoPhat = this.totalRecords_NhapKhoBaoPhat;
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }
  //

  scaneShipmentNumber(txtAssignShipment: any, template: TemplateRef<any>, tabIndex: number) {
    this.txtAssignShipmentBillTong.nativeElement.focus();
    this.txtAssignShipmentBillTong.nativeElement.select();
    this.txtAssignShipmentBillTongBaoPhat.nativeElement.focus();
    this.txtAssignShipmentBillTongBaoPhat.nativeElement.select();
    if (!txtAssignShipment.value || txtAssignShipment.value.trim() === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng nhập mã vận đơn!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.tabIndex = tabIndex;
    this.checkNoteWareHouse(txtAssignShipment, template);
  }
  checkNoteWareHouse(txtAssignShipment: any, template: TemplateRef<any>) {
    if (txtAssignShipment.length !== 0) {
      this.txtShipmentNumber = txtAssignShipment;
    }
    if (this.isNoteWarehouse) {
      this.openModelNote(template);
    } else {
      this.confirmScan(this.txtShipmentNumber);
    }
  }

  confirmScan(txtAssignShipment) {
    if (this.isNoteWarehouse) {
      if (StringHelper.isNullOrEmpty(this.txtNote)) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Chưa nhập ghi chú nhập kho"
        });
        return;
      }
    }
    this.processScanShipmentNumber(txtAssignShipment);
  }

  async processScanShipmentNumber(txtAssignShipment: any) {
    this.messageService.clear();

    let model: AssignShipmentWarehousing = new AssignShipmentWarehousing();
    if (this.tabIndex === 1) {//lấy hàng
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
    } else if (this.tabIndex === 2) {
      model.typeWarehousing = ListGoodsTypeHelper.receiptDelivery;
      if (this.listGoodsWDCreated) {
        model.listGoodsId = this.listGoodsWDCreated.id;
      } else {
        let modelListGoods: CreateListGoods = new CreateListGoods();
        modelListGoods.typeWarehousing = model.typeWarehousing;
        await this.listGoodsService.createListGoodsAsync(modelListGoods).then(
          x => {
            if (x.isSuccess == false) {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo bảng kê nhập kho không thành công [BKBP].' });
              return;
            } else {
              this.listGoodsWDCreated = x.data as ListGoods;
              model.listGoodsId = this.listGoodsWDCreated.id;
            }
          }
        )
      }
    }
    model.ShipmentNumber = txtAssignShipment.value.trim();
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
          return
        } else {
          if (x.message == "RequestShipment") {
            this.scaneRequestShipmet(x.data);
          } else {
            // quét thành công
            if (this.tabIndex === 1) {
              this.isSuccessScanTabOne = true;
              // set localStorage
              const timestamp: any = new Date().getTime();
              const dataStore: any = JSON.stringify({
                listGoodsWPCreated: this.listGoodsWPCreated,
                timestamp: timestamp
              });
              localStorage.setItem(this.localStorageListGoodsWP, dataStore);
            } else if (this.tabIndex === 2) {
              this.isSuccessScanTabTwo = true;
              // set localStorage
              const timestamp: any = new Date().getTime();
              const dataStore: any = JSON.stringify({
                listGoodsWDCreated: this.listGoodsWDCreated,
                timestamp: timestamp
              });
              localStorage.setItem(this.localStorageListGoodsWD, dataStore);
            }

            this.messageService.add({
              severity: Constant.messageStatus.success, detail: "Nhập kho thành công",
            });
            SoundHelper.getSoundMessage(Constant.messageStatus.success);
            this.txtShipmentNumber = null;
            if (this.isNoteWarehouse) {
              this.bsModalRefNote.hide();
            }
            this.txtNote = null;
            this.txtScanShipmentBillTong = null;
            this.txtScanShipmentBillTongBaoPhat = null;
            if (this.tabIndex === 1) this.addShipmentSuccess(x.data as Shipment);
            else if (this.tabIndex === 2) this.addShipmentSuccessTwo(x.data as Shipment);
          }
        }
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
          this.countWarehousing_ShipmentKeeping--;
        }
      }
    }
  }

  addShipmentSuccessTwo(shipment: Shipment) {
    if (this.listShipmentWarehousedOnTabTwo.length >= 10) {
      this.listShipmentWarehousedOnTabTwo.splice(0, 1);
    }
    this.listShipmentWarehousedOnTabTwo.unshift(shipment);
    if (this.listNhapKhoBaoPhat) {
      let findIndexS = this.listNhapKhoBaoPhat.findIndex(f => f.id == shipment.id);
      if (findIndexS || findIndexS == 0) {
        if (findIndexS >= 0) {
          this.listNhapKhoBaoPhat.splice(findIndexS, 1);
          this.countWarehousing_NhapKhoBaoPhat--;
        }
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

  selectedDateBK() {
    this.dateFromCreateLG = SearchDate.formatToISODate(moment(this.dateFromCreateLG).toDate());
    this.dateToCreateLG = SearchDate.formatToISODate(moment(this.dateToCreateLG).toDate());
    this.loadListGoodsWarehouse();
  }

  changeTypeListGoodsWarehouse() {
    this.loadListGoodsWarehouse();
  }

  changeUserByCurrentHubLgWarehouse() {
    this.loadListGoodsWarehouse();
  }

  refresh() {
    this.mainInput = DaterangePickerHelper.mainInput;
    this.mainInputBK = DaterangePickerHelper.mainInput;
    this.daterangepickerOptions = DaterangePickerHelper.getSettings(this.daterangepickerOptions);
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    //
    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
      fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
      toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }
    this.filterDateFrom_NKBP = currentDate + "T00:00:00";
    this.filterDateTo_NKBP = currentDate + "T23:59:59";
    this.dateFromCreateLG = fromDate;
    this.dateToCreateLG = toDate;
    this.selectedUserByCurrentHubLgWarehouse = null;
    this.selectedCustomer = null,
      this.selectedType = null;
    this.employee = null;
    this.customer = null;
    this.hub = null;
    this.createdHubId = null;
    this.pageNum = 1;
    this.rowPerPage = 20;

    this.loadListGoodsWarehouse();
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
  onViewisRecovery() {
    this.isSuccessScanTabTwo = false;
    this.getListNhapKhoBaoPhat();
  }

  colorRow(rowData) {
    if (rowData.isBillTong) {
      return 'blue';
    } else {
      if (rowData.shipmentStatusId === StatusHelper.deliveryFail) {
        return '#ff9600';
      }
      if (rowData.shipmentStatusId === StatusHelper.deliveryComplete) {
        return '#1c84c6';
      }
      if (rowData.numDeliver >= 3) {
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
    this.listShipmentWarehousedOnTabTwo = [];
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

  onPageChange(event: any) {
    this.pageNum = event.first / event.rows + 1;
    this.rowPerPage = event.rows;
    this.loadListGoodsWarehouse();
  }

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      this.filteredEmployees.push(`-- Tất cả --`);
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    if (cloneSelectedUser == '-- Tất cả --') {
      this.selectedUserByCurrentHubLgWarehouse = null;
      this.loadListGoodsWarehouse();
    } else {
      this.employees.forEach(x => {
        let obj = x.label;
        if (obj) {
          if (cloneSelectedUser === obj) {
            this.selectedUserByCurrentHubLgWarehouse = x.value;
            this.loadListGoodsWarehouse();
          }
        }
      });
    }
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
        this.selectedUserByCurrentHubLgWarehouse = findCus.data.id;
        this.employee = findCus.label;
      }
      this.loadListGoodsWarehouse();

    } else {
      this.selectedUserByCurrentHubLgWarehouse = null;
      this.loadListGoodsWarehouse();
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //

  // Filter customer
  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 2) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            this.filteredCustomers.push(`-- Tất cả --`);
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
    if (cloneSelectedCustomer == '-- Tất cả --') {
      this.selectedCustomer = null;
      this.loadListGoodsWarehouse();
    } else {
      this.customers.forEach(x => {
        let obj = x.data as Customer;
        if (obj) {
          if (cloneSelectedCustomer === x.label) {
            this.selectedCustomer = x.value;
            this.loadListGoodsWarehouse();
          }
        }
      });
    }
  }

  // filter Hub
  async filterHub(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null);
      this.hubs = [];
      this.filteredHubs = [];
      let data = (x as Hub[]);
      Promise.all(data.map(m => {
        this.hubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredHubs.push(`${m.code} ${m.name}`);
      }));
      this.hubs.push({ value: null, label: `-- Tất cả --`, data: null })
      this.filteredHubs.push(`-- Tất cả --`);
    }
  }

  onSelectedHub() {
    let cloneSelectedUser = this.hub;
    this.hubs.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.createdHubId = x.value;
          this.loadListGoodsWarehouse();
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
            this.loadListGoodsWarehouse();
          } else {
            this.selectedCustomer = null;
            this.loadListGoodsWarehouse();
          }
        }
      );
    } else {
      this.selectedCustomer = null;
      this.loadListGoodsWarehouse();
    }
  }
  //

  async onEnterSearchGB(shipmentNumber) {
    this.bsModalRef = this.modalService.show(ShipmentDetailComponent, { class: 'inmodal animated bounceInRight modal-1000' });

    const data = await this.shipmentService.getByShipmentNumberAsync(shipmentNumber.trim());
    if (data) {
      const ladingSchedule = await this.shipmentService.getGetLadingScheduleAsync(data.id);
      if (ladingSchedule) {
        data.ladingSchedules = ladingSchedule;
      }
      this.bsModalRef.content.loadData(data, 1, true);
    }
  }
}

