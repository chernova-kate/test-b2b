import { Injectable } from '@angular/core';

import { DataElement } from '../models/data-element';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private _worker?: Worker;

  init() {
    if (typeof Worker !== 'undefined') {
      this._worker = new Worker(new URL('../workers/list.worker', import.meta.url));
      this._worker.onmessage = ({ data }) => this.onMessage(data);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  onMessage(data: DataElement[]) {}

  postMessage(data: { list: DataElement[], ids: string[], size: number }) {
    this._worker?.postMessage(data);
  }
}
