import { computed, Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AncladoDoc, AncladoExpediente } from '../models/anclado.model';

const STORAGE_KEY = 'oj.anclados.v1';

@Injectable({ providedIn: 'root' })
export class AncladosService {
  private readonly _state = signal<Map<string, AncladoExpediente>>(this.loadFromStorage());

  readonly todos: Signal<AncladoExpediente[]> = computed(() =>
    Array.from(this._state().values())
  );

  toggle(expedienteNum: string, doc: AncladoDoc): boolean {
    const next = new Map(this._state());
    const exp = next.get(expedienteNum);

    if (exp) {
      const idx = exp.docs.findIndex(d => d.id === doc.id);
      if (idx >= 0) {
        const newDocs = exp.docs.filter((_, i) => i !== idx);
        if (newDocs.length === 0) {
          next.delete(expedienteNum);
        } else {
          next.set(expedienteNum, { ...exp, docs: newDocs });
        }
        this._state.set(next);
        this.persist(next);
        return false;
      }
    }

    const existing = next.get(expedienteNum);
    if (existing) {
      next.set(expedienteNum, { ...existing, docs: [...existing.docs, doc] });
    } else {
      next.set(expedienteNum, {
        numeroExpediente: expedienteNum,
        juzgado: '',
        docs: [doc],
        preparedAt: new Date().toISOString()
      });
    }
    this._state.set(next);
    this.persist(next);
    return true;
  }

  getByExpediente(num: string): AncladoDoc[] {
    return this._state().get(num)?.docs ?? [];
  }

  countByExpediente(num: string): number {
    return this._state().get(num)?.docs.length ?? 0;
  }

  totalCount(): number {
    let count = 0;
    for (const exp of this._state().values()) {
      count += exp.docs.length;
    }
    return count;
  }

  reorder(expedienteNum: string, newOrderIds: string[]): void {
    const next = new Map(this._state());
    const exp = next.get(expedienteNum);
    if (!exp) return;
    const byId = new Map(exp.docs.map(d => [d.id, d]));
    const reordered = newOrderIds.map(id => byId.get(id)).filter((d): d is AncladoDoc => !!d);
    next.set(expedienteNum, { ...exp, docs: reordered });
    this._state.set(next);
    this.persist(next);
  }

  clear(expediente: string): void {
    const next = new Map(this._state());
    next.delete(expediente);
    this._state.set(next);
    this.persist(next);
  }

  private loadFromStorage(): Map<string, AncladoExpediente> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return environment.useDto ? this.defaultDemoAnclados() : new Map();
      const entries = JSON.parse(raw) as [string, AncladoExpediente][];
      return new Map(entries);
    } catch {
      return new Map();
    }
  }

  private defaultDemoAnclados(): Map<string, AncladoExpediente> {
    const m = new Map<string, AncladoExpediente>();
    m.set('01173-2026-00045', {
      id: 1,
      numeroExpediente: '01173-2026-00045',
      juzgado: 'Juzgado Primero de Adolescentes',
      preparedAt: new Date().toISOString(),
      docs: [
        { id: '1', name: 'Demanda_Inicial.pdf', type: 'pdf', size: '250880', category: 'pdf' },
        { id: '2', name: 'Resolucion_Admision.pdf', type: 'pdf', size: '193536', category: 'pdf' },
        { id: '3', name: 'Contestacion_Demanda.pdf', type: 'pdf', size: '319488', category: 'pdf' }
      ]
    });
    return m;
  }

  private persist(state: Map<string, AncladoExpediente>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.entries())));
    } catch {
      // Silently degrade if localStorage is unavailable
    }
  }
}
