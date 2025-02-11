declare module "*.worker.ts" {
  const WorkerConstructor: {
    new (): Worker;
  };
  export default WorkerConstructor;
}

declare module "*.wasm" {
  const content: any;
  export default content;
}

interface DedicatedWorkerGlobalScope {
  postMessage(message: any, transfer?: Transferable[]): void;
  onmessage: ((this: DedicatedWorkerGlobalScope, ev: MessageEvent) => any) | null;
  onerror: ((this: DedicatedWorkerGlobalScope, ev: ErrorEvent) => any) | null;
  addEventListener<K extends keyof DedicatedWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: DedicatedWorkerGlobalScope, ev: DedicatedWorkerGlobalScopeEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof DedicatedWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: DedicatedWorkerGlobalScope, ev: DedicatedWorkerGlobalScopeEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
}