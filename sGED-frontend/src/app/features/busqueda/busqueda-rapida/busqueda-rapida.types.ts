export const DEFAULT_SIZE = 10;
export const DEFAULT_SORT = 'fechaUltimoMovimiento,desc';

export interface BusquedaParams {
  page: number;
  size: number;
  sort?: string;
}
