import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { TableAction, TableColumn } from '../../../interface/table.interface';
import { CommonDropdownComponent } from '../common-dropdown/common-dropdown.component';

@Component({
  selector: 'app-common-table',
  standalone: true,
  imports: [CommonModule,CommonDropdownComponent],
  templateUrl: './common-table.component.html',
  styleUrl: './common-table.component.css'
})
export class CommonTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() primaryActions: TableAction[] = [];
  @Input() secondaryActions: TableAction[] = [];

  /**
   * If true, fallback displays the first letter of the channel name.
   * If false, the fallback will be empty.
   */
  @Input() showFallbackInitial: boolean = true;

  dropdownOpen: any = null;

  constructor(private elementRef: ElementRef) {}

   // When toggling, set the dropdown open state for that row.
   toggleDropdown(row: any): void {
    if (this.dropdownOpen === row) {
      this.dropdownOpen = null;
    } else {
      this.dropdownOpen = row;
    }
  }

  onSecondaryAction(act: TableAction, row: any): void {
    act.action(row);
    this.dropdownOpen = null;
  }

  // Listen for document clicks to close dropdown if clicking outside.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // If click is outside the component, close dropdown.
    if (this.dropdownOpen && !(event.target as HTMLElement).closest('.dropdown-container')) {
      this.dropdownOpen = null;
    }
  }

}
