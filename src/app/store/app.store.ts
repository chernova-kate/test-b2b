import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { bufferCount, catchError, from, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';

import { DataElement } from '../models/data-element';
import { LoadingState } from '../models/loading-state';
import { DataRequest } from '../models/data-request';
import { DataApiService } from '../services/data.api.service';
import { WorkerService } from '../services/worker.service';

export interface AppState {
  data: DataElement[];
  loadingState: LoadingState;
}

@Injectable()
export class AppStore extends ComponentStore<AppState> {

  data$ = this.select(state => state.data);
  loadingState$ = this.select(state => state.loadingState);

  WORKER_CHUNK_SIZE = 100_000;

  constructor(
    private _api: DataApiService,
    private _worker: WorkerService,
  ) {
    super({
      data: [],
      loadingState: LoadingState.loading
    });

    this._worker.init();

    this._worker.onMessage = (data) => {
      this.patchState({
        data,
        loadingState: LoadingState.loaded
      })
    }
  }

  getData = this.effect((load$: Observable<DataRequest>) => load$
    .pipe(
      tap(() => this.patchState({
        loadingState: LoadingState.loading
      })),
      switchMap(req => this._api.getData(req)
        .pipe(
          catchError(() => {
            this.patchState({
              loadingState: LoadingState.failed
            });
            return of(null);
          }),
          mergeMap(
            (res, idx) => {
              return from(res || []).pipe(
                bufferCount(this.WORKER_CHUNK_SIZE),
                map(list => ({ list, size: res?.length }))
              )
            },
            10
          ),
          tap(({ list, size }) => {
            this._worker.postMessage({ list, ids: req.ids, size: size || 0  })
          })
        ))
    )
  )
}
