import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, Juzgado } from '../../../core/models/catalogos.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ExpedienteListFilters, ListPagination, LoadState } from './expedientes-list.types';
import { MOCK_EXPEDIENTES } from '../../../core/mocks/expedientes.mock';
import { MOCK_TIPOS_PROCESO, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedientesListDto {
  state = signal<LoadState>(LoadState.Idle);
  error = signal<string | null>(null);

  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedientes  = signal<ExpedienteResponse[]>(MOCK_EXPEDIENTES);
  totalRecords = signal(MOCK_EXPEDIENTES.length);

  pagination = signal<ListPagination>({
    page: 0,
    rows: 10,
    first: 0,
    sortField: 'fechaCreacion',
    sortDir: 'desc',
  });

  tiposProceso = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  juzgados     = signal<Juzgado[]>(MOCK_JUZGADOS);
  currentUser  = signal<AuthUser | null>(null);

  filters = signal<ExpedienteListFilters>({
    search: '',
    estadoId: null,
    juzgadoId: null,
  });
}
