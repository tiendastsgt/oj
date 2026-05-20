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
  readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const u = this.url();
    if (!u) return null;
    const sep = u.includes('#') ? '&' : '#';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${u}${sep}toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0`
    );
  });
}
