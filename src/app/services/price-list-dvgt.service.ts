import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { PriceService } from '../models';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { PriceListDVGT } from '../models/priceListDVGT.model';
import { SelectModel } from '../models/select.model';

@Injectable()
export class PriceListDVGTService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "priceListDVGT");
  }

  async getAllAsync(): Promise<any> {
    const res = await this.getAll().toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as PriceListDVGT[];
    return data;
  }

  async getAllSelectItemAsync(): Promise<SelectModel[]> {
    const data = await this.getAllAsync();
    if (data) {
      let priceListDVGT: SelectModel[] = [];
      priceListDVGT.push({ label: `-- Chọn tất cả --`, value: null });
      data.forEach(element => {
        priceListDVGT.push({
          label: `${element.code} - ${element.name}`,
          value: element.id,
          data: element
        });
      });
      return priceListDVGT;
    }
    return null;
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