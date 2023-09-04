import { Injectable } from "@angular/core";
import { MessageService } from "primeng/primeng";
import { BaseService } from ".";
import { HttpClient, HttpParams } from "@angular/common/http";
import { PersistenceService } from "angular-persistence";
import { NotificationCenter } from "../models";
import { environment } from "../../environments/environment";
import { GeneralService } from "./general.service";

@Injectable()
export class NotificationCenterService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "NotificationCenter");
  }

  async getNotificationMenuAsync(): Promise<NotificationCenter> {
    let params = new HttpParams;
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "GetNotificationMenu", [], params).toPromise().then(
      x => {
        if (!this.isValidResponse(x)) return;
        return x.data as NotificationCenter;
      }
    );
  }
}
