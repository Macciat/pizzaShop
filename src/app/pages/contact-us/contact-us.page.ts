import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss']
})
export class ContactUsPage {

  openGmail(event: Event) {
    event.preventDefault();

    const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
    const concernType = (document.getElementById('concernType') as HTMLSelectElement).value;
    const message = (document.getElementById('message') as HTMLTextAreaElement).value;

    const recipient = 'qsapagres@tip.edu.ph';
    const subject = encodeURIComponent(`[${concernType}] Message from ${firstName} ${lastName}`);
    const body = encodeURIComponent(
      `Name: ${firstName} ${lastName}\nType of Concern: ${concernType}\n\nMessage:\n${message}`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  }
}
