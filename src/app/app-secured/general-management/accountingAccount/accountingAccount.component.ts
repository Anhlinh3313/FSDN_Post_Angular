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
import { AccountingAccountService } from '../../../services/index';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { AccountingAccount } from '../../../models';


@Component({
  selector: 'app-accountingAccount',
  templateUrl: './accountingAccount.component.html',
  styles: []
})
export class AccountingAccountComponent extends BaseComponent implements OnInit {
  first: number = 0;
  txtFilterGb: any;
  check_CK: boolean;
  check_TM: boolean;
  constructor(private modalService: BsModalService, private AccountingAccountService: AccountingAccountService,
    public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.AccountingAccount.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: AccountingAccount;
  selectedData: AccountingAccount;
  isNew: boolean;
  listData: AccountingAccount[];
  columns: string[] = ["code", "name"];
  datasource: AccountingAccount[];
  totalRecords: number;
  rowPerPage: number = 10;

  lstBank: SelectModel[] = [];
  lstBranch: SelectModel[] = [];
  changType  = [
    {value: true, label: "Chuyển khoản" },
    {value: false, label: "Tiền mặt"},
  ]
  ngOnInit() {
    this.initData();
  }

  async initData() {
    let x = await this.AccountingAccountService.getAllAsync();

    this.datasource = x.data as AccountingAccount[];
    this.totalRecords = this.datasource.length;
    this.listData = this.datasource.slice(0, this.rowPerPage);

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }

  openModel(template: TemplateRef<any>, data: AccountingAccount = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = Object.assign({}, data);
      this.selectedData = data;
      if(this.data.isTransfer) 
        {
          this.check_CK = true;
          this.check_TM = false;
        }
      else {
        this.check_CK = false;
        this.check_TM = true;
      }
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new AccountingAccount();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  change_Method()
  { 
    if(this.check_CK) 
        { 
          this.check_TM = false;
        }
    else this.check_TM = true;
    return this.data.isTransfer = this.check_CK;

  } 
  change_Method2(){
    if(this.check_TM )
      { 
        this.check_CK = false;
      }
    else this.check_CK = true;
      return this.data.isTransfer = this.check_CK;
  } 
  openDeleteModel(template: TemplateRef<any>, data: AccountingAccount) {
    this.selectedData = data;
    this.data = Object.assign({}, data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  loadLazy(event: LazyLoadEvent) {
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
      this.AccountingAccountService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        this.initData();
        this.bsModalRef.hide();
      });
    }
    else {
      this.AccountingAccountService.update(this.data).subscribe(x => {
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
        detail: "Vui lòng nhập số tài khoản"
      });
      result = false;
    }

    if (!this.data.code) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập tên tài khoản"
      });
      result = false;
    }

    return result;
  }

  delete() {
    this.AccountingAccountService.delete(new BaseModel(this.data.id)).subscribe(x => {
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

