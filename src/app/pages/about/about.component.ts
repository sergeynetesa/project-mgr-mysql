import { ViewportService } from './../../shared/services/viewport.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { BreakpointState } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { AboutItemInterface } from 'src/app/shared/model/about.interface';
import { ScreenService } from './../../shared/services/screen.service';
import { AboutImageDialogComponent } from './../../forms/about-image-dialog/about-image-dialog.component';
import { WindowSizesInterface } from 'src/app/shared/model/window-sizes.interface';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  public items$: Observable<AboutItemInterface[]> = null;

  public dialogRef: MatDialogRef<AboutImageDialogComponent, any> = null;

  public isSmallScreen$: Observable<{matches: boolean}>;
  // public isHandset$: Observable<BreakpointState>;
  public winSizes$: Observable<WindowSizesInterface>;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public screenSrv: ScreenService,
    public vpSrv: ViewportService
    ) {

  }
  ngOnInit() {
    this.items$ = this.http.get<AboutItemInterface[]>('./assets/about/about.json');

    this.isSmallScreen$ = this.screenSrv.isSmallScreen$;
    // this.isHandset$ = this.screenSrv.isHandset$;

    this.winSizes$ = this.vpSrv.windowSizes$;
  }

  getSmallImageFileName(imageFileName: string): string {
    // const regEx = /^(?<path>\.\/assets\/about\/)(?<fn>\d\d_.+)(?<ext>\.jpg)$/gm;
    const regEx = /^(\.\/assets\/about\/)(\d\d_.+)(\.jpg)$/gm;
    return imageFileName.replace(regEx, '$1$2_s$3');
  }
  openAboutImageDialog(aboutItem: AboutItemInterface ) {
    const vpW = this.vpSrv.viewportSizes.width;
    const vpH = this.vpSrv.viewportSizes.height;

    this.dialogRef = this.dialog.open(AboutImageDialogComponent, {
      // disableClose:  true,
      autoFocus: true,
      data: aboutItem,
      // maxWidth: vpW * 0.9,
      // minWidth: vpW - (vpW * 0.1),
      // maxHeight: vpH,
      // minHeight: vpH - (vpH * 0.1),
      // width: vpW + 'px',
      // height: vpH + 'px',
    });

  }
}
