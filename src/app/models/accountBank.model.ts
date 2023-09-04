import { GeneralModel } from ".";
import { AccountingAccount } from "./accountingAcount.model";

export class AccountBank extends GeneralModel {
    branchId: number;
    accountingAccountId: number;
    accountingAccount: AccountingAccount;
    branch: any;
}