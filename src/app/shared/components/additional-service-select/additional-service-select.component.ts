import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectComponent } from '../select/select.component';
import { takeUntil } from 'rxjs/operators';
import { AdditionalServiceDto } from '../../dtos/additional-service.dto';
import { AdditionalServiceService } from '../../services/additional-service.service';
import { DEFAULT_LANG } from '../../constants/constants';

@Component({
  selector: 'additional-service-select',
  templateUrl: './additional-service-select.component.html',
  styleUrls: ['./additional-service-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AdditionalServiceSelectComponent),
    multi: true
  }]
})
export class AdditionalServiceSelectComponent extends SelectComponent implements OnInit, ControlValueAccessor, OnDestroy {

  additionalServices: AdditionalServiceDto[];
  isMultiSelect = true;

  constructor(
    private additionalServiceService: AdditionalServiceService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.additionalServiceService.fetchAllAdditionalServices({ page: 1, limit: 100 })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(response => {
        this.additionalServices = response.data;

        this.options = this.additionalServices.map(service => ({ data: service.id, view: service.name[DEFAULT_LANG] }));

        this.markSelectedOptions();
        this.cdr.markForCheck();
      });
  }
}
