import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { MediaDto } from '../shared/dtos/media.dto';
import { INPUT_MEDIA_ACCEPT_TYPES } from '../shared/constants/constants';
import { NotyService } from '../noty/noty.service';

@Component({
  selector: 'media-uploader',
  templateUrl: './media-uploader.component.html',
  styleUrls: ['./media-uploader.component.scss']
})
export class MediaUploaderComponent implements OnInit {

  acceptTypes: string = INPUT_MEDIA_ACCEPT_TYPES;

  @Input() uploadUrl: string;
  @Output('uploaded') uploadedEmitter = new EventEmitter<MediaDto>();
  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private notyService: NotyService
  ) { }

  ngOnInit() {
    if (!this.uploadUrl) {
      this.notyService.showErrorNoty(`[${MediaUploaderComponent.name}]: Input property 'uploadUrl' is mandatory`);
      throw new Error(`Input property 'uploadUrl' is mandatory`);
    }
  }

  onInputChange(files: FileList) {
    const file = files.item(0);

    this.uploadFile(file);
  }

  private uploadFile(file: File) {
    const payload = new FormData();
    payload.append('file', file, file.name);

    this.http.post<MediaDto>(this.uploadUrl, payload)
      .pipe( finalize(() => this.inputRef.nativeElement.value = ''), this.notyService.attachNoty() )
      .subscribe(
        media => {
          this.uploadedEmitter.emit(media);
        },
        error => console.warn(error)
      );
  }
}
