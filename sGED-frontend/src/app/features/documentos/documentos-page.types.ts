export type ViewerType = 'PDF' | 'IMAGEN' | 'AUDIO' | 'VIDEO' | 'WORD' | null;

export enum LoadState {
  Idle    = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error   = 'error',
}
