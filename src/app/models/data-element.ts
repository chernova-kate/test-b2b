export interface DataElementChild {
  id: string;
  color: string;
}

export interface DataElement {
  id: string;
  int: number;
  float: string;
  color: string;
  child: DataElementChild;
}
