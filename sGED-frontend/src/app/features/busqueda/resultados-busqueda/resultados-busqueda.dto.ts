import { Signal, computed } from '@angular/core';
import { ExpedienteBusquedaResponse, Page } from './resultados-busqueda.types';

export class ResultadosBusquedaDto {
  constructor(private readonly resultados: Signal<Page<ExpedienteBusquedaResponse> | undefined>) {}

  totalRecords = computed(() => this.resultados()?.totalElements ?? 0);
  rows         = computed(() => this.resultados()?.size ?? 10);
  first        = computed(() => (this.resultados()?.page ?? 0) * (this.resultados()?.size ?? 10));
}
