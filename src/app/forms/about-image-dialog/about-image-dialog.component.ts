import { AboutItemInterface } from './../../shared/model/about.interface';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { ViewportService } from 'src/app/shared/services/viewport.service';

@Component({
  selector: 'app-about-image-dialog',
  templateUrl: './about-image-dialog.component.html',
  styleUrls: ['./about-image-dialog.component.scss']
})
export class AboutImageDialogComponent implements OnInit {
  isImgLoading = true;

  constructor(
    private dialogRef: MatDialogRef<AboutImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public item: AboutItemInterface,
    public vpSrv: ViewportService
  ) { }

  ngOnInit() {
  }

  // close() {
  //   this.dialogRef.close();
  // }

  imgLoaded() {
    // console.log('img loaded!');
    this.isImgLoading = false;
  }
  getImgStyle() {
    if (!(this.vpSrv.viewportSizes && this.vpSrv.viewportSizes.width)) {
      return;
    }
    const vpW = this.vpSrv.viewportSizes.width;
    const vpH = this.vpSrv.viewportSizes.height;
    if (this.item.src_w > vpW) {
      const kW = 0.7374;
      const kH = 0.6261;

      if (this.isImgLoading) {
        return {visibility: 'hidden', 'height.px': vpH * kH, 'width.px': vpW * kW};
      } else {
        // return {'height.px': vpH * kH, 'width.px': vpW * kW};
        return {'width.px': vpW * kW};
      }
    } else {
      const kW = 0.66;
      const kH = 0.66;
      let cW = vpW * kW;
      let cH = vpH * kH;
      if (this.item.src_w <= cW) {
        cH = this.item.src_h;
        cW = this.item.src_w;
      }
      if (this.isImgLoading) {
        return {visibility: 'hidden', 'height.px': cH, 'width.px': cW};
      } else {
        // return {'height.px': vpH * kH, 'width.px': vpW * kW};
        return {'width.px': cW};
      }
    }
  }
}
