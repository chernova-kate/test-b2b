import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { debounceTime, startWith, Subject, takeUntil } from 'rxjs';

export interface Filters {
  timer: number | null;
  arraySize: number | null;
  additionalIds: string | null;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  form = new FormGroup({
    timer: new FormControl<number>(30000),
    arraySize: new FormControl<number>(1000),
    additionalIds: new FormControl<string | null>(null),
  })

  @Output() filtersChanged = new EventEmitter<Partial<Filters>>();

  private _ngDestroy = new Subject<void>();

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        debounceTime(500),
        takeUntil(this._ngDestroy)
      )
      .subscribe(val => this.filtersChanged.emit(val))
  }

  ngOnDestroy() {
    this._ngDestroy.next();
    this._ngDestroy.complete();
  }

}
