import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { Province, District, ChargedCOD } from '../../../models';
import { DataFilterViewModel } from '../../../view-model';
import { LazyLoadEvent, MultiSelectModule, SelectItem, Dropdown } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { ChargedCODService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-charged-cod',
    templateUrl: 'charged-cod.component.html',
    styles: []
})
export class ChargedCODComponent extends BaseComponent implements OnInit {
    constructor(private modalService: BsModalService, private chargedCODService: ChargedCODService,
        protected messageService: MessageService, private provinceService: ProvinceService,
        public permissionService: PermissionService, 
        public router: Router,
      ) {
        super(messageService,permissionService,router);
    }
    parentPage: string = Constant.pages.price.name;
    currentPage: string = Constant.pages.price.children.chargedCOD.name;
    modalTitle: string;
    bsModalRef: BsModalRef;
    displayDialog: boolean;

    //
    provinces: SelectItem[] = [];
    multiSelectProvinces: number[] = [];
    //
    districts: SelectItem[] = [];
    multiSelectDistricts: number[] = [];

    ngOnInit() {
        this.loadProvinces();
    }

    loadProvinces() {
        this.provinces = [];
        this.provinceService.getAll().subscribe(
            x => {
                let objs = x.data as Province[];
                objs.forEach(element => {
                    this.provinces.push({ label: element.name, value: element.id })
                });
                this.loadProvinceSelected();
            }
        )
    }

    loadProvinceSelected() {
        this.multiSelectProvinces = [];
        this.chargedCODService.GetProvinceSelected().subscribe(
            x => {
                this.multiSelectProvinces = x.data as number[];
                this.loadDistrictAllowSelect();
            }
        )
    }

    loadDistrictAllowSelect() {
        this.districts = [];
        let dataFilter: DataFilterViewModel = new DataFilterViewModel();
        dataFilter.arrayInt1 = this.multiSelectProvinces;
        this.chargedCODService.GetDistrictAllowSelect(dataFilter).subscribe(
            x => {
                let data = x.data as District[];
                data.forEach(element => {
                    this.districts.push({ label: element.name, value: element.id });
                })
                this.loadDistrictSelected();
            }
        )
    }

    loadDistrictSelected() {
        this.multiSelectDistricts = [];
        let dataFilter: DataFilterViewModel = new DataFilterViewModel();
        dataFilter.arrayInt1 = this.multiSelectProvinces;
        this.chargedCODService.GetDistrictSelected(dataFilter).subscribe(
            x => this.multiSelectDistricts = x.data as number[]
        )
    }

    save() {
        let chargedCOD: ChargedCOD = new ChargedCOD();
        chargedCOD.districtIds = this.multiSelectDistricts;
        this.chargedCODService.saveSetup(chargedCOD).subscribe(
            x => {
                if (!super.isValidResponse(x)) return;
                this.messageService.add({
                    severity: Constant.messageStatus.success,
                    detail: "Đã lưu dữ liệu thành công."
                });
            }
        );
    }
}