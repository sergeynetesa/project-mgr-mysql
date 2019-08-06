import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { map, filter, shareReplay, startWith, tap } from 'rxjs/operators';

import { PAGE_ROUTES, PageRoutes, PageRoute } from './pages/pages.routes';

// import { DomSanitizer } from '@angular/platform-browser';
// import { MatIconRegistry } from '@angular/material';

import { ScreenService } from './shared/services/screen.service';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [
    trigger('growInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale3d(.3, .3, .3)'
        }),
        animate(`150ms ease-in`)
      ]),
      transition('* => void', [
        animate(
          `150ms ease-out`,
          style({
            opacity: 0,
            transform: 'scale3d(.3, .3, .3)'
          })
        )
      ])
    ])
  ],
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  public pageRoutes = PAGE_ROUTES;
  public routeMap = createTopRouteMap(PAGE_ROUTES);
  public leftRouteArr = createLeftRouteArray(PAGE_ROUTES);

  public header$: Observable<{title: string}>;

  public isSmallScreen$: Observable<{matches: boolean}>;

  constructor(
    private router: Router,
    // private iconRegistry: MatIconRegistry,
    // private sanitizer: DomSanitizer,
    public screenSrv: ScreenService,
    public userSrv: UserService
  ) {
    // iconRegistry.addSvgIcon('user-circle',
    //   sanitizer.bypassSecurityTrustResourceUrl('assets/img/homepage/user-circle-solid_white.svg'));
  }

  ngOnInit() {
    this.isSmallScreen$ = this.screenSrv.isSmallScreen$;

    this.header$ = this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => getTopTitleByUrl(e.url, this.routeMap)),
      shareReplay(1)
    );
    // this.router.navigateByUrl('/login-signup');

  }

  logout() {
    this.userSrv.logoutUser();
    this.router.navigateByUrl('/');
  }
}
// --------------------------------------------------------------------------------

export function createTopRouteMap(routes: PageRoutes) {
  const flatCopy = [];
  routes.forEach((item: PageRoute) => item.data.forEach(it => flatCopy.push(it)) );
  const rs = flatCopy.reduce((acc: { [key: string]: string }, route) => {
    return { ...acc, [route.pathRegex]: route.topNavTitle };
  }, {});
  return rs;
}
export function createLeftRouteArray(routes: PageRoutes) {
  const flatCopy1 = [];
  routes.forEach((item: PageRoute) => item.data.forEach(it => {
    if (it.isLeftNav) {
      flatCopy1.push({path: item.path, title: it.leftNavTitle, order_id: it.orderId});
    }
  }));
  return flatCopy1;
}
export function getTopTitleByUrl(url: string, routeMapObject: {[key: string]: string}): {title: string} {
  const routeEntryArr = Object.entries(routeMapObject);
  const foundEntry = routeEntryArr.find((entry: [string, string]) =>
    RegExp(entry[0]).test(url)
  );
  if (foundEntry) {
    return {title: foundEntry[1]};
  } else {
      return {title: 'N/A'};
  }
}
