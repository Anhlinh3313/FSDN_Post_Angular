import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Province } from '../models/province.model';
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { HttpParams } from '@angular/common/http';
import { SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable({
  providedIn: 'root'
})
export class VietstarExpressService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    
  }

  async ChamNo(chiNhanh: string = null){
    let params = JSON.parse(JSON.stringify(environment.paramsApiVietstarExpress));
    params.data.ChiNhanh = chiNhanh;
    let res = await this.httpClient.post(environment.apiVietstarExpress, params).toPromise();
    console.log(res);
    return res;
  }
}