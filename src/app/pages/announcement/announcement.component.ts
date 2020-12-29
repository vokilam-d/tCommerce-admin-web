import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnnouncementDto } from '../../shared/dtos/announcement.dto';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { finalize } from 'rxjs/operators';
import { AnnouncementService } from '../../shared/services/announcement.service';
import { NotyService } from '../../noty/noty.service';

@Component({
  selector: 'announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {

  private announcementList = [
    {
      data: 'Наши самые прекрасные покупатели! 31.12.2020 и 01.01.2021 интернет-магазин "Клондайк" не принимает заказы. Приносим наши извинения за предоставленные неудобства. С наступающим Новым годом! :)'
    }
  ];

  public form: FormGroup;
  public isLoading: boolean = false;
  public announcement: AnnouncementDto;
  public announcementOptions: ISelectOption[] = this.announcementList;

  constructor(
    private formBuilder: FormBuilder,
    private announcementService: AnnouncementService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  private init() {
    this.fetchAnnouncementAndBuildForm();
  }

  private fetchAnnouncementAndBuildForm() {
    this.isLoading = true;
    this.announcementService.fetchAnnouncement()
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.announcement = response.data;
          this.buildForm(this.announcement);
        },
        error => console.warn(error)
      );
  }

  public save() {
    this.updateAnnouncement();
  }

  private updateAnnouncement() {
    const dto = {
      ...this.announcement,
      ...this.form.value
    }

    this.isLoading = true;
    this.announcementService.updateAnnouncement(dto).pipe(
      finalize(() => this.isLoading = false),
      this.notyService.attachNoty({ successText: 'Объявление успешно изменено' })
    ).subscribe(
      response => {
        this.announcement = response.data;
        this.buildForm(this.announcement);
      },
      error => console.warn(error)
    );
  }

  private buildForm(announcement: AnnouncementDto) {
    this.form = this.formBuilder.group({
      isEnabled: [announcement.isEnabled],
      announcement: [announcement.announcement]
    });
  }

  public setAnnouncementValue(text: string) {
    this.form.get('announcement').setValue(text);
  }
}
