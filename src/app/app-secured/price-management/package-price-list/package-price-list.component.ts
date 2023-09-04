import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { Message } from '../../../../../node_modules/primeng/primeng';
import { ResponseModel } from '../../../models';
import { BsModalService, BsModalRef } from '../../../../../node_modules/ngx-bootstrap/modal';
import { Router } from '../../../../../node_modules/@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PackagePriceService } from '../../../services/packagePrice.service';
import { PackagePrice } from '../../../models/packagePrice.model';
import { PackTypeService, FormulaService } from '../../../services';
import { SelectModel } from '../../../models/select.model';
import { InputValue } from '../../../infrastructure/inputValue.helper';

@Component({
  selector: 'app-package-price-list',
  templateUrl: './package-price-list.component.html',
  styles: []
})
export class PackagePriceListComponent extends BaseComponent implements OnInit {

  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.packagePrice.name;
  modalTitle: string;
  bsModalRef: BsModalRef;

  listData: PackagePrice[] = [];
  dataModal: PackagePrice;

  listSelectModelPackType: SelectModel[] = [];
  selectedPackType: number;

  listSelectModelFormular: SelectModel[] = [];
  selectedFormular: number;

  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    private packagePrice: PackagePriceService,
    private packTypeService: PackTypeService,
    private formulaService: FormulaService,
  ) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {
    this.initData();
    this.GetPackageSelectModel();
    this.GetFormularSelectModel();
  }

  refresh() {
    this.initData();
  }

  async initData() {
    let cols = [
      Constant.classes.includes.packagePriceList.packType,
      Constant.classes.includes.packagePriceList.formula
    ];

    let res = await this.packagePrice.getAllAsync(cols);
    this.listData = res.data;
  }

  //#region  Select model
  async GetPackageSelectModel() {
    this.listSelectModelPackType = await this.packTypeService.getAllSelectModelAsync();
  }

  async GetFormularSelectModel() {
    this.listSelectModelFormular = await this.formulaService.getAllSelectModelAsync();
  }
  //#endregion

  //#region Modal
  openModal(template: TemplateRef<any>, data: PackagePrice = null) {
    if (data) {
      this.modalTitle = "Cập nhật";
      this.dataModal = data;
    }
    else {
      this.modalTitle = "Tạo mới";
      this.dataModal = new PackagePrice();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openDeleteModal(template: TemplateRef<any>, data: PackagePrice = null) {
    this.dataModal = data;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  async save() {
    if (!this.isValidModel()) return;

    if (this.selectedPackType) {
      this.dataModal.packTypeId = this.selectedPackType;
    }

    if (this.selectedFormular) {
      this.dataModal.formulaId = this.selectedFormular;
    }

    let res: ResponseModel;
    let model = Object.assign({}, this.dataModal);

    if (this.dataModal.id > 0) {
      res = await this.packagePrice.updateAsync(model);
    }
    else {
      res = await this.packagePrice.createAsync(model);
    }

    if (res.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: this.modalTitle + ' thành công' });
    }
    else
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: res.message });

    this.saveClient();
  }

  async delete() {
    let model = Object.assign({}, this.dataModal);
    let res = await this.packagePrice.deleteAsync(model);

    if (res.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: this.modalTitle + ' thành công' });
    }
    else
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: res.message });

    this.saveClient();
  }

  saveClient() {
    this.initData();
    this.dataModal = new PackagePrice();
    this.bsModalRef.hide();
  }

  isValidModel() {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.dataModal.code && this.dataModal.id == 0) {
      this.listData.forEach(x => {
        if (this.dataModal.code === x.code) {
          messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
          result = false;
        }
      });
    }

    if (!this.dataModal.code) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
      result = false;
    }

    if (!this.dataModal.name) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Tên không được để trống!" });
      result = false;
    }

    if (!this.dataModal.valueFrom && this.dataModal.valueFrom!=0) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Giá trị từ không được để trống!" });
      result = false;
    }

    if (!this.dataModal.valueTo && this.dataModal.valueFrom!=0) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Giá trị đến không được để trống!" });
      result = false;
    }

    if (!this.selectedPackType) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Loại đóng gói không được để trống!" });
      result = false;
    }

    if (!this.selectedFormular) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Công thức không được để trống!" });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }
  //
  nameChange(){
    this.dataModal.code =  InputValue.removeCharactersVI(this.dataModal.name);
  }
  //#endregion
}
