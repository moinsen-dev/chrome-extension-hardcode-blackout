declare type EmscriptenModule = {
  HEAPU8: Uint8Array;
  HEAP8: Int8Array;
  HEAP16: Int16Array;
  HEAP32: Int32Array;
  HEAPU16: Uint16Array;
  HEAPU32: Uint32Array;
  HEAPF32: Float32Array;
  HEAPF64: Float64Array;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  cwrap: (
    ident: string,
    returnType: string | null,
    argTypes: (string | null)[],
    opts?: { async?: boolean }
  ) => (...args: any[]) => any;
  ccall: (
    ident: string,
    returnType: string | null,
    argTypes: (string | null)[],
    args: any[],
    opts?: { async?: boolean }
  ) => any;
  getValue: (ptr: number, type: string) => number;
  setValue: (ptr: number, value: number, type: string) => void;
  UTF8ToString: (ptr: number, maxBytesToRead?: number) => string;
  stringToUTF8: (str: string, outPtr: number, maxBytesToWrite: number) => void;
  lengthBytesUTF8: (str: string) => number;
  stackSave: () => number;
  stackRestore: (stack: number) => void;
  stackAlloc: (size: number) => number;
};

declare type EmscriptenModuleFactory<T extends EmscriptenModule = EmscriptenModule> = (
  moduleOverrides?: Partial<T>
) => Promise<T>;

declare function cwrap(
  ident: string,
  returnType: string | null,
  argTypes: (string | null)[],
  opts?: { async?: boolean }
): (...args: any[]) => any;

declare const HEAPU8: Uint8Array;