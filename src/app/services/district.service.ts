import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { District } from '../models/district.model';
import { ResponseModel } from '../models/response.model';
import { HttpParams } from '@angular/common/http';
import { GeneralService } from './general.service';
import { IdViewModel } from '../view-model/index';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class DistrictService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "district");
  }

  public getDistrictByProvinceId(provinceId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("provinceId", provinceId);

    return super.getCustomApi("getDistrictByProvinceId", params);
  }

  async getDistrictByProvinceIdAsync(provinceId: any): Promise<District[]> {
    const res = await this.getDistrictByProvinceId(provinceId).toPromise();
    if (res.isSuccess) {
      const data = res.data as District[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelDistrictByProvinceIdAsync(provinceId: any): Promise<SelectModel[]> {
    const data = await this.getDistrictByProvinceIdAsync(provinceId);
    if (data) {
      let districts: SelectModel[] = [];
      districts.push({ label: `-- Chọn quận/huyện --`, data: null, value: null });
      data.forEach(element => {
        districts.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return districts;
    } else {
      return null;
    }
  }  

  public getDistrictByProvinceIds(provinceIds: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = provinceIds;
    obj.cols = arrCols.join(",");

    return super.postCustomApi("getDistrictByProvinceIds", obj);
  }

  getDistrictByName(name: string, provinceId: number = null) {
    let params = new HttpParams();
    params = params.append("name", name);

    if(provinceId) {
      params = params.append("provinceId", provinceId + "");
    }

    return super.getCustomApi("getDistrictByName", params);
  }

  async getDistrictByNameAsync(name: string, provinceId?: number): Promise<District> {
    const res = await this.getDistrictByName(name, provinceId).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as District;
    return data;
  }  
}
