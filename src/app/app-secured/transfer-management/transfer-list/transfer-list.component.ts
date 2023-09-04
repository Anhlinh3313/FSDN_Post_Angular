import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { ShipmentService, UserService, ListGoodsService, ShipmentStatusService, HubService, AuthService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { Shipment } from '../../../models/shipment.model';
import { User, ListGoodsStatus } from '../../../models/index';
import { PersistenceService, StorageType } from 'angular-persistence';
import { KeyValuesViewModel, ListUpdateStatusViewModel } from '../../../view-model/index';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ListGoodsStatusIdsFilterModel } from '../../../models/abstract/listGoodsStatusIdsFilterModel.interface';
import { ListGoodsStatusHelper } from '../../../infrastructure/listGoodsStatusHelper';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

declare var jQuery: any;

@Component({
  selector: 'app-transfer-list',
  templateUrl: 'transfer-list.component.html',
  styles: []
})
export class TransferListComponent extends BaseComponent implements OnInit {
  hub = environment;
  listGoodsFilter: ListGoodsStatusIdsFilterModel = new Object() as ListGoodsStatusIdsFilterModel;
  pageNum = 1;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  txtFilterGbLeft: any;
  constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService, private listGoodsService: ListGoodsService, private shipmentStatusService: ShipmentStatusService,
    private hubService: HubService, private userService: UserService, private authService: AuthService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.transferList.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = ["shipmentNumber", "package.name", "fromHub.name", "receiveHub.name", "toHub.name",
    "transferUser.fullName", "transferReturnUser.fullName", "shipmentStatus.name", "listGoods.name"];
  datasource: Shipment[];
  totalRecords: number = 0;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  packages: SelectItem[];
  selectedPackage: number;
  //
  fromHubs: SelectItem[];
  selectedFromHub: number;
  //
  receiveHubs: SelectItem[];
  selectedReceiveHub: number;
  //
  toHubs: SelectItem[];
  selectedToHub: number;
  //
  listGoods: SelectItem[];
  selectedListGoods: number;

  ngOnInit() {
    this.initData();
  }

  initData() {
    let includes: string =
      Constant.classes.includes.shipment.listGoods + "," +
      Constant.classes.includes.shipment.package + "," +
      Constant.classes.includes.shipment.fromHub + "," +
      Constant.classes.includes.shipment.receiveHub + "," +
      Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.transferUser + "," +
      Constant.classes.includes.shipment.transferReturnUser + "," +
      Constant.classes.includes.shipment.shipmentStatus;

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    let orderDateFrom = currentDate + "T00:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.transferring;
    this.shipmentFilterViewModel.OrderDateFrom = null;
    this.shipmentFilterViewModel.OrderDateTo = null;
    this.shipmentFilterViewModel.PageNumber = this.pageNum;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    //
    this.loadShipment();

    this.selectedData = null;

    this.loadStatus();
    this.loadHubs();
    this.loadFilterListGoods();
  }

  async loadStatus() {
    this.selectedStatus = null;
    this.statuses = [];
    const data = await this.shipmentStatusService.getAllSelectModelByTypeAsync("transfer");
    if (data) {
      this.statuses = data;
    }
  }

  changeStatus() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatus;
    this.loadShipmentPaging();
  }

  async loadHubs() {
    this.fromHubs = [];
    this.receiveHubs = [];
    this.selectedReceiveHub = null;
    this.toHubs = [];
    this.selectedToHub = null;
    const hubs = await this.hubService.getAllAsync();
    if (hubs) {
      this.fromHubs.push({ label: `-- Chọn tất cả --`, value: null });
      this.selectedFromHub = null;
      hubs.forEach(element => {
        this.fromHubs.push({
          label: element.name,
          value: element.id
        });
      });
      this.receiveHubs = this.fromHubs;
      this.toHubs = this.fromHubs;
    }
  }

  changeFromHub () {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromHubId = this.selectedFromHub;
    this.loadShipmentPaging();
  }

  changeReceiveHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.receiveHubId = this.selectedReceiveHub;
    this.loadShipmentPaging();
  }

  changeToHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ToHubId = this.selectedToHub;
    this.loadShipmentPaging();
  }

  async loadFilterListGoods() {
    this.listGoods = [];
    this.selectedListGoods = null;
    this.listGoodsFilter.statusIds = [ListGoodsStatusHelper.READY_TO_TRANSFER,ListGoodsStatusHelper.TRANSFERRING];
    const id = this.authService.getUserId();
    const arrCols = ["Hub"];
    const user = await this.userService.getAsync(id, arrCols);
    if (user) {
      if (user.hub) {
        this.listGoodsFilter.fromHubId = user.hub.id;
      }
    }
    const data = await this.listGoodsService.getListGoodsByStatusIdsAndFromHubIdAsync(this.listGoodsFilter);
    if (data) {
      this.listGoods = data;
    }
  }

  changeListGoods() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.listGoodsId = this.selectedListGoods;
    this.loadShipmentPaging();
  }

  loadShipment() {
    this.loadShipmentPaging();

    //refresh
    this.txtFilterGbLeft = null;

  }

  async loadShipmentPaging() {
    await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
      if (x) {
        const data = x.data as Shipment[];
        // console.log(data);
        this.datasource = data.reverse();
        this.listData = this.datasource;
        this.totalRecords = x.dataCount;
      }
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
        let filterRows = this.datasource;

        //End Custom filter

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows;
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  changeFilterLeft() {
    this.loadLazy(this.event);
  }

  loadFilterLeft() {
    
  }

  clickRefresh(template: TemplateRef<any>) {
    this.refresh();
  }

  refresh() {
    this.selectedFromHub = null;
    this.selectedToHub = null;
    this.selectedReceiveHub = null;
    this.selectedListGoods = null;
    this.selectedStatus = null;
    this.shipmentFilterViewModel.FromHubId = null;
    this.shipmentFilterViewModel.ToHubId = null;
    this.shipmentFilterViewModel.receiveHubId = null;
    this.shipmentFilterViewModel.listGoodsId = null;
    this.shipmentFilterViewModel.ShipmentStatusId = null;
    if (this.bsModalRef)
    this.bsModalRef.hide();
    this.loadShipment();
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    this.loadShipmentPaging();
  }

  search(value) {
    this.shipmentFilterViewModel.SearchText = value;
    this.loadShipmentPaging();
  }
}
