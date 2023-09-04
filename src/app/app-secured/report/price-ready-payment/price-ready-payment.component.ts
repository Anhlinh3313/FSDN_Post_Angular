import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { ReportSumaryComponent } from '../report-sumary/report-sumary.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentService, HubService, ServiceDVGTService, UserService, CustomerService, ServiceService, PaymentTypeService, ShipmentStatusService, ReportService, UploadService, ProvinceService } from '../../../services';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { Shipment, Customer } from '../../../models';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';

@Component({
  selector: 'app-price-ready-payment',
  templateUrl: './price-ready-payment.component.html',
  styles: []
})
export class PriceReadyPaymentComponent extends ReportSumaryComponent implements OnInit {
  type: string = ShipmentTypeHelper.pricereadypayment;
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.priceReadyPayment.name;

  columns: string[] = ["id", "shipmentNumber", "requestShipmentId", "cusNote", "orderDate", "paymentType.name", "service.name",
    "defaultPrice", "fuelPrice", "remoteAreasPrice", "totalDVGT", "vatPrice", "totalPrice", "shipmentStatus.name", "deliverUser.fullName",
    "senderName", "senderPhone", "companyFrom", "pickingAddress", "fromWard.district.province.name", "fromHub.name", "fromHubRouting.name",
    "receiverName", "receiverPhone", "companyTo", "shippingAddress", "realRecipientName", "endDeliveryTime", "toWard.district.province.name",
    "toHub.name", "toHubRouting.name"];
  columnsExp: any[] = [
    { field: "id", header: 'ID' },
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "requestShipmentId", header: 'Mã bill tổng' },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi' },
    { field: "paymentType.name", header: 'HTTT' },
    { field: "service.name", header: 'Dịch vụ' },
    { field: "defaultPrice", header: 'Cước chính' },
    { field: "fuelPrice", header: 'PPXD' },
    { field: "remoteAreasPrice", header: 'VSVX' },
    { field: "totalDVGT", header: 'Phí DVGT' },
    { field: "vatPrice", header: 'VAT' },
    { field: "totalPrice", header: 'Tổng cước' },
    { field: "shipmentStatus.name", header: 'Trạng thái' },
    { field: "deliverUser.fullName", header: 'Nhân viên gửi' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromWard.district.province.name", header: 'Tỉnh đi' },
    { field: "fromHub.name", header: 'Trạm lấy' },
    { field: "fromHubRouting.name", header: 'Tuyến lấy' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "realRecipientName", header: 'Tên người nhận thực tế' },
    { field: "endDeliveryTime", header: 'TG giao hàng' },
    { field: "toWard.district.province.name", header: 'Tỉnh đến' },
    { field: "toHub.name", header: 'Trạm giao' },
    { field: "toHubRouting.name", header: 'Tuyến giao' },
  ];

  constructor(
    protected modalService: BsModalService,
    protected persistenceService: PersistenceService,
    protected messageService: MessageService,
    protected shipmentService: ShipmentService,
    protected hubService: HubService,
    protected serviceDVGTService: ServiceDVGTService,
    protected userService: UserService,
    protected customerService: CustomerService,
    protected serviceService: ServiceService,
    protected paymentTypeService: PaymentTypeService,
    protected shipmentStatusService: ShipmentStatusService,
    protected reportService: ReportService,
    protected bsModalRef: BsModalRef,
    protected uploadService: UploadService,
    public permissionService: PermissionService,
    protected provinceService: ProvinceService,
    public router: Router
    // allDatasource: Shipment[],
  ) {
    super(modalService, persistenceService, messageService, shipmentService, hubService, serviceDVGTService, userService, customerService, serviceService, paymentTypeService, shipmentStatusService, reportService, bsModalRef, uploadService, provinceService,permissionService, router,);
  }

  customer: any;
  // customers: SelectModel[];
  filteredCustomers: any;

  ngOnInit() {
    this.initData(this.type);
    this.loadFilter();
  }

  async loadAllShipment(arrPageNumber: number[]): Promise<Shipment[]> {
    let data: Shipment[] = [];
    await Promise.all(arrPageNumber.map(async x => {
      this.shipmentAllFilterViewModel.PageNumber = x;
      if (this.shipmentAllFilterViewModel.PageSize === 0) {
        this.shipmentAllFilterViewModel.PageSize = this.rowPerPage;
      }
      const res = await this.shipmentService.postByTypeAsync(this.shipmentAllFilterViewModel);
      if (res) {
        const arr = res.data as Shipment[];
        data = Array.from(new Set(data.concat(arr)));
        this.sumTotalReceive();
      }
    }));
    return data;
  }

  mapDataExport() {
    let data: any[] = [];

    data.push([
      'ID',
      'Mã vận đơn',
      'Mã bill tổng',
      'Yêu cầu phục vụ',
      'Ngày gửi',
      'HTTT',
      'Dịch vụ',
      'Cước chính',
      'PPXD',
      'VSVX',
      'Phí DVGT',
      'VAT',
      'Tổng cước',
      'Trạng thái',
      'Nhân viên gửi',
      'Tên người gửi',
      'Đt gửi',
      'CTY gửi',
      'Địa chỉ gửi',
      'Tỉnh đi',
      'Trạm lấy',
      'Tuyến lấy',
      'Tên người nhận',
      'Đt nhận',
      'CTY nhận',
      'Địa chỉ nhận',
      'Tên người nhận thực tế',
      'TG giao hàng',
      'Tỉnh đến',
      'Trạm giao',
      'Tuyến giao',
    ]);

    this.allDatasource.map((shipment) => {
      let ship = Object.assign({}, shipment);
      ship.orderDate = this.formatDate(shipment.orderDate);
      ship.endDeliveryTime = this.formatDate(shipment.endDeliveryTime);
      data.push([
        ship.id,
        ship.shipmentNumber,
        ship.requestShipmentId,
        ship.cusNote,
        ship.orderDate,
        ship.paymentType ? ship.paymentType.name : '',
        ship.service ? ship.service.name : '',
        ship.defaultPrice,
        ship.fuelPrice,
        ship.remoteAreasPrice,
        ship.totalDVGT,
        ship.vatPrice,
        ship.totalPrice,
        ship.shipmentStatus ? ship.shipmentStatus.name : '',
        ship.deliverUser ? ship.deliverUser.fullName : '',
        ship.senderName,
        ship.senderPhone,
        ship.companyFrom,
        ship.pickingAddress,
        ship.fromWard.district.province ? ship.fromWard.district.province.name : '',
        ship.fromHub ? ship.fromHub.name : '',
        ship.fromHubRouting ? ship.fromHubRouting.name : '',
        ship.receiverName,
        ship.receiverPhone,
        ship.companyTo,
        ship.shippingAddress,
        ship.realRecipientName,
        ship.endDeliveryTime,
        ship.toWard.district.province ? ship.toWard.district.province.name : '',
      ]);
    });

    ExportAnglar5CSV.exportExcelBB(data, this.fileName);
  }
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.cod + shipment.totalPrice);
    }, 0)
  }

  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
          }
        }
      );
    }
  }

  onSelectedCustomer() {
    let cloneSelectedCustomer = this.customer;
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (cloneSelectedCustomer === x.label) {
          this.selectedCustomer = obj.id;
          this.changeCustomer();
        }
      }
    });
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
            let findCus: SelectModel = null;
            if (this.customers.length == 1) {
              findCus = this.customers[0];
            } else {
              findCus = this.customers.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.selectedCustomer = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.selectedCustomer = null
            }
            this.changeCustomer();
          } else {
            this.selectedCustomer = null;
            this.changeCustomer();
          }
        }
      );
    } else {
      this.selectedCustomer = null;
      this.changeCustomer();
    }
  }
}
