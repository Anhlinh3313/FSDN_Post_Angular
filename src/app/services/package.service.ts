import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { Package, ResponseModel } from '../models';
import { ScanShipmentInPackage } from '../models/scanShipmentInPackage.model';
import { Observable } from "rxjs/Observable";
import { ScanOpenCheckPackage } from '../models/scanOpenCheckPackage.model';
import { IBaseModel } from '../models/abstract/ibaseModel.interface';
import { SelectItem } from 'primeng/primeng';
import { ShipmentFilterViewModel } from '../models/shipmentFilterViewModel';

@Injectable()
export class PackageService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "package");
  }

  async getPackageNewAsync(toHubId: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("toHubId", toHubId);
    return await super.getCustomApi("GetPackageNew", params).toPromise();
  }

  openPackage(id: any) {
    return super.postCustomApi("openPackage", id);
  }

  closedPackage(model: Package) {
    return super.postCustomUrlApi(environment.apiPostUrl, "ClosedPackage", model);
  }

  async closedPackageAsync(model: Package): Promise<ResponseModel> {
    const res = await this.closedPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  openUpdatePackage(sealNumber: any) {
    return super.postCustomUrlApi(environment.apiPostUrl, "OpenUpdatePackage", sealNumber);
  }

  async openUpdatePackageAsync(sealNumber: any): Promise<ResponseModel> {
    const res = await this.openUpdatePackage(sealNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  openCheckedPackage(model: IBaseModel) {
    return super.postCustomUrlApi(environment.apiPostUrl, "OpenCheckedPackage", model);
  }

  async openCheckedPackageAsync(model: IBaseModel): Promise<ResponseModel> {
    const res = await this.openCheckedPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  trackingPackage(model: ScanOpenCheckPackage) {
    return super.postCustomUrlApi(environment.apiPostUrl, "TrackingPackage", model);
  }

  async trackingPackageAsync(model: ScanOpenCheckPackage): Promise<ResponseModel> {
    const res = await this.trackingPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  completeCheckedPackage(model: IBaseModel) {
    return super.postCustomUrlApi(environment.apiPostUrl, "CompleteCheckedPackage", model);
  }

  async completeCheckedPackageAsync(model: IBaseModel): Promise<ResponseModel> {
    const res = await this.completeCheckedPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  scanShipmentInPackage(model: ScanShipmentInPackage) {
    return super.postCustomUrlApi(environment.apiPostUrl, "ScanShipmentInPackage", model);
  }

  async scanShipmentInPackageAsync(model: ScanShipmentInPackage): Promise<ResponseModel> {
    const res = await this.scanShipmentInPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  scanShipmentOutPackage(model: ScanShipmentInPackage) {
    return super.postCustomUrlApi(environment.apiPostUrl, "ScanShipmentOutPackage", model);
  }

  async scanShipmentOutPackageAsync(model: ScanShipmentInPackage): Promise<ResponseModel> {
    const res = await this.scanShipmentOutPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getPackageToPrintAsync(packageId: any): Promise<any> {
    let params = new HttpParams;
    params = params.append("packageId", packageId);
    const res = await super.getCustomApi("GetPackageToPrint", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getShipmentByPackageIdAsync(packageId: any, statusId?: any, pageNumber?: any, pageSize?: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("packageId", packageId);
    params = params.append("statusId", statusId);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    return await super.getCustomApi("GetShipmentByPackageId", params).toPromise();
  }

  getListPackage(createdHubId?: any, searchText?: any, statusId?: any,
    dateFrom?: any, dateTo?: any, pageNumber?: any, pageSize?: any) {
    let params = new HttpParams;
    params = params.append("createdHubId", createdHubId);
    params = params.append("searchText", searchText);
    params = params.append("statusId", statusId);
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    return super.getCustomApi("GetListPackage", params);
  }

  async getListPackageAsync(createdHubId?: any, searchText?: any, statusId?: any,
    dateFrom?: any, dateTo?: any, pageNumber?: any, pageSize?: any): Promise<ResponseModel> {
    const res = await this.getListPackage(createdHubId, searchText, statusId, dateFrom, dateTo, pageNumber, pageSize).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getShipmentByPackageCodeOrSeal(codeOrSeal?: any, statusId?: any, pageNumber?: any, pageSize?: any) {
    let params = new HttpParams;
    params = params.append("codeOrSeal", codeOrSeal);
    params = params.append("statusId", statusId);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    return super.getCustomApi("GetShipmentByPackageCodeOrSeal", params);
  }

  async getShipmentByPackageCodeOrSealAsync(codeOrSeal?: any, statusId?: any, pageNumber?: any, pageSize?: any): Promise<ResponseModel> {
    const res = await this.getShipmentByPackageCodeOrSeal(codeOrSeal, statusId, pageNumber, pageSize).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getPackageStatus() {
    let params = new HttpParams();
    return super.getCustomApi("GetPackageStatus", params);
  }

  async getSelectItemPackageStatusAsync(): Promise<SelectItem[]> {
    const res = await this.getPackageStatus().toPromise();
    if (res.isSuccess) {
      const data = res.data as any[];
      if (data) {
        const status: SelectItem[] = [];
        status.push({ label: `-- Chọn tất cả --`, value: null });
        data.forEach(element => {
          status.push({
            label: `${element.name}`,
            value: element.id
          });
        });
        return status;
      }
    }
    return;
  } 

  async getListPackageByAsync(filterViewModel?: ShipmentFilterViewModel): Promise<Package[]> {
    const res = await super.postCustomApi("GetListPackageBy", filterViewModel).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }
}