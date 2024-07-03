/// <reference lib="webworker" />

import { DataElement } from '../models/data-element';

let arrLength = 0;

addEventListener('message', ({ data }: { data: { list: DataElement[], ids: string[], size: number } }) => {
  arrLength += data.list.length;

  if (arrLength === data.size) {
    const result = data.list.slice(data.list.length - 10);

    data.ids.forEach((id, idx) => {
      result[idx].id = id;
    });

    postMessage(result);
    arrLength = 0;
  }
});
