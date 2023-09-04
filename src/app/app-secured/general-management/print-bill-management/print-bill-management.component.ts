import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { FormPrintService } from '../../../services/form-print.service';
import { SelectModel } from '../../../models/select.model';
import { FromPrintViewModel } from '../../../view-model/form-print.viewModel';
import { GeneralModel } from '../../../models';
import { FormPrintTypeHelper } from '../../../infrastructure/formPrintType.helper';

declare var jQuery: any;

@Component({
  selector: 'app-print-bill-management',
  templateUrl: 'print-bill-management.component.html',
  styles: []
})
export class PrintBillManagementComponent extends BaseComponent implements OnInit {
  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.paymentType.name;
  public editorValue: string = '';
  name = 'ng2-ckeditor';
  ckeConfig: any;
  log: string = '';
  @ViewChild("myckeditor") ckeditor: any;
  //
  formPrintTypeSelected: any = null;
  formPrintTypes: SelectModel[] = [];
  //
  formPrints: SelectModel[] = [];
  formPrintselected: any = null;
  dataformPrints: FromPrintViewModel;
  cloneFromPrint: FromPrintViewModel;
  //
  data: FromPrintViewModel = new FromPrintViewModel();
  dataNumOrder: any;
  dataCode: any;
  dataName: any;
  //
  numOrder: any;
  formPrintBody: any;
  isPublic: boolean;
  //
  bsModalRef: BsModalRef;
  isNew: boolean;
  // dataEditor: any;
  constructor(
    public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    public formPrintService: FormPrintService,
    public modalService: BsModalService,
  ) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {
    this.ckeConfig = {
      allowedContent: true,
      extraPlugins: 'divarea',
      forcePasteAsPlainText: true
    };
    this.loadFormPrintType();
  }
  async loadFormPrintType() {
    // if (this.formPrintTypes.length == 0) {
    //   this.loadAllFormPrint();
    // }
    await this.formPrintService.getFormPrintTypeAsync().then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.formPrintTypes = [];
        this.formPrintTypes.push({ value: null, label: `-- chọn loại mẫu in --` })
        let datas = x.data as GeneralModel[];
        datas.map(m => this.formPrintTypes.push({ value: m.id, label: m.name, data: m }));
      }
    );
  }

  loadAllFormPrint() {
    this.formPrints = [];
    this.formPrintService.getAllAsync().then(
      x => {
        this.formPrints.push({ value: null, label: `-- chọn mẫu in --` })
        if (!this.isValidResponse(x)) return;
        let datas = x.data as GeneralModel[];
        datas.map(m => this.formPrints.push({ value: m.id, label: `${m.code} - ${m.name}`, data: m }));
        this.formPrints.push({ value: 0, label: "-- Tạo mới mẫu in --" });
        this.formPrintselected = null;
      }
    )
  }

  loadDataFormPrint() {
    this.formPrints = [];
    this.formPrintService.getFormPrintByTypeAsync(this.formPrintTypeSelected).then(
      x => {
        this.formPrints.push({ value: null, label: `-- chọn mẫu in --` })
        if (!this.isValidResponse(x)) return;
        let datas = x.data as GeneralModel[];
        datas.map(m => this.formPrints.push({ value: m.id, label: `${m.code} - ${m.name}`, data: m }));
        this.formPrints.push({ value: 0, label: "-- Tạo mới mẫu in --" });
        this.formPrintselected = null;
      }
    )
  }

  onChange($event: any): void {
    //this.log += new Date() + "<br />";
  }
  public onReady(editor) {
    editor.ui.view.editable.element.parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.view.editable.element,
    );
  }
  onChangeFormPrint(template: TemplateRef<any>, ) {
    if (this.formPrintselected == 0) {
      this.openCreateModel(template);
      this.formPrintselected = null;
    }
    else {
      let cloneSelectedFromPrint = this.formPrintselected;
      this.formPrints.forEach(x => {
        let obj = x.data as FromPrintViewModel;
        if (obj) {
          if (cloneSelectedFromPrint === obj.id) {
            this.dataformPrints = obj;
            this.changeFormPrint();
          }
          if (cloneSelectedFromPrint == null) {
            this.resetFrom();
          }
        }
      });
    }
  }
  changeFormPrint() {
    let fromPrint = this.dataformPrints;
    this.cloneFromPrint = Object.assign({}, fromPrint);
    this.resetFrom()
    if (fromPrint) {
      this.numOrder = fromPrint.numOrder;
      this.formPrintBody = fromPrint.formPrintBody;
      this.isPublic = fromPrint.isPublic;
    }
  }
  resetFrom() {
    this.numOrder = null;
    this.formPrintBody = null;
    this.isPublic = false;
  }
  openCreateModel(template: TemplateRef<any>) {
    this.isNew = true;
    this.dataNumOrder = 5;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  async create() {
    this.messageService.clear();
    if (!this.formPrintTypeSelected) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng chọn lại mẫu in!` });
      return;
    }
    this.data.name = this.dataName;
    this.data.code = this.dataCode;
    if (this.dataNumOrder) this.data.numOrder = this.dataNumOrder;
    else this.data.numOrder = 5;
    this.data.formPrintTypeId = this.formPrintTypeSelected;
    this.data.isPublic = false;
    this.data.formPrintBody = "";
    this.formPrintService.createAsync(this.data).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Tạo mới thành công.` });
        this.reset();
        this.loadDataFormPrint();
        this.bsModalRef.hide();
      }
    )
  }
  reset() {
    this.data = new FromPrintViewModel();
    this.dataName = null;
    this.dataCode = null;
    this.dataNumOrder = null;
    this.formPrintselected = null;
    this.numOrder = 0;
    this.isPublic = false;
  }

  async update() {
    this.messageService.clear();
    var data = new FromPrintViewModel();
    let cloneSelectedFromPrint = this.formPrintselected;
    this.formPrints.forEach(x => {
      let obj = x.data as FromPrintViewModel;
      if (obj) {
        if (cloneSelectedFromPrint === obj.id) {
          data = obj;
        }
      }
    });

    data.formPrintBody = this.formPrintBody;
    data.numOrder = this.numOrder;
    data.isPublic = this.isPublic;
    await this.formPrintService.updateAsync(data).then(
      x => {
        if (!this.isValidResponse(x)) return;
        let result = x.data;
        data.concurrencyStamp = result.concurrencyStamp;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Cập nhật dữ liệu thành công!` });
      }
    );
  }
}
