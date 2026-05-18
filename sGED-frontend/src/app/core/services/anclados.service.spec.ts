import { TestBed } from '@angular/core/testing';
import { AncladosService } from './anclados.service';
import { AncladoDoc } from '../models/anclado.model';

describe('AncladosService', () => {
  const doc1: AncladoDoc = { id: 'd1', name: 'Test.pdf', type: 'pdf', size: '100KB', category: 'Civil' };
  const doc2: AncladoDoc = { id: 'd2', name: 'Video.mp4', type: 'video', size: '20MB', category: 'Penal' };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should toggle (add) a document', () => {
    const svc = TestBed.inject(AncladosService);
    const added = svc.toggle('EXP-001', doc1);
    expect(added).toBeTrue();
    expect(svc.countByExpediente('EXP-001')).toBe(1);
  });

  it('should toggle (remove) a document already pinned', () => {
    const svc = TestBed.inject(AncladosService);
    svc.toggle('EXP-001', doc1);
    const removed = svc.toggle('EXP-001', doc1);
    expect(removed).toBeFalse();
    expect(svc.countByExpediente('EXP-001')).toBe(0);
  });

  it('should remove the expediente entry when last doc is unpinned', () => {
    const svc = TestBed.inject(AncladosService);
    svc.toggle('EXP-001', doc1);
    svc.toggle('EXP-001', doc1);
    expect(svc.todos().length).toBe(0);
  });

  it('should persist to localStorage', () => {
    const svc = TestBed.inject(AncladosService);
    svc.toggle('EXP-001', doc1);
    const raw = localStorage.getItem('oj.anclados.v1');
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!);
    expect(Array.isArray(data)).toBeTrue();
  });

  it('should load persisted data on construction', () => {
    const state = new Map([
      ['EXP-001', {
        numeroExpediente: 'EXP-001',
        juzgado: 'Juzgado 1',
        docs: [doc1, doc2],
        preparedAt: new Date().toISOString()
      }]
    ]);
    localStorage.setItem('oj.anclados.v1', JSON.stringify(Array.from(state.entries())));

    const svc = TestBed.inject(AncladosService);
    expect(svc.countByExpediente('EXP-001')).toBe(2);
    expect(svc.totalCount()).toBe(2);
  });
});
