import { Component, OnInit, TemplateRef } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  RequestShipmentService,
  UserService,
  ShipmentService,
  HubService,
  UploadService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  User,
  ListReceiptMoney,
  Hub,
  ListReceiptMoneyStatus
} from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel,
  ListReceiptMoneyViewModel
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ShipmentEmployeeKeeping } from "../../../models/shipmentEmployeeKeeping";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { Daterangepicker } from "ng2-daterangepicker";
import { from } from "rxjs/observable/from";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { VietstarExpressService } from "../../../services/vietstar-express.service";
import { ChamNo } from "../../../models/chamNo.model";
declare var jQuery: any;

@Component({
  selector: "app-confirm-money-from-emp",
  templateUrl: "confirm-money-from-emp.component.html",
  styles: []
})
export class ConfirmMoneyFromEmpComponent extends BaseComponent
  implements OnInit {
  hub = environment;

  first: number = 0;
  txtFilterGb: any;
  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    private hubService: HubService,
    private userService: UserService,
    public permissionService: PermissionService,
    public router: Router,
    private uploadService: UploadService,
    private vietstarExpressService: VietstarExpressService
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children.comfirmMoneyFromEmp.name;

  bsModalRef: BsModalRef;
  //============================
  //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  selectedStatusLRM: ListReceiptMoneyStatus;
  updateImagePath: any;
  selectedFromHubLRM: Hub;
  bankAccount: string;
  rowPerPageLRM: 20;
  totalRecordsLRM: number;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "",
    "listReceiptMoneyStatus.name",
    "fromHub.name",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "userModified.fullName",
    "modifiedWhen"
  ];
  datasourceLRM: ListReceiptMoney[];
  listDataLRM: ListReceiptMoney[];
  eventLRM: LazyLoadEvent;
  statuesLRM: SelectItem[];
  fromHubsLRM: SelectItem[];
  public dateRangeLRM = {
    start: moment(),
    end: moment()
  };

  sortAmount = [
    { label: "-- Chọn dữ liệu --", data: null, value: null },
    { label: "Tăng", data: null, value: null },
    { label: "Giảm", data: null, value: null },
  ]

  listDataLRM_Right: ChamNo[] = [];

  selectedDateFrom: any;
  selectedDateTo: any;
  //============================
  //END Danh sách bảng kê nộp tiền về TT/CN/T
  //============================

  ngOnInit() {
    this.initData();
    this.loadDataRight();
  }

  initData() {
    this.selectedDateFrom = new Date();
    this.selectedDateTo = new Date();
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.loadListReceitMoney();
  }
  //======== BEGIN METHOD ListReceiveMoney =======
  loadListReceitMoney() {
    let includes: any = [];
    let includesListReceiptMoney = Constant.classes.includes.listReceiptMoney;
    for (var prop in Constant.classes.includes.listReceiptMoney) {
      includes.push(includesListReceiptMoney[prop]);
    }

    this.listReceiptMoneyService
      .getListToConfirmByType(
        ListReceiptMoneyTypeHelper.HUB,
        this.selectedDateFrom,
        this.selectedDateTo,
        includes
      )
      .subscribe(x => {
        this.datasourceLRM = x.data as ListReceiptMoney[];
        this.totalRecordsLRM = this.datasourceLRM.length;
        this.listDataLRM = this.datasourceLRM.slice(0, this.rowPerPageLRM);
        this.listDataLRM = this.listDataLRM.sort((x, y) => {
          const a = new Date(x.orderDate);
          const b = new Date(y.orderDate);
          if (a > b) return -1;
          return 1;
        })
        this.loadFilterLRM();
      });
  }
  loadLazyListReceiveMoney(event: LazyLoadEvent) {
    this.eventLRM = event;
    setTimeout(() => {
      if (this.datasourceLRM) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLRM)
          );
        if (this.selectedStatusLRM) {
          filterRows = filterRows.filter(
            x => x.listReceiptMoneyStatusId === this.selectedStatusLRM.id
          );
        }
        if (this.bankAccount) {
          filterRows = filterRows.filter(
            x => x.bankAccount === this.bankAccount
          );
        }
        if (this.selectedFromHubLRM) {
          filterRows = filterRows.filter(
            x => x.fromHubId === this.selectedFromHubLRM.id
          );
        }
        // search datetime
        if (this.txtFilterGb) {
          let result = SearchDate.searchFullDate(this.txtFilterGb);
          if (result) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columnsLRM)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGb);
          if (res) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columnsLRM)
            );
          }
        }
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLRM = filterRows.slice(
          event.first,
          event.first + event.rows
        );
        this.totalRecordsLRM = filterRows.length;
      }
    }, 250);
  }
  loadFilterLRM() {
    this.selectedStatusLRM = null;
    let uniqueStatus = [];
    this.statuesLRM = [{ label: "Chọn tất cả", value: null }];

    this.selectedFromHubLRM = null;
    let uniqueFromHub = [];
    this.fromHubsLRM = [{ label: "Chọn tất cả", value: null }];

    this.datasourceLRM.forEach(x => {
      if (
        uniqueStatus.indexOf(x.listReceiptMoneyStatusId) === -1 &&
        x.listReceiptMoneyStatusId
      ) {
        uniqueStatus.push(x.listReceiptMoneyStatusId);
        this.statuesLRM.push({
          label: x.listReceiptMoneyStatus.name,
          value: x.listReceiptMoneyStatus
        });
      }
      //
      if (uniqueFromHub.indexOf(x.fromHubId) === -1 && x.fromHubId) {
        uniqueFromHub.push(x.fromHubId);
        this.fromHubsLRM.push({ label: x.fromHub.name, value: x.fromHub });
      }
    });
    //
  }
  refreshLRM() {
    this.loadListReceitMoney();

    //refresh
    this.txtFilterGb = null;
    this.first = 0;
  }
  changeFilterLRM() {
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  confirmLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.confirm(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Xác nhận bảng kê thu tiền thành công"
      });
    });
  }
  viewLRM(data: ListReceiptMoney) {
    this.bsModalRef = this.modalService.show(ReceiveMoneyDetailComponent, { class: 'inmodal animated bounceInRight modal-xlg' });
    this.bsModalRef.content.loadData(data);
  }
  public eventLog = "";

  public selectedDateLRM() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.loadListReceitMoney();
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  //======== END METHOD ListReceiveMoney =======

  //#region Load Data Right
  async loadDataRight() {
    let res = await this.vietstarExpressService.ChamNo();
  }
  //#endregion

  openModel(template: TemplateRef<any>, path: string) {
    this.uploadService.getImageByPath(path).subscribe(x => {
      if (!super.isValidResponse(x)) return;

      if (x.data["fileBase64String"]) {
        this.updateImagePath = x;
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
      }
    });
  }

  assign(data: ListReceiptMoney) {
    // let index = this.listDataLRM.findIndex(x => x.id == data.id);
    // if (index != -1) {
    //   this.listDataLRM_Right.push(data);
    //   this.listDataLRM.splice(index, 1);
    // }
  }

  unassign(data: ListReceiptMoney) {
    // let index = this.listDataLRM_Right.findIndex(x => x.id == data.id);
    // if (index != -1) {
    //   this.listDataLRM.push(data);
    //   this.listDataLRM_Right.splice(index, 1);
    // }
  }
}
