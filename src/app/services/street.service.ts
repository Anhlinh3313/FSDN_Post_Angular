import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Street } from '../models/street.model';

@Injectable()
export class StreetService extends GeneralService{

  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "street");
   }

   getStreetByName(name: string) {
    let params = new HttpParams();
    params = params.append("name", name);

    return super.getCustomApi("getStreetByName", params);
  }

  async getStreetByNameAsync(name: string): Promise<Street[]> {
    const res = await this.getStreetByName(name).toPromise();
    // if(!this.isValidResponse(res)) return;
    const data = res.data as Street[];
    return data;
  }   
}
