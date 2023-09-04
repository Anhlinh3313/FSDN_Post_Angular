import { Component, OnInit, TemplateRef } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Constant } from '../../../infrastructure/constant';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { GeneralModel } from '../../../models';
import { MessageService } from 'primeng/primeng';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { AuthService, UserService } from '../../../services';
import { ChangeCODTypeService } from '../../../services/changeCODType.service';

@Component({
  selector: 'app-change-cod-type',
  templateUrl: './change-cod-type.component.html',
  styles: []
})
export class ChangeCODTypeComponent extends BaseComponent implements OnInit {
  parentPage: string = Constant.pages.general.name;
  currentPage: string = Constant.pages.general.children.changeCodType.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  datasource = [];
  create_name: string = "";
  create_code: string = "";
  isCreate: boolean;
  data: GeneralModel;
  pageSize: 20;
  totalRecords: number = 0;

  constructor(private modalService: BsModalService,
    protected messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    private authService: AuthService,
    private userService: UserService,
    private changeCODTypeService: ChangeCODTypeService,
  ) {
    super(messageService, permissionService, router);
  }
  columnsExport = [
    { field: "id", header: "ID" },
    { field: "code", header: "Mã loại điều chỉnh COD" },
    { field: "name", header: "Tên loại điều chỉnh COD" },
  ];

  //
  async ngOnInit() {
    this.load_dataSource();
  }


  eventEnterSearch() {

  }

  async load_dataSource() {
    this.datasource = [];
    let res = await this.changeCODTypeService.getAll().toPromise();
    if (res && res.data !== null) this.datasource = res.data;
    this.totalRecords = this.datasource.length;
  }
  // async creat_method(model : GeneralModel)
  // {
  //   if(this.check_model(model))
  //   {
  //     let res = await this.changeCODTypeService.create(model).toPromise();
  //     if(res && res.data!==null)
  //     this.messageService.add({ severity: Constant.messageStatus.success, detail: "Tạo mới thành công" }); 
  //     await this.load_dataSource();
  //     this.bsModalRef.hide();
  //   }
  // }
  check_model(model: GeneralModel) {
    if (model.name == "") {
      this.messageService.add({ severity: Constant.messageStatus.error, detail: "Vui lòng nhập tên  " });
      return false;
    }
    if (model.code == "") {
      this.messageService.add({ severity: Constant.messageStatus.error, detail: "vui lòng nhập mã  " });
      return false;
    }
    return true;
  }
  async update_method(model: GeneralModel) {
    if (this.check_model(model)) {
      let res = await this.changeCODTypeService.update(model).toPromise();
      if (res && res !== null)
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Cập nhật thành công" });
      await this.load_dataSource();
      this.bsModalRef.hide();
    }
  }
  // async delete_model(id : number)
  // {
  //   let res = await this.changeCODTypeService.deleteAsync(id);
  //   if(res) this.messageService.add({ severity: Constant.messageStatus.success, detail: "Đã xóa thành công" }); 
  //   await this.load_dataSource();
  //   this.bsModalRef.hide();
  // }
  eventFilterParentCustomer(event) {

  }


  eventOnSelectedParentCustomer() {
  }

  // onPageChange(event: LazyLoadEvent) {
  //   this.pageNumber = event.first / event.rows + 1;
  //   this.pageSize = event.rows;
  //   // this.loadDataSource();
  // }





  openModel(template: TemplateRef<any>, iscreat, data) {
    if (iscreat == true) {
      this.modalTitle = "Tạo mới ";
      this.isCreate = true;
      this.data = new GeneralModel();
    } else {
      this.modalTitle = "Chỉnh sữa : " + data.name;
      this.isCreate = false;
      this.data = data;
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal setwidthbyName animated bounceInRight modal-lg' });
  }


  openDeleteModel(template: TemplateRef<any>, data) {
    this.data = data;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  refresh() {

    // this.initData();
  }



  delete() {

  }
}

