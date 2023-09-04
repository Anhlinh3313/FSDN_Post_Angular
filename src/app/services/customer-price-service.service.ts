import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { CustomerPriceService } from '../models/customerPriceService';

@Injectable()
export class CustomerPriceServiceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "CustomerPriceService");
  }

  async GetByPriceServiceId(priceServiceId): Promise<CustomerPriceService[]> {
    let params = new HttpParams();
    params = params.append("priceServiceId", priceServiceId);

    let res = await this.getCustomApi("GetByPriceServiceId", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data as CustomerPriceService[];
  }
}
