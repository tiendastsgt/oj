import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Documento } from '../models/documento.model';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent {
  @Input() documentos: Documento[] = [];
  @Output() ver = new EventEmitter<Documento>();
  @Output() descargar = new EventEmitter<Documento>();
  @Output() imprimir = new EventEmitter<Documento>();
  @Output() eliminar = new EventEmitter<Documento>();
}
