export class HubHelper {
    static getHubId(centerHubID: number, poHubID: number, stationHub: number): number {
        let hubId: number = null;
        if (centerHubID && poHubID && stationHub) {
            hubId = stationHub;
          } else if (centerHubID && poHubID) {
            hubId = poHubID;
          } else {
            hubId = centerHubID;
        }
        return hubId;
    }
}