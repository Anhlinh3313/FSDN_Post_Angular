import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { CustomerPriceListDVGT } from '../models';

@Injectable()
export class CustomerPriceListDVGTService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "CustomerPriceListDVGT");
  }

  async getByPriceListDVGTasync(id): Promise<CustomerPriceListDVGT[]> {
    let params = new HttpParams();
    params = params.append("id", id);

    let res = await this.getCustomApi("GetByPriceListDVGT", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data as CustomerPriceListDVGT[];
  }
}
