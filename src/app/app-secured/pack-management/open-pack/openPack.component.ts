import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { IBaseModel } from "../../../models/abstract/ibaseModel.interface";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService,
  PackageService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { Shipment } from "../../../models/shipment.model";
import { User, Package } from "../../../models/index";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { StringHelper } from "../../../infrastructure/string.helper";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { ScanOpenCheckPackage } from "../../../models/scanOpenCheckPackage.model";
import { ScanShipmentInPackage } from "../../../models/scanShipmentInPackage.model";
import { PackageStatusHelper } from "../../../infrastructure/packageStatus.helper.";
import { ArrayHelper } from "../../../infrastructure/array.helper";

declare var jQuery: any;

@Component({
  selector: "app-openPack",
  templateUrl: "openPack.component.html",
})
export class OpenPackComponent extends BaseComponent implements OnInit {
  percentScanAllShip: number = 0;
  totalScanAllShipFail: number = 0;
  totalScanAllShipSuccess: number = 0;
  isCheckScanAllShip: boolean = false;
  listAllShipCheckComplete: Shipment[] = [];
  listShipScanSuccess: any[] = []; // lưu các mã vận đơn đã kiểm thành công
  countScanSuccess: number = 0; // lưu số vận đơn đã kiểm thành công (bao gồm cả quét từng đơn hoặc là kiểm all)
  pageNumber: number = 1;
  pageSize: number = 10;
  txtShipmentNumber: string;
  txtPackageNumber: string;
  package: Package = new Package();
  isCheckOpenPackage: boolean = true;
  @ViewChild("txtShipment") txtShipmentNumberRef: ElementRef;
  @ViewChild("txtPackage") txtPackageNumberRef: ElementRef;
  pack = environment.pack;
  hub = environment;
  txtSearchShipmentNumber: any;
  selectedPackage: Package;
  datasourceShipment: Shipment[];
  packages: Package[];
  txtFilterGbLeft: any;
  txtFilterGbRight: any;
  showAssign: boolean = false;
  confirmOpenPackageSuccess: boolean;
  currentUser: User;
  constructor(
    private bsModalService: BsModalService,
    private authService: AuthService,
    protected messageService: MessageService,
    private userService: UserService,
    private packageService: PackageService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.pack.name;
  currentPage: string = Constant.pages.pack.children.openPack.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Package[];
  listStatusId: any = 1;
  listStatus: SelectItem[] = [{ value: null, label: '-- Tất cả --' },
  { value: 1, label: 'Chờ kiểm' },
  { value: 2, label: 'Đã kiểm' },
  { value: 3, label: 'Kiểm lỗi' }];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "code", "sealNumber", "weight", "content", "length", "width", "height", "calWeight", "shipmentNumber", "numPick", "packAppointmentTime",
    "orderDate", "fromHubRouting.name", "cusNote", "senderName", "senderPhone", "pickingAddress", "packNote", "shipmentStatus.name",
    "package.code"];

  columnsFilter = [
    { field: 'code', header: "Mã" + this.pack },
    { field: 'sealNumber', header: 'Số Seal' },
    { field: 'weight', header: 'TL (gam)' },
    { field: 'content', header: 'Nội dung' },
    { field: 'length', header: 'Chiều dài (cm)' },
    { field: 'width', header: 'Chiều rộng (cm)' },
    { field: 'height', header: 'Chiều cao (cm)' },
    { field: 'calWeight', header: 'TL QĐ (gam)' }
  ]

  columnsFilterRight = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'package.code', header: 'Mã ' + this.pack },
    { field: 'numPick', header: 'Lấy lại' },
    { field: 'pickupAppointmentTime', header: 'Ngày hẹn lại' },
    { field: 'orderDate', header: 'Ngày vận đơn' },
    { field: 'fromHubRouting.name', header: 'Tuyến' },
    { field: 'cusNote', header: 'Ghi chú khách hàng' },
    { field: 'senderName', header: 'Người gửi' },
    { field: 'senderPhone', header: 'Số đt người gửi' },
    { field: 'pickAddress', header: 'Địa chỉ lấy hàng' },
    { field: 'pickNote', header: 'Ghi chú lấy hàng' },
    { field: 'shipmentStatus.name', header: 'Tình trạng' },
  ]


  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  selectedDataRight: Shipment[];
  listDataRight: Shipment[];
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  hubRoutings: SelectItem[];
  selectedHubRouting: string;
  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  riders: SelectItem[];
  selectedRider: User;

  //
  packageCodes: SelectItem[];
  selectedCodePackage: number;

  async ngOnInit() {
    this.currentUser = await this.authService.getAccountInfoAsync();
    this.initData();
  }

  initData() {
    this.userService.getEmpByCurrentHub().subscribe(x => {
      this.riders = [];
      let users = x.data as User[];

      users.forEach(element => {
        this.riders.push({ label: element.fullName, value: element });
      });

      this.selectedRider = null;
    });

    this.selectedData = null;
    this.listDataRight = [];
  }

  // quét mã gói cần mở
  async evenScanePackageNumber(txtPackageNumber) {
    this.messageService.clear();
    this.txtPackageNumberRef.nativeElement.focus();
    this.txtPackageNumberRef.nativeElement.select();
    if (StringHelper.isNullOrEmpty(txtPackageNumber.value)) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng nhập thông tin gói cần kiểm tra!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    // quét mã Seal
    let model = new ScanOpenCheckPackage();
    model.sealNumber = txtPackageNumber.value.trim();
    const res = await this.packageService.trackingPackageAsync(model);
    if (res) {
      if (res.isSuccess) {
        const data = res.data as Package;
        if (data) {
          this.messageService.add({ severity: Constant.messageStatus.success, detail: "Đã tìm thấy thông tin gói!" });
          this.package = data;
          this.txtPackageNumber = null;
          if (this.package.statusId == PackageStatusHelper.IsClosed) this.isCheckOpenPackage = false;
          else this.isCheckOpenPackage = true;
          if (this.package.statusId == PackageStatusHelper.IsOpen) this.confirmOpenPackageSuccess = true;
          else this.confirmOpenPackageSuccess = false;
          this.loadShipment();
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy thông tin gói. vui lòng kiểm tra lại!" });
        }

      }
    }
  }

  // xác nhận mở gói
  async confirmOpenPackage() {
    this.messageService.clear();
    let model = new Object as IBaseModel;
    model.id = this.package.id;
    const res = await this.packageService.openCheckedPackageAsync(model);
    if (res) {
      if (res.isSuccess) {
        const data = res.data as Package;
        if (data) {
          this.package = data;
          this.txtPackageNumber = null;
          if (this.package.statusId == PackageStatusHelper.IsClosed) this.isCheckOpenPackage = false;
          else this.isCheckOpenPackage = true;
          if (this.package.statusId == PackageStatusHelper.IsOpen) this.confirmOpenPackageSuccess = true;
          else this.confirmOpenPackageSuccess = false;
          this.messageService.add({ severity: Constant.messageStatus.success, detail: "Xác nhận mở gói thành công!" });
          this.loadShipment();
        }
      }
    }
  }

  async loadShipment() {
    const res = await this.packageService.getShipmentByPackageIdAsync(this.package.id, this.listStatusId, this.pageNumber, this.pageSize).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.datasource = x.data as Shipment[] || [];
        this.totalRecords = this.datasource.length > 0 ? this.datasource[0].totalCount : 0;
      }
    );
  }

  onPageChange(event: LazyLoadEvent) {
    this.pageNumber = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadShipment();
  }

  // quét vận đơn mở gói
  async evenScaneShipmentNumber(txtShipmentNumber) {
    this.messageService.clear();
    this.txtShipmentNumberRef.nativeElement.focus();
    this.txtShipmentNumberRef.nativeElement.select();

    if (StringHelper.isNullOrEmpty(txtShipmentNumber.value)) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mã vận đơn trống, vui lòng scan mã vận đơn!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    let shipmentOutPackage = new ScanShipmentInPackage();
    shipmentOutPackage.shipmentNumber = txtShipmentNumber.value.trim();
    shipmentOutPackage.packageId = this.package.id;
    const res = await this.packageService.scanShipmentOutPackageAsync(shipmentOutPackage);
    if (res) {
      if (res.isSuccess) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Quét thành công!" });
        this.txtShipmentNumber = null;
        this.listShipScanSuccess.push(shipmentOutPackage.shipmentNumber.toUpperCase());
        this.countScanSuccess++;
        // bổ sung nv kiểm gói chính là nv hiện tại
        // this.datasource.filter(f => {
        //   if (f.shipmentNumber.toUpperCase() === shipmentOutPackage.shipmentNumber.toUpperCase()) {
        //     f.outputUserFullName = this.currentUser.fullName;
        //   }
        // });
        this.loadShipment();
      }
    }
  }

  refresh() {
    if (this.bsModalRef) this.bsModalRef.hide();
    this.package = new Package();
    this.isCheckOpenPackage = true;
    this.confirmOpenPackageSuccess = false;
    this.txtPackageNumber = null;
    this.txtShipmentNumber = null;
    this.datasource = [];
    this.totalRecords = 0;
    this.pageNumber = 1;
    this.pageSize = 10;
    this.countScanSuccess = 0;
    this.listShipScanSuccess = [];
    this.listAllShipCheckComplete = [];
  }

  noneCheckPackage() {
    this.bsModalRef.hide();
  }

  onclickCheckedPackage(template: TemplateRef<any>) {
    this.messageService.clear();
    this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  async completeCheckedPackage() {
    this.messageService.clear();
    // if (this.countScanSuccess === 0) {
    //   this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm gói trước!" });
    //   return;
    // }
    let model = new Object as IBaseModel;
    model.id = this.package.id;
    const res = await this.packageService.completeCheckedPackageAsync(model);
    if (res) {
      if (res.isSuccess) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Hoàn tất kiểm gói thành công!" });
        // refresh
        this.refresh();
      }
    }
  }

  async onClickScanAllAndCompleteCheckedPackage(template: TemplateRef<any>) {
    this.messageService.clear();
    this.isCheckScanAllShip = false;
    this.totalScanAllShipFail = 0;
    this.totalScanAllShipSuccess = 0;
    this.percentScanAllShip = 0;

    // kiểm tra danh sách vận đơn cần mở gói
    if (!this.totalRecords) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "DS vận đơn trống, vui lòng kiểm tra lại!" });
      return;
    }

    this.listAllShipCheckComplete = [];
    const res = await this.packageService.getShipmentByPackageIdAsync(this.package.id, 1, 1, this.totalRecords).then(
      async x => {
        if (!this.isValidResponse(x)) return;
        const data = x.data as Shipment[] || [];
        if (ArrayHelper.isNullOrZero(data)) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: "DS vận đơn trống, vui lòng kiểm tra lại!" });
          return;
        }

        // lấy ra các vận đơn chưa kiểm
        this.listAllShipCheckComplete = data.filter(f => !this.listShipScanSuccess.includes(f.shipmentNumber.toUpperCase().trim()));
      }
    );

    this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  async scanAllAndCompleteCheckedPackage() {
    this.messageService.clear();
    this.isCheckScanAllShip = true;

    let shipmentOutPackage = new ScanShipmentInPackage();
    shipmentOutPackage.packageId = this.package.id;
    // tự động scan kiểm từng vận đơn
    await Promise.all(this.listAllShipCheckComplete.map(async m => {
      shipmentOutPackage.shipmentNumber = m.shipmentNumber.trim();
      const res = await this.packageService.scanShipmentOutPackageAsync(shipmentOutPackage);
      if (res) {
        if (res.isSuccess) {
          this.countScanSuccess++;
          this.totalScanAllShipSuccess++;
          this.percentScanAllShip = Math.ceil(this.totalScanAllShipSuccess * 100 / this.listAllShipCheckComplete.length);
        } else {
          this.totalScanAllShipFail++;
        }
      }
    }));

    if (this.percentScanAllShip === 100) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: `Kiểm nhanh ${this.pack} thành công!` });
    }

    // hoàn tất kiểm gói
    await this.completeCheckedPackage();
  }
}
