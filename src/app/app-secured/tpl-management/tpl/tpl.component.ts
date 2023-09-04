import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { BaseModel } from '../../../models/base.model';
import { TPL } from '../../../models/tpl.model';
import { TPLService } from '../../../services/tpl.service';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { PriceListService } from '../../../services';

declare var jQuery: any;

@Component({
  selector: 'app-tpl',
  templateUrl: 'tpl.component.html',
  styles: []
})
export class TPLComponent extends BaseComponent implements OnInit {
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private tplService: TPLService,
    public messageService: MessageService, public permissionService: PermissionService, public router: Router, private priceListService: PriceListService) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.tpl.name;
  currentPage: string = Constant.pages.tpl.children.tplManagement.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: TPL;
  selectedData: TPL;
  isNew: boolean;
  listData: TPL[];
  //
  listPriceList: SelectModel[] = [];
  selectedPriceList: number;
  //
  columns: string[] = ["code", "name", "email", "phone", "address"];
  datasource: TPL[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  ngOnInit() {
    this.initData();
    this.loadSelectModelPriceList();
  }
  initData() {
    this.tplService.getAll().subscribe(
      x => {
        this.datasource = x.data as TPL[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
      }
    );
    this.data = null;
    this.selectedData = null;
    this.isNew = true;
    //refresh
    this.txtFilterGb = null;
  }

  async loadSelectModelPriceList() {
    this.listPriceList = await this.priceListService.getAllSelectModelAsync();
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

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  refresh() {
    this.initData();
  }

  openModel(template: TemplateRef<any>, data: TPL = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.cloneCode = this.data.code;
      this.selectedData = data;
      this.selectedPriceList = data.priceListId;
    } else {
      this.selectedPriceList = null;
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new TPL();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  clone(model: TPL): TPL {
    let data = new TPL();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  save() {
    if (!this.isValidateTPL()) return;
    let list = [...this.listData];

    if (this.selectedPriceList)
      this.data.priceListId = this.selectedPriceList;

    if (this.isNew) {
      this.data.concurrencyStamp = null;
      this.tplService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as TPL);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      })
    } else {
      this.tplService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as TPL);
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  mapSaveData(obj: TPL) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  saveClient(list: TPL[]) {
    if (this.isNew) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Thêm mới thành công' });
    } else {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    }
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
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

  isValidateTPL(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];
    if (this.isNew === true) {
      if (this.data.code) {
        this.listData.forEach(x => {
          if (x.code === this.data.code) {
            messages.push({ severity: Constant.messageStatus.warn, detail: 'Trùng mã, vui lòng nhập mã khác!' });
            result = false;
          }
        });
      } else {
        messages.push({ severity: Constant.messageStatus.warn, detail: 'Mã không được trống!' });
        result = false;
      }
    } else {
      if (!this.data.code) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
        result = false;
      } else {
        if (this.data.code !== this.cloneCode) {
          this.datasource.forEach(x => {
            if (this.data.code === x.code) {
              messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
              result = false;
            }
          });
        }
      }
    }
    if (!this.data.name) {
      messages.push({ severity: Constant.messageStatus.warn, detail: 'Tên không được trống!' });
      result = false;
    }
    if (!this.data.phone) {
      messages.push({ severity: Constant.messageStatus.warn, detail: 'Điện thoại không được trống!' });
      result = false;
    }
    if (!this.data.address) {
      messages.push({ severity: Constant.messageStatus.warn, detail: 'Địa chỉ không được trống!' });
      result = false;
    }
    // if (!this.selectedPriceList) {
    //   messages.push({ severity: Constant.messageStatus.warn, detail: 'Bảng giá không được trống!' });
    //   result = false;
    // }
    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }
    return result;
  }

  openDeleteModel(template: TemplateRef<any>, data: TPL) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  delete() {
    this.tplService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;
      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }
}