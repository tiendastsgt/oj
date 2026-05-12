import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, Juzgado } from '../../../core/models/catalogos.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ExpedienteListFilters, ListPagination, LoadState } from './expedientes-list.types';

// Mock de referencia (no se usa en render inicial):
// { id:1, numero:'EXP-2024-001', tipoProcesoId:1, juzgadoId:1, estadoId:1,
//   fechaInicio:'2024-01-15', descripcion:'Demo A', actorPrincipal:'Juan Pérez',
//   demandado:'Pedro García', usuarioCreacion:'admin', fechaCreacion:'2024-01-15', totalDocumentos:3 }

export class ExpedientesListDto {
  state = signal<LoadState>(LoadState.Loading);
  error = signal<string | null>(null);

  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedientes  = signal<ExpedienteResponse[]>([]);
  totalRecords = signal(0);

  pagination = signal<ListPagination>({
    page: 0,
    rows: 10,
    first: 0,
    sortField: 'fechaCreacion',
    sortDir: 'desc',
  });

  tiposProceso = signal<TipoProceso[]>([]);
  juzgados     = signal<Juzgado[]>([]);
  currentUser  = signal<AuthUser | null>(null);

  filters = signal<ExpedienteListFilters>({
    search: '',
    estadoId: null,
    juzgadoId: null,
  });
}
