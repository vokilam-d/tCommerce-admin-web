import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';
import { SelectComponent } from './components/select/select.component';
import { FieldsGroupComponent } from './components/fields-group/fields-group.component';
import { AttributeSelectComponent } from './components/attribute-select/attribute-select.component';
import { NgUnsubscribe } from './directives/ng-unsubscribe/ng-unsubscribe.directive';
import { TabsComponent } from './components/tabs/tabs.component';
import { ButtonComponent } from './components/button/button.component';
import { NumberInputDirective } from './directives/number-input/number-input.directive';
import { ToggleComponent } from './components/toggle/toggle.component';
import { ReadableCurrencyPipe } from './pipes/readable-currency.pipe';
import { NormalizedPhonePipe } from './pipes/normalized-phone.pipe';
import { PreloaderModule } from '../preloader/preloader.module';
import { AutofocusDirective } from './directives/autofocus/autofocus.directive';
import { DraggableItemDirective } from './directives/draggable-item/draggable-item.directive';
import { RouterModule } from '@angular/router';
import { AdditionalServiceSelectComponent } from './components/additional-service-select/additional-service-select.component';
import { BeautifyPhonePipe } from './pipes/beautify-phone.pipe';
import { InputCapitalizeDirective } from './directives/input-capitalize/input-capitalize.directive';
import { MultilingualControlModule } from '../multilingual-control/multilingual-control.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ClickOutsideDirective,
    SelectComponent,
    FieldsGroupComponent,
    AttributeSelectComponent,
    AdditionalServiceSelectComponent,
    NgUnsubscribe,
    TabsComponent,
    ButtonComponent,
    NumberInputDirective,
    ToggleComponent,
    ReadableCurrencyPipe,
    NormalizedPhonePipe,
    BeautifyPhonePipe,
    AutofocusDirective,
    DraggableItemDirective,
    InputCapitalizeDirective
  ],
  exports: [
    ClickOutsideDirective,
    SelectComponent,
    FieldsGroupComponent,
    AttributeSelectComponent,
    AdditionalServiceSelectComponent,
    NgUnsubscribe,
    TabsComponent,
    ButtonComponent,
    NumberInputDirective,
    ToggleComponent,
    ReadableCurrencyPipe,
    NormalizedPhonePipe,
    BeautifyPhonePipe,
    AutofocusDirective,
    DraggableItemDirective,
    InputCapitalizeDirective
  ],
  imports: [
    CommonModule,
    PreloaderModule,
    RouterModule,
    MultilingualControlModule,
    ReactiveFormsModule
  ]
})
export class SharedModule {
}
