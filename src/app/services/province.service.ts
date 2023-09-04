import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Province } from '../models/province.model';
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { HttpParams } from '@angular/common/http';
import { SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class ProvinceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "province");
  }

  getByListCode(listCode: string[]) {
    return super.postCustomUrlApi(environment.apiGeneralUrl, "getByListCode", listCode);
  }

  async getByListCodeAsync(listCode: string[]): Promise<Province[]> {
    const res = await this.getByListCode(listCode).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Province[];
    return data;
  }

  getProvinceByName(name: string, countryId: number = null) {
    let params = new HttpParams();
    params = params.append("name", name);

    if (countryId) {
      params = params.append("countryId", countryId + "");
    }

    return super.getCustomApi("getProvinceByName", params);
  }

  async getProvinceByNameAsync(name: string, provinceId?: number): Promise<Province> {
    const res = await this.getProvinceByName(name, provinceId).toPromise();
    // if(!this.isValidResponse(res)) return;
    const data = res.data as Province;
    return data;
  }    

  async getAllSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as Province[];
      if (data) {
        const province: SelectItem[] = [];
        province.push({ label: `-- Chọn tỉnh --`, value: null });
        data.forEach(element => {
          province.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
        });
        return province;
      }
    } else {
      return null;
    }
  }
  getProvinceByCode(code: string) {
    let params = new HttpParams();
    params = params.append("code", code);

    return super.getCustomApi("getProvinceByCode", params);
  }

  async getProvinceByCodeAsync(code: string): Promise<Province> {
    const res = await this.getProvinceByCode(code).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Province;
    return data;
  }
}
