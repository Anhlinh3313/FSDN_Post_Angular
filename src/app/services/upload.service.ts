import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class UploadService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "upload");
  }

  public getImageByPath(imagePath: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("imagePath", imagePath);
    return super.getCustomApi("getImageByPath", params);
  }

  async getImageByPathAsync(imagePath: any): Promise<any> {
    const res = await this.getImageByPath(imagePath).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getImageByShipmentId(shipmentId: any, imageType: any, incidentsId: any = null) {
    let params = new HttpParams();
    params = params.append("shipmentId", shipmentId);
    params = params.append("imageType", imageType);
    params = params.append("incidentsId", incidentsId);
    let res =  await super.getCustomApi("GetImageByShipmentId", params).toPromise();
    // if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async uploadIamgeSubmitToTreasurer(model: any): Promise<any> {
    const res = await this.postCustomApi("UploadIamgeSubmitToTreasurer", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async uploadImageComplainHandle(model: any): Promise<any> {
    const res = await this.postCustomApi("UploadImageComplainHandle", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async uploadDocCompensation(model: any): Promise<any> {
    const res = await this.postCustomApi("UploadDocCompensation", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
}
