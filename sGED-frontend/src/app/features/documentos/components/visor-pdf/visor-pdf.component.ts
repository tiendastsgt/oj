import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [],
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.scss']
})
export class VisorPdfComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly url     = input<string>('');
  readonly safeUrl = computed<SafeResourceUrl | null>(() =>
    this.url() ? this.sanitizer.bypassSecurityTrustResourceUrl(this.url()) : null
  );
}
