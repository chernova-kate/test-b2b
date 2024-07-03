import { Injectable } from '@angular/core';
import {
  asyncScheduler,
  EMPTY,
  expand,
  Observable,
  observeOn,
  of,
  reduce,
} from 'rxjs';

import { DataElement } from '../models/data-element';
import { DataRequest } from '../models/data-request';

@Injectable({
  providedIn: 'root'
})
export class DataApiService {

  readonly MAX_CHUNK_SIZE = 100_000;
  private _chunkSize = this.MAX_CHUNK_SIZE;

  getData(req: DataRequest): Observable<DataElement[]> {
    this._chunkSize = req.size > this.MAX_CHUNK_SIZE
      ? this.MAX_CHUNK_SIZE
      : req.size;

    let chunks = req.size / this._chunkSize;
    let counter = 0;

    return this._generateDataChunk(0)
      .pipe(
        expand(() => {
          chunks -= 1;
          counter++;

          return chunks >= 1 ? this._generateDataChunk(this._chunkSize * counter) : EMPTY
        }),
        reduce((acc, data) => acc.concat(data))
      )
  }

  private _generateDataChunk(startFrom = 0) {
    return of(Array.from({ length: this._chunkSize }, (_, i: number) => {
      return this._generateDataItem(startFrom + i + 1);
    })).pipe(
      observeOn(asyncScheduler)
    )
  }

  private _generateDataItem(i: number): DataElement {
    const randomNum = Math.random() * 100;
    const id = Math.round(randomNum);
    const childId = Math.round(Math.random() * 100);
    return {
      id: i.toString(),
      int: id,
      float: randomNum.toString(),
      color: this._getRandomColor(),
      child: {
        id: childId.toString(),
        color: this._getRandomColor()
      },
    }
  }

  private _getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
