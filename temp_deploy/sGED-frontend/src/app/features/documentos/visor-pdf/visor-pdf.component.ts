import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.scss']
})
export class VisorPdfComponent {
  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  @Input() set url(value: string) {
    this.safeUrl = value ? this.sanitizer.bypassSecurityTrustResourceUrl(value) : null;
  }
}
