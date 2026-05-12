import { signal, computed } from '@angular/core';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { FormMode, LoadState } from './expediente-form.types';

export class ExpedienteFormDto {
  state          = signal<LoadState>(LoadState.Idle);
  isLoading      = computed(() => this.state() === LoadState.Loading);

  errors         = signal<string[]>([]);
  successMessage = signal<string>('');

  mode           = signal<FormMode>('create');
  isEditMode     = computed(() => this.mode() === 'edit');

  tiposProceso   = signal<TipoProceso[]>([]);
  estados        = signal<EstadoExpediente[]>([]);
  juzgados       = signal<Juzgado[]>([]);
}
