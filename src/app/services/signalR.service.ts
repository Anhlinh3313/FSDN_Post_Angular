import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment } from '../../environments/environment';

@Injectable()
export class SignalRService {

    hubConnection: HubConnection;

    constructor() {
    }

    GetConnection() {
        return this.hubConnection;
    }

    async Connect() {
        this.hubConnection = await new HubConnectionBuilder().withUrl(environment.apiGeneralUrl + "/SignalR").build();
        await this.hubConnection.start();
        return this.hubConnection;
    }

    async Disconnect() {
        if (this.hubConnection)
            await this.hubConnection.stop();
    }
}