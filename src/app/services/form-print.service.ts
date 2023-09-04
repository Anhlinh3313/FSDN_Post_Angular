import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { ResponseModel } from '../models';

@Injectable()
export class FormPrintService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "FormPrint");
  }

  getFormPrintTypeAsync():Promise<ResponseModel>{
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "getFormPrintType").toPromise();
  }
  
  getFormPrintByTypeAsync(typeId: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("typeId", typeId);
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "GetFormPrintByType", [], params).toPromise();
  }

  getFormPrintA5Async(customerId: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("customerId", customerId);
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "getFormPrintA5", [], params).toPromise();
  }

  getFormPrintLabelAsync(): Promise<ResponseModel> {
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "getFormPrintLabel", []).toPromise();
  }

  getFormPrintBarCodeAsync(): Promise<ResponseModel> {
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "getFormPrintBarCode", []).toPromise();
  }

  getFormPrintPackageAsync(): Promise<ResponseModel> {
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "getFormPrintPackage", []).toPromise();
  }
}
