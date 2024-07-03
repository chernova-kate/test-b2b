import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { of } from 'rxjs';

import { AppStore } from './app.store';
import { DataApiService } from '../services/data.api.service';
import { DataElement } from '../models/data-element';
import { WorkerService } from '../services/worker.service';

describe('AppStore', () => {
  let spectator: SpectatorService<AppStore>;
  const createService = createServiceFactory({
    service: AppStore,
    mocks: [
      DataApiService,
      WorkerService
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should return data from state', (done: DoneFn) => {
    const elements: DataElement[] = [{
      child: { id: '12', color: '#7E979B' },
      color: "#A7E56F",
      float: "33.31170604233571",
      id: "1",
      int: 33
    }];
    spectator.service.patchState({ data: elements });

    spectator.service.data$.subscribe({
      next: data => {
        expect(data.length).toBe(elements.length);
        done();
      }
    })
  });

  it('should set data to state from API', (done: DoneFn) => {
    const apiService = spectator.inject(DataApiService);
    const workerService = spectator.inject(WorkerService);

    const elements: DataElement[] = [{
      child: { id: '12', color: '#7E979B' },
      color: "#A7E56F",
      float: "33.31170604233571",
      id: "1",
      int: 33
    }];

    apiService.getData.and.returnValue(of(elements));
    spectator.service.getData({ size: 1_000, ids: [] });

    expect(workerService.postMessage).toHaveBeenCalledWith({
      list: elements, ids: [], size: elements.length
    });

    workerService.onMessage(elements);

    spectator.service.data$.subscribe({
      next: data => {
        expect(data.length).toBe(elements.length);
        done();
      }
    });
  });

  it('should divide received data to chunks in order to not to send to worker large amount of data', (done: DoneFn) => {
    const apiService = spectator.inject(DataApiService);
    const workerService = spectator.inject(WorkerService);
    const WORKER_CHUNK_SIZE = 100;

    const elements: DataElement[] = Array.from({ length: 303 }, () => ({
      child: { id: '12', color: '#7E979B' },
      color: "#A7E56F",
      float: "33.31170604233571",
      id: "1",
      int: 33
    }))

    spectator.service.WORKER_CHUNK_SIZE = WORKER_CHUNK_SIZE;

    apiService.getData.and.returnValue(of(elements));
    spectator.service.getData({ size: 1_000, ids: [] });

    expect(workerService.postMessage).toHaveBeenCalledTimes(Math.ceil(elements.length / WORKER_CHUNK_SIZE));

    workerService.onMessage(elements);

    spectator.service.data$.subscribe({
      next: data => {
        expect(data.length).toBe(elements.length);
        done();
      }
    });
  });

})
