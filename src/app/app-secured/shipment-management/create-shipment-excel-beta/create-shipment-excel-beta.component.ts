import { Component, OnInit, NgZone, ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
//
import { Constant } from '../../../infrastructure/constant';
import { User, Customer, Hub, Service, Province, InfoLocation } from '../../../models';

import {
  ShipmentService, CustomerService, HubService, ServiceService,
  PaymentTypeService, StructureService, UserService, PriceService, ProvinceService, DistrictService, WardService, DeadlinePickupDeliveryService, GeocodingApiService, ServiceDVGTService, RequestShipmentService, CustomerInfoLogService
} from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { BaseComponent } from '../../../shared/components/baseComponent';
//
import * as XLSX from 'xlsx';
import { Structure } from '../../../models/structure.model';
import { PaymentType } from '../../../models/paymentType.model';
import { ShipmentCalculateViewModel } from '../../../view-model/shipmentCalculate.viewModel';
import { Shipment } from '../../../models/shipment.model';
//
import { MapsAPILoader } from '@agm/core';
import { GMapHelper } from '../../../infrastructure/gmap.helper';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { RequestShipment } from '../../../models/RequestShipment.model';
import { CustomerInfoLog } from '../../../models/customerInfoLog.model';

type AOA = Array<Array<any>>;
function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

@Component({
  selector: 'app-create-shipment-excel-beta',
  templateUrl: './create-shipment-excel-beta.component.html',
  styles: []
})
export class CreateShipmentExcelBetaComponent extends BaseComponent implements OnInit {
  namePrint = environment.namePrint;
  // [x: string]: any;
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  @ViewChild("addressMap") addressMap: ElementRef;
  //
  targetDataTransfer: DataTransfer;
  constructor(
    private requestShipmentService: RequestShipmentService,
    protected messageService: MessageService, private shipmentService: ShipmentService,
    private customerService: CustomerService,
    private hubService: HubService, private structureService: StructureService, private serviceService: ServiceService,
    private paymentTypeService: PaymentTypeService, private priceService: PriceService, private mapsAPILoader: MapsAPILoader,
    public provinceService: ProvinceService, private districtService: DistrictService, private serviceDVGTService: ServiceDVGTService,
    private wardService: WardService, private deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    private ngZone: NgZone, private userService: UserService, private geocodingApiService: GeocodingApiService,
    public permissionService: PermissionService, public router: Router, private customerInfoLogService: CustomerInfoLogService) {
    super(messageService, permissionService, router);
  }
  //
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.createShipmentExcelBeta.name;
  //
  ngOnInit() {
    // console.log(window.location);
    this.declareColumn();
    this.loadData();
  }

  listRequestCodeImport: string[] = [];
  listUserImport: string[] = [];
  listCustomerImport: string[] = [];
  listProvinceImport: string[] = [];
  listWardID: number[] = [];
  // listShippingAddressImport: InfoLocation[] = [];
  listHub: Hub[] = [];
  listAddress: any[] = [];

  listUserFromExcel: User[] = [];
  listCustomerFromExcel: Customer[] = [];
  listProvinceFromExcel: Province[] = [];
  listWardFromExcel: any[] = [];
  listReceiverCodeExcel: CustomerInfoLog[] = [];
  listReceiverCodeClone: CustomerInfoLog[] = [];

  totalUpload: string = "0";
  uploading: boolean = true;
  uploadingValue: string = "0/0"

  isUpload: boolean = false;

  users: User[];
  paymentTypes: PaymentType[];
  structures: Structure[];
  services: Service[];
  serviceDVGTs: Service[];
  customers: Customer[];
  provinces: Province[];
  shipments: Shipment[] = [];
  datas: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';
  //
  value: number = 0;
  loadData() {
    this.paymentTypes = [];
    this.paymentTypeService.getAllAsync().then(x => {
      if (x.isSuccess == true) {
        (x.data as PaymentType[]).forEach(element => {
          this.paymentTypes.push(element);
        });
      }
    });
    this.structures = [];
    this.structureService.getAll().subscribe(
      x => {
        if (x.isSuccess == true) {
          (x.data as Structure[]).forEach(element => {
            this.structures.push(element);
          });
        }
      });
    this.services = [];
    this.serviceService.GetListService().subscribe(x => {
      if (x.isSuccess == true) {
        (x.data as Service[]).forEach(element => {
          this.services.push(element);
        });
      }
    });
    this.serviceDVGTs = [];
    this.serviceService.GetListServiceSubAsync().then(
      x => {
        if (x) {
          this.serviceDVGTs = x as Service[];
        }
      }
    );


  }
  orderBy() {
    let shipmentError: Shipment[] = [];
    let shipmentSuccess: Shipment[] = [];
    this.shipments.forEach(element => {
      if (element.isValid === true) {
        shipmentSuccess.push(element);
      } else {
        shipmentError.push(element);
      }
    });
    this.shipments = [];
    this.shipments = shipmentError.concat(shipmentSuccess);
  }

  columns: ColumnExcel[] = [];
  columnNameExcel: ColumnNameExcel = new ColumnNameExcel();
  columnsName: string[] = [
    this.columnNameExcel.request_code,
    this.columnNameExcel.staff_code,
    this.columnNameExcel.lading_code,
    this.columnNameExcel.order_date,
    this.columnNameExcel.customer_code,
    this.columnNameExcel.receiver_code,
    this.columnNameExcel.name_to,
    this.columnNameExcel.phone_to,
    this.columnNameExcel.address_to,
    this.columnNameExcel.cod,
    this.columnNameExcel.insured,
    this.columnNameExcel.weight,
    this.columnNameExcel.exc_weight,
    this.columnNameExcel.box,
    this.columnNameExcel.doc,
    this.columnNameExcel.structure,
    this.columnNameExcel.service,
    this.columnNameExcel.service_plus,
    this.columnNameExcel.type_pay,
    this.columnNameExcel.content,
    this.columnNameExcel.cusNote,
    this.columnNameExcel.type_rider
  ];

  declareColumn() {
    this.columns = [];
    this.columnsName.forEach(element => {
      let columnExcel: ColumnExcel = new ColumnExcel();
      columnExcel.Name = element; columnExcel.Index = -1;
      this.columns.push(columnExcel);
    });
  }

  onFileChange(evt: any) {

    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;

    if (!this.isValidChangeFile()) return;
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      /* save data */
      this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      this.value += 10;
      this.setDataNew();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  clearData() {
    this.value = 0;
    this.datas = [];
    this.shipments = [];
    this.myInputFilesVariable.nativeElement.value = "";

    this.listCustomerImport = [];
    this.listProvinceImport = [];
    this.listRequestCodeImport = [];
    this.listUserImport = [];
    this.listHub = [];
    this.listWardID = [];
    this.listAddress = [];
    // this.listShippingAddressImport = [];
    this.declareColumn();
  }

  async setDataNew() {
    this.shipments = [];
    this.users = [];
    this.customers = [];
    this.provinces = [];
    // this.listShippingAddressImport = [];

    if (this.datas.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
      });
      return;
    }
    if (!this.isValidChangeFile()) return;
    let firstRows = this.datas[0] as string[];
    for (let i = 1; i < firstRows.length; i++) {
      let check = this.columns.find(f => f.Name == firstRows[i]);
      if (check) {
        check.Index = i;
      }
    }
    if (this.columns.find(f => f.Index == -1)) {
      let notfoutColumns = this.columns.find(f => f.Index == -1);
      this.messageService.add({
        severity: Constant.messageStatus.error, detail: "File thiếu colum: " + notfoutColumns.Name + ", vui lòng kiểm tra lại: "
      });
      return;
    }

    //#region Add code from excel to list code
    Promise.all(await this.datas.map(async (x, i) => {
      if (i > 1) {
        let rows = this.datas[i] as string[];
        let info: InfoLocation = new InfoLocation();
        info.key = i - 1;
        await Promise.all(rows.map(async (cell, j) => {
          let column = this.columns.find(f => f.Index == j);
          if (column) {
            if (column.Name == this.columnNameExcel.request_code) {
              this.listRequestCodeImport = Array.from(new Set(this.listRequestCodeImport.concat(cell)));
            } else if (column.Name == this.columnNameExcel.staff_code) {
              this.listUserImport = this.listUserImport.concat(cell);
            } else if (column.Name == this.columnNameExcel.customer_code) {
              this.listCustomerImport = this.listCustomerImport.concat(cell);
              let receiverCode = rows[j + 1];
              if (!this.listReceiverCodeExcel.find(f => f.code == receiverCode && f.senderCode == cell)) {
                let customerInfoLog: CustomerInfoLog = new CustomerInfoLog();
                customerInfoLog.code = receiverCode;
                customerInfoLog.senderCode = cell;
                this.listReceiverCodeExcel.push(customerInfoLog);
              }
            }
          }
        }));
      }
    }));
    //#endregion

    //#region Get by list code
    // requestCode
    let cloneRequest: string[] = [];
    let requestShipments: RequestShipment[] = [];
    cloneRequest = Array.from(new Set(this.listRequestCodeImport));
    requestShipments = await this.requestShipmentService.getByListCodeAsync(cloneRequest);

    // Users
    let cloneUsers = JSON.parse(JSON.stringify(this.listUserImport));
    cloneUsers = cloneUsers.sort().filter((x, i, arr) => arr[i] != arr[i + 1]);
    let users = await this.userService.getByListCodeAsync(cloneUsers);
    this.value = 15;
    //

    // Customer
    let cloneCustomers = JSON.parse(JSON.stringify(this.listCustomerImport));
    cloneCustomers = cloneCustomers.sort().filter((x, i, arr) => arr[i] != arr[i + 1]);
    let customers = await this.customerService.getByListCodeAsync(cloneCustomers);
    this.value = 20;
    //

    // Province
    let cloneProvines = JSON.parse(JSON.stringify(this.listProvinceImport));
    cloneProvines = cloneProvines.sort().filter((x, i, arr) => arr[i] != arr[i + 1]);
    // const provines = await this.provinceService.getByListCodeAsync(cloneProvines);
    this.value = 25;
    //

    // Ward
    await Promise.all(await customers.map(async x => {
      this.listWardID.push(x.wardId);
    }));
    await Promise.all(await this.listReceiverCodeExcel.map(async fintInfo => {
      let fCus = customers.find(f => f.code == fintInfo.senderCode)
      if (fintInfo) {
        fintInfo.senderId = fCus.id;
        await this.customerInfoLogService.getInfoLogByAsync(fintInfo.senderId, fintInfo.code).then(
          async  res => {
            if (res) {
              this.listReceiverCodeClone.push(res);
            }
          }
        );
      }
    })
    );
    let cloneWards = JSON.parse(JSON.stringify(this.listWardID));
    cloneWards = cloneWards.sort().filter((x, i, arr) => arr[i] != arr[i + 1]);
    let wards = await this.hubService.getByListWardIdAsync(cloneWards);
    this.listWardFromExcel = wards;
    this.value = 30;
    //

    //#region Add data to list shipment
    await Promise.all(await this.datas.map(async (rows: string[], i) => {
      if (i > 1) {
        let shipment = new Shipment();
        this.shipments = this.shipments.concat(shipment);
        shipment.key = i - 1;

        await Promise.all(await rows.map(async (cell, j) => {
          let column = this.columns.find(f => f.Index == j);
          if (column) {
            // Staff code
            if (column.Name == this.columnNameExcel.staff_code) {
              shipment.staffCode = cell;
              let user = this.users.find(f => f.userName.toLowerCase() === this.toLowerCase(shipment.staffCode));
              if (!user) {
                let findUser = users.find(x => x.userName.toLowerCase() == this.toLowerCase(shipment.staffCode));
                if (findUser) {
                  shipment.pickUserId = findUser.id;
                  this.users.push(findUser);
                }
              } else {
                shipment.pickUserId = user.id;
              }
            }
            // request code
            else if (column.Name == this.columnNameExcel.request_code) {
              shipment.requestCode = cell;
              let requestShipment = requestShipments.find(rq => rq.shipmentNumber.toLowerCase() == this.toLowerCase(shipment.requestCode));
              if (requestShipment) {
                shipment.requestShipmentId = requestShipment.id;
                if (requestShipment.pickUserId) {
                  shipment.pickUserId = requestShipment.pickUserId;
                }
              }
            }

            // Lading code
            else if (column.Name == this.columnNameExcel.lading_code) {
              if (cell) {
                shipment.shipmentNumber = cell;
              }
            }
            else if (column.Name == this.columnNameExcel.order_date) {
              if (cell) {
                shipment.orderDate = cell;
              }
            }
            // COD
            else if (column.Name == this.columnNameExcel.cod) {
              if (+cell != NaN && +cell > 0) {
                shipment.cod = +cell;
              } else {
                shipment.cod = 0;
              }
            } else if (column.Name == this.columnNameExcel.insured) {
              if (+cell != NaN && +cell > 0) {
                shipment.insured = +cell;
              } else {
                shipment.insured = 0;
              }
            }
            // Weight
            else if (column.Name == this.columnNameExcel.weight) {
              if (+cell != NaN && +cell > 0) {
                shipment.weight = +cell;
                if (shipment.weight > shipment.excWeight) shipment.calWeight = shipment.weight;
                else shipment.calWeight = shipment.excWeight;
              }
            }
            else if (column.Name == this.columnNameExcel.exc_weight) {
              if (+cell != NaN && +cell > 0) {
                shipment.excWeight = +cell;
                if (shipment.weight > shipment.excWeight) shipment.calWeight = shipment.weight;
                else shipment.calWeight = shipment.excWeight;
              }
            }
            // Structure
            else if (column.Name == this.columnNameExcel.structure) {
              shipment.structureCode = cell;
            }
            // Service
            else if (column.Name == this.columnNameExcel.service) {
              shipment.serviceCode = cell;
            }
            // Type pay
            else if (column.Name == this.columnNameExcel.type_pay) {
              shipment.paymentTypeCode = cell;
            }
            // Box
            else if (column.Name == this.columnNameExcel.box) {
              if (+cell != NaN && +cell > 0) {
                shipment.totalBox = +cell;
              } else {
                shipment.totalBox = 1;
              }
            }
            // doc
            else if (column.Name == this.columnNameExcel.doc) {
              if (+cell != NaN && +cell > 0) {
                shipment.doc = +cell;
              } else {
                shipment.doc = 0;
              }
            }
            // Service plus
            else if (column.Name == this.columnNameExcel.service_plus) {
              shipment.serviceDVGTCode = cell;
            }
            // Content
            else if (column.Name == this.columnNameExcel.content) {
              shipment.content = cell;
              // console.log(shipment.content);
            }
            // Cusnote
            else if (column.Name == this.columnNameExcel.cusNote) {
              shipment.cusNote = cell;
            }
            // 
            else if (column.Name == this.columnNameExcel.receiver_code) {
              shipment.receiverCode2 = cell;
            }// ReceiverCode
            else if (column.Name == this.columnNameExcel.type_rider) {
              shipment.typeRider = cell;
            }// NameTo
            else if (column.Name == this.columnNameExcel.name_to) {
              shipment.receiverName = cell;
            }// PhoneTo
            else if (column.Name == this.columnNameExcel.phone_to) {
              shipment.receiverPhone = cell;
            } else if (column.Name == this.columnNameExcel.address_to) {
              shipment.addressNew = cell;
            }// Customer code
            else if (column.Name == this.columnNameExcel.customer_code) {
              shipment.customerCode = cell;
              let receiverCode = rows[6];
              let customer = customers.find(f => f.code.toLowerCase() === this.toLowerCase(shipment.customerCode));
              if (customer) {
                await this.setDataCustomer(shipment.key, customer);
              }
              let receiver = this.listReceiverCodeClone.find(f => f.code == receiverCode && f.senderId == customer.id);
              if (receiver) {
                shipment.shippingAddress = receiver.address;
                shipment.toProvinceId = receiver.provinceId;
                shipment.toDistrictId = receiver.districtId;
                shipment.toWardId = receiver.wardId;
                shipment.latTo = receiver.lat;
                shipment.lngTo = receiver.lng;
              }
            }
          }
          this.value = 60 + (Math.round(((i + 1) / this.datas.length) * 30));
        }));
        // Payment type code
        let paymentType = this.paymentTypes.find(f => f.code.toLowerCase() === (shipment.paymentTypeCode ? shipment.paymentTypeCode.toLowerCase() : ""));
        if (paymentType) {
          shipment.paymentTypeId = paymentType.id;
          if (shipment.paymentTypeId === PaymentTypeHelper.NGTTN && !shipment.keepingTotalPriceHubId && shipment.pickUserId) {
            shipment.keepingTotalPriceEmpId = shipment.pickUserId;
          }
        }

        // Structure code
        const structure = this.structures.find(f => f.code.toLowerCase() === (shipment.structureCode ? shipment.structureCode.toLowerCase() : ""));
        if (structure) {
          shipment.structureId = structure.id;
        }

        // Service code
        const service = this.services.find(f => f.code.toLowerCase() === (shipment.serviceCode ? shipment.serviceCode.toLowerCase() : ""));
        if (service) {
          shipment.serviceId = service.id;
        }

        // Province code
        const province = this.provinces.find(f => f.code === shipment.provinceCode);
        if (province) {
          shipment.provinceCode = province.code;
        }

        // Service DVGT code
        shipment.serviceDVGTIds = [];
        if (shipment.serviceDVGTCode) {
          shipment.serviceDVGTCode.split(",").map(async x => {
            if (x) {
              const serviceDVGT = this.serviceDVGTs.find(f => f.code.toLowerCase() == x.trim().toLowerCase());
              if (serviceDVGT) {
                shipment.serviceDVGTIds.push(serviceDVGT.id);
              }
            }
          }
          );
        }
        if (shipment.cod && shipment.cod > 0) {
          let serviceCOD = this.serviceDVGTs.find(f => f.id == 3);
          if (serviceCOD) {
            if (!shipment.serviceDVGTIds.find(f => f == serviceCOD.id)) shipment.serviceDVGTIds.push(serviceCOD.id);
          }
        }

        // Nguoi gui thanh toán
        if (shipment.paymentTypeId == PaymentTypeHelper.NGTTN) {
          const findUser = users.find(x => x.userName == shipment.staffCode);
          if (findUser) {
            shipment.keepingTotalPriceEmpId = findUser.id;
          }
        }
        this.calculator(shipment.key);
      }
    }));

    setTimeout(() => {
      if (this.shipments.length == 0) {
        this.messageService.add({
          severity: Constant.messageStatus.error, detail: "File không có dữ liệu, vui lòng kiểm tra lại!",
        });
        return;
      }
      else {
        this.isValidToCreate(this.shipments);
      }
      this.value += 10;
    }, 0);
    //#endregion
  }

  async setDataCustomer(key: Number, cus: Customer) {
    let shipment = this.shipments.find(f => f.key === key);
    if (shipment) {
      this.customers.push(cus);
      shipment.senderId = cus.id;
      shipment.senderPhone = cus.phoneNumber;
      shipment.senderName = cus.name;
      shipment.pickingAddress = cus.address;
      shipment.fromProvinceId = cus.provinceId;
      shipment.fromDistrictId = cus.districtId;
      shipment.fromWardId = cus.wardId;
      shipment.latFrom = cus.lat;
      shipment.lngFrom = cus.lng;
      let hub = this.listWardFromExcel.find(x => x.wardId == shipment.fromWardId);
      if (hub) {
        shipment.fromHubId = hub.hubId;
      }
    }
  }

  async setDataProvince(key: Number, pro: Province) {
    let shipment = this.shipments.find(f => f.key === key);
    if (shipment) {
      this.provinces.push(pro);
      shipment.provinceCode = pro.code;

      this.provinceService.getProvinceByCode(shipment.provinceCode).subscribe(x => {
        let ship = this.shipments.find(f => f.key === key);
        if (x.isSuccess == true) {
          ship.provinceCode = (x.data as Province).code;
        }
        this.initMap(shipment.key, shipment);
      });
    }
  }

  setAutocompleteGoogleMap(key) {
    var ship = this.shipments.find(f => f.key === key);
    this.mapsAPILoader.load().then(async () => {
      let fromAutocomplete = new google.maps.places.Autocomplete(
        (<HTMLInputElement>document.getElementById("addressTo" + key)),
        {
          // types: ["address"]
        }
      );

      fromAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(async () => {
          //get the place result
          let place: google.maps.places.PlaceResult = fromAutocomplete.getPlace();
          let str: any;
          if (place.address_components) {
            str = place.address_components[0].long_name + " " + place.address_components[1].long_name;
            //verify result
            if (!place) {
              place = await this.geocodingApiService.findFromAddressAsync(place.name);
              if (!place) {
                this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
                return;
              }
            }
            this.loadLocationToPlace(place, ship, key);
            ship.latTo = place.geometry.location.lat();
            ship.lngTo = place.geometry.location.lng();
            //ship.shippingAddress = place.formatted_address;
          }
        });
      });
    });
  }

  async initMap(key: number, ship: Shipment) {
    if (ship.shippingAddress) {
      let address = this.listAddress.find(x => x.shippingAddress == ship.shippingAddress);
      if (ship.toProvinceId && ship.toDistrictId) {
        this.calculator(ship.key);
      } else if (address) {
        ship.shippingAddress = address.address;
        ship.toProvinceId = address.toProvinceId;
        ship.toWardId = address.toWardId;
        ship.toDistrictId = address.toDistrictId;
        ship.toHubId = address.toHubId;
        this.calculator(ship.key);
      } else {
        await this.hubService.getInfoLocationByAddressAsync(ship.shippingAddress).then(
          x => {
            if (x.isSuccess == true) {
              let info = x.data as InfoLocation;
              let obj = { shippingAddress: '', toProvinceId: null, toDistrictId: null, toWardId: null, toHubId: null };
              obj.shippingAddress = ship.shippingAddress;
              // this.cloneToProviceName = info.provinceName;
              // this.cloneToDistrictName = info.districtName;
              // this.cloneToWardName = info.wardName;
              if (info.provinceId) ship.toProvinceId = info.provinceId;
              if (info.districtId) ship.toDistrictId = info.districtId;
              if (info.wardId) ship.toWardId = info.wardId;
              if (info.hubId) ship.toHubId = info.hubId;
              this.listAddress.push(obj);
              this.calculator(ship.key);
            }
          }
        );
      }
    }
  }

  async loadLocationToPlaceInfo(place: google.maps.places.PlaceResult): Promise<InfoLocation> {
    let infoLocation: InfoLocation;
    if (place && place.address_components.length > 0) {
      infoLocation = new InfoLocation();
      place.address_components.map(element => {
        //
        if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
          infoLocation.provinceName = element.long_name;
        }
        else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
          infoLocation.districtName = element.long_name;
        }
        else if (element.types.indexOf(GMapHelper.LOCALITY) !== -1) {
          infoLocation.districtName = element.long_name;
        }
        else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
          infoLocation.wardName = element.long_name;
        }
        else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
          infoLocation.wardName = element.long_name;
        }
      });
      if (place.geometry && place.geometry.location) {
        infoLocation.lat = place.geometry.location.lat;
        infoLocation.lng = place.geometry.location.lng;
      }
    }
    return infoLocation;
  }
  async loadLocationToPlace(place: google.maps.places.PlaceResult, ship: Shipment, key) {
    var ship = this.shipments.find(f => f.key === key)

    let provinceName = "";
    let districtName = "";
    let wardName = "";
    let isProvince: boolean = false;
    let isDistrict: boolean = false;
    let isWard: boolean = false;

    place.address_components.map(element => {
      //
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        isProvince = true;
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.LOCALITY) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
    });
    // if (isProvince && isDistrict && isWard) {
    //   this.toLocation = "none";
    // } else {
    //   this.toLocation = "block";
    // }
    if (!districtName && wardName) {
      districtName = wardName;
      wardName = null;
    }
    await this.hubService.getInfoLocationAsync(provinceName, districtName, wardName, null, null, null, null).then(
      x => {
        if (x) {
          if (x.provinceId) ship.toProvinceId = x.provinceId;
          if (x.districtId) ship.toDistrictId = x.districtId;
          if (x.wardId) ship.toWardId = x.wardId;
          if (x.hubId) ship.toHubId = x.hubId;
          //
          ship.toProvinceName = provinceName;
          ship.toDistrictName = districtName;
          ship.toWardName = wardName;
        }
      }
    )
    if (!ship.toHubId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy TT/CN/TRẠM đến của quận/huyện: ' + wardName })
    }
    this.calculator(ship.key);
  }

  async uploadExcelNew() {
    this.messageService.clear();
    this.value = 0;

    if (this.shipments.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: ("Danh sách đơn trống."),
      });
      return;
    }

    this.isValidToCreate(this.shipments);

    if (this.shipments.find(f => f.isValid == false)) {
      this.orderBy();
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: ("Danh sách có bill lỗi."),
      });
      return false;
    }

    this.isUpload = true;

    this.shipments = (this.shipments || []).sort((a: Shipment, b: Shipment) => a.key < b.key ? -1 : 1);

    let listShipCode: string[] = [];
    this.shipments.map((x, i) => {
      if (x.shipmentNumber && i >= 1) listShipCode.push(x.shipmentNumber);
    })
    let listShipments = [];
    let listShipmentNumberDuplicate: string = "";
    if (listShipCode.length) listShipments = await this.shipmentService.getByListCodeAsync(listShipCode);

    this.shipments.map((ship, i, arr) => {
      this.totalUpload = (i + 1) + "/" + this.shipments.length;
      if (ship.typeRider && ship.typeRider.toLowerCase() == 'xt') ship.isTruckDelivery = true;
      else ship.isTruckDelivery = false;
      let find = listShipments.find(x => x.shipmentNumber == ship.shipmentNumber);
      if (find) {
        // ship.id = find.id;
        // ship.orderDate = SearchDate.formatToISODate(find.orderDate);
        // ship.shipmentStatusId = find.shipmentStatusId;
        // ship.currentEmpId = find.currentEmpId;
        // ship.currentHubId = find.currentHubId;
        // ship.currentLat = find.currentLat;
        // ship.currentLng = find.currentLng;
        // arr[i] = this.cloneUpdate(find, ship);
        listShipmentNumberDuplicate += `${find.shipmentNumber} `;
      }
      else {
        if (!ship.orderDate) ship.orderDate = SearchDate.formatToISODate(new Date());
        ship.shipmentStatusId = StatusHelper.readyToDelivery;
        // save Employee
        if (ship.fromHubId !== ship.toHubId) {
          ship.shipmentStatusId = StatusHelper.waitingToTransfer;
        }
      }
      this.value = Math.round(((i + 1) / this.datas.length) * 90);   
    });   
    if (listShipmentNumberDuplicate) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: (`Danh sách mã bill bị trùng ${listShipmentNumberDuplicate}.`),
      });
      this.isUpload = false;
      return false;
    }
    // debugger;
    // console.log("shipments", this.shipments);
    // return;
    let rs = await this.shipmentService.uploadExcelShipmentAsync(this.shipments);
    this.value = 100;

    if (rs.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: (rs.data + ""),
      });
      this.clearData();
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.error,
        detail: ("Upload data lỗi"),
      });
    }
    this.isUpload = false;
  }

  async uploadExcel() {
    let countSuccess = 0;
    let countCreate = 0;
    let listCode: Number[] = [];
    this.messageService.clear();
    this.value = 0;

    if (this.shipments.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: ("Danh sách đơn trống."),
      });
    }

    await this.isValidToCreate(this.shipments);

    if (this.shipments.find(f => f.isValid == false)) {
      this.orderBy();
      return false;
    }

    this.shipments = await (this.shipments || []).sort((a: Shipment, b: Shipment) => a.key < b.key ? -1 : 1);

    for (let i = 0; i < this.shipments.length; i++) {
      let element = this.shipments[i];

      await this.shipmentService.checkExistTrackingNumberAsync(element.shipmentNumber).then(async x => {
        if (x.isSuccess == true) {
          //đã sử dụng - update 
          let gShipment = x.data as Shipment;
          element.id = gShipment.id;
          element.orderDate = gShipment.orderDate;
          element.shipmentStatusId = gShipment.shipmentStatusId;
          element.currentEmpId = gShipment.currentEmpId;
          element.currentHubId = gShipment.currentHubId;
          element.currentLat = gShipment.currentLat;
          element.currentLng = gShipment.currentLng;
          element.keepingTotalPriceEmpId = gShipment.keepingTotalPriceEmpId;
          element.keepingTotalPriceHubId = gShipment.keepingTotalPriceHubId;
          element.keepingCODHubId = gShipment.keepingCODHubId;
          element.keepingCODEmpId = gShipment.keepingCODEmpId;
          element.deliverUserId = gShipment.deliverUserId;
          let updateShipment = this.cloneUpdate(gShipment, element);
          if (updateShipment.paymentTypeId) {
            if (updateShipment.paymentTypeId === PaymentTypeHelper.NGTTN && !updateShipment.keepingTotalPriceHubId) {
              updateShipment.keepingTotalPriceEmpId = updateShipment.pickUserId;
            } else if (updateShipment.cod > 0 && updateShipment.paymentTypeId === PaymentTypeHelper.NNTTN && !updateShipment.keepingCODHubId
              && updateShipment.shipmentStatusId == StatusHelper.deliveryComplete && updateShipment.deliverUserId) {
              updateShipment.keepingCODEmpId = updateShipment.deliverUserId;
            }
          }
          this.shipmentService.update(updateShipment).subscribe(x => {
            countCreate++;
            if (x) {
              countSuccess++;
              listCode.push(element.key);
            } else {
              this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: (element.shipmentNumber + " - cập nhật vận đơn lỗi "),
              });
            }
            let phantram: any;
            phantram = (countSuccess / countCreate) * 100;
            if (countCreate == this.shipments.length) {
              this.messageService.add({
                severity: Constant.messageStatus.success,
                detail: ("Upload thành công " + phantram + "% (" + countSuccess + "/" + countCreate + ") vận đơn."),
              });
              if (listCode.length === this.shipments.length) {
                this.clearData();
              } else {
                listCode.forEach(elementKey => {
                  let ship = this.shipments.find(f => f.key == elementKey);
                  let idx = this.shipments.indexOf(ship);
                  if (idx != -1) {
                    this.shipments.splice(idx, 1); // The second parameter is the number of elements to remove.
                  }
                });
              }
            }
          });
        } else {
          //chưa sử dụng - create  
          element.orderDate = SearchDate.formatToISODate(new Date());
          await this.shipmentService.createAsync(element).then(
            x => {
              countCreate++;
              if (x) {
                countSuccess++;
                listCode.push(element.key);
              } else {
                this.messageService.add({
                  severity: Constant.messageStatus.warn,
                  detail: (element.shipmentNumber + " - tạo vận đơn lỗi "),
                });
              }
              if (countCreate == this.shipments.length) {
                this.messageService.add({
                  severity: Constant.messageStatus.success,
                  detail: ("Upload thành công " + countSuccess + "/" + countCreate + " vận đơn."),
                });
                if (listCode.length === this.shipments.length) {
                  this.clearData();
                } else {
                  listCode.forEach(elementKey => {
                    let ship = this.shipments.find(f => f.key == elementKey);
                    let idx = this.shipments.indexOf(ship);
                    if (idx != -1) {
                      this.shipments.splice(idx, 1); // The second parameter is the number of elements to remove.
                    }
                  });
                }
              }
            });
        }
        this.value = Math.round((countSuccess / this.shipments.length) * 100) + Math.round((1 / this.shipments.length) * 100);
      });
    };
  }

  toLowerCase(str: string = "") {
    if (!str) str = '';
    return str.toLowerCase().trim();
  }

  cloneUpdate(data: Shipment, model: Shipment): Shipment {
    for (let prop in model) {
      if (model[prop] || model[prop] == 0) {
        data[prop] = model[prop];
      }
    }
    return data;
  }

  async calculator(key: Number) {
    let ship = this.shipments.find(f => f.key === key);
    let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
    model.fromWardId = ship.fromWardId;
    model.insured = ship.insured ? ship.insured : 0;
    model.otherPrice = ship.otherPrice ? ship.otherPrice : 0;
    model.senderId = ship.senderId;
    model.fromHubId = ship.fromHubId;
    if (ship && ship.endPickTime) model.orderDate = ship.endPickTime;
    if (model.orderDate && ship.orderDate) model.orderDate = ship.orderDate;
    model.cod = ship.cod;
    model.weight = ship.weight;
    model.toDistrictId = ship.toDistrictId;
    model.serviceDVGTIds = ship.serviceDVGTIds;
    model.serviceId = ship.serviceId;
    model.structureId = ship.structureId;
    model.calWeight = ship.calWeight;
    model.toWardId = ship.toWardId;
    model.insured = ship.insured;
    let price = await this.priceService.calculateAsync(model);
    ship.totalPrice = 0;
    if (price) {
      ship.defaultPrice = price.defaultPrice;
      ship.defaultPriceS = price.defaultPriceS;
      ship.defaultPriceP = price.defaultPriceP;
      ship.fuelPrice = price.fuelPrice;
      ship.otherPrice = price.otherPrice;
      ship.remoteAreasPrice = price.remoteAreasPrice;
      ship.totalDVGT = price.totalDVGT;
      ship.vatPrice = price.vatPrice;
      ship.priceDVGTs = price.priceDVGTs;
      ship.priceReturn = price.priceReturn;
      ship.priceCOD = price.priceCOD;
      ship.totalPrice = price.totalPrice;
      ship.totalPriceSYS = price.totalPrice;
      ship.deliveryDate = SearchDate.formatToISODate(price.deadlineDelivery);
      if (ship.priceCOD && ship.priceCOD > 0) {
        if (!ship.paymentCODTypeId) ship.paymentCODTypeId = 1;
      }
      //
      if (ship.toHubId == ship.fromHubId) {
        ship.shipmentStatusId = StatusHelper.readyToDelivery;
      } else {
        ship.shipmentStatusId = StatusHelper.waitingToTransfer;
      }

      ship.serviceDVGTIds = [];
      if (price.priceDVGTs) {
        price.priceDVGTs.map(x_dvgt => {
          ship.serviceDVGTIds.push(x_dvgt.serviceId);
        });
      }
      setTimeout(() => {
        this.isValidShipment(ship, ship.key);
      }, 300);
    }
    setTimeout(() => {
      this.value = 100;
    }, 0);
  }

  isValidToCreate(shipments: Shipment[]) {
    let row = 0;
    shipments.map(async shipment => {
      row++;
      this.isValidShipment(shipment, row);
    });
  }

  isValidShipment(shipment: Shipment, row: Number) {
    let result: boolean = true;
    let messages: Message[] = [];
    let errors: string = "";
    if (!shipment.senderPhone) {
      let message = "Chưa nhập số điện thoại người gửi";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }
    if (!shipment.requestCode && !shipment.staffCode) {
      let message = "Chưa nhập mã bill tổng hoặc nhân viên nhận hàng";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    } else {
      if (shipment.requestCode && !shipment.requestShipmentId) {
        let message = "Mã bill tổng không tồn tại!";
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: row + ": " + message
        });
        result = false;
        errors += message + ", ";
      }
      if (!shipment.pickUserId) {
        let message = "Không tìm thấy nhân viên nhận hàng!";
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: row + ": " + message
        });
        result = false;
        errors += message + ", ";
      }
    }
    if (!shipment.senderName) {
      let message = "Chưa có tên người gửi";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.pickingAddress) {
      let message = "Chưa có địa chỉ lấy hàng";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.fromProvinceId) {
      let message = "Chưa có tỉnh/thành gửi";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.fromDistrictId) {
      let message = "Chưa có quận/huyện gửi";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.fromWardId) {
      let message = "Chưa có phường xã gửi";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (
      !shipment.fromHubId
    ) {
      let message = "Chưa có TT/CC/TRẠM gửi:" + shipment.fromHubId;
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }
    //
    if (!shipment.receiverPhone && shipment.receiverPhone != "0") {
      let message = "Chưa nhập số điện thoại người nhận";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.receiverName) {
      let message = "Chưa nhập tên người nhận";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.shippingAddress) {
      let message = "Chưa nhập địa chỉ giao hàng";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (this.toLowerCase(shipment.shippingAddress) != this.toLowerCase(shipment.addressNew)) {
      let message = "Địa chỉ giao hàng mới không hợp lệ với địa chỉ cũ.";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.toProvinceId) {
      let message = "Chưa có tỉnh/thành nhận";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.toDistrictId) {
      let message = "Chưa có quận/huyện nhận";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    // if (!shipment.toWardId) {
    //   let message = "Chưa có phường/xã nhận";
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: row + ": " + message
    //   });
    //   result = false;
    //   errors += message + ", ";
    // }

    // if (
    //   !shipment.toHubId
    // ) {
    //   let message = "Chưa có TT/CN/TRẠM nhận";
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: row + ": " + message
    //   });
    //   result = false;
    //   errors += message + ", ";
    // }

    if (!shipment.cod && shipment.cod !== 0) {
      let message = "Giá trị COD không đúng";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }
    if (!shipment.weight) {
      let message = "Chưa nhập trọng lượng";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    } else if (shipment.weight <= 0) {
      let message = "Trọng lượng phải lớn hơn 0";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (shipment.totalBox <= 0) {
      let message = "Số kiện phải lớn hơn 0";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.paymentTypeId) {
      let message = "Không tìm thấy hình thức thanh toán theo mã";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.structureId) {
      let message = "Không tìm thấy loại bưu gửi theo mã";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }

    if (!shipment.serviceId) {
      let message = "Không tìm thấy dịch vụ theo mã";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }
    if (!shipment.totalPrice && shipment.totalPrice != 0) {
      let message = "Không tìm thấy giá để tính chi phí cho địa chỉ này";
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: row + ": " + message
      });
      result = false;
      errors += message + ", ";
    }
    //  else if (shipment.totalPrice === 0) {
    //   let message = "Chi phí phải lớn hơn 0";
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: row + ": " + message
    //   });
    //   result = false;
    //   errors += message + ", ";
    // }
    shipment.message = errors;
    if (messages.length > 0 || result !== true) {
      // this.messageService.addAll(messages);
      shipment.isValid = false;
    } else {
      shipment.isValid = true;
    }
  }
  valueChange(key: Number) {
    let ship = this.shipments.find(f => f.key === key);
    if (ship.cod < 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Giá trị COD không đúng" });
      return false;
    } else if (ship.weight <= 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Trọng lượng không đúng" });
      return false;
    }
    this.isValidShipment(ship, ship.key);
    if (!this.shipments.find(f => f.isValid == false)) {
      this.calculator(ship.key);
    }
  }
  serviceChange(key: Number) {
    let shipment = this.shipments.find(f => f.key === key);
    let service = this.services.find(f => f.code === shipment.serviceCode);
    shipment.serviceId = null;
    if (!service) {
      //this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy dịch vụ" });
      return false;
    }
    shipment.serviceId = service.id;
    this.isValidShipment(shipment, shipment.key);
    if (!this.shipments.find(f => f.isValid == false)) {
      this.calculator(shipment.key);
    }
  }
  paymentTypeChange(key: Number) {
    let shipment = this.shipments.find(f => f.key === key);
    let paymentType = this.paymentTypes.find(f => f.code === shipment.paymentTypeCode);
    shipment.paymentTypeId = null;
    if (!paymentType) {
      //this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy dịch vụ" });
      return false;
    }
    shipment.paymentTypeId = paymentType.id;
    this.isValidShipment(shipment, shipment.key);
  }
  structureChange(key: Number) {
    let shipment = this.shipments.find(f => f.key === key);
    let structure = this.structures.find(f => f.code === shipment.structureCode);
    shipment.structureId = null;
    if (!structure) {
      //this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy dịch vụ" });
      return false;
    }
    shipment.structureId = structure.id;
    this.isValidShipment(shipment, shipment.key);
  }
  isValidChangeFile(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.targetDataTransfer || this.myInputFilesVariable.nativeElement.value === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn file upload."
      });
      result = false;
    }
    if (this.targetDataTransfer && this.targetDataTransfer.files.length > 1) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Không thể upload nhiều file cùng lúc"
      });
      this.myInputFilesVariable.nativeElement.value = "";
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }
    return result;
  }

}

export class ColumnExcel {
  Name: string;
  Index: number;
}

export class ColumnNameExcel {
  stt: string = "stt";
  request_code?: string = "request_code";
  staff_code: string = "staff_code";
  lading_code: string = "lading_code";
  order_date: string = "order_date";
  customer_code: string = "customer_code";
  name_to: string = "name_to";
  phone_to: string = "phone_to";
  receiver_code: string = "receiver_code";
  address_to: string = "address_to";
  // province_to: string = "province_to";
  // district_to: string = "district_to";
  // ward_to: string = "ward_to";
  // address_note_to: string = "address_note_to";
  cod: string = "cod";
  insured: string = "insured";
  weight: string = "weight";
  exc_weight: string = "exc_weight";
  box: string = "box";
  doc: string = "doc";
  structure: string = "structure";
  service: string = "service";
  service_plus: string = "service_plus";
  type_pay: string = "type_pay";
  content: string = "content";
  cusNote: string = "cusNote";
  type_rider: string = "type_rider";
}
