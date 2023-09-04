import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { PriceService } from '../models';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { ShipmentCalculateViewModel } from '../view-model/index';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class PriceServiceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "priceService");
  }

  public calculate(model: ShipmentCalculateViewModel): Observable<ResponseModel> {
    return super.postCustomApi("calculate", model);
  }

  public GetByPriceList(priceListId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("priceListId", priceListId);
    return super.getCustomApi("GetByPriceList", params);
  }

  public CopyPriceServiceAsync(priceServiceId: any, newPriceServiceCode: any): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("priceServiceId", priceServiceId);
    params = params.append("newCode", newPriceServiceCode);
    return super.getCustomApi("CopyPriceService", params).toPromise();
  }

  public GetByPriceListService(priceListId: any, serviceId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("priceListId", priceListId);
    params = params.append("serviceId", serviceId);
    return super.getCustomApi("GetByPriceListService", params);
  }

  async GetByPriceListServiceAsync(priceListId: any, serviceId: any): Promise<PriceService[]> {
    const res = await this.GetByPriceListService(priceListId,serviceId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as PriceService[];
    return data;
  }

  public getDIM(priceListId: number, serviceId: number): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("priceListId", priceListId + "");
    params = params.append("serviceId", serviceId + "");
    return super.getCustomApi("GetDIM", params);
  }

  async getDIMAsync(priceListId: number, serviceId: number): Promise<PriceService> {
    const res = await this.getDIM(priceListId, serviceId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as PriceService;
    return data;
  }  

  public getByCode(code: string): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("code", code);
    return super.getCustomApi("GetByCode", params);
  }

  async getByCodeAsync(code: string):Promise<PriceService[]>{
    const res = await this.getByCode(code).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as PriceService[];
    return data;
  }
}