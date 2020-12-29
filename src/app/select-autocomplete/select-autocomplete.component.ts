import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild
} from '@angular/core';
import { SelectComponent } from '../shared/components/select/select.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AddressService } from '../shared/services/address.service';
import { DEFAULT_ERROR_TEXT } from '../shared/constants/constants';
import { StreetDto } from '../shared/dtos/street.dto';
import { WarehouseDto } from '../shared/dtos/warehouse.dto';
import { SettlementDto } from '../shared/dtos/settlement.dto';
import { ISelectOption } from '../shared/components/select/select-option.interface';
import { ResponseDto } from '../shared/dtos/response.dto';
import { NotyService } from '../noty/noty.service';

@Component({
  selector: 'select-autocomplete',
  templateUrl: './select-autocomplete.component.html',
  styleUrls: ['./select-autocomplete.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectAutocompleteComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectAutocompleteComponent extends SelectComponent implements AfterViewInit {

  isSearchInProgress: boolean = false;
  searchError: string = null;

  private _activeOptionLabel: string;

  @Input() set activeOptionLabel(label: string) { this._activeOptionLabel = label; };
  @Input() type: 'settlement' | 'warehouse' | 'street';
  @Input() settlementId?: string;
  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  get activeOptionLabel(): string { return this._activeOptionLabel; };

  constructor(
    private addressService: AddressService,
    private notyService: NotyService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngAfterViewInit() {
    if (!this.type) {
      this.notyService.showErrorNoty(`[${SelectAutocompleteComponent.name}]: "type" is not provided!`);
      throw new Error('"type" is not provided!');
    }

    this.listenForInput();
  }

  toggleVisibility(isVisible: boolean = !this.isVisible) {
    super.toggleVisibility(isVisible);
    if (this.isVisible) {
      setTimeout(() => this.inputRef.nativeElement.focus(), 50);
    }
  }

  private listenForInput() {
    fromEvent(this.inputRef.nativeElement, 'input')
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(200),
        distinctUntilChanged(),
        map((event: InputEvent) => (event.target as HTMLInputElement).value.trim()),
        tap(() => {
          this.isSearchInProgress = true;
          this.cdr.markForCheck();
        }),
        switchMap(query => this.getRequestByQuery(query)),
        catchError((err, caught) => {
          this.searchError = err.error?.message || DEFAULT_ERROR_TEXT;
          console.error(err);
          this.isSearchInProgress = false;
          this.cdr.markForCheck();
          return caught;
        })
      )
      .subscribe(
        response => {
          this.options = this.transformResponse(response);
          this.searchError = null;
          this.isSearchInProgress = false;
          this.cdr.markForCheck();
        }
      );
  }

  private getRequestByQuery(query: string): Observable<ResponseDto<any>> {
    if (!query) {
      return of({ data: [] });
    }

    switch (this.type) {
      case 'settlement':
        return this.addressService.fetchSettlements(query);
      case 'warehouse':
        return this.addressService.fetchWarehouses(this.settlementId, query);
      case 'street':
        return this.addressService.fetchStreets(this.settlementId, query);
    }
  }

  private transformResponse({ data }: ResponseDto<any[]>): ISelectOption[] {
    switch (this.type) {
      case 'settlement':
        return (data as SettlementDto[]).map(settlement => ({ data: settlement, view: settlement.fullName }));
      case 'warehouse':
        return (data as WarehouseDto[]).map(warehouse => ({ data: warehouse, view: warehouse.description }));
      case 'street':
        return (data as StreetDto[]).map(street => ({ data: street, view: street.name }));
    }
  }
}
