import { RolePage } from "./rolePage.model";
import { GeneralModel } from "./general.model";

export class Page extends GeneralModel {
    parentPageId: number;
    aliasPath: string;
    pageOrder: number;
    isAccess: boolean;
    isAdd: boolean;
    isEdit: boolean;
    isDelete: boolean;
    modulePageId: number;
    icon: string;
    children: Page[] = [];
    rolePage: RolePage;
    display: string;
    active: string;
    notification: number = 0;
}