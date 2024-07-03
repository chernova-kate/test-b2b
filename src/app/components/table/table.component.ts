import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DataElement } from '../../models/data-element';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {

  @Input() data: DataElement[] = [];

  trackByItem(idx: number, item: DataElement): string {
    return item.id;
  }

}
