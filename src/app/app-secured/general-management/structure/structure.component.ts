import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { Structure } from '../../../models/structure.model';
import { LazyLoadEvent } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { StructureService } from '../../../services/index';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

declare var jQuery: any;

@Component({
  selector: 'app-structure',
  templateUrl: 'structure.component.html',
  styles: []
})
export class StructureComponent extends BaseComponent implements OnInit {
  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;

  constructor(private modalService: BsModalService, private structureService: StructureService,
    public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
     }

  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.structure.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: Structure;
  selectedData: Structure;
  isNew: boolean;
  listData: Structure[];
  //
  columns: string[] = ["code", "name"];
  datasource: Structure[];
  totalRecords: number;
  rowPerPage: number = 10;

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.structureService.getAll().subscribe(
      x => {
        this.datasource = x.data as Structure[];
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

  openModel(template: TemplateRef<any>, data: Structure = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.cloneCode = this.data.code;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Structure();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openDeleteModel(template: TemplateRef<any>, data: Structure) {
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
    if (!this.isValidStructure()) return;
    let list = [...this.listData];
    if (this.isNew) {

      this.structureService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as Structure);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.structureService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as Structure);
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }

  mapSaveData(obj: Structure) {
    if(obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  delete() {
    this.structureService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }

  saveClient(list: Structure[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
  }

  clone(model: Structure): Structure {
    let data = new Structure();
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

  isValidStructure(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.isNew === true) {
      if (this.data.code) {
        this.datasource.forEach(x => {
          if(this.data.code === x.code) {
            messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
            result = false;
          }
        });
      } else {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
        result = false;
      }
      if (!this.data.name) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Tên không được để trống!" });
        result = false;
      }
    } else {
      if (!this.data.code) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
        result = false;
      } else {
        if (this.data.code !== this.cloneCode) {
          this.datasource.forEach(x => {
            if(this.data.code === x.code) {
              messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
              result = false;
            }
          });
        }
      }
      if (!this.data.name) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Tên không được để trống!" });
        result = false;
      }
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
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
