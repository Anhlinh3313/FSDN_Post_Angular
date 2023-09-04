import { Component, OnInit } from '@angular/core';
import { ImagePickupServiceInstance } from '../../../services/imagePickup.serviceInstance';
import { GetDatasFromHubViewModel } from '../../../view-model';
import { Shipment } from '../../../models';
import { UploadService } from '../../../services';

@Component({
  selector: 'app-image-pick-up',
  templateUrl: './image-pick-up.component.html',
  styles: []
})
export class ImagePickUpComponent implements OnInit {

  updateImagePath: any;
  modalTitle: string;
  constructor(
    private imagePickupServiceInstance: ImagePickupServiceInstance,
    private uploadService: UploadService,
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.imagePickupServiceInstance.getEventSubject.subscribe(x => {
      if (x) {
        const data = x;
        this.openModel(data);
      }
   });
  }

  async openModel(data: Shipment) {
    this.modalTitle = "Hình ảnh nhận hàng";
    const res = await this.uploadService.getImageByPathAsync(data.pickupImagePath);
    if (res) {
      const popUpWin = this.createPopupWin();
      if (res.data["fileBase64String"]) {
        this.updateImagePath = res;
        this.print(popUpWin);
      }      
    }     
  }

  createPopupWin(): Window {
    return window.open(
      "",
      "_blank",
      "top=0,left=0,height=100%,width=auto,time=no"
    );
  }

  print(popupWin) {
    setTimeout(() => {
      let printContents;
      printContents = document.getElementById("image-section").innerHTML;
      popupWin.document.open();
      popupWin.document.write(
        "<!DOCTYPE html><html>" +
          "<head>" +
            '<link rel="stylesheet" href="/assets/css/layout.css" media="screen">' +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
            '<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>' +
            "<style>@page { size: auto;  margin: 0mm; }</style>" +
          '</head>' +
          "<body>" +
          "<div class='reward-body'>" +
            printContents +
          "</div>" +
          "<script>" + 
            "$(document).ready(function() {" + 
              "let canvas = document.getElementById('canvas');" +
              "let image = document.getElementById('imagePickupComplete');" +
              "let element = canvas.getContext('2d');" +
              "let angleInDegrees = 0;" +
              "let zoomDelta = 0.02;" +
              "let currentScale = 0.4;" +
              "let currentAngle = 0;" +
              "let startX, startY, isDown = false;" +
              "element.translate(canvas.width / 2, canvas.height / 2);" +
              "drawImage();" +
              "$('#canvas').attr('data-girar', 0);" +
              "$('#giraresq').click(function () {" +
                "angleInDegrees = 90;" +
                "currentAngle += angleInDegrees;" +
                "drawImage();" +
              "});" +  
              "$('#girardir').click(function () {" +
                  "angleInDegrees = -90;" +
                  "currentAngle += angleInDegrees;" +
                  "drawImage();" +
              "});" +
              "$('#zoomIn').click(function () {" + 
                  "currentScale += zoomDelta;" + 
                  "drawImage();" + 
              "});" + 
              "$('#zoomOut').click(function () {" + 
                  "currentScale -= zoomDelta;" + 
                  "drawImage();" + 
              "});" + 
              "function drawImage() {" + 
                  "clear();" + 
                  "element.save();" + 
                  "element.scale(currentScale, currentScale);" +
                  "element.rotate(currentAngle * Math.PI / 180);" +
                  "element.drawImage(image, -image.width / 2, -image.height / 2);" +
                  "element.restore();" +
              "}" + 
              "function clear() {" + 
                  "element.clearRect(-image.width / 2 - 2, -image.width / 2 - 2, image.width + 4, image.height + 4);" + 
              "}" +
              "function getMousePos(canvas, evt) {" + 
                  "let rect = canvas.getBoundingClientRect();" + 
                  "return {" + 
                      "x: evt.clientX - rect.left," + 
                      "y: evt.clientY - rect.top" + 
                  "};" +
              "}" +
            '});' +
          "</script>" +
          "</body>" +
        "</html>"
      );
      popupWin.document.close();
    }, 0);    
  }

  ngOndestroy() {
    this.imagePickupServiceInstance.resetEventObserver();
  }
}
