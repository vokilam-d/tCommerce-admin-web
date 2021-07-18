import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, OnInit } from '@angular/core';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { SupplierService } from '../../../shared/services/supplier.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SupplierDto } from '../../../shared/dtos/supplier.dto';

@Component({
  selector: 'supplier-select',
  templateUrl: './supplier-select.component.html',
  styleUrls: ['./supplier-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SupplierSelectComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierSelectComponent extends SelectComponent<number> implements OnInit {

  error: any;

  constructor(
    private readonly supplierService: SupplierService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchSuppliers();
  }

  private fetchSuppliers() {
    this.supplierService.fetchAllSuppliers({ limit: 10000 })
      .pipe( this.takeUntilDestroy() )
      .subscribe(
        response => {
          this.setOptions(response.data);
          this.cdr.markForCheck();
        },
        error => {
          this.error = error;
        }
      );
  }

  private setOptions(suppliers: SupplierDto[]): void {
    this.options = suppliers.map(supplier => ({
      value: supplier.id,
      view: supplier.name,
      isSelected: this.value === supplier.id
    }));
  }
}
