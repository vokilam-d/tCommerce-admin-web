import { AfterViewInit, Component, OnInit, Input } from '@angular/core';
import { NotyService } from 'src/app/noty/noty.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductComponent } from '../product.component';

@Component({
  selector: 'set-breadcrumps',
  templateUrl: './set-breadcrumps.component.html',
  styleUrls: ['./set-breadcrumps.component.scss'],
  providers: [ ProductComponent ]

})
export class SetBreadcrumpsComponent implements AfterViewInit, OnInit {
  
  @Input('breadcrumpsVarisnts') breadcrumpsVarisnts: any

  constructor(private productService: ProductService,
              private notyService: NotyService) 
{ }

  ngOnInit(): void {
    this.fetchBreadcrumpsVariants(this.breadcrumpsVarisnts.id)
  }

  ngAfterViewInit() {
    if (this.breadcrumpsVarisnts.breadcrumpsVariants) {
      console.log(`this.breadcrumps.breadcrumpsVariants is ISSET`)
      //console.table(this.breadcrumps.breadcrumpsVariants)
    } else {
      console.log(`this.breadcrumps.breadcrumpsVariants is UNDERFINED`)
      this.breadcrumpsVarisnts.breadcrumpsVariants = this.breadcrumpsVarisnts.breadcrumbs;
      //console.table(this.breadcrumps.breadcrumpsVariants)
    }
  }

  async fetchBreadcrumpsVariants (id: string) {
    await this.productService.fetchProductBreadcrumps(id)
    .pipe(this.notyService.attachNoty())
    .subscribe(
      response => {
        console.table(response)
      },
      error => console.warn(error)
    );
  }

}
