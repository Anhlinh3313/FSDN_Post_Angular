import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { Formula, ServiceDVGTPrice, ServiceDVGT } from "../../../models";
import { LazyLoadEvent, CalendarModule, Calendar } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  FormulaService,
  ServiceDVGTPriceService,
  ServiceDVGTService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { PriceListDVGTService } from "../../../services/price-list-dvgt.service";
import { PriceListDVGT } from "../../../models/priceListDVGT.model";

declare var jQuery: any;

@Component({
  selector: "app-service-dvgt-price",
  templateUrl: "service-dvgt-price.component.html",
  styles: []
})
export class ServiceDVGTPriceComponent extends BaseComponent implements OnInit {

  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.serviceDVGTPrice.name;
  modalTitle: string;
  bsModalRef: BsModalRef;

  listData: PriceListDVGT[] = [];
  dataModal: PriceListDVGT;

  constructor(
    private modalService: BsModalService,
    private formulaService: FormulaService,
    protected messageService: MessageService,
    private serviceDVGTPriceService: ServiceDVGTPriceService,
    private priceListDVGTService: PriceListDVGTService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {
    this.initData();
  }

  refresh() {
    this.initData();
  }

  async initData() {
    let res = await this.priceListDVGTService.getAllAsync();
    this.listData = res.data;
  }

  //#region Modal
  openModal(template: TemplateRef<any>, data: PriceListDVGT = null) {
    if (data) {
      this.modalTitle = "Cập nhật";
      this.dataModal = data;
    }
    else {
      this.modalTitle = "Tạo mới";
      this.dataModal = new PriceListDVGT();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openDeleteModal(template: TemplateRef<any>, data: PriceListDVGT = null) {
    this.dataModal = data;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  async save() {
    if (!this.isValidModel()) return;

    let res: ResponseModel;
    let model = Object.assign({}, this.dataModal);

    if (this.dataModal.id > 0) {
      res = await this.priceListDVGTService.updateAsync(model);
    }
    else {
      res = await this.priceListDVGTService.createAsync(model);
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
    let res = await this.priceListDVGTService.deleteAsync(model);

    if (res.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: this.modalTitle + ' thành công' });
    }
    else
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: res.message });

    this.saveClient();
  }

  saveClient() {
    this.initData();
    this.dataModal = new PriceListDVGT();
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

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }
  //#endregion
}
