import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GeneralService } from "./general.service";
import { PersistenceService } from "angular-persistence";
import { environment } from "../../environments/environment";
import { SelectItem } from "primeng/primeng";
import { SelectModel } from "../models/select.model";
import { MessageService } from "primeng/components/common/messageservice";
import { PaymentCODType } from "../models";

@Injectable()
export class PaymentCODTypeService extends GeneralService {
  paymentTypes: SelectItem[];
  constructor(
    protected messageService: MessageService,
    protected httpClient: HttpClient,
    protected persistenceService: PersistenceService,
  ) {
    super(
      messageService,
      httpClient,
      persistenceService,
      environment.apiPostUrl,
      "paymentCODType"
    );
  }

  async getAllSelectModelAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as PaymentCODType[];
      if (data) {
        const paymentType: SelectModel[] = [];
        paymentType.push({ label: `---`, value: null });
        data.forEach(element => {
          paymentType.push({
            label: `${element.code} - ${element.name}`,
            value: element.id,
            data: element
          });
        });
        return paymentType;
      }
    } else {
      return null;
    }
  }
}
