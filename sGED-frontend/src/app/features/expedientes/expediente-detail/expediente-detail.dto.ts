import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { Documento } from '../../documentos/models/documento.model';
import { LoadState } from './expediente-detail.types';

export class ExpedienteDetailDto {
  state     = signal<LoadState>(LoadState.Loading);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expediente   = signal<ExpedienteResponse | null>(null);
  errorMessage = signal<string>('');

  tiposProceso = signal<TipoProceso[]>([]);
  estados      = signal<EstadoExpediente[]>([]);
  juzgados     = signal<Juzgado[]>([]);

  selectedDocumento = signal<Documento | null>(null);
  readingModeActive = signal<boolean>(false);
}
