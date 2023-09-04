import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { ResponseModel } from '../models';

@Injectable()
export class CustomerPaymentToService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiCRMUrl, "customerPaymentTo");
    }

    async checkCustomerPaymentTo(customerId: any, paymentToCustomerId: any): Promise<ResponseModel> {
        let params = new HttpParams();
        params = params.append("customerId", customerId);
        params = params.append("paymentToCustomerId", paymentToCustomerId);
        return super.getCustomApi("CheckCustomerPaymentTO", params).toPromise();
    }
}