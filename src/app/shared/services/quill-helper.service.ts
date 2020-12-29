import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuillModules } from 'ngx-quill';
import { API_HOST, INPUT_MEDIA_ACCEPT_TYPES } from '../constants/constants';
import { NotyService } from '../../noty/noty.service';

@Injectable({
  providedIn: 'root'
})
export class QuillHelperService {

  constructor(
    private http: HttpClient,
    private notyService: NotyService
  ) { }

  getEditorModules(): QuillModules {
    const helper = this;
    return {
      toolbar: {
        container: [
          [{ header: [false, 1, 2, 3, 4, 5, 6] }],
          ['bold', 'italic', 'underline'],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        handlers: {
          image: function () { helper.imageUploadHandler.call(helper, this.quill) }
        }
      },
      imageResize: {}
    }
  }

  private imageUploadHandler(quill: any) {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', INPUT_MEDIA_ACCEPT_TYPES);
    fileInput.click();

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files.item(0);
      if (!file) { return; }

      const payload = new FormData();
      payload.append('file', file, file.name);

      this.http.post(this.getMediaUploadUrl(), payload, { responseType: 'text' })
        .pipe( this.notyService.attachNoty() )
        .subscribe(
          url => {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', `${API_HOST}${url}`, 'user');
            quill.setSelection(range.index + 1, 0, 'silent');
          },
          error => console.warn(error)
        );
    });
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/wysiwyg/media`;
  }
}
