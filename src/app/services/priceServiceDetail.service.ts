import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { PriceServiceDetail } from '../models';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { DataFilterViewModel, PriceServiceDetailExcelViewModel } from '../view-model/index';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class PriceServiceDetailService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "priceServiceDetail");
  }

  public GetByPriceService(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("GetByPriceService", dataFilter);
  }

  public UploadExcelPriceService(dataExcels: PriceServiceDetailExcelViewModel): Observable<ResponseModel> {
    return super.postCustomApi("UploadExcelPriceService", dataExcels);
  }

  async updateFromProvince(model) {
    let res = await super.postCustomApi("UpdateFromProvince", model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }

  getByPriceServiceId(priceSerivceId: any, areaGroupId): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("priceServiceId", priceSerivceId);
    params = params.append("areaGroupId", areaGroupId);
    return super.getCustomApi("GetByPriceServiceId", params);
  }

  async getByPriceServiceIdAsync(priceSerivceId: any, areaGroupId: any): Promise<any> {
    const res = await this.getByPriceServiceId(priceSerivceId, areaGroupId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }

  updatePriceServices(model: PriceServiceDetail[]) {
    return super.postCustomApi("UpdatePriceServices", model);
  }
  async updatePriceServicesAsync(model: PriceServiceDetail[]): Promise<PriceServiceDetail[]> {
    const res = await this.updatePriceServices(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as PriceServiceDetail[];
    return data;
  }
}