import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MessageService, LazyLoadEvent } from 'primeng/primeng';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { ListGoodsService, UserService, AuthService, DepartmentService, ShipmentService, HubService, PackageService } from '../../../services';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { environment } from '../../../../environments/environment';

import * as moment from "moment";
import { SelectModel } from '../../../models/select.model';
import { User, Shipment, Hub, Package } from '../../../models';
import { ListGoods } from '../../../models/listGoods.model';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { GeneralInfoModel } from '../../../models/generalInfo.model';
import { GeneralInfoService } from '../../../services/generalInfo.service';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
import { PrintHelper } from '../../../infrastructure/printHelper';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-issue-history',
  templateUrl: './issue-history.component.html',
  styles: []
})
export class IssueHistoryComponent extends BaseComponent implements OnInit {

  // Page
  rowPerPage: number = 20;
  rowPerPage_2: number = 20;
  rowPerPage_3: number = 20;
  rowPerPage_All: number = 20;
  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.issueHistory.name;
  infoGeneral = environment;
  //

  // Calendar
  fromDate: any = moment(new Date()).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
  toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");

  public eventLog = "";
  public eventLog_2 = "";
  public eventLog_3 = "";
  //
  listTypeIssues: SelectModel[] = [{ value: 100, label: '-- Tất cả --' },
  { value: 3, label: 'Xuất kho giao hàng' },
  { value: 10, label: 'Xuất kho trả hàng' },
  { value: 8, label: 'Xuất kho trung chuyển' }];
  //

  // Tab
  isActiveTabOne: boolean = true;
  isActiveTab4: boolean = false;
  isActiveTabTwo: boolean = false;
  isActiveTabThree: boolean = false;
  isActiveTabAll: boolean = false;
  //

  // Filter
  lstUsers: SelectModel[];
  selectedUser: number;
  selectedUser_2: number;
  listgoodDataView: ListGoods = new ListGoods();

  hub: any;
  hubs: any;
  filteredHubs: any;
  selectedHub: number;

  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;
  //
  employee_All: any;
  employees_All: any;
  filteredEmployees_All: any;
  selectedEmployee_All: number;
  // Print
  itemShipment: any = [];
  idPrint: string;
  fromHub: string;
  currentUser: User;
  generalInfo: GeneralInfoModel;
  dateCreate: any;
  totalCalWeight: number;
  totalWeight: number;
  totalSumPrice: any;
  totalBox: number;
  stt: number;
  itemShipmentLAT: any;

  listShipment: Shipment[] = [];
  listPackage: Package[] = [];

  totalRecords: number = 0;
  bsModalRef: BsModalRef;
  //

  // CSV
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'ListGoodsDelivery.xlsx';
  //

  columnShipmentExport: any[] = [
    { field: 'shipmentNumber', header: 'Mã vận đơn' },
    { field: 'orderDate', header: 'Ngày tạo' },
    { field: 'senderCode', header: 'Mã KH gửi' },
    { field: 'senderName', header: 'Tên KH gửi' },
    { field: 'senderPhone', header: 'Điện thoại KH gửi' },
    { field: 'addressNoteFrom', header: 'Ghi chú đia chỉ gửi' },
    { field: 'pickingAddress', header: 'Địa chỉ gửi' },
    { field: 'fromWardName', header: 'Phường/xã gửi' },
    { field: 'fromDistrictName', header: 'Quận/huyện gửi' },
    { field: 'fromProvinceName', header: 'TỈnh/thành gửi' },
    { field: 'fromHubName', header: 'Trạm lấy hàng' },
    { field: 'ReceiverCode2', header: 'Mã KH nhận' },
    { field: 'receiverName', header: 'Tên KH nhận' },
    { field: 'receiverPhone', header: 'Điện thoại KH nhận' },
    { field: 'addressNoteTo', header: 'Ghi chú địa chỉ nhận' },
    { field: 'shippingAddress', header: 'Địa chỉ nhận' },
    { field: 'toWardName', header: 'Phường/xã nhận' },
    { field: 'toProvinceName', header: 'Quận huyện nhận' },
    { field: 'toHubName', header: 'Trạm giao hàng' },
    { field: 'cOD', header: 'Thu hộ' },
    { field: 'insured', header: 'Bảo hiểm' },
    { field: 'weight', header: 'Trọng lượng' },
    { field: 'calWeight', header: 'Trọng lượng QĐ' },
    { field: 'cusWeight', header: 'Trong lựng KH' },
    { field: 'serviceName', header: 'Dịch vụ' },
    { field: 'totalBox', header: 'Số kiện' },
    { field: 'totalItem', header: 'Số sản phẩm' },
    { field: 'structureName', header: 'Cơ cấu' },
    { field: 'defaultPrice', header: 'Cước chính' },
    { field: 'remoteAreasPrice', header: 'PPVX' },
    { field: 'priceReturn', header: 'PPXD' },
    { field: 'totalDVGT', header: 'Tông cước DVGT' },
    { field: 'totalPrice', header: 'Tổng cước vận chuyển' },
    { field: 'paymentTypeName', header: 'Hình thức thanh toán' },
    { field: 'cod', header: 'COD' },
    { field: 'priceCOD', header: 'Phí COD' },
    { field: 'paymentCODTypeName', header: 'Hình thức thanh toán phí COD' },
    { field: 'content', header: 'Nội dung hàng hóa' },
    { field: 'cusNote', header: 'Khách hàng ghi chú' },
    { field: 'note', header: 'Ghi chú nội bộ' },
    { field: 'isReturn', header: 'Chuyển hoàn' },
    { field: 'shipmentStatusName', header: 'Trang thái' },
    { field: 'realRecipientName', header: 'Người ký nhận' },
    { field: 'endDeliveryTime', header: 'Thời gian ký nhận' },
    { field: 'deliveryNote', header: 'Ghi chú giao hàng' },
    { field: 'iSPrioritize', header: 'Vận đơn ưu tiên' },
    { field: 'isIncidents', header: 'Vận đơn sự cố' },
    { field: 'fromHubNameISSUE', header: 'Mã xuất kho' },
    { field: 'listGoodsCode', header: 'Kho xuất' },
    { field: 'fromUserFullname', header: 'NV bàn giao' },
    { field: 'toUserFullname', header: 'NV nhận bàn giao' },
  ];
  // Data
  filterModel = {
    typeId: 3,
    createByHubId: null,
    fromHubId: null,
    toHubId: null,
    userId: null,
    statusId: null,
    transportTypeId: null,
    tplId: null,
    dateFrom: this.fromDate,
    dateTo: this.toDate,
    listGoodsCode: null,
    pageNumber: 1,
    pageSize: 20
  };

  filterModel_2 = {
    typeId: 8,
    createByHubId: null,
    fromHubId: null,
    toHubId: null,
    userId: null,
    statusId: null,
    transportTypeId: null,
    tplId: null,
    dateFrom: this.fromDate,
    dateTo: this.toDate,
    listGoodsCode: null,
    pageNumber: 1,
    pageSize: 20
  };

  filterModel_3 = {
    typeId: 8,
    createByHubId: null,
    fromHubId: null,
    toHubId: null,
    userId: null,
    statusId: null,
    transportTypeId: null,
    tplId: null,
    dateFrom: this.fromDate,
    dateTo: this.toDate,
    listGoodsCode: null,
    pageNumber: 1,
    pageSize: 20
  };

  filterModel_All = {
    typeId: 100,
    createByHubId: null,
    fromHubId: null,
    toHubId: null,
    userId: null,
    statusId: null,
    transportTypeId: null,
    tplId: null,
    dateFrom: this.fromDate,
    dateTo: this.toDate,
    listGoodsCode: null,
    pageNumber: 1,
    pageSize: 20
  };

  columns = [
    { field: 'code', header: '' },
    { field: 'createdWhen', header: '' },
    { field: 'fromHubName', header: '' },
    { field: 'fullName', header: '' },
    { field: 'totalShipment', header: '' },
    { field: 'totalNotReceive', header: '' },
    { field: 'delivering', header: '' },
    { field: 'deliveryComplete', header: '' },
    { field: 'deliveryFail', header: '' },
    { field: 'toHubName', header: '' }
  ];


  datasource: ListGoods[];
  lstData: ListGoods[];
  selected_lstData: ListGoods[];
  totalCount: number = 0;

  datasourceReturn: ListGoods[];
  lstDataReturn: ListGoods[];
  selected_lstDataReturn: ListGoods[];
  totalCountReturn: number = 0;

  lstData_2: ListGoods[];
  datasource_2: ListGoods[];
  selected_lstData2: ListGoods[];
  totalCount_2: number = 0;

  datasource_3: ListGoods[];
  lstData_3: ListGoods[];
  selected_lstData3: ListGoods[];
  totalCount_3: number = 0;
  event_2: LazyLoadEvent;
  event_All: LazyLoadEvent;
  event: LazyLoadEvent;
  event_3: LazyLoadEvent;
  //
  selectedListGoods: ListGoods[];
  lstData_All: ListGoods[];
  datasource_All: ListGoods[];
  totalCount_All: number = 0;
  textDate: string;
  textUser: string;
  //

  constructor(
    protected messageService: MessageService,
    private daterangepickerOptions: DaterangepickerConfig,
    private listGoodsService: ListGoodsService,
    public permissionService: PermissionService,
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private generalInfoService: GeneralInfoService,
    private departmentService: DepartmentService,
    private shipmentService: ShipmentService,
    private hubService: HubService,
    private packageSerive: PackageService,
    private modalService: BsModalService
  ) {
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
  }

  async ngOnInit() {
    await this.loadFilter();
    this.authService.getAccountInfoAsync().then(
      currentUser => {
        this.filterModel.createByHubId = currentUser.hubId;
        this.filterModel.fromHubId = currentUser.hubId;
        this.filterModel_2.createByHubId = currentUser.hubId;
        this.filterModel_2.fromHubId = currentUser.hubId;
        this.filterModel_3.toHubId = currentUser.hubId;
        this.filterModel_All.createByHubId = currentUser.hubId;
        this.loadData();
      });
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  //#region Tab 1
  refresh() {
    // this.filterModel.userId = null;
    // this.filterModel.dateFrom = this.fromDate;
    // this.filterModel.dateTo = this.toDate;
    // this.filterModel.listGoodsCode = null;
    this.loadData();
  }

  // Load data
  async loadData() {
    this.datasource = await this.listGoodsService.getListGoodsAsync(this.filterModel.typeId, this.filterModel.createByHubId, this.filterModel.fromHubId, this.filterModel.toHubId, this.filterModel.userId, this.filterModel.statusId, this.filterModel.transportTypeId, this.filterModel.tplId, this.filterModel.dateFrom, this.filterModel.dateTo, this.filterModel.listGoodsCode);
    if (this.datasource) {
      this.lstData = this.datasource.slice(0, this.rowPerPage);
      this.totalCount = this.datasource.length;
    }
    // 
    this.datasourceReturn = await this.listGoodsService.getListGoodsAsync(ListGoodsTypeHelper.detailReturn, this.filterModel.createByHubId, this.filterModel.fromHubId, this.filterModel.toHubId, this.filterModel.userId, this.filterModel.statusId, this.filterModel.transportTypeId, this.filterModel.tplId, this.filterModel.dateFrom, this.filterModel.dateTo, this.filterModel.listGoodsCode);
    if (this.datasourceReturn) {
      this.lstDataReturn = this.datasourceReturn.slice(0, this.rowPerPage);
      this.totalCountReturn = this.datasourceReturn.length;
    }
  }

  async exportTabOneDetail() {
    let clone = Object.assign({}, this.filterModel);
    clone.pageSize = 300;
    let fileName = "LICH_SU_XUAT_KHO_GIAO.xlsx";
    let data: any[] = [];
    data = await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailDelivery, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
      clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, '');
    if (data && data.length > 0) {
      if (data[0].totalCount > clone.pageSize) {
        let count = Math.ceil(data[0].totalCount / clone.pageSize);
        let promise = [];

        for (let i = 2; i <= count; i++) {
          clone.pageNumber = i;
          promise.push(await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailDelivery, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
            clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, ''));
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x.data);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      } else {
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }
  //
  async exportExcelReturn() {
    let clone = Object.assign({}, this.filterModel);
    clone.pageSize = 300;
    let fileName = "LICH_SU_XUAT_KHO_TRA.xlsx";
    let data: any[] = [];
    data = await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailReturn, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
      clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, '');
    if (data && data.length > 0) {
      if (data[0].totalCount > clone.pageSize) {
        let count = Math.ceil(data[0].totalCount / clone.pageSize);
        let promise = [];

        for (let i = 2; i <= count; i++) {
          clone.pageNumber = i;
          promise.push(await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailReturn, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
            clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, ''));
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x.data);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      } else {
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }
  //
  async exportExcelTransfer() {
    let clone = Object.assign({}, this.filterModel_2);
    clone.pageSize = 300;
    let fileName = "LICH_SU_XUAT_KHO_TRUNG_CHUYEN.xlsx";
    let data: any[] = [];
    data = await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailTranfer, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
      clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, '');
    if (data && data.length > 0) {
      if (data[0].totalCount > clone.pageSize) {
        let count = Math.ceil(data[0].totalCount / clone.pageSize);
        let promise = [];

        for (let i = 2; i <= count; i++) {
          clone.pageNumber = i;
          promise.push(await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailTranfer, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
            clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, ''));
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x.data);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      } else {
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }

  async exportExcelAll() {
    let clone = Object.assign({}, this.filterModel_All);
    clone.pageSize = 300;
    let fileName = "LICH_SU_XUAT_KHO.xlsx";
    let data: any[] = [];
    var listIds: any = '';
    if (this.selectedListGoods && this.selectedListGoods.length > 0) {
      listIds = this.selectedListGoods.map(m => m.id).join(',');
    }
    data = await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailIssueAll, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
      clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, listIds);
    if (data && data.length > 0) {
      if (data[0].totalCount > clone.pageSize) {
        let count = Math.ceil(data[0].totalCount / clone.pageSize);
        let promise = [];

        for (let i = 2; i <= count; i++) {
          clone.pageNumber = i;
          promise.push(await this.listGoodsService.getListGoodsDetailAsync(ListGoodsTypeHelper.detailIssueAll, clone.createByHubId, clone.fromHubId, clone.toHubId, clone.userId, clone.statusId, clone.transportTypeId, clone.tplId,
            clone.dateFrom, clone.dateTo, clone.listGoodsCode, clone.pageNumber, clone.pageSize, listIds));
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x.data);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      } else {
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnShipmentExport, false, false);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }

  async exportExcelDetail() {

    let columnShipment: any[] = [
      { field: 'shipmentNumber', header: 'Mã vận đơn' },
      { field: 'orderDate', header: 'Ngày tạo' },
      { field: 'sender', child: true, childName: "code", header: 'Mã KH gửi' },
      { field: 'senderName', header: 'Tên KH gửi' },
      { field: 'senderPhone', header: 'Điện thoại KH gửi' },
      { field: 'addressNoteFrom', header: 'Ghi chú đia chỉ gửi' },
      { field: 'pickingAddress', header: 'Địa chỉ gửi' },
      { field: 'fromWard', child: true, header: 'Phường/xã gửi' },
      { field: 'fromDistrict', child: true, header: 'Quận/huyện gửi' },
      { field: 'fromProvince', child: true, header: 'TỈnh/thành gửi' },
      { field: 'fromHub', child: true, header: 'Trạm lấy hàng' },
      { field: 'receiverCode2', header: 'Mã KH nhận' },
      { field: 'receiverName', header: 'Tên KH nhận' },
      { field: 'receiverPhone', header: 'Điện thoại KH nhận' },
      { field: 'addressNoteTo', header: 'Ghi chú địa chỉ nhận' },
      { field: 'shippingAddress', header: 'Địa chỉ nhận' },
      { field: 'toWard', child: true, header: 'Phường/xã nhận' },
      { field: 'toProvince', child: true, header: 'Quận huyện nhận' },
      { field: 'toHub', child: true, header: 'Trạm giao hàng' },
      { field: 'cod', header: 'Thu hộ' },
      { field: 'insured', header: 'Bảo hiểm' },
      { field: 'weight', header: 'Trọng lượng' },
      { field: 'calWeight', header: 'Trọng lượng QĐ' },
      { field: 'cusWeight', header: 'Trong lựng KH' },
      { field: 'service', child: true, header: 'Dịch vụ' },
      { field: 'totalBox', header: 'Số kiện' },
      { field: 'totalItem', header: 'Số sản phẩm' },
      { field: 'structure', child: true, header: 'Cơ cấu' },
      { field: 'defaultPrice', header: 'Cước chính' },
      { field: 'remoteAreasPrice', header: 'PPVX' },
      { field: 'priceReturn', header: 'PPXD' },
      { field: 'totalDVGT', header: 'Tông cước DVGT' },
      { field: 'totalPrice', header: 'Tổng cước vận chuyển' },
      { field: 'paymentType', child: true, header: 'Hình thức thanh toán' },
      { field: 'cod', header: 'COD' },
      { field: 'priceCOD', header: 'Phí COD' },
      { field: 'paymentCODType', child: true, header: 'Hình thức thanh toán phí COD' },
      { field: 'sumPayPriceCOD', header: 'Tổng phải thu khi phát hàng' },
      { field: 'content', header: 'Nội dung hàng hóa' },
      { field: 'cusNote', header: 'Khách hàng ghi chú' },
      { field: 'note', header: 'Ghi chú nội bộ' },
      { field: 'isReturn', header: 'Chuyển hoàn' },
      { field: 'shipmentStatus', child: true, header: 'Trang thái' },
      { field: 'realRecipientName', header: 'Người ký nhận' },
      { field: 'endDeliveryTime', header: 'Thời gian ký nhận' },
      { field: 'deliveryNote', header: 'Ghi chú giao hàng' },
      { field: 'iSPrioritize', header: 'Vận đơn ưu tiên' },
      { field: 'isIncidents', header: 'Vận đơn sự cố' },
      { data: this.listgoodDataView.code, header: 'Mã xuất kho' },
      { data: this.listgoodDataView.fromHub.name, header: 'Kho xuất' },
      { data: this.listgoodDataView.createdByUser.fullName, header: 'NV bàn giao' },
      { data: this.listgoodDataView.emp.fullName, header: 'NV nhận bàn giao' },
    ];
    let fileName = "CHI_TIET_BANG_KE.xlsx";
    let data: any[] = [];
    if (this.listShipment && this.listShipment.length > 0) {
      // let promise = [];
      this.listShipment.map(m => {
        m.sumPayPriceCOD = 0;
        if (m.paymentTypeId == 1) m.sumPayPriceCOD += m.totalPrice;
        if (m.cod && !m.isReturn && !m.isCreditTransfer && !m.isCreatedChild) {
          m.sumPayPriceCOD += m.cod;
          if (m.paymentCODTypeId == 2) m.sumPayPriceCOD += m.priceCOD;
        }
        data.push(m);
      });
      // Promise.all(promise).then(rs => {
      //   rs.map(x => {
      //     data = data.concat(x.data);
      //   })
      let dataE = data.reverse();
      var dataEX = ExportAnglar5CSV.ExportData(dataE, columnShipment, false, false);
      ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      // });
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.lstData = filterRows.slice(event.first, (event.first + event.rows));
        this.totalCount = filterRows.length;
      }
    }, 250);
  }

  // Load filter
  async loadFilter() {
    this.loadUser();
    this.loadCurrentUser();
    this.loadGeneralInfo();
    await this.getCurrentHub();
  }

  async loadUser() {
    this.lstUsers = await this.userService.getSelectModelAllUserByCurrentHubAsync();
  }

  async getCurrentHub() {
    let res = await this.authService.getAccountInfoAsync();
    // this.filterModel.createByHubId = res.hubId;
    // this.filterModel.fromHubId = res.hubId;

    this.filterModel_2.createByHubId = res.hubId;
    this.filterModel_2.fromHubId = res.hubId;
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];

    await this.userService.getAsync(this.authService.getUserId(), cols).then(x => {
      if (!x) return;
      this.currentUser = x as User;
      this.fromHub = this.currentUser.hub.name;
    });
  }

  //

  // Calendar
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate() {
    this.filterModel.dateFrom = SearchDate.formatToISODate(moment(this.filterModel.dateFrom).toDate());
    this.filterModel.dateTo = SearchDate.formatToISODate(moment(this.filterModel.dateTo).toDate());
    this.loadData();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
  //
  //#endregion

  //#region Tab 2
  // Load data
  async loadData_2() {
    // this.lstData_2 = await this.listGoodsService.getListGoodsAsync(this.filterModel_2.typeId, this.filterModel_2.createByHubId, this.filterModel_2.fromHubId, this.filterModel_2.toHubId, this.filterModel_2.userId, this.filterModel_2.statusId, this.filterModel_2.transportTypeId, this.filterModel_2.tplId, this.filterModel_2.dateFrom, this.filterModel_2.dateTo, this.filterModel_2.listGoodsCode);
    // this.totalCount_2 = this.lstData_2.length;
    this.datasource_2 = await this.listGoodsService.getListGoodsAsync(this.filterModel_2.typeId, this.filterModel_2.createByHubId, this.filterModel_2.fromHubId, this.filterModel_2.toHubId, this.filterModel_2.userId, this.filterModel_2.statusId, this.filterModel_2.transportTypeId, this.filterModel_2.tplId, this.filterModel_2.dateFrom, this.filterModel_2.dateTo, this.filterModel_2.listGoodsCode);

    if (this.datasource_2) {
      this.lstData_2 = this.datasource_2.slice(0, this.rowPerPage_2);
      this.totalCount_2 = this.datasource_2.length;
    }
  }

  async loadData_All() {
    // this.lstData_2 = await this.listGoodsService.getListGoodsAsync(this.filterModel_2.typeId, this.filterModel_2.createByHubId, this.filterModel_2.fromHubId, this.filterModel_2.toHubId, this.filterModel_2.userId, this.filterModel_2.statusId, this.filterModel_2.transportTypeId, this.filterModel_2.tplId, this.filterModel_2.dateFrom, this.filterModel_2.dateTo, this.filterModel_2.listGoodsCode);
    // this.totalCount_2 = this.lstData_2.length;
    this.datasource_All = await this.listGoodsService.getListGoodsAsync(this.filterModel_All.typeId, this.filterModel_All.createByHubId, this.filterModel_All.fromHubId, this.filterModel_All.toHubId, this.filterModel_2.userId, this.filterModel_All.statusId, this.filterModel_All.transportTypeId, this.filterModel_All.tplId, this.filterModel_All.dateFrom, this.filterModel_All.dateTo, this.filterModel_All.listGoodsCode);

    if (this.datasource_All) {
      this.lstData_All = this.datasource_All.slice(0, this.rowPerPage_All);
      this.totalCount_All = this.datasource_All.length;
    }
  }

  loadLazy_2(event: LazyLoadEvent) {
    this.event_2 = event;
    setTimeout(() => {
      if (this.datasource_2) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasource_2.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource_2.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.lstData_2 = filterRows.slice(event.first, (event.first + event.rows));
        this.totalCount_2 = filterRows.length;
      }
    }, 250);
  }

  loadLazy_All(event: LazyLoadEvent) {
    this.event_All = event;
    setTimeout(() => {
      if (this.datasource_All) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasource_All.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource_All.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.lstData_All = filterRows.slice(event.first, (event.first + event.rows));
        this.totalCount_All = filterRows.length;
      }
    }, 250);
  }

  // Calendar
  public mainInput_2 = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate_2() {
    this.filterModel_2.dateFrom = SearchDate.formatToISODate(moment(this.filterModel_2.dateFrom).toDate());
    this.filterModel_2.dateTo = SearchDate.formatToISODate(moment(this.filterModel_2.dateTo).toDate());
    this.loadData_2();
  }

  public selectedDate_All() {
    this.filterModel_All.dateFrom = SearchDate.formatToISODate(moment(this.filterModel_All.dateFrom).toDate());
    this.filterModel_All.dateTo = SearchDate.formatToISODate(moment(this.filterModel_All.dateTo).toDate());
    this.loadData_All();
  }

  public calendarEventsHandler_2(e: any) {
    this.eventLog_2 += "\nEvent Fired: " + e.event.type;
  }
  //
  //#endregion


  //#region Tab 3
  // Load data
  async loadData_3() {
    // this.lstData_3 = await this.listGoodsService.getListGoodsAsync(this.filterModel_3.typeId, this.filterModel_3.createByHubId, this.filterModel_3.fromHubId, this.filterModel_3.toHubId, this.filterModel_2.userId, this.filterModel_3.statusId, this.filterModel_3.transportTypeId, this.filterModel_3.tplId, this.filterModel_3.dateFrom, this.filterModel_3.dateTo, this.filterModel_3.listGoodsCode);
    // this.totalCount_3 = this.lstData_3.length;

    this.datasource_3 = await this.listGoodsService.getListGoodsAsync(this.filterModel_3.typeId, this.filterModel_3.createByHubId, this.filterModel_3.fromHubId, this.filterModel_3.toHubId, this.filterModel_3.userId, this.filterModel_3.statusId, this.filterModel_3.transportTypeId, this.filterModel_3.tplId, this.filterModel_3.dateFrom, this.filterModel_3.dateTo, this.filterModel_3.listGoodsCode);

    if (this.datasource_3) {
      this.lstData_3 = this.datasource_3.slice(0, this.rowPerPage_3);
      this.totalCount_3 = this.datasource_3.length;
    }
  }

  loadLazy_3(event: LazyLoadEvent) {
    this.event_3 = event;
    setTimeout(() => {
      if (this.datasource_3) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasource_3.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource_3.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.lstData_3 = filterRows.slice(event.first, (event.first + event.rows));
        this.totalCount_3 = filterRows.length;
      }
    }, 250);
  }

  // Calendar
  public mainInput_3 = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate_3() {
    this.filterModel_3.dateFrom = SearchDate.formatToISODate(moment(this.filterModel_3.dateFrom).toDate());
    this.filterModel_3.dateTo = SearchDate.formatToISODate(moment(this.filterModel_3.dateTo).toDate());
    this.loadData_3();
  }

  public calendarEventsHandler_3(e: any) {
    this.eventLog_3 += "\nEvent Fired: " + e.event.type;
  }
  //
  //#endregion


  //#region Print
  async onGetListGoodsId(data: ListGoods, isPrintDetail: boolean): Promise<Shipment[]> {
    const shipments = await this.getShipmentByListGoodsId(data);
    if (shipments) {
      this.itemShipment = [...shipments];
      if (isPrintDetail) {
        const deliveryAndHubRouting = await this.shipmentService.getDeliveryAndHubRoutingAsync(data.id);
        if (deliveryAndHubRouting) {
          this.itemShipment.printDetail = [...deliveryAndHubRouting];
        }
      }
      let cols = ["ToHub", "FromHub", "FromDistrict", "ToDistrict", "Emp", "Emp.Department", "CreatedByUser", "CreatedByUser.Department", "ListGoodsType"];
      let listgood = await this.listGoodsService.getAsync(data.id, cols);
      this.listgoodDataView = listgood.data as ListGoods;
      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName;
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
      this.itemShipment.isPrintDetail = isPrintDetail;

      if (listgood.data.listGoodsType) {
        this.itemShipment.namePrintLabel = listgood.data.listGoodsType.name;
        this.itemShipment.listGoodsTypeId = listgood.data.listGoodsType.id;
      }

      if (listgood.data.toHub) {
        this.itemShipment.toHubName = listgood.data.toHub.name;
      }

      if (listgood.data.emp) {
        this.itemShipment.emp = listgood.data.emp;
        this.itemShipment.currentEmp = listgood.data.emp.fullName;
        if (listgood.data.emp.hub) this.itemShipment.empHubName = listgood.data.emp.hub.name;
        if (listgood.data.emp.department) this.itemShipment.empDepartmentName = listgood.data.emp.department.name;
      }

      if (listgood.data.createdByUser) {
        this.itemShipment.createdBy = listgood.data.createdByUser.fullName;
        if (listgood.data.createdByUser.hub) this.itemShipment.userHubName = listgood.data.createdByUser.hub.name;
        if (listgood.data.createdByUser.department) this.itemShipment.userDepartmentName = listgood.data.createdByUser.department.name;
      }

      if (data.listGoodsType)
        this.itemShipment.type = data.listGoodsType.name;

      this.itemShipment.listGoods = data.code;
      this.itemShipment.note = listgood.data.note;
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;

      this.itemShipment.totalCOD = 0;
      this.itemShipment.totalPrice = 0;
      this.itemShipment.totalPriceAll = 0;

      await Promise.all(this.itemShipment.map(async (item, index) => {

        this.itemShipment.totalCOD += item.cod;
        this.itemShipment.totalPrice += ((item.paymentTypeId == 1 ? item.totalPrice : 0) + (item.paymentCODTypeId ? item.totalPriceCOD : 0));
        this.itemShipment.totalPriceAll += (this.itemShipment.totalCOD + this.itemShipment.totalPrice);

        this.itemShipment[index].totalPriceAll = item.cod + ((item.paymentTypeId == 1 ? item.totalPrice : 0) + (item.paymentCODTypeId ? item.totalPriceCOD : 0));

        if (item.currentEmp) {
          if (item.currentEmp.departmentId) {
            const id = item.currentEmp.departmentId;
            const data = await this.departmentService.getDepartmentAsync(id);
            this.itemShipment.empDepartmentName = data.name;
          }
        }

        if (item.transferUser) {
          this.itemShipment.transferUserFullName = item.transferUser.fullName;
        }

        this.stt = index + 1;
        this.itemShipment[index].stt = this.stt;
        this.totalWeight += this.itemShipment[index].weight;
        this.itemShipment.totalWeight = this.totalWeight;
        if (this.itemShipment[index].calWeight) {
          this.totalCalWeight += this.itemShipment[index].calWeight;
          this.itemShipment.totalCalWeight = this.totalCalWeight;
        }
        if (
          !this.itemShipment[index].totalBox ||
          this.itemShipment[index].totalBox === 0
        ) {
          this.itemShipment[index].totalBox = 1;
        }
        this.totalBox += this.itemShipment[index].totalBox;
        this.itemShipment.totalBox = this.totalBox;
        if (item.paymentTypeId !== PaymentTypeHelper.NNTTN) {
          item.cod = item.cod ? item.cod : 0;
          this.itemShipment[index].sumPrice = item.cod;
        } else {
          item.cod = item.cod ? item.cod : 0;
          item.totalPrice = item.totalPrice ? item.totalPrice : 0;
          this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
        }
        this.itemShipment[index].sumPrice = this.itemShipment[index].sumPrice ? this.itemShipment[index].sumPrice : 0;
        this.totalSumPrice += this.itemShipment[index].sumPrice;
        this.itemShipment.totalSumPrice = this.totalSumPrice;

        this.itemShipment[index].fakeId =
          "id" + shipments[index].id;
        const time = new Date();
        this.itemShipment.getFullYear = time.getFullYear();
        if (isPrintDetail && item.toHubRoutingId && this.itemShipment.printDetail) {
          let fintPrintDetail = this.itemShipment.printDetail.find(f => f.listHubRoutingIds.split(',').findIndex(f => f == item.toHubRoutingId) >= 0);
          if (fintPrintDetail) {
            if (!fintPrintDetail.data) fintPrintDetail.data = [];
            if (!fintPrintDetail.totalBox) fintPrintDetail.totalBox = 0;
            fintPrintDetail.data.push(this.itemShipment[index]);
            if (this.itemShipment[index].totalBox) fintPrintDetail.totalBox += this.itemShipment[index].totalBox;
          }
        }
      }));
      return this.itemShipment;
    }
  }

  async getShipmentByListGoodsId(data: ListGoods): Promise<Shipment[]> {
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
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    const shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes, true);
    if (shipments) {
      return shipments;
    }
  }
  //

  // Print LAD
  async printLAD(data: ListGoods, isPrintBareCode: boolean, isPrintDetail: boolean) {
    this.itemShipment = await this.onGetListGoodsId(data, isPrintDetail);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailDelivery;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
      }, 0);

      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 100);
    }
  }

  // Print Signature
  async printSignature(data: ListGoods, isPrintBareCode: boolean, isPrintDetail: boolean) {
    this.itemShipment = await this.onGetListGoodsId(data, isPrintDetail);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = PrintHelper.printSignature;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
      }, 0);

      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 100);
    }
  }

  // Print LAT
  async printLAT(rowData: ListGoods, isPrintDetail: boolean) {
    this.itemShipmentLAT = await this.onGetListGoodsId(rowData, isPrintDetail);
    //pack
    let filterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    filterViewModel.listGoodsId = rowData.id;
    filterViewModel.PageNumber = 1;
    filterViewModel.PageSize = 50;
    this.itemShipmentLAT.selectedPackage = await this.loadListPackage(filterViewModel);
    await Promise.all(this.itemShipmentLAT.selectedPackage.map(async (item, index) => {
      this.itemShipmentLAT.selectedPackage[index].fakeId = "pack" + item.id;
    }));
    //
    if (this.itemShipmentLAT) {
      setTimeout(async () => {
        this.itemShipmentLAT.isPrintBareCode = true;
        this.idPrint = ListGoodsTypeHelper.printDetailTranfer;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(this.itemShipmentLAT);
        }, 500);
      }, 0);
    }
  }
  //#endregion

  //#region CSV
  async exportCSVShipment(data: ListGoods) {
    const shipments = await this.getShipmentByListGoodsId(data);
    const listGoodsCode = data.code;
    if (shipments) {
      let data: any[] = [];
      data.push([
        'Mã bảng kê',
        'Mã vận đơn',
        'Ngày tạo',
        'Khách hàng gửi',
        'Số kiện',
        'Số Kg',
        'Địa chỉ gaio',
        'Tên người nhận',
        'Tên người nhận thực tế',
        'Ngày giờ giao thực tế',
      ]);

      shipments.map((shipment) => {
        let ship = Object.assign({}, shipment);
        ship.orderDate = SearchDate.formatDate(shipment.orderDate);
        ship.endDeliveryTime = SearchDate.formatDate(shipment.endDeliveryTime);
        data.push([
          listGoodsCode,
          ship.shipmentNumber,
          ship.orderDate,
          ship.senderName,
          ship.totalBox,
          ship.weight / 1000,
          ship.shippingAddress,
          ship.receiverName,
          ship.realRecipientName,
          ship.endDeliveryTime
        ]);
      });

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      const wbout: string = XLSX.write(wb, this.wopts);
      saveAs(new Blob([InputValue.s2ab(wbout)]), this.fileName);
    }
  }
  //#endregion

  //filter Hub
  async filterHub(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null)
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
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.hubs.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel_2.toHubId = x.value;
          this.loadData_2();
        }
      }
    });
  }

  onSelectedHub_All() {
    let cloneSelectedUser = this.hub;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.hubs.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel_All.toHubId = x.value;
          this.loadData_All();
        }
      }
    });
  }

  onSelectedHub_3() {
    let cloneSelectedUser = this.hub;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.hubs.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel_3.createByHubId = x.value;
          this.filterModel_3.fromHubId = x.value;
          this.loadData_3();
        }
      }
    });
  }

  //

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      Promise.all(data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      }));
      this.employees.push({ value: null, label: `-- Tất cả --`, data: null })
      this.filteredEmployees.push(`-- Tất cả --`);
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.userId = x.value;
          this.loadData();
        }
      }
    });
  }

  // filter Employee
  async filterEmployee_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      Promise.all(data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m });
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      }));
      this.employees_2.push({ value: null, label: '-- Tất cả --', data: null });
      this.filteredEmployees_2.push('-- Tất cả --');
    }
  }

  // filter Employee
  async filterEmployee_All(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_All = [];
      this.filteredEmployees_All = [];
      let data = (x as User[]);
      Promise.all(data.map(m => {
        this.employees_All.push({ value: m.id, label: `${m.code} ${m.name}`, data: m });
        this.filteredEmployees_All.push(`${m.code} ${m.name}`);
      }));
      this.employees_All.push({ value: null, label: '-- Tất cả --', data: null });
      this.filteredEmployees_All.push('-- Tất cả --');
    }
  }

  onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;

    this.employees_2.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel_2.userId = x.value;
          this.loadData_2();
        }
      }
    });
  }

  onSelectedEmployee_All() {
    let cloneSelectedUser = this.employee_All;
    this.employees_All.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel_All.userId = x.value;
          this.loadData_All();
        }
      }
    });
  }

  onSelectedEmployee_3() {
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
          this.filterModel_3.userId = x.value;
          this.loadData_3();
        }
      }
    });
  }

  refreshSelectUser() {

  }
  //
  async loadListPackage(filterViewModel?: ShipmentFilterViewModel) {
    let datas = await this.packageSerive.getListPackageByAsync(filterViewModel);
    return datas;
  }

  async viewShipment(template: TemplateRef<any>, data) {
    this.listShipment = await this.onGetListGoodsId(data, false);
    let filterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    filterViewModel.listGoodsId = data.id;
    filterViewModel.PageNumber = 1;
    filterViewModel.PageSize = 50;
    this.listPackage = await this.loadListPackage(filterViewModel);
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-1000"
    });
  }

  unBlock(data: ListGoods) {
    this.listGoodsService.unBlock(data.id).subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Mở khóa Bảng kê thành công!' });
        data.isBlock = false;
      }
    );
  }
  async exportExcelFormat() {
    let columnShipment: any[] = [
      { field: "rowNum", header: 'STT', typeFormat: "number", IsNO: true },
      { field: 'shipmentNumber', header: 'Mã vận đơn', typeFormat: "string" },
      { field: 'currentEmp', child: true, childName: 'code', header: 'Mã nv thao tác cuối', typeFormat: "string" },
      { field: 'currentEmp', child: true, childName: 'fullName', header: 'NV thao tác cuối', typeFormat: "string" },
      { field: 'shipmentStatus', child: true, childName: 'name', header: 'Trạng thái', typeFormat: "string" },
      { field: 'endPickTime', header: 'Ngày nhập kho lấy hàng', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
      { field: 'inOutDate', header: 'Ngầy xuất nhập/cuối', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
      { field: 'endDeliveryTime', header: 'Thời gian giao hàng thành công', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
      { field: 'timeCompareString', header: 'Thời gian', isCompareTime: true, fieldStart: 'inOutDate', fieldEnd: 'endDeliveryTime' },
      { field: 'receiverName', header: 'Tên người nhận', typeFormat: "string" },
      { field: 'shippingAddress', header: 'Địa chỉ nhận', typeFormat: "string" },
      { field: 'cod', header: 'COD', typeFormat: "number" },
      { field: 'handNote', header: 'Ghi chú' },
    ];

    let clone = Object.assign({}, this.filterModel);
    clone.pageSize = 300;
    let fileName = "BAO_CAO_GIAO_HANG.xlsx";
    let data: any[] = [];
    const ids = [];
    const fullNames = [];
    if (this.isActiveTabOne) {
      this.selected_lstData.map(m => {
        ids.push(m.id);
        const find = fullNames.find(f => f === m.fullName);
        if (!find) {
          fullNames.push(m.fullName);
        }
      })
    }
    if (this.isActiveTab4) {
      this.selected_lstDataReturn.map(m => {
        ids.push(m.id);
        const find = fullNames.find(f => f === m.fullName);
        if (!find) {
          fullNames.push(m.fullName);
        }
      })
    }
    if (this.isActiveTabTwo) {
      this.selected_lstData2.map(m => {
        ids.push(m.id);
        const find = fullNames.find(f => f === m.fullName);
        if (!find) {
          fullNames.push(m.fullName);
        }
      })
    }
    if (this.isActiveTabThree) {
      this.selected_lstData3.map(m => {
        ids.push(m.id);
        const find = fullNames.find(f => f === m.fullName);
        if (!find) {
          fullNames.push(m.fullName);
        }
      })
    }
    if (this.isActiveTabAll) {
      this.selectedListGoods.map(m => {
        ids.push(m.id);
        const find = fullNames.find(f => f === m.fullName);
        if (!find) {
          fullNames.push(m.fullName);
        }
      })
    }
    let cols = ['CurrentEmp', 'ShipmentStatus'];
    data = await this.shipmentService.getByListGoodsIdsAsync(ids, cols);
    if (data && data.length > 0) {
      if (data[0].totalCount > clone.pageSize) {
        let count = Math.ceil(data[0].totalCount / clone.pageSize);
        let promise = [];

        for (let i = 2; i <= count; i++) {
          clone.pageNumber = i;
          promise.push(await this.shipmentService.getByListGoodsIdsAsync(ids, cols));
        }
        Promise.all(promise).then(rs => {
          rs.map(x => {
            data = data.concat(x.data);
          })
          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, columnShipment, false, false, ExportAnglar5CSV.issueHistory);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      } else {
        if (fullNames.length === 1) {
          data['fullNames'] = fullNames;
        }
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, columnShipment, false, false, ExportAnglar5CSV.issueHistory);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  } 
  async exportExcelTPL(){
    let columnShipment: any[] = [
      { field: "#",fieldHeader: '#', header: 'STT', typeFormat: "number", IsNO: true },
      { field: 'null',fieldHeader: 'shipment_number', header: 'Mã vận đơn', typeFormat: "string" },
      { field: 'cusCodeTo',fieldHeader: 'cus_code_to', child: true, childName: 'code', header: 'Mã khách nhận', typeFormat: "string" },
      { field: 'nameTo',fieldHeader: 'name_to', header: 'Tên người nhận', typeFormat: "string" },
      { field: 'phoneTo',fieldHeader: 'phone_to', header: 'Điện thoại nhận', typeFormat: "string" },
      { field: 'addressTo',fieldHeader: 'address_to', header: 'Địa chỉ nhận', typeFormat: "string" },
      { field: 'addressNoteTo',fieldHeader: 'address_note_to', header: 'Địa chỉ chi tiết', typeFormat: "string" },
      { field: 'companyTo',fieldHeader: 'company_To', header: 'Tên công ty', typeFormat: "string" },
      { field: 'shipmentNumber',fieldHeader: 'shop_code', header: 'Mã vận đơn KH', typeFormat: "string" },
      { field: 'cod',fieldHeader: 'cod', header: 'COD', typeFormat: "number" },
      { field: 'insured',fieldHeader: 'insured', header: 'Khai giá', typeFormat: "number" },
      { field: 'totalBox',fieldHeader: 'box', header: 'Số kiện', typeFormat: "number" },
      { field: 'weight',fieldHeader: 'weight', header: 'Trọng lượng', typeFormat: "number" },
      { field: 'service',fieldHeader: 'service',  child: true, childName: 'name', header: 'Dịch vụ', typeFormat: "string" },
      { field: 'typePay',fieldHeader: 'type_Pay',  child: true, childName: 'code', header: 'Thanh toán', typeFormat: "string" },
      { field: 'content',fieldHeader: 'content', header: 'Nội dung', typeFormat: "number" },
      { field: 'note',fieldHeader: 'note', header: 'Ghi chú', typeFormat: "number" }, 
    ];

    let clone = Object.assign({}, this.filterModel);
    clone.pageSize = 300;
    let fileName = "BAO_CAO_GIAO_HANG_DOI_TAC.xlsx";
    let data: any[] = [];
    const ids = [];
    const fullNames = [];
    if (this.isActiveTabOne) {
      this.selected_lstData.map(m => {
        ids.push(m.id); 
      })
    }
    if (this.isActiveTab4) {
      this.selected_lstDataReturn.map(m => {
        ids.push(m.id); 
      })
    }
    if (this.isActiveTabTwo) {
      this.selected_lstData2.map(m => {
        ids.push(m.id); 
      })
    }
    if (this.isActiveTabThree) {
      this.selected_lstData3.map(m => {
        ids.push(m.id); 
      })
    }
    if (this.isActiveTabAll) {
      this.selectedListGoods.map(m => {
        ids.push(m.id); 
      })
    }
    let cols = ['Service', 'ShipmentStatus','PaymentType'];
    data = await this.shipmentService.getByListGoodsIdsAsync(ids, cols);
    if (data && data.length > 0) {
        let dataE = data.reverse();
        var dataEX = ExportAnglar5CSV.ExportData(dataE, columnShipment, false, false,null,true);
        ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
      
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dữ liệu' });
    }
  }
  async PrintFormat(data) {
    let arr;  
    let delivery_succes = 0;
    let delivery_fail = 0;
    let total_payed = 0;
    let total_notpay = 0;
    let ids = [];
    data.forEach(element => {
        ids.push(element.id);
    });
    await this.shipmentService.getByListGoodsIdsAsync(ids,
      ["PaymentType", "ShipmentStatus", "CurrentEmp"]).then(x => {
        if (!x) return;
        x.forEach(m => {
          if (m.shipmentStatusId == 12) {
            delivery_succes++;
            if (m.cod)
              total_payed = total_payed + m.cod;
          }
          else if (m.shipmentStatusId == 13 || m.shipmentStatusId == 62) {
                if (m.cod)
                  total_notpay = total_notpay + m.cod;
                delivery_fail++;
              }
          if (m.endDeliveryTime && m.inOutDate) {
            const diffInMs = Date.parse(m.endDeliveryTime) - Date.parse(m.inOutDate);
            if (diffInMs > 0) {
                const diffInMinutes = diffInMs / 1000 / 60;
                m.timeCompareString = Math.round(diffInMinutes / 60) + ':' + Math.round(diffInMinutes % 60)
            } else m.timeCompareString = "";
          }
          arr = x;
        }); 
        setTimeout(() => {
          arr['printName'] = "Báo Cáo Chi Tiết Giao Hàng";
          arr['deliverysucces'] = delivery_succes;
          arr['deliveryfail'] = delivery_fail;
          arr['total_payed'] = total_payed;
          arr['total_notpay'] = total_notpay;
          this.printFrormServiceInstance.sendCustomEvent(arr);
        }, 100);
      });
    this.idPrint = PrintHelper.printreportdelivery;
  }
}