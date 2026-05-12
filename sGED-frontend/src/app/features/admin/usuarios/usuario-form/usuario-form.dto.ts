import { signal, computed } from '@angular/core';
import { LoadState, RolOption, JuzgadoOption } from './usuario-form.types';

export const ROLES_ESTATICOS: RolOption[] = [
  { label: 'ADMINISTRADOR', value: 1 },
  { label: 'SECRETARIO',    value: 2 },
  { label: 'AUXILIAR',      value: 3 },
  { label: 'CONSULTA',      value: 4 }
];

export class UsuarioFormDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);

  isCreation   = signal<boolean>(true);
  usuarioId    = signal<number | null>(null);
  juzgados     = signal<JuzgadoOption[]>([]);
  roles        = signal<RolOption[]>(ROLES_ESTATICOS);
  submitting   = signal<boolean>(false);
  errorMessage = signal<string>('');
}
