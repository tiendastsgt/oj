import { computed, signal } from '@angular/core';
import { AuthUser } from '../../../core/models/auth-user.model';
import {
  BusquedaAvanzadaRequest,
  EstadoExpediente,
  ExpedienteBusquedaResponse,
  Juzgado,
  LoadState,
  Page,
  TipoProceso
} from './busqueda-avanzada.types';

export class BusquedaAvanzadaDto {
  state               = signal<LoadState>(LoadState.Idle);
  isLoading           = computed(() => this.state() === LoadState.Loading);
  hasError            = computed(() => this.state() === LoadState.Error);

  resultados          = signal<Page<ExpedienteBusquedaResponse> | undefined>(undefined);
  showAdvancedFilters = signal(false);
  errorMessages       = signal<string[]>([]);
  lastFilters         = signal<BusquedaAvanzadaRequest | null>(null);

  tiposProceso        = signal<TipoProceso[]>([]);
  estados             = signal<EstadoExpediente[]>([]);
  juzgados            = signal<Juzgado[]>([]);
  currentUser         = signal<AuthUser | null>(null);
}
