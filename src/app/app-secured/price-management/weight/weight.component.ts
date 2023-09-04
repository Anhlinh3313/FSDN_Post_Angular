import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { Weight } from '../../../models/weight.model';
import { Formula } from '../../../models/formula.model';
import { WeightGroup } from '../../../models/weightGroup.model';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { WeightGroupService, StructureService } from '../../../services';
import { WeightService } from '../../../services';
import { FormulaService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { SelectModel } from '../../../models/select.model';

declare var jQuery: any;

@Component({
  selector: 'app-weight',
  templateUrl: 'weight.component.html',
  styles: []
})
export class WeightComponent extends BaseComponent implements OnInit {
  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private weightService: WeightService, private formulaService: FormulaService,
    private weightGroupService: WeightGroupService, public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    private structureService: StructureService
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.weight.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: Weight;
  selectedData: Weight;
  isNew: boolean;
  listData: Weight[];
  //
  structure: SelectModel[] = [];
  selectedStructure: number;
  //
  columns: string[] = ["code", "weightFrom", "weightTo", "weightPlus", "formula.name", "weightGroup.name",];
  datasource: Weight[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  formulas: SelectModel[] = [];
  selectedFormula: number;
  //
  weightGroups: SelectModel[] = [];
  selectedWeightGroup: number;
  //
  selectedWeight: string;
  weight: SelectItem[];
  event: LazyLoadEvent;
  //
  ngOnInit() {
    this.initData();
    this.loadStructure();
  }

  async initData() {
    let includes = [];
    includes.push(Constant.classes.includes.weight.formula);
    includes.push(Constant.classes.includes.weight.weightGroup);
    includes.push(Constant.classes.includes.weight.structure);

    this.weightService.getAll(includes).subscribe(
      x => {
        this.datasource = x.data as Weight[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadWeight();
      }
    );

    // this.formulaService.getAll().subscribe(
    //   x => this.formulas = x.data as Formula[]
    // )

    // this.weightGroupService.getAll().subscribe(
    //   x => this.weightGroups = x.data as WeightGroup[]
    // )

    this.weightGroups = await this.weightGroupService.getAllSelectModelAsync();

    this.formulas = await this.formulaService.getAllSelectModelAsync();

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }

  refresh() {
    this.initData();
    this.first = 0;
  }

  async loadStructure() {
    this.structure = await this.structureService.getAllSelectModelAsync();
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
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
        //
        if (this.selectedWeight) {
          filterRows = filterRows.filter(
            x => {
              if (x.weightGroup) {
                return x.weightGroup.name === this.selectedWeight;
              } else {
                return false;
              }
            });
        }
        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  openModel(template: TemplateRef<any>, data: Weight = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.selectedFormula = data.formulaId;
      this.selectedWeightGroup = data.weightGroupId;
      this.cloneCode = this.data.code;
      this.selectedStructure = data.structureId;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Weight();
      this.data.weightPlus = 0;
      this.selectedFormula = null;
      this.selectedWeightGroup = null;
      this.selectedStructure = null;
      this.data.isWeightCal = true;
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  clone(model: Weight): Weight {
    let data = new Weight();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: Weight, c2: Weight): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  save() {
    if (!this.isValidWeight()) return;
    let list = [...this.listData];

    if (this.selectedFormula) {
      this.data.formulaId = this.selectedFormula;
    }

    if (this.selectedWeightGroup) {
      this.data.weightGroupId = this.selectedWeightGroup;
    }

    this.data.structureId = this.selectedStructure;

    if (this.isNew) {
      this.weightService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as Weight);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.weightService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as Weight);
        this.mapSaveData(obj);
        
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }

  mapSaveData(obj: Weight) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.formula = this.formulas.find(x => x.value == this.selectedFormula).data;
      this.data.weightGroup = this.weightGroups.find(x => x.value == this.selectedWeightGroup).data;
      this.data.structure = this.structure.find(x => x.value == this.selectedStructure).data;
      
    }
  }

  saveClient(list: Weight[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
    this.initData();
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

  isValidWeight(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.isNew === true) {
      if (this.data.code) {
        this.datasource.forEach(x => {
          if (this.data.code === x.code) {
            messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
            result = false;
          }
        });
      } else {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã mức cân không được để trống!" });
        result = false;
      }
      if (!this.selectedWeightGroup) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mức cân đến không được để trống!" });
        result = false;
      }
      if (!this.selectedFormula) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Công thức không được để trống!" });
        result = false;
      }
      // if (!this.selectedStructure) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Loại hàng hóa không được để trống!" });
      //   result = false;
      // }
      // if (!this.data.weightFrom && this.data.weightFrom != 0) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Mức cân bắt đầu không được để trống!" });
      //   result = false;
      // }
      // if (this.data.weightTo == null) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Mức cân đến không được để trống!" });
      //   result = false;
      // }
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
      // if (!this.selectedStructure) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Loại hàng hóa không được để trống!" });
      //   result = false;
      // }
      if (!this.data.weightFrom && this.data.weightFrom !== 0) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mức cân bắt đầu không được để trống!" });
        result = false;
      }
      if (this.data.weightTo == null) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mức cân đến không được để trống!" });
        result = false;
      }
      // if (!this.data.valueFrom && this.data.valueFrom !== 0) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Giá trị từ không được để trống!" });
      //   result = false;
      // }
      // if (!this.data.valueTo && this.data.valueTo !== 0) {
      //   messages.push({ severity: Constant.messageStatus.warn, detail: "Giá trị đến không được để trống!" });
      //   result = false;
      // }
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  openDeleteModel(template: TemplateRef<any>, data: Weight) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  delete() {
    this.weightService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }
  loadWeight() {
    this.selectedWeight = null;
    let uniqueWeight = [];
    this.weight = [];

    this.datasource.forEach(x => {
      if (uniqueWeight.length === 0) {
        this.weight.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueWeight.indexOf(x.weightGroupId) === -1 && x.weightGroupId) {
        uniqueWeight.push(x.weightGroupId);
        this.weight.push({
          label: x.weightGroup.name,
          value: x.weightGroup.name
        });
      }
    });
  }
  changeWeight() {
    this.loadLazy(this.event);
  }
}