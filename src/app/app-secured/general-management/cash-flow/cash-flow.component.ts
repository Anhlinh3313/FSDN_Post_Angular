import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
//
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { CashFlowModel } from '../../../models';
import { CashFlowServices } from '../../../services';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { BaseModel } from '../../../models/base.model';
import { LazyLoadEvent } from 'primeng/primeng';
import { FilterUtil } from '../../../infrastructure/filter.util';


@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styles: []
})
export class CashFlowComponent extends BaseComponent implements OnInit {
  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.packType.name;
  //
  modalTitle: string;
  bsModalRef: BsModalRef;
  txtFilterGb: any;
  //
  selectedData: CashFlowModel;
  isNew: boolean;
  listData: CashFlowModel[];
  data: CashFlowModel;
  datasource: CashFlowModel[];
  //
  pageSize: number;
  pageNumber: number;
  rowPerPage: number = 10;
  totalRecord: number;
  columns: string[] = ["code", "name"];
  //
  constructor(
    private modalService: BsModalService,
    public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    //
    public cashFlowServices: CashFlowServices,
  ) {
    super(messageService, permissionService, router);
    this.pageNumber = 1;
    this.pageSize = 20;
  }
  //
  //
  ngOnInit() {
    this.initData();
  }

  async initData() {
    this.getCashFlow();
  }

  async getCashFlow() {
    const results = await this.cashFlowServices.getAllAsync([], this.pageSize, this.pageNumber);
    if (results.isSuccess) {
      this.datasource = results.data as CashFlowModel[];
      this.totalRecord = results.dataCount;
      this.listData = this.datasource.slice(0, this.rowPerPage);
    } else {
      this.listData = [];
      this.totalRecord = 0;
    }
  }

  refresh() {
    this.initData();
  }
  mapSaveData(obj: CashFlowModel) {
    if(obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }
  clone(model: CashFlowModel): CashFlowModel {
    let data = new CashFlowModel();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }
  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }
  saveClient(list: CashFlowModel[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
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
        this.totalRecord = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }
  //
  openModel(template: TemplateRef<any>, data: CashFlowModel = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new CashFlowModel();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  openDeleteModel(template: TemplateRef<any>, data: CashFlowModel) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  createOrUpdate() {
    let list = [...this.listData];
    if (this.isNew) {

      this.cashFlowServices.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as CashFlowModel);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.cashFlowServices.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as CashFlowModel);
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }
  delete() {
    this.cashFlowServices.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }

  keyDownFunction(event) {
    if(event.keyCode == KeyCodeUtil.charEnter) {
      this.createOrUpdate();
    }
    if((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.createOrUpdate();
      event.preventDefault();
      return false;
    }
  }
}

