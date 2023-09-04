import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { Ward } from '../models/ward.model';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { IdViewModel } from '../view-model/index';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class WardService  extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "ward");
  }

  public getWardByDistrictId(districtId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("districtId", districtId);

    return super.getCustomApi("getWardByDistrictId", params);
  }

  async getWardByDistrictIdAsync(districtId: any): Promise<Ward[]> {
    const res = await this.getWardByDistrictId(districtId).toPromise();
    if (res.isSuccess) {
      const data = res.data as Ward[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelWardByDistrictIdAsync(districtId: any): Promise<SelectModel[]> {
    const data = await this.getWardByDistrictIdAsync(districtId);
    if (data) {
      let wards: SelectModel[] = [];
      wards.push({ label: `-- Chọn phường/xã --`, data: null, value: null });
      data.forEach(element => {
        wards.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return wards;
    } else {
      return null;
    }
  } 

  public getWardByDistrictIds(districtIds: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = districtIds;
    obj.cols = arrCols.join(",");

    return super.postCustomApi("getWardByDistrictIds", obj);
  }

  getWardByName(name: string, districtId: number = null) {
    let params = new HttpParams();
    params = params.append("name", name);

    if(districtId) {
      params = params.append("districtId", districtId + "");
    }

    return super.getCustomApi("getWardByName", params);
  }

  async getWardByNameAsync(name: string, districtId?: number): Promise<Ward> {
    const res = await this.getWardByName(name, districtId).toPromise();
    if (res.isSuccess) {
      const data = res.data as Ward;
      return data;
    } else {
      return null;
    }
  }
}
