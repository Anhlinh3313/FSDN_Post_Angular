import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { AccountBank } from '../../../models/accountBank.model';
import { AccountBankService } from '../../../services/account-bank.service';
import { AccountingAccountService } from '../../../services';


@Component({
  selector: 'app-account-bank',
  templateUrl: './account-bank.component.html',
  styles: []
})
export class AccountBankComponent extends BaseComponent implements OnInit {
  first: number = 0;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private accountBankService: AccountBankService,
    private accountingAccountService: AccountingAccountService,
    public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.AccountBank.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: AccountBank;
  selectedData: AccountBank;
  isNew: boolean;
  listData: AccountBank[];
  columns: string[] = ["code", "name", "branch.name", "accountingAccount.name"];
  datasource: AccountBank[];
  totalRecords: number;
  rowPerPage: number = 10;

  selectedBankId: any = null;
  lstBank: SelectModel[] = [];
  lstBranch: SelectModel[] = [];
  listAccountingAccount: SelectModel[] = [];

  ngOnInit() {
    this.initData();
    this.loadBank();
    this.loadAccountingAccount();
  }

  async loadBank() {
    this.lstBank = await this.accountBankService.getBankSelectModel();
  }

  async loadAccountingAccount() {
    this.listAccountingAccount = await this.accountingAccountService.getAllSelectModelAsync();
  }

  async changeBank() {
    this.lstBranch = await this.accountBankService.getBranchByBankIdSelectModel(this.selectedBankId);
  }

  async initData() {
    let x = await this.accountBankService.getAllAsync(["Branch", "AccountingAccount"]);
    console.log(x);

    this.datasource = x.data as AccountBank[];
    this.totalRecords = this.datasource.length;
    this.listData = this.datasource.slice(0, this.rowPerPage);

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }

  openModel(template: TemplateRef<any>, data: AccountBank = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = Object.assign({}, data);
      this.selectedData = data;
      if (data.branch) this.selectedBankId = data.branch.bankId;
      this.changeBank();
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.selectedData = null;
      this.data = new AccountBank();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openDeleteModel(template: TemplateRef<any>, data: AccountBank) {
    this.selectedData = data;
    this.data = Object.assign({}, data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));

        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;
      }
    }, 250);
  }

  refresh() {
    this.initData();
    this.first = 0;
  }

  save() {
    if (!this.isValidData()) return;
    if (this.isNew) {
      this.accountBankService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        this.initData();
        this.bsModalRef.hide();
      });
    }
    else {
      this.accountBankService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        this.initData();
        this.bsModalRef.hide();
      });
    }
  }

  isValidData() {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.data.code) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập số TK"
      });
      result = false;
    }

    if (!this.data.branchId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn chi nhánh"
      });
      result = false;
    }

    return result;
  }

  delete() {
    this.accountBankService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;
      this.initData();
      this.bsModalRef.hide();
    });
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  isValidResponse(x: ResponseModel): boolean {
    if (!x.isSuccess) {
      if (x.message) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: x.message });
      } else if (x.data) {
        let mess: Message[] = [];

        for (let key in x.data) {
          let element = x.data[key];
          mess.push({ severity: Constant.messageStatus.warn, detail: element });
        }

        this.messageService.addAll(mess);
      }
    }
    return x.isSuccess;
  }

  keyDownFunction(event) {
    if (event.keyCode == KeyCodeUtil.charEnter) {
      this.save();
    }
    if ((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.save();
      event.preventDefault();
      return false;
    }
  }
}

