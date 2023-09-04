import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { Price } from '../models';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { ShipmentCalculateViewModel } from '../view-model/index';
import { PriceListService } from '../models/priceListService.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class PriceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "price");
  }

  public calculate(model: ShipmentCalculateViewModel): Observable<ResponseModel> {
    return super.postCustomApi("calculate", model);
  }

  async calculateAsync(model: ShipmentCalculateViewModel): Promise<Price> {
    const res = await this.calculate(model).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Price;
    return data;
  }

  public getListService(model: ShipmentCalculateViewModel): Observable<ResponseModel> {
    return super.postCustomApi("getListService", model);
  }

  public loadListService(model: ShipmentCalculateViewModel) {
    let res : ResponseModel = new ResponseModel;
    return this.getListService(model).map(x => {
      let services = [];
      let data = x.data as PriceListService[]; 
      if (data.length > 0) {
        services.push({ label: "-- Chọn dữ liệu --", value: null });
        data.forEach(element => {
          services.push({
            label: `${element.code} - ${element.name} - ${element.price}`,
            value: element.id,
            title: element.name,
          });
        });
        res.data = services;
        res.message = null;
        return res;
      } else {
        services = [];
        res.data = services;
        res.message = "Khu vực không có dịch vụ!";
        return res;
      }
    });
  }

  async loadListServiceAsync(model: ShipmentCalculateViewModel): Promise<ResponseModel> {
    let data : ResponseModel = new ResponseModel;
    const res = await this.getListService(model).toPromise();
    if(!this.isValidResponse(res)) return;
    const priceList = res.data as PriceListService[];
    let services = [];
    if (priceList.length > 0) {
      services.push({ label: "-- Chọn dữ liệu --", value: null });
      priceList.forEach(element => {
        services.push({
          label: `${element.code} - ${element.name} - ${element.price}`,
          value: element.id,
          title: element.name,
          data: element
        });
      });
      data.data = services;
      data.message = null;
      return data;
    } else {
      services = [];
      data.data = services;
      data.message = "Khu vực không có dịch vụ!";
      return data;
    }
  }
}