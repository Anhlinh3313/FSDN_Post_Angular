import { Component, OnInit, TemplateRef, Input } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService,
  UploadService,
  AccountingAccountService,
  CashFlowServices
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  User,
  ListReceiptMoney,
  Hub,
  ListReceiptMoneyStatus,
  BaseModel
} from "../../../models/index";
import {
  ListReceiptMoneyViewModel, IncomingPaymentViewModel
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { SelectModel } from "../../../../app/models/select.model";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";
declare var jQuery: any;

@Component({
  selector: "app-confirm-money-from-hub",
  templateUrl: "confirm-money-from-hub.component.html",
  styles: []
})
export class ConfirmMoneyFromHubComponent extends BaseComponent
  implements OnInit {
  hub = environment;

  configImageViewer = {
    wheelZoom: true
  }
  imageData: string[];

  idPrint: string;

  first: number = 0;
  txtFilterGb: any;
  constructor(
    public currencyFormatPipe: CurrencyFormatPipe,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    private accountingAccountService: AccountingAccountService,
    private cashFlowService: CashFlowServices,
    public permissionService: PermissionService,
    public router: Router,
    private uploadService: UploadService,
    private printFrormServiceInstance: PrintFrormServiceInstance
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children.comfirmMoneyFromHub.name;

  bsModalRef: BsModalRef;
  //============================
  //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
  //============================
  listAccountingAccount: SelectModel[] = [];
  listCashFlow: SelectModel[] = [];
  selectedStatusLRM: ListReceiptMoneyStatus;
  updateImagePath: any;
  selectedFromHubLRM: Hub;
  bankAccount: string;
  rowPerPageLRM: 20;
  totalRecordsLRM: number;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "bankAccount",
    "",
    "listReceiptMoneyStatus.name",
    "fromHub.name",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "grandTotalReal",
    "feeBank",
    "userCreated.fullName",
    "createdWhen",
    "userModified.fullName",
    "modifiedWhen"
  ];
  columns: any[] = [
    { field: "code", header: 'Mã' },
    { field: "isTransfer", header: 'Chuyển khoản / tiền mặt' },
    { field: "userCreated.fullName", header: 'NV tạo' },
    { field: "lockDate", header: 'Ngày khóa' },
    { field: "totalPrice", header: 'Cước', typeFormat: "number" },
    { field: "totalCOD", header: 'COD', typeFormat: "number" },
    { field: "grandTotal", header: 'Tổng', typeFormat: "number" },
    { field: "grandTotalReal", header: 'Nộp thực tế', typeFormat: "number" },
    { field: "feeBank", header: 'Phí ngân hàng', typeFormat: "number" },
    { field: "fromHub.name", header: 'Từ' },
    { field: "createdWhen", header: 'Ngày tạo', typeFormat: "date", formatString: 'YYYY/MM/DD' },
    { field: "userCreated.fullName", header: 'NV Nộp' },
    { field: "accountingAccount.code", header: 'TK kế toán' },
    { field: "acceptDate", header: 'Ngày xác nhận', typeFormat: "date", formatString: 'YYYY/MM/DD' },
    { field: "modifiedWhen", header: 'Ngày thao tác cuối', typeFormat: "date", formatString: 'YYYY/MM/DD' },
  ];
  datasourceLRM: ListReceiptMoney[];
  listDataLRM: ListReceiptMoney[];
  data: ListReceiptMoney;
  eventLRM: LazyLoadEvent;
  statuesLRM: SelectItem[];
  fromHubsLRM: SelectItem[];
  users: SelectModel[] = [];
  selectedUser: any;
  lastTotal: number = 0;
  incomingPayment: IncomingPaymentViewModel = new IncomingPaymentViewModel();

  public dateRangeLRM = {
    start: moment(),
    end: moment()
  };

  sortAmount = [
    { label: "-- Chọn dữ liệu --", data: null, value: null },
    { label: "Tăng", data: null, value: null },
    { label: "Giảm", data: null, value: null },
  ]

  listDataLRM_Right: ListReceiptMoney[] = [];

  selectedDateFrom: any;
  selectedDateTo: any;
  //============================
  //END Danh sách bảng kê nộp tiền về TT/CN/T
  //============================

  ngOnInit() {
    this.initData();
  }

  async initData() {
    this.selectedDateFrom = new Date();
    this.selectedDateTo = new Date();
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    const setMomentDateTo = moment(this.selectedDateTo);
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    setMomentDateTo.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    this.incomingPayment.paymentDate = SearchDate.formatToISODate(setMomentDateTo.toDate());
    this.loadListReceitMoney();
    //
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
        if (this.datasourceLRM) this.totalRecordsLRM = this.datasourceLRM.length;
        else this.totalRecordsLRM = 0;
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
  async loadAccountingAccount(isTranfer: boolean) {
    this.listAccountingAccount = [];
    let res = await this.accountingAccountService.getSelectModelByTypeAsync(this.data);
    if (res) {
      Promise.all(res.map(x => {
        if (x.data != null)
          if (x.data.isTransfer == isTranfer) {
            this.listAccountingAccount.push(x);
          }
      }))
    }
  }
  async loadCashFlow() {
    let res = await this.cashFlowService.getAllSelectModelAsync();
    if (res) {
      this.listCashFlow = res;
    }
  }
  // loadUserByHubId(hubId: any) {
  //   this.users = [];
  //   this.users.push({ label: "-- Chọn nhân viên --", value: null });
  //   if (!hubId) return;
  //   this.userService.getEmpByHubId(hubId).subscribe(
  //     x => {
  //       if (!super.isValidResponse(x)) return;
  //       let users = x.data as User[];
  //       users.forEach(element => {
  //         this.users.push({ label: `${element.code} - ${element.fullName}`, value: element.id });
  //       });
  //     }
  //   );
  // }

  openModalImage(template: TemplateRef<any>, path: string) {
    this.uploadService.getImageByPath(path).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      if (x.data["fileBase64String"]) {
        this.imageData = [`data:image/png;base64,${x.data["fileBase64String"]}`];
        this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-1000" });
      }
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
            x => x.bankAccount == this.bankAccount
          );
        }
        if (this.selectedFromHubLRM) {
          filterRows = filterRows.filter(
            x => x.fromHubId === this.selectedFromHubLRM.id
          );
        }
        if (this.selectedUser) {
          filterRows = filterRows.filter(
            x => x.userCreated && x.userCreated.id === this.selectedUser
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

    this.selectedUser = null;
    let uniqueUser = [];
    this.users = [{ label: "Chọn tất cả", value: null }];

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
      if (uniqueFromHub.indexOf(x.fromHubId) === -1 && x.fromHubId) {
        uniqueFromHub.push(x.fromHubId);
        this.fromHubsLRM.push({ label: x.fromHub.name, value: x.fromHub });
      }
      if (uniqueUser.indexOf(x.userCreated.id) === -1 && x.userCreated && x.userCreated.id) {
        uniqueUser.push(x.userCreated.id);
        this.users.push({ value: x.userCreated.id, label: `${x.userCreated.code} ${x.userCreated.fullName}` });
      }
    });
    //
  }
  refreshLRM() {
    this.loadListReceitMoney();

    //refresh
    this.txtFilterGb = null;
    this.first = 0;
    this.data = new ListReceiptMoney();
  }
  changeFilterLRM() {
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  changeHub() {
    // if (this.selectedFromHubLRM) this.loadUserByHubId(this.selectedFromHubLRM.id);
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  async checkConfirm(data: ListReceiptMoney, template: TemplateRef<any>) {
    if (!data) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Thông tin trống không thể xác nhận!"
      });
      return;
    }
    this.data = data;
    if (!this.data.feeBank) this.data.feeBank = 0;
    await this.loadAccountingAccount(data.isTransfer);
    this.changeFee();
    this.openModelCheckConfirm(template);
    this.loadCashFlow();
  }
  changeFee() {
    this.lastTotal = this.data.grandTotal - this.data.grandTotalReal - this.data.feeBank;
  }
  async openModelCheckConfirm(template: TemplateRef<any>) {
    this.listAccountingAccount = await this.accountingAccountService.getSelectModelByTypeAsync(this.data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  async confirmLRM(isShowTemplate: boolean) {
    if (!this.data) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Thông tin trống không thể xác nhận!"
      });
      return;
    }
    if (this.data.isTransfer && !this.data.feeBank) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập phí ngân hàng!"
      });
      return;
    }
    if (this.lastTotal < -1000) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Tiền chênh lệch tối đã 1000 vnđ trên một bảng kê!"
      });
      return;
    }
    if (!this.data.accountingAccountId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn tài khoản kế toán!"
      });
      return;
    }
    if (!this.incomingPayment.paymentDate) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn ngày xác nhận!"
      });
      return;
    }
    this.incomingPayment.paymentDate = SearchDate.formatToISODate(this.incomingPayment.paymentDate);
    this.incomingPayment.bankAccount = this.listAccountingAccount.find(f => f.value == this.data.accountingAccountId).data.code;
    let model = new ListReceiptMoneyViewModel();
    model.id = this.data.id;
    model.feeBank = this.data.feeBank;
    model.accountingAccountId = this.data.accountingAccountId;
    model.acceptDate = this.incomingPayment.paymentDate;
    model.grandTotalReal = this.data.grandTotalReal;
    //
    this.incomingPayment.id = this.data.id;
    this.incomingPayment.grandTotalReal = this.data.grandTotalReal;
    //
    if (this.hub.namePrint.toUpperCase() === 'GSDP' || this.hub.namePrint.toUpperCase() === 'DLEX') {
      if (!this.data.cashFlowId) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Vui lòng chọn dòng tiền!"
        });
        return;
      }
      let findCashFlow = this.listCashFlow.find(f => f.value == this.data.cashFlowId);
      this.incomingPayment.cashFlowCode = findCashFlow.data.code;
      var resPush = await this.pushIncomingPaymentGSDP(this.incomingPayment);
      if (!resPush) {
        return;
      } else {
        this.listReceiptMoneyService.confirm(model).subscribe(x => {
          if (!super.isValidResponse(x)) {
            console.log(x.message)
            return;
          }
          this.refreshLRM();
          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Xác nhận bảng kê thu tiền thành công"
          });
          this.bsModalRef.hide();
        });
      }
    } else {
      this.listReceiptMoneyService.confirm(model).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.refreshLRM();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Xác nhận bảng kê thu tiền thành công"
        });
        this.bsModalRef.hide();
      });
    }
  }

  async pushIncomingPaymentGSDP(modelIncoming: IncomingPaymentViewModel): Promise<boolean> {
    var x_in = await this.listReceiptMoneyService.pushIncomingPaymentToGSDP(modelIncoming).toPromise();//.then(
    //  x_in => {
    if (x_in.isSuccess) {
      console.log('Result push incoming payment GSDP', x_in);
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Push Incoming Payment GSDP Success."
      });
      return true;
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Push Incoming Payment GSDP Fail."
      });
      return false;
    }
    // }
    // );
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
    let index = this.listDataLRM.findIndex(x => x.id == data.id);
    if (index != -1) {
      this.listDataLRM_Right.push(data);
      this.listDataLRM.splice(index, 1);
    }
  }

  unassign(data: ListReceiptMoney) {
    let index = this.listDataLRM_Right.findIndex(x => x.id == data.id);
    if (index != -1) {
      this.listDataLRM.push(data);
      this.listDataLRM_Right.splice(index, 1);
    }
  }

  print(data) {
    if (data) {
      setTimeout(() => {
        this.idPrint = PrintHelper.printReceipts;
        let dataPrint: any = [];
        this.listReceiptMoneyService.getListReceiptMoneyShipmentByListReceiptMoney(data.id,
          ["Shipment", "Shipment.PaymentType", "Shipment.Service"]).subscribe(x => {
            if (!super.isValidResponse(x)) return;
            dataPrint = x.data;
            dataPrint.paidFullName = (data.paidByEmp ? data.paidByEmp.fullName : '');
            dataPrint.paidAddress = (data.paidByEmp ? data.paidByEmp.address : '');
            dataPrint.paidTotal = (data.grandTotalReal ? data.grandTotalReal : 0);
            dataPrint.paidNote = data.note;
            this.printFrormServiceInstance.sendCustomEvent(dataPrint);
          });
      }, 0);
    }
  }
}
