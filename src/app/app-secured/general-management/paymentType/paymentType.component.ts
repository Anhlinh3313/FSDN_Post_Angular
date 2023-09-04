import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { PaymentType } from '../../../models/paymentType.model';
import { LazyLoadEvent } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { PaymentTypeService } from '../../../services/index';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

declare var jQuery: any;

@Component({
  selector: 'app-paymentType',
  templateUrl: 'paymentType.component.html',
  styles: []
})
export class PaymentTypeComponent extends BaseComponent implements OnInit {
  first: number = 0;
  txtFilterGb: any;

  constructor(private modalService: BsModalService, private paymentTypeService: PaymentTypeService,
    public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
     }

  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.paymentType.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: PaymentType;
  selectedData: PaymentType;
  isNew: boolean;
  listData: PaymentType[];
  //
  columns: string[] = ["code", "name"];
  datasource: PaymentType[];
  totalRecords: number;
  rowPerPage: number = 10;

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.paymentTypeService.getAll().subscribe(
      x => {
        this.datasource = x.data as PaymentType[];
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

  ngAfterViewInit() {
    // jQuery(document).ready(function () {
    //   jQuery('.i-checks').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green',
    //   });
    //   jQuery('.footable').footable();
    // });
  }

  openModel(template: TemplateRef<any>, data: PaymentType = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new PaymentType();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openDeleteModel(template: TemplateRef<any>, data: PaymentType) {
    this.selectedData = data;
    this.data = this.clone(data);
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
    this.first = 0;
  }

  save() {
    let list = [...this.listData];
    if (this.isNew) {

      this.paymentTypeService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as PaymentType);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.paymentTypeService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as PaymentType);
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }

  mapSaveData(obj: PaymentType) {
    if(obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  delete() {
    this.paymentTypeService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }

  saveClient(list: PaymentType[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
  }

  clone(model: PaymentType): PaymentType {
    let data = new PaymentType();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
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
    if(event.keyCode == KeyCodeUtil.charEnter) {
      this.save();
    }
    if((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.save();
      event.preventDefault();
      return false;
    }
  }
}
