export class ResponseModel {
    isSuccess: boolean;
    message: string;
    data: any;
    exception?: object;
    dataCount?: number;
}