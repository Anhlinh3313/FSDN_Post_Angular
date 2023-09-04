import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

import { ServiceDVGTPrice } from '../models/serviceDVGTPrice.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class ServiceDVGTPriceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "serviceDVGTPrice");
  }

 getByPriceListDVGT(id: any) {
    let params = new HttpParams();
    params = params.append("id", id);
    return super.getCustomApi("getByPriceListDVGT", params);
  }
  
  async getByPriceListDVGTAsync(id: any): Promise<ServiceDVGTPrice[]> {
    const res = await this.getByPriceListDVGT(id).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as ServiceDVGTPrice[];
    return data;
  }
}