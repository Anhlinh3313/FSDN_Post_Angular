import { Component, OnInit, TemplateRef, ElementRef, ViewChild } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { SelectModel } from '../../../models/select.model';
import { ListGoods } from '../../../models/listGoods.model';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { UserService, ShipmentService, ListGoodsService, DepartmentService, AuthService } from '../../../services';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { Shipment, User } from '../../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { AssignShipmentWarehousing } from '../../../models/assignShipmentWarehousing.model';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { environment } from '../../../../environments/environment';
import { SortUtil } from '../../../infrastructure/sort.util';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { SoundHelper } from '../../../infrastructure/sound.helper';
import { IdModel } from '../../../view-model/id.model';
import { Truck } from '../../../models/truck.model';
import { TruckService } from '../../../services/truck.service';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { GeneralInfoModel } from '../../../models/generalInfo.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
import { GeneralInfoService } from '../../../services/generalInfo.service';
type AOA = Array<Array<any>>;

@Component({
  selector: "app-delivery-issue",
  templateUrl: "delivery-issue.component.html"
})
export class DeliveryIssueComponent extends BaseComponent implements OnInit {
  totalBoxsRight: number = 0;
  totalBoxsLeft: number = 0;

  //#region  param
  @ViewChild("txtUnAssignShipment") txtShipmentRefRight: ElementRef;
  @ViewChild("txtShipmentNumberIssue") txtShipmentNumberIssueRef: ElementRef;
  unAssignShipment: string;
  unit = environment.unit;
  hub = environment;
  bsModalRef: BsModalRef;
  //
  selectedData: Shipment[] = [];
  datasource: Shipment[] = [];
  pageSizeLeft: number = this.hub.pageSize;
  pageNumberLeft: number = 1;
  totalRecordLeft: number = 0;
  firstLeft: number = 0;
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  typeIssues: SelectItem[] = [
    { value: 3050, label: '-- Tất cả --' }, 
    // { value: 5, label: 'Hàng giao' }, 
    { value: 3051, label: 'Hàng giao mới' }, 
    { value: 3052, label: 'Hàng giao lại' }, 
    { value: 3, label: 'Hàng hỗ trợ' },
  ]
  //
  datasourceRightClient: Shipment[] = [];
  pageSizeRight: number = this.hub.pageSize;
  pageNumberRight: number = 1;
  totalRecordRight: number = 0;
  firstRight: number = 0;
  shipmentFilterViewModelRight: IdModel = new IdModel();
  //
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string = Constant.pages.deliveryManagement.children.deliveryIssue.name;
  users: SelectModel[] = [];
  userFilters: string[] = [];
  //  
  users_filter: SelectModel[] = [];
  userFilters_filter: string[] = [];
  userSelected: string;
  userSelected_filter: string;
  listGoodsIssue: ListGoods = new ListGoods();
  listGoodsIssues: SelectModel[] = [];
  listGoodsIssueTypes: SelectModel[] = [{ value: 3, label: 'Giao hàng' }, { value: 10, label: 'Trả hàng' }];
  //
  filterTrucks: any;
  listTruck: SelectModel[] = [];
  selectedTruck: any;
  selectedTrucks: Truck;
  isFeeRent: boolean;
  //
  itemShipment: any = [];
  idPrint: string;
  generalInfo: GeneralInfoModel;
  currentUser: User;
  dateCreate: any;
  totalCalWeight: number;
  totalWeight: number;
  totalSumPrice: any;
  totalBox: number;
  stt: number;
  //
  //#endregion

  constructor(
    private listGoodsService: ListGoodsService,
    private bsModalService: BsModalService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private truckService: TruckService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private departmentService: DepartmentService,
    private generalInfoService: GeneralInfoService,
    private authService: AuthService
  ) {
    super(messageService, permissionService, router);
  }

  async  ngOnInit() {
    this.currentUser = await this.authService.getAccountInfoAsync();
    this.shipmentFilterViewModelLeft.CurrentHubId = this.currentUser.hubId;
    this.shipmentFilterViewModelLeft.groupStatusId = 5;
    this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.waitingForDelivery;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNumberLeft;
    this.shipmentFilterViewModelLeft.PageSize = this.pageSizeLeft;
    //
    this.shipmentFilterViewModelRight.pageSize = this.pageSizeRight;
    this.shipmentFilterViewModelRight.pageNumber = this.pageNumberRight;
    this.listGoodsIssue.listGoodsTypeId = 3;
    //
    this.initData();
    this.loadGeneralInfo();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  async initData() {
    this.loadDatasourceLeft();
  }

  async loadDatasourceLeft() {
    this.messageService.clear();
    this.shipmentFilterViewModelLeft.Type = 5;
    const res = await this.shipmentService.getListShipment(this.shipmentFilterViewModelLeft);
    if (res) {
      const data = res.data as Shipment[];
      this.datasource = data;
      this.totalRecordLeft = data.length > 0 ? data[0].totalCount : 0;
      this.totalBoxsLeft = data.length > 0 ? data[0].totalBoxs : 0;
      if (this.datasource.length == 0) this.messageService.add({ severity: Constant.messageStatus.success, detail: `Kiểm kho '0' vận đơn!` });
    }
  }
  selectOnlyDeliveryUser?: number = null;
  onlyDeliveryUser: SelectModel[] = [
    { label: "-- Tất cả --", data: null, value: null },
    { label: "Theo NV xuất kho", data: null, value: 1 },
  ];

  changeOnlyDeliveryUser() {
    if (this.selectOnlyDeliveryUser && this.listGoodsIssue.empId) {
      this.shipmentFilterViewModelLeft.DeliveryUserId = this.listGoodsIssue.empId;
    } else {
      this.shipmentFilterViewModelLeft.DeliveryUserId = null;
    }
    this.loadDatasourceLeft();
  }

  loadListGoodsDeliveryNew() {
    this.listGoodsService.getListGoodsDeliveryNewAsync(this.listGoodsIssue.empId).then(
      x => {
        this.listGoodsIssues = [];
        if (x.isSuccess == true) {
          let data = x.data as ListGoods[];
          if (data.length > 0) {
            data = SortUtil.sortAlphanumerical(data, -1, "id");
            data.map(m => this.listGoodsIssues.push({ value: m.id, label: `${m.code} ${m.emp ? m.emp.userName : ""}` }));
            this.listGoodsIssue.id = data[0].id;
            this.listGoodsIssue = data[0];
          } else {
            this.listGoodsIssues.push({ value: 0, label: "Tạo mã xuất kho mới" });
          }
        }
      }
    );
  }

  async loadDatasourceRight() {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn mã xuất kho' });
      return;
    }
    this.shipmentFilterViewModelRight.id = this.listGoodsIssue.id;
    this.shipmentFilterViewModelRight.cols = "Service,ToHub";
    const res = await this.shipmentService.getByListGoodsIdPagingAsync(this.shipmentFilterViewModelRight).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.datasourceRightClient = x.data as Shipment[];
        this.totalRecordRight = x.dataCount ? x.dataCount : 0;
        this.totalBoxsRight = (x.data).length > 0 ? (x.data)[0].totalBoxs : 0;
        if (this.datasourceRightClient.length == 0) this.messageService.add({ severity: Constant.messageStatus.success, detail: `Danh sách xuất kho '0' vận đơn.` });
      }
    )
  }

  //#region Event
  eventFilterUsers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.userService.getSearchByValueAsync(value, this.listGoodsIssue.transferUserId).then(
        x => {
          this.users = [];
          this.userFilters = [];
          x.map(m => this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.users.map(m => this.userFilters.push(m.label));
        }
      );
    }
  }

  eventFilterUsers_Filter(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          this.users_filter = [{ value: null, label: '-- Tất cả --' }];
          this.userFilters_filter = [];
          x.map(m => this.users_filter.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.users_filter.map(m => this.userFilters_filter.push(m.label));
        }
      );
    }
  }

  eventOnSelectedUser() {
    let findU = this.users.find(f => f.label === this.userSelected);
    //this.refresh();
    if (findU) {
      this.listGoodsIssue.empId = findU.value;
      this.loadListGoodsDeliveryNew();
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy nhân viên.` });
    }
  }

  eventOnSelectedUser_filter() {
    let findU = this.users_filter.find(f => f.label === this.userSelected_filter);
    if (findU) {
      this.shipmentFilterViewModelLeft.DeliveryUserId = findU.value;
      this.loadDatasourceLeft();
    }
  }

  eventOnSelectedListGoods(template: TemplateRef<any>) {
    if (this.listGoodsIssue.id === 0) {
      this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
    }
  }

  noneCreateListGoods() {
    this.bsModalRef.hide();
    this.listGoodsIssue.id = null;
  }

  onPageChangeLeft(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadDatasourceLeft();
  }

  onPageChangeRight(event: LazyLoadEvent) {
    this.shipmentFilterViewModelRight.pageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelRight.pageSize = event.rows;
    this.loadDatasourceRight();
  }

  evenScaneShipmentNumberIssue(txtShipmentNumberIssue) {
    this.messageService.clear();
    this.txtShipmentNumberIssueRef.nativeElement.focus();
    this.txtShipmentNumberIssueRef.nativeElement.select();
    if (!this.listGoodsIssue.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mã xuất kho trống, vui lòng tạo mã xuất kho trước." });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (!this.listGoodsIssue.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mã xuất kho trống, vui lòng tạo mã xuất kho trước." });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    if (!this.listGoodsIssue.empId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy NV giao nhận, vui lòng kiểm tra lại." });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    txtShipmentNumberIssue.value.trim().split(" ").forEach(x => {

      let shipmentWHIssue = new AssignShipmentWarehousing();
      shipmentWHIssue.ShipmentNumber = x;
      shipmentWHIssue.listGoodsId = this.listGoodsIssue.id;
      shipmentWHIssue.toUserId = this.listGoodsIssue.empId;
      //
      this.shipmentService.issueDeliveryAsync(shipmentWHIssue).then(res => {
        if (!this.isValidResponse(res)) {
          return;
        }
        txtShipmentNumberIssue.value = "";
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Xuất kho thành công." });
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
        const shipment: Shipment = res.data as Shipment;
        // add to table right
        this.datasourceRightClient.unshift(shipment);
        this.totalRecordRight++;
        this.totalBoxsRight = this.totalBoxsRight + shipment.totalBox;
        if (this.datasourceRightClient.length > 10) {
          this.datasourceRightClient.splice(0, 1);
        }
        // remove from table left
        if (this.totalRecordLeft) this.totalRecordLeft--;
        this.totalBoxsLeft = this.totalBoxsLeft - shipment.totalBox;
        let findLeft = this.datasource.findIndex(f => f.id == shipment.id);
        if (findLeft || findLeft == 0) {
          this.datasource.splice(findLeft, 1);
        }
      });
    });
  }


  issueFast() {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Mã xuất kho trống, vui lòng tạo mã xuất kho trước.' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (!this.selectedData || !this.selectedData.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn vận đơn nhập kho nhanh' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.selectedData.map(map => {
      let shipmentWHIssue = new AssignShipmentWarehousing();
      shipmentWHIssue.ShipmentNumber = map.shipmentNumber;
      shipmentWHIssue.listGoodsId = this.listGoodsIssue.id;
      shipmentWHIssue.toUserId = this.listGoodsIssue.empId;
      this.shipmentService.issueDeliveryAsync(shipmentWHIssue).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            return;
          }
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xuất kho thành công.' });
          SoundHelper.getSoundMessage(Constant.messageStatus.success);
          let shipment = x.data as Shipment;
          //Add client
          this.datasourceRightClient.unshift(shipment);
          this.totalRecordRight++;
          this.totalBoxsRight = this.totalBoxsRight + shipment.totalBox;
          if (this.datasourceRightClient.length > 10) {
            this.datasourceRightClient.splice(0, 1);
          }
          //Remove client
          let findLeft = this.datasource.findIndex(f => f.id == shipment.id);
          if (findLeft || findLeft == 0) {
            this.datasource.splice(findLeft, 1);
            if (this.totalRecordLeft) this.totalRecordLeft--;
            this.totalBoxsLeft = this.totalBoxsLeft - shipment.totalBox;
          }
          //remove select data
          let findSelectLeft = this.selectedData.findIndex(f => f.id == shipment.id);
          if (findSelectLeft || findSelectLeft == 0) {
            this.selectedData.splice(findSelectLeft, 1);
          }
        });
    });
  }

  //#endregion

  //#region Function excute
  createNewListGoods() {
    this.messageService.clear();
    if (!this.listGoodsIssue.listGoodsTypeId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: `Vui lòng chọn loại xuất kho`
      });
      return;
    }
    if (this.listGoodsIssue.listGoodsTypeId == ListGoodsTypeHelper.detailDelivery) {
      this.listGoodsIssue.listGoodsStatusId = StatusHelper.assignEmployeeDelivery;
    } if (this.listGoodsIssue.listGoodsTypeId == ListGoodsTypeHelper.detailReturn) {
      this.listGoodsIssue.listGoodsStatusId = StatusHelper.assignEmployeeReturn;
    }
    this.listGoodsService.createAsync(this.listGoodsIssue).then(
      x => {
        if (!this.isValidResponse(x)) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: `Tạo mã xuất kho mới không thành công, vui lòng kiểm tra lại`
          });
          return;
        }
        this.listGoodsIssue = x.data as ListGoods;
        let finU = this.users.find(f => f.value == this.listGoodsIssue.empId);
        if (finU) {
          this.listGoodsIssue.emp = finU.data;
          this.listGoodsIssue.emp.fullName = this.listGoodsIssue.emp.name;
        }
        this.listGoodsIssues.push({
          value: this.listGoodsIssue.id,
          label: `${this.listGoodsIssue.code} ${this.listGoodsIssue.emp ? this.listGoodsIssue.emp.name : ""}`
        });
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Đã tạo mã xuất kho mới thành công` });
        this.bsModalRef.hide();
      }
    );
  }
  //#endregion
  eventConfirmBlockListGoods(template: TemplateRef<any>) {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id === 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mã xuất kho trống, vui lòng tạo mã xuất kho trước." });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  noneBlockListGoods() {
    this.bsModalRef.hide();
  }

  async blockListGoods() {
    this.messageService.clear();
    await this.listGoodsService.BlockListGoodsAsync(this.listGoodsIssue).then(async res => {
      if (!this.isValidResponse(res)) {
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        return;
      }
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Chốt xuất kho thành công." });
      SoundHelper.getSoundMessage(Constant.messageStatus.success);
      this.refresh();
    });
  }

  // Print
  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  async blockAndPrintListGoods() {
    let listGoodsIssue = Object.assign({}, this.listGoodsIssue);
    await this.blockListGoods();
    this.itemShipment = await this.onGetListGoodsId(listGoodsIssue);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailDelivery;
        this.itemShipment.isPrintBareCode = true;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  async onGetListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const shipments = await this.getShipmentByListGoodsId(data);
    if (shipments) {
      this.itemShipment = [...shipments];

      let cols = ["ToHub", "FromHub", "Emp", "Emp.Department", "CreatedByUser", "CreatedByUser.Department", "ListGoodsType"];
      let listgood = await this.listGoodsService.getAsync(data.id, cols);

      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName;
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;

      if (listgood.data.toHub) {
        this.itemShipment.toHubName = listgood.data.toHub.name;
      }

      if (listgood.data.listGoodsType) {
        this.itemShipment.namePrintLabel = listgood.data.listGoodsType.name;
        this.itemShipment.listGoodsTypeId = listgood.data.listGoodsType.id;
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
      //
      this.itemShipment.listGoods = data.code;
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      await Promise.all(this.itemShipment.map(async (item, index) => {
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

    const shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      return shipments;
    }
  }
  //

  refresh() {
    this.userSelected = "";
    this.listGoodsIssue = new ListGoods();
    this.listGoodsIssue.listGoodsTypeId = 3;
    this.datasourceRightClient = [];
    this.listGoodsIssues = [];
    this.totalRecordRight = 0;
    this.totalBoxsRight = 0;
    this.bsModalRef.hide();
  }

  filterTruck(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.truckService.searchByTruckNumber(value).then(
        x => {
          if (x.isSuccess == true) {
            this.listTruck = [];
            this.filterTrucks = [];
            let data = (x.data as Truck[]);
            data.map(m => {
              this.listTruck.push({ value: m.id, label: `${m.truckNumber}`, data: m })
              this.filterTrucks.push(`${m.truckNumber}`);
            });
          }
        }
      );
    }
  }

  onSelectedCustomer() {
    let cloneSelectedCustomer = this.selectedTruck;
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    this.listTruck.forEach(x => {
      if (x) {
        if (cloneSelectedCustomer === x.label) {
          this.selectedTrucks = x.data;
        }
        else {
          this.selectedTrucks = null;
        }
        this.changeTruck();
      }
    });
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      this.truckService.searchByTruckNumber(value).then(
        x => {
          if (x.isSuccess == true) {
            this.listTruck = [];
            this.filterTrucks = [];
            let data = (x.data as Truck[]);
            data.map(m => {
              this.listTruck.push({ value: m.id, label: `${m.truckNumber}`, data: m })
              this.filterTrucks.push(`${m.truckNumber}`);
            });
            let findCus: SelectModel = null;
            if (this.listTruck.length == 1) {
              findCus = this.listTruck[0];
            } else {
              findCus = this.listTruck.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.selectedTrucks = findCus.data;
              this.selectedTruck = findCus.label;
              this.changeTruck();
            }
            else {
              this.selectedTrucks = null;
              this.changeTruck();
            }
          }
          else {
            this.selectedTrucks = null;
            this.changeTruck();
          }
        }
      );
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập biển số xe.` });
    }
  }

  changeTruck() {
    if (this.selectedTrucks) this.listGoodsIssue.truckId = this.selectedTrucks.id;
    if (this.selectedTrucks && this.selectedTrucks.truckOwnershipId == 2) {
      this.isFeeRent = true;
    }
    else {
      this.isFeeRent = false;
      this.listGoodsIssue.feeRent = 0;
    }
  }

  removeIssueWarehousing(shipmentId: any) {
    if (!this.listGoodsIssue || !this.listGoodsIssue.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chưa có mã xuất kho!` });
      return;
    }
    let model: any = new Object();
    model.listGoodsId = this.listGoodsIssue.id;
    model.shipmentId = shipmentId;
    this.shipmentService.unAssign(model).subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Gỡ vận đơn thành công' });
        this.loadDatasourceLeft();
        this.loadDatasourceRight();
      }
    );
  }
}
