export interface ExpedienteListFilters {
  search: string;
  estadoId: number | null;
  juzgadoId: number | null;
}

export interface ListPagination {
  page: number;
  rows: number;
  first: number;
  sortField: string;
  sortDir: 'asc' | 'desc';
}

export enum LoadState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}
