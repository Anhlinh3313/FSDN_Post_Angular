import { environment } from './../../environments/environment';
export const AgmCoreConfig = {
    apiKey: environment.gMapKey,
    libraries: ["geometry","drawing","places"],
    language: 'vi',
    region: 'VN'
}