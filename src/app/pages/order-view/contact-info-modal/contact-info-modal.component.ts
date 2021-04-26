import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ContactInfoDto } from '../../../shared/dtos/contact-info.dto';
import { ContactInfoComponent } from '../../../contact-info/contact-info.component';

@Component({
  selector: 'contact-info-modal',
  templateUrl: './contact-info-modal.component.html',
  styleUrls: ['./contact-info-modal.component.scss']
})
export class ContactInfoModalComponent implements OnInit {

  isModalVisible: boolean = false;

  @Input() contactInfo: ContactInfoDto;
  @Output() contactInfoSubmit = new EventEmitter<ContactInfoDto>();
  @ViewChild(ContactInfoComponent) contactInfoCmp: ContactInfoComponent;

  constructor() { }

  ngOnInit(): void {
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onContactInfoSubmit() {
    if (!this.contactInfoCmp.checkValidity()) {
      return;
    }

    this.contactInfoSubmit.emit(this.contactInfoCmp.getValue());
  }
}
