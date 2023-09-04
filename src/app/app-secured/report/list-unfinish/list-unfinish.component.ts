import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import { ShipmentService, UserService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { ArrayHelper } from "../../../infrastructure/array.helper";

declare var jQuery: any;

@Component({
  selector: "app-list-unfinish",
  templateUrl: "list-unfinish.component.html",
  styles: []
})
export class ListUnfinishComponent extends BaseComponent implements OnInit {
  txtFilterGbLeft: any;
  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.listUnfinish.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "numPick",
    "transferAppointmentTime",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "transferNote",
    "shipmentStatus.name"
  ];
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  selectedDataRight: Shipment[];
  listDataRight: Shipment[];
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  hubRoutings: SelectItem[];
  selectedHubRouting: string;
  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  riders: SelectItem[];
  selectedRider: User;

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.loadShipment();

    this.userService.getEmpByCurrentHub().subscribe(x => {
      this.riders = [];
      let users = x.data as User[];

      users.forEach(element => {
        this.riders.push({ label: element.fullName, value: element });
      });

      this.selectedRider = null;
    });

    this.selectedData = null;
    this.listDataRight = [];
  }

  loadShipment() {
    this.refreshTableRight();

    let includes: string =
    Constant.classes.includes.shipment.fromHubRouting + "," +
    Constant.classes.includes.shipment.shipmentStatus;

    let shipmentFilterViewModel = new ShipmentFilterViewModel();
    shipmentFilterViewModel.Type = ShipmentTypeHelper.transfer;
    shipmentFilterViewModel.Cols = includes;

    this.datasource = [];
    this.listData = [];
    this.shipmentService
      .postByType(shipmentFilterViewModel)
      .subscribe(x => {
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        if (!ArrayHelper.isNullOrZero(this.datasource)) {
          this.totalRecords = this.datasource.length;
          this.listData = this.datasource.slice(0, this.rowPerPage);
          this.loadFilterLeft();
        }
      });

    //refresh
    this.txtFilterGbLeft = null;
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
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(
            x => x.shipmentStatus.name === this.selectedStatus
          );
        }
        if (this.selectedHubRouting) {
          filterRows = filterRows.filter(
            x => x.fromHubRouting.name === this.selectedHubRouting
          );
        }
        if (this.selectedDateAppointment) {
          filterRows = filterRows.filter(
            x => x.transferAppointmentTime === this.selectedDateAppointment
          );
        }
        //End Custom filter

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

  changeFilterLeft() {
    this.loadLazy(this.event);
  }

  loadFilterLeft() {
    //
    this.selectedStatus = null;
    let uniqueStatus = [];
    this.statuses = [];
    //
    this.selectedHubRouting = null;
    let uniqueHubRouting = [];
    this.hubRoutings = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
        this.hubRoutings.push({ label: "Chọn tất cả", value: null });
        this.dateAppointments.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatus.name
        });
      }
      //
      if (
        uniqueHubRouting.indexOf(x.fromHubRoutingId) === -1 &&
        x.fromHubRoutingId
      ) {
        uniqueHubRouting.push(x.fromHubRoutingId);
        this.hubRoutings.push({
          label: x.fromHubRouting.name,
          value: x.fromHubRouting.name
        });
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.loadFilterLeft();
    if (this.bsModalRef) this.bsModalRef.hide();
    this.selectedData = null;
  }

  refreshTableRight() {
    this.removeStorage(this.localStorageRightData);
    this.selectedDataRight = null;
    this.listDataRight = [];
  }

  save() {
    if (!this.selectedDataRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    if (!this.selectedRider) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRider.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider.id;
    model.shipmentStatusId = StatusHelper.assignEmployeeTransfer;
    model.shipmentIds = shipmentIds;

    // this.shipmentService.assignTransferList(model).subscribe(x => {
    //   if (!super.isValidResponse(x)) return;
    //   this.refreshTableRight();
    //   this.messageService.add({ severity: Constant.messageStatus.success, detail: "Cập nhật thành công" });
    // });
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) {}

  assign() {
    if (!this.selectedData) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    if (!this.selectedRider) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRider.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
  }

  unAssign() {
    if (!this.selectedDataRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    let listDataClone = Array.from(this.listData);
    this.selectedDataRight.forEach(x => {
      listDataClone.push(x);
      this.datasource.push(x);
    });
    this.listData = listDataClone;
    this.removeDataRight(this.selectedDataRight);
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
    let listClone = Array.from(this.listDataRight);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRight = listClone;
    this.selectedDataRight = null;
    this.setObjectDataRight();
  }

  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }

    this.refresh();
  }

  changeRider() {
    this.selectedDataRight = null;
    this.listDataRight = this.getSelectedObjectDataRight();
  }

  getSelectedObjectDataRight(): Shipment[] {
    let arr = [];
    let objectDataRight = this.getObjectDataRight();

    if (objectDataRight)
      objectDataRight.filter(x => {
        if (x.key === this.selectedRider.id) arr = x.values;
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
      obj.key = this.selectedRider.id;
      obj.values = this.listDataRight;
      arrStorage.push(obj);
    } else {
      arrStorage[index].values = this.listDataRight;
    }
    // console.log(arrStorage);
    this.setStorage(this.localStorageRightData, arrStorage);
    // console.log(this.getObjectDataRight());
  }

  findObjectDataRight(arrStorage: KeyValuesViewModel[]): number {
    let index = -1;

    arrStorage.forEach((val, i) => {
      if (val.key === this.selectedRider.id) {
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
}
