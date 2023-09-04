import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { ResponseModel } from '../models';

@Injectable()
export class EmailCenterService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "EmailCenter");
  }
  async sendEmailShipmentAsync(model: any): Promise<ResponseModel> {
    return await super.postCustomApi("SendEmailShipment", model).toPromise();
  }
}
