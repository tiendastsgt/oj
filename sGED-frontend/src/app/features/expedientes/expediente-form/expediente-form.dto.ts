import { signal, computed } from '@angular/core';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { FormMode, LoadState } from './expediente-form.types';
import { MOCK_TIPOS_PROCESO, MOCK_ESTADOS, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedienteFormDto {
  state          = signal<LoadState>(LoadState.Idle);
  isLoading      = computed(() => this.state() === LoadState.Loading);

  errors         = signal<string[]>([]);
  successMessage = signal<string>('');

  mode           = signal<FormMode>('create');
  isEditMode     = computed(() => this.mode() === 'edit');

  tiposProceso   = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  estados        = signal<EstadoExpediente[]>(MOCK_ESTADOS);
  juzgados       = signal<Juzgado[]>(MOCK_JUZGADOS);
}
