import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService,
  HubService,
  AuthService,
  UploadService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  User,
  ListReceiptMoney,
  Hub,
  ListReceiptMoneyStatus
} from "../../../models/index";
import { PersistenceService } from "angular-persistence";
import {
  ListReceiptMoneyViewModel
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ShipmentHubKeeping } from "../../../models/shipmentHubKeeping";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
declare var jQuery: any;

@Component({
  selector: "app-receive-money-from-hub",
  templateUrl: "receive-money-from-hub.component.html",
  styles: []
})
export class ReceiveMoneyFromHubComponent extends BaseComponent
  implements OnInit {
  @ViewChild("fileInput") fileInput: ElementRef;

  hubName = environment;

  first: number = 0;
  txtFilterGb: any;
  txtFilterGbShipment: any;
  updateImagePath: any;
  txtNote: any;

  bankAccount: string;

  selectedDateFrom: any;
  selectedDateTo: any;
  //
  idPrint: any;

  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    private hubService: HubService,
    private userService: UserService,
    private authService: AuthService,
    public permissionService: PermissionService,
    public router: Router,
    private uploadService: UploadService,
    private printFrormServiceInstance: PrintFrormServiceInstance
  ) {
    super(messageService, permissionService, router);

    this.userService.get(this.authService.getUserId(), ["Hub"]).subscribe(x => {
      let user = x.data as User;
      if (user.hub) {
        var hubId = user.hub.poHubId ? user.hub.poHubId : user.hub.centerHubId;
        if (hubId) {
          this.hubService.get(hubId, ["CenterHub"]).subscribe(x => {
            this.toHubs = [];
            let hub = x.data as Hub;
            this.toHubs.push({ label: hub.name, value: hub });
            if (hub.centerHub) {
              this.toHubs.push({ label: hub.centerHub.name, value: hub.centerHub });
            }
            this.loadShipment();
          });
        }
      }
    });
  }

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children.receiveMoneyFromHub
    .name;

  //============================
  //BEGIN Danh sách vận đơn nộp tiền
  //============================
  selectedToHub: Hub;
  toHubs: SelectItem[];
  datasource: ShipmentHubKeeping[];
  listData: ShipmentHubKeeping[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  columns: string[] = [
    "shipmentNumber",
    "createdWhen",
    "cODKeeping",
    "totalPriceKeeping",
    "senderName",
    "serviceName",
    "paymentTypeName",
    "shipmentStatusName"
  ];
  //============================
  //END Danh sách vận đơn nộp tiền
  //============================

  //============================
  //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  toHubsLRM: SelectItem[];
  selectedToHubLRM: Hub;
  selectedStatusLRM: ListReceiptMoneyStatus;
  rowPerPageLRM: 20;
  totalRecordsLRM: number;
  bsModalRef: BsModalRef;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "id",
    "listReceiptMoneyStatus.name",
    "toHub.name",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "orderDate",
    "userModified.fullName",
    "modifiedWhen"
  ];
  datasourceLRM: ListReceiptMoney[];
  listDataLRM: ListReceiptMoney[];
  eventLRM: LazyLoadEvent;
  statuesLRM: SelectItem[];
  public dateRangeLRM = {
    start: moment(),
    end: moment()
  };
  //============================
  //END Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  ngOnInit() {
    this.initData();
  }

  initData() {
    this.selectedDateFrom = moment(new Date()).format("YYYY/MM/DD 00:00");
    this.selectedDateTo = SearchDate.formatToISODate(new Date());
    this.loadListReceitMoney();
  }
  loadShipment() {
    this.listReceiptMoneyService.getListShipmentKeepingByHub(undefined, ListReceiptMoneyTypeHelper.HUB).subscribe(x => {
      let shipments = x.data as ShipmentHubKeeping[];
      this.datasource = shipments;
      this.totalRecords = this.datasource.length;
      this.listData = this.datasource.slice(0, this.rowPerPage);
      this.listData = this.listData.sort((x, y) => {
        const a = new Date(x.createdWhen);
        const b = new Date(y.createdWhen);
        if (a > b) return -1;
        return 1;
      })
    });

    //refresh
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
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );
        // search datetime
        if (this.txtFilterGbShipment) {
          let result = SearchDate.searchFullDate(this.txtFilterGbShipment);
          if (result) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGbShipment);
          if (res) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columns)
            );
          }
        }

        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;
        // console.log("listData", this.listData);
      }
    }, 250);
  }
  refresh() {
    this.listData = [];
    this.loadShipment();
    this.first = 0;
  }

  save() {
    // console.log(this.listData);
    if (!this.datasource.length) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Danh sách vận đơn đang giữ trống."
      });
      return;
    }
    if (!this.selectedToHub) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn TT/CN nhận"
      });
      return;
    }

    //if (!this.bankAccount) {
    //  this.messageService.add({
    //    severity: Constant.messageStatus.warn,
    //    detail: "Chưa nhập tài khoản ngân hàng"
    //  });
    //  return;
    //}
    
    let shipments = [];
    let model = new ListReceiptMoneyViewModel();

    shipments = this.datasource.map(function (x) {
      return {
        id: x.id,
        cOD: x.codKeeping,
        totalPrice: x.totalPriceKeeping
      };
    });
    model.shipments = shipments;
    model.toHubId = this.selectedToHub.id;
    model.bankAccount = this.bankAccount;
    this.listReceiptMoneyService
      .createListReceiptMoneyToHub(model)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.refresh();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo bảng kê thu tiền thành công"
        });
        this.refreshLRM();
      });
  }

  //======== BEGIN METHOD ListReceiveMoney =======
  loadListReceitMoney() {
    let includes: any = [];
    let includesListReceiptMoney = Constant.classes.includes.listReceiptMoney;
    for (var prop in Constant.classes.includes.listReceiptMoney) {
      includes.push(includesListReceiptMoney[prop]);
    }
    this.listReceiptMoneyService
      .getListByType(ListReceiptMoneyTypeHelper.HUB, this.selectedDateFrom, this.selectedDateTo, includes)
      .subscribe(x => {
        this.datasourceLRM = x.data as ListReceiptMoney[];
        this.totalRecordsLRM = this.datasourceLRM.length;
        this.listDataLRM = this.datasourceLRM.slice(0, this.rowPerPageLRM);
        this.listDataLRM = this.listDataLRM.sort((x, y) => {
          const a = new Date(x.createdWhen);
          const b = new Date(y.createdWhen);
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
        //
        if (this.selectedStatusLRM) {
          filterRows = filterRows.filter(
            x => x.listReceiptMoneyStatusId === this.selectedStatusLRM.id
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

    this.selectedToHubLRM = null;
    let uniqueToHub = [];
    this.toHubsLRM = [{ label: "Chọn tất cả", value: null }];

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
      if (uniqueToHub.indexOf(x.fromHubId) === -1 && x.fromHubId) {
        uniqueToHub.push(x.fromHubId);
        this.toHubsLRM.push({ label: x.fromHub.name, value: x.fromHub });
      }
    });
    //
  }
  refreshLRM() {
    this.loadListReceitMoney();

    //refresh
    this.txtNote = null;
    this.txtFilterGbShipment = null;
    this.txtFilterGb = null;
    this.first = 0;
  }
  changeFilterLRM() {
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  lockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.lock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Khóa bảng kê thu tiền thành công"
      });
    });
  }
  unlockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.unlock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Mở khóa bảng kê thu tiền thành công"
      });
    });
  }
  cancelLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.cancel(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Hủy bảng kê thu tiền thành công"
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

  uploadImage(data: ListReceiptMoney) {
    this.fileInput.nativeElement.click();
  }

  async changeImage(event, data: ListReceiptMoney) {
    let lstFiles = ["bmp", "jpg", "jpeg", "gif", "png"];
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileName = file.name;
      let fileExtension = file.name.split('.')[1];

      if (!lstFiles.find(x => x == fileExtension)) {
        this.messageService.add({
          severity: Constant.messageStatus.error,
          detail: "Vui lòng chọn file hình ảnh"
        });
      }
      else {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          let base64 = reader.result as string;
          let obj = {
            id: data.id,
            fileName: fileName,
            fileExtension: fileExtension,
            fileBase64String: base64.split(',')[1]
          }
          let res = await this.uploadService.uploadIamgeSubmitToTreasurer(obj);
          console.log(res);
        };
      }
    }
  }

  openModel(template: TemplateRef<any>, path: string) {
    this.uploadService.getImageByPath(path).subscribe(x => {
      if (!super.isValidResponse(x)) return;

      if (x.data["fileBase64String"]) {
        this.updateImagePath = x;
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
      }
    });
  }
  

  async inLRM(data) {
    let arr;
    let total = 0;
    data["fakeId"] = "id" + data.id;
    data["shipmentNumber"] = data.code;

    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHub);
    
    this.listReceiptMoneyService.getListReceiptMoneyShipmentByListReceiptMoney(data.id,
      ["Shipment", "Shipment.PaymentType", "Shipment.Service", "Shipment.ListGoods", "Shipment.Sender"]).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        arr = x.data;
        x.data.forEach(el => {
          total += el.cod;
        });
        setTimeout(() => {
          arr['code'] = data.code;
          arr['paidByEmpName'] = data.paidByEmp.fullName;
          arr['createdWhen'] = data.createdWhen;
          arr['totalPrice'] = total.toLocaleString();
          this.printFrormServiceInstance.sendCustomEvent(arr);
        }, 100);
      });
    this.idPrint = PrintHelper.printReceiveMoneyFromRider;
  }
}