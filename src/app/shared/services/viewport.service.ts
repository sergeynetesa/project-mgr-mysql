import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { shareReplay, startWith, tap, map, last, debounceTime } from 'rxjs/operators';

import { WindowSizesInterface } from '../model/window-sizes.interface';

@Injectable({
  providedIn: 'root'
})
export class ViewportService {
  public viewportSizes: WindowSizesInterface = null;

  public windowSizes$: Observable<WindowSizesInterface> =
    fromEvent(window, 'resize')
      .pipe(
        map((e: Event) => {
          return {
            height: (e.target as Window).innerHeight,
            width: (e.target  as Window).innerWidth
          };
        }),
        startWith({height: window.innerHeight, width: window.innerWidth}),
        debounceTime(1000),
        // tap((ws: WindowSizesInterface) => console.log('\tViewportService.PIPE ws: %O', ws)),
        shareReplay(1)
      );

  constructor() {
    // console.log('ENTER ViewportService.constructor()');

    this.windowSizes$
    .subscribe(
      (vpSizes: WindowSizesInterface) => {
        // console.log('\tSUBSCRIBE: ViewportService.constructor(NEXT): w=%d; h=%d',
        //               vpSizes.width, vpSizes.height);
        this.viewportSizes = vpSizes;
      }
      // , err => console.log(`\tSUBSCRIBE: ViewportService.constructor(ERROR): %O`, err)
      // , () => console.log(`\tSUBSCRIBE: ViewportService.constructor(COMPLETE)`)
    );
  }

}
