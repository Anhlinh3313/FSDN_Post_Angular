import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { PriceList } from '../models/priceList.model';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { SelectModel } from '../models/select.model';

@Injectable()
export class PriceListService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "priceList");
  }

  async getSelectItemAsync(): Promise<SelectItem[]> {
    const res = await this.getAllAsync();
    if (res) {
      let allPriceList: SelectItem[] = [];
      allPriceList.push({ label: `-- Chọn bảng giá --`, value: null });
      res.forEach(element => {
        allPriceList.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return allPriceList;
    }
    return null;
  }
  
  public CopyPriceList(model: any): Observable<ResponseModel> {
    return super.postCustomApi("CopyPriceList", model);
  }

  public getByHubAndCustomer(hubId: any, customerId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("hubId", hubId);
    params = params.append("customerId", customerId);
    return super.getCustomApi("GetByHubAndCustomer", params);
  }

  async getByHubAndCustomerAsync(hubId: any, customerId: any): Promise<PriceList[]> {
    const res = await this.getByHubAndCustomer(hubId, customerId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as PriceList[];
    return data;
  }

  async getSelectModelByHubAndCustomerAsync(hubId: any, customerId: any): Promise<SelectModel[]> {
    const data = await this.getByHubAndCustomerAsync(hubId, customerId);
    if (data) {
      const selectModel = [];
      const datas = data as any[];

      selectModel.push({ label: "-- Chọn bảng giá --", data: null, value: null });
      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return selectModel;
    }
    return null;
  }
}