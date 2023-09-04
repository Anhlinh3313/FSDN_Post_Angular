import { TypeCodeHelper } from "../app/infrastructure/typeCodeHelper";

export const environment = {
  production: true,
  company: "FlashShip",
  title: "FlashShip",
  name: "flashship",

  urlFirebase: "https://fcm.googleapis.com/fcm/send",

  gMapKey: "AIzaSyCJ6X8dE3Igc0wUL2SIg5csH4tZrnCALLY",

  namePrint: "flashship",

  formatTime: "HH:mm",
  formatDate: "YYYY/MM/DD",
  formatDateTable: "yyyy/MM/dd",
  formatDateTime: "YYYY/MM/DD HH:mm",
  formatDateTimeTable: "yyyy/MM/dd HH:mm",
  unit: "(kg)",

  centerHubLongName: "Trung tâm",
  centerHubSortName: "TT",
  poHubLongName: "Chi nhánh",
  poHubSortName: "CN",
  stationHubLongName: "Bưu cục",
  stationHubSortName: "BC",

  pack: "Túi",
  isInTong: true,

  typeRequestCode: TypeCodeHelper.Request.NORMAL,
  defaultSize: 6,
  pageSize: 20,
  heightBarcode: 30,
  heightQRCode: 50,

  urlLogo: "/assets/images/logo/flashshipvn.png",
  apiGeneralUrl: "http://coreapifsdn.dsc.vn/api",
  apiCRMUrl: "http://crmapifsdn.dsc.vn/api",
  apiPostUrl: "http://postapifsdn.dsc.vn/api",
  apiCusUrl: "http://cusapifsdn.dsc.vn/api",
  tokenFirebase: "AIzaSyCafKSiMTLP6DhwJTW41FhBldJtaGUopZc",

  postUrl: "",
  apiVietstarExpress: "",
  paramsApiVietstarExpress: {
    user: "50611",
    pass: "qqqq",
    apikey: "eSg1JdaPo1k:APA91bHGaq6ilA_1N7cVh2nxUpSunxy5s0Z5IMWY70uTs5BPNrwvvhzpA2pU24cncdgBh5LHV_w6O5_ZPUUXOxwMP-ImM2Rem6ATmWMP5t3S9WotemyLKHVMq572ywK2F3nlNQwbFS89",
    data: {
      ChiNhanh: null
    }
  },
};