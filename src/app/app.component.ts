import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Subject, takeUntil, timer, withLatestFrom } from 'rxjs';

import { AppStore } from './store/app.store';
import { Filters } from './components/header/header.component';
import { LoadingState } from './models/loading-state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AppStore
  ]
})
export class AppComponent implements OnInit {

  data$ = this._appStore.data$;
  loadingState$ = this._appStore.loadingState$;

  LoadingState = LoadingState;

  private _reqIntervalMs = 1000;
  private _arraySize = 1000;
  private _ids: string[] = [];
  private _unsub = new Subject<void>();

  constructor(
    private _appStore: AppStore
  ) {
  }

  ngOnInit() {
    this.startTimer();
  }

  loadData(data: Partial<Filters>) {
    if (data.timer && data.timer !== this._reqIntervalMs) {
      this._reqIntervalMs = data.timer;
    }
    this.resetTimer();

    this._arraySize = data.arraySize || this._arraySize;
    this._ids = data.additionalIds?.split(',') || this._ids;
    this._appStore.getData({ size: this._arraySize, ids: this._ids });
  }

  resetTimer() {
    this._unsub.next();
    this.startTimer();
  }

  startTimer() {
    timer(this._reqIntervalMs, this._reqIntervalMs)
      .pipe(
        withLatestFrom(this.loadingState$),
        takeUntil(this._unsub),
      )
      .subscribe(([, loadingState]) => {
        if (loadingState === LoadingState.loading) {
          this.resetTimer();
        } else {
          this.loadData({})
        }
      })
  }
}
