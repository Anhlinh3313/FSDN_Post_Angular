import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { ProvinceCode } from '../models/provinceCode.model';

@Injectable()
export class ProvideCodeService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiPostUrl, "ProvideCode");
    }

    provide(model: any) {
        return super.postCustomApi("Provide", model);
    }

    async provideAsync(model: any): Promise<ProvinceCode[]> {
        const res = await this.provide(model).toPromise();
        const data = res.data as ProvinceCode[];
        return data;
    }
}
