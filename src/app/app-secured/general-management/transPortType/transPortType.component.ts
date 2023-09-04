import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TransportTypeService, TPLService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Constant } from '../../../infrastructure/constant';
import { TransportType, ResponseModel, BaseModel } from '../../../models';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { Message } from 'primeng/components/common/message';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { ArrayHelper } from '../../../infrastructure/array.helper';
import { TPLTransportType } from '../../../models/tplTransportType.model';


declare var jQuery: any;

@Component({
    selector: 'app-transPortType',
    templateUrl: 'transPortType.component.html',
    styles: []
})
export class TransportTypeComponent extends BaseComponent implements OnInit {
    selectedTPL: number[];
    tpls: SelectItem[];
    first: number = 0;
    txtFilterGb: any;

    constructor(private modalService: BsModalService, private transportTypeService: TransportTypeService,
        private tplService: TPLService,
        public messageService: MessageService,
        public permissionService: PermissionService, 
        public router: Router,
      ) {
        super(messageService,permissionService,router);
        }
    parentPage: string = Constant.pages.general.name;
    currentPage: string = Constant.pages.general.children.transportType.name;
    //
    modalTitle: string;
    bsModalRef: BsModalRef;
    //
    columns: string[] = ["code", "name"];
    //
    transPortType: TransportType;
    selectedTransportType: TransportType;
    isNew: boolean;
    listTransportType: TransportType[];
    datasource: TransportType[];
    //
    totalRecords: number;
    rowPerPage: number = 10;
    //
    ngOnInit() {
        this.initData();
    }
    initData() {
        let includes: string[] = [Constant.classes.includes.transportType.tplTransportTypes];
        this.transportTypeService.getAll(includes).subscribe(
            x => {
                this.datasource = x.data as TransportType[];
                this.totalRecords = this.datasource.length;
                this.listTransportType = this.datasource.slice(0, this.rowPerPage);
            }
        );
        this.transPortType = null;
        this.selectedTransportType = null;
        this.isNew = true;
        this.selectedTPL = [];

        //refresh
        this.txtFilterGb = null;
    }

    openDeleteModel(template: TemplateRef<any>, transPortType: TransportType) {
        this.selectedTransportType = transPortType;
        this.transPortType = this.clone(transPortType);
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    }

    openModel(template: TemplateRef<any>, transPortType: TransportType = null) {
        this.loadTPLs();
        this.selectedTPL = [];
        if (transPortType) {
            this.modalTitle = "Xem chi tiết";
            this.isNew = false;
            this.transPortType = this.clone(transPortType);
            this.selectedTransportType = transPortType;
            if (!ArrayHelper.isNullOrZero(this.transPortType.tplTransportTypes)) {
                const tplEnabled = this.transPortType.tplTransportTypes.filter(x =>  x.tpl && x.tpl.isEnabled);
                this.selectedTPL = tplEnabled.map(x => x.tpl.id);
            }
        } else {
            this.modalTitle = "Tạo mới";
            this.isNew = true;
            this.transPortType = new TransportType();
        }
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    }

    onViewRequiredTPL() {
    }
    
    async loadTPLs() {
        const data = await this.tplService.getAllSelectItemTPLAsync();
        this.tpls = [];
        if (data) {
            this.tpls = data;
        }
    }

    onSelectTPLs() {
        if (!ArrayHelper.isNullOrZero(this.selectedTPL)) {
            this.transPortType.tplIds = this.selectedTPL;
        }
    }

    loadLazy(event: LazyLoadEvent) {
        //imitate db connection over a network
        setTimeout(() => {
            if (this.datasource) {
                var filterRows;

                //filter
                if (event.filters.length > 0)
                    filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
                else
                    filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

                // sort data
                filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
                this.listTransportType = filterRows.slice(event.first, (event.first + event.rows))
                this.totalRecords = filterRows.length;

                // this.listData = filterRows.slice(event.first, (event.first + event.rows));
            }
        }, 250);
    }

    clone(model: TransportType): TransportType {
        let transPortType = new TransportType();
        for (let prop in model) {
            transPortType[prop] = model[prop];
        }
        return transPortType;
    }

    refresh() {
        this.initData();
        this.first = 0;
    }

    save() {
        let list = [...this.listTransportType];
        if (this.isNew) {

            this.transportTypeService.create(this.transPortType).subscribe(x => {
                if (!this.isValidResponse(x)) return;

                var obj = (x.data as TransportType);
                this.mapSaveData(obj);
                list.push(this.transPortType);
                this.datasource.push(this.transPortType);
                this.saveClient(list);
            });
        }
        else {
            this.transportTypeService.update(this.transPortType).subscribe(x => {
                if (!this.isValidResponse(x)) return;

                var obj = (x.data as TransportType);
                this.mapSaveData(obj);
                list[this.findSelectedDataIndex()] = this.transPortType;
                this.datasource[this.datasource.indexOf(this.selectedTransportType)] = this.transPortType;
                this.saveClient(list);
            });
        }
    }

    mapSaveData(obj: TransportType) {
        if (obj) {
            this.transPortType.id = obj.id;
            this.transPortType.concurrencyStamp = obj.concurrencyStamp;
        }
    }

    delete() {
        this.transportTypeService.delete(new BaseModel(this.transPortType.id)).subscribe(x => {
            if (!this.isValidResponse(x)) return;

            let index = this.findSelectedDataIndex();
            this.datasource.splice(this.datasource.indexOf(this.selectedTransportType), 1);
            this.saveClient(this.listTransportType.filter((val, i) => i != index));
        });
    }

    saveClient(list: TransportType[]) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
        this.listTransportType = list;
        this.transPortType = null;
        this.selectedTransportType = null;
        this.bsModalRef.hide();
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
    findSelectedDataIndex(): number {
        return this.listTransportType.indexOf(this.selectedTransportType);
    }
}