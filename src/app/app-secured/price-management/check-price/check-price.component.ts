import { Component, OnInit, TemplateRef } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Constant } from '../../../infrastructure/constant';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { ProvinceService, DistrictService, StructureService, PriceServiceService, PriceService, WardService, ServiceService } from '../../../services';
import { ServiceHelper } from '../../../infrastructure/service.helper';
import { PriceServiceP, Service, PriceDVGT } from '../../../models';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SelectModel } from '../../../models/select.model';
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";

declare var jQuery: any;

@Component({
    selector: 'app-check-price',
    templateUrl: 'check-price.component.html',
    styles: []
})

export class CheckPriceComponent extends BaseComponent implements OnInit {
    parentPage: string = Constant.pages.price.name;
    currentPage: string = Constant.pages.price.children.checkPrice.name;
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //ServiceModel
        private priceServiceService: PriceServiceService,
        private provinceService: ProvinceService,
        private districtService: DistrictService,
        private wardService: WardService,
        private structureService: StructureService,
        protected priceService: PriceService,
        private serviceService: ServiceService,
        protected modalService: BsModalService,
        protected currencyFormat: CurrencyFormatPipe
    ) {
        super(messageService, permissionService, router);
    }
    bsModalRef: BsModalRef;
    filteredServiceDVGT: any[] = [];
    serviceDVGTs: Service[];
    serviceDVGTModels: SelectModel[];
    selectedServiceDVGTs: number[];
    selectedServiceDVGT: any;
    priceDVGT?: PriceDVGT = new PriceDVGT();
    priceDVGTs: PriceDVGT[];
    //Bảng giá
    priceServices: PriceServiceP[];
    selectedPriceService: PriceServiceP;
    usingPriceService: string = "";
    //Tỉnh thành
    provinces: SelectItem[];
    selectedProvince: number;
    selectedFromProvince: number;
    //Quận huyện
    districts: SelectItem[];
    selectedDistrict: number;
    //Phường xã
    wards: SelectItem[];
    selectedWard: number;
    selectedFromWardId: number;
    selectedFromDistrictId: number;
    //Cơ cấu
    structure: SelectItem[];
    selectedStructure: number;
    //Trọng lượng
    weight: number = 1;
    //Số lượng
    quantity: number = 0;
    cod: number = 0;
    insured: number = 0;
    servicePlus: string;
    //Dịch vụ
    services: SelectItem[];
    selectedService: number;
    //Giá
    defaultPrice: number = 0;
    remoteAreasPrice: number = 0;
    fuelPrice: number = 0;
    totalDVGT: number = 0;
    otherPrice: number = 0;
    vatPrice: number = 0;
    totalPrice: number = 0;
    //
    ngOnInit() {
        this.initData();
        this.changeService();
        this.loadServiceDVGT();
    }

    async initData() {
        //Bảng giá
        // this.priceLists = await this.priceListService.getAllSelectModelAsync();
        //Tỉnh thành
        this.provinces = await this.provinceService.getAllSelectModelAsync();
        //Cơ cấu
        this.structure = await this.structureService.getAllSelectModelAsync();
    }
    async loadServiceDVGT() {
        this.serviceDVGTs = [];
        this.serviceDVGTs = await this.serviceService.GetListServiceSubAsync();
        this.serviceDVGTModels = [];
        this.serviceDVGTs.forEach(m => { this.serviceDVGTModels.push({ value: m.id, label: `${m.code} - ${m.name}`, data: m }) });
    }

    async completePriceService(event) {
        if (event.query.length > 0) {
            this.priceServices = (await this.priceServiceService.getByCodeAsync(event.query)) as PriceServiceP[];
        }
    }

    onSelectedPriceService(event) {
        this.selectedPriceService = event;
        this.selectedService = this.selectedPriceService.serviceId;
        this.calculatePrice();
    }

    onKeyUpPriceServive(event) {
        // if (event.key == "Enter") {
        //     var value = event.currentTarget.value;
        //     if (value) {
        //         this.selectedPriceList = this.priceLists.find(x => x.name.includes(value) || x.code.includes(value));
        //     }
        // }
    }

    async changeFromProvince() {
        let districts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(this.selectedFromProvince);
        this.selectedFromDistrictId = districts[1].value;
        let wards = await this.wardService.getSelectModelWardByDistrictIdAsync(districts[1].value);
        this.selectedFromWardId = wards[1].value;
        this.calculatePrice();
    }

    async changeDistrictByProvince() {
        //Quận huyện
        this.districts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(this.selectedProvince)
        this.selectedDistrict = this.districts[1].value;
        this.wards = [];
        this.changeWardByDistrict();
    }
    async changeWardByDistrict() {
        //Phường xã
        this.wards = await this.wardService.getSelectModelWardByDistrictIdAsync(this.selectedDistrict)
        this.selectedWard = this.wards[1].value;
        this.calculatePrice();
    }
    async changeWard() {
        // this.changeService()
        this.calculatePrice();
    }
    async changeWeight() {
        // this.changeService()
        this.calculatePrice();
    }
    async changePriceList() {
        this.calculatePrice();
        // this.changeService()
    }
    async changeStructure() {
        // this.selectedService = null;
        // this.changeService()
        this.calculatePrice();
    }
    async changeService() {
        this.services = [];
        this.services = await this.serviceService.getAllSelectModelAsync();

        // this.calculatePrice();
    }

    async openModalEditPriceDVGT(template: TemplateRef<any>) {
        setTimeout(() => {
            var atcServiceDVGT = $("#atcServiceDVGT input");
            atcServiceDVGT.focus();
            atcServiceDVGT.select();
        }, 0);
        this.bsModalRef = this.modalService.show(template, {
            class: "inmodal animated bounceInRight modal-s"
        });
    }

    filterServiceDVGT(event) {
        this.filteredServiceDVGT = [];
        let value = event.query.toUpperCase();
        this.serviceDVGTModels.map(
            m => {
                if (value == '%') {
                    this.filteredServiceDVGT.push(m.label);
                } else {
                    if (m.label.toUpperCase().indexOf(value) >= 0) {
                        this.filteredServiceDVGT.push(m.label);
                    }
                }
            }
        );
    }

    keyTabServiceDVGT(event) {
        this.messageService.clear();
        let value = event.target.value;
        if (!value) {
            this.bsModalRef.hide();
            setTimeout(() => {
                var txtServiceDVGT = $('#txtServiceDVGT');
                txtServiceDVGT.focus();
                txtServiceDVGT.select();
            }, 0);
        } else {
            if (value.length >= 2) {
                let find = this.serviceDVGTModels.find(f => f.label.toUpperCase().indexOf(value.toUpperCase()) >= 0);
                if (find) {
                    this.selectedServiceDVGT = find.label;
                    if (!this.filteredServiceDVGT.find(f => f == this.selectedServiceDVGT)) this.filteredServiceDVGT.push(this.selectedServiceDVGT);
                    if (!this.priceDVGTs) this.priceDVGTs = [];
                    let checkDVGT = this.priceDVGTs.find(f => f.serviceId == find.value);
                    if (!checkDVGT) {
                        this.priceDVGT = new PriceDVGT();
                        this.priceDVGT.isAgree = false;
                        this.priceDVGT.totalPrice = 0;
                    } else {
                        this.priceDVGT.isAgree = checkDVGT.isAgree;
                        this.priceDVGT.totalPrice = checkDVGT.totalPrice;
                    }
                    this.priceDVGT.code = find.data.code;
                    this.priceDVGT.name = find.data.name;
                    this.priceDVGT.serviceId = find.data.id;
                    this.priceDVGT.vSEOracleCode = find.data.vseOracleCode;
                } else {
                    this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Dịch vụ gia tăng không đúng` });
                    setTimeout(() => {
                        var atcServiceDVGT = $("#atcServiceDVGT input");
                        atcServiceDVGT.focus();
                        atcServiceDVGT.select();
                    }, 0);
                }
            } else {
                this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập dịch vụ gia tăng` });
                setTimeout(() => {
                    var atcServiceDVGT = $('#atcServiceDVGT input');
                    atcServiceDVGT.focus();
                    atcServiceDVGT.select();
                }, 0);
            }
        }
    }

    resetPrice() {
        this.defaultPrice = 0;
        this.remoteAreasPrice = 0;
        this.fuelPrice = 0;
        this.vatPrice = 0;
        this.otherPrice = 0;
        this.totalDVGT = 0;
        this.totalPrice = 0;
        this.usingPriceService = '';
    }

    async calculatePrice() {
        this.usingPriceService = "";
        if (!this.selectedService) {
            this.resetPrice();
            return false;
        }
        let model = ServiceHelper.checkParams(null, this.selectedDistrict, this.selectedWard, this.selectedDistrict, this.weight);
        model.insured = 0;
        model.totalItem = this.quantity ? this.quantity : 0;
        model.structureId = this.selectedStructure;
        model.serviceId = this.selectedService;
        model.priceServiceId = this.selectedPriceService.id;
        model.calWeight = this.weight;
        model.toWardId = this.selectedWard;
        model.fromWardId = this.selectedFromWardId;
        model.fromDistrictId = this.selectedFromDistrictId;
        model.toDistrictId = this.selectedDistrict;
        model.cod = this.cod;
        model.insured = this.insured;
        let data = await this.priceService.calculateAsync(model);
        if (data) {
            this.defaultPrice = data.defaultPrice;
            this.remoteAreasPrice = data.remoteAreasPrice;
            this.fuelPrice = data.fuelPrice;
            this.vatPrice = data.vatPrice;
            this.otherPrice = data.otherPrice;
            this.totalDVGT = data.totalDVGT;
            this.totalPrice = data.totalPrice;
            this.usingPriceService = data.priceService.code;
        } else {
            this.resetPrice();
        }
    }
}