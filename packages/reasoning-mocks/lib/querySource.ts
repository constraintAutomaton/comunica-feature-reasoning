import type { IQuerySource } from '@comunica/types';
import { Store } from 'n3';

export function generateSource(store?: Store): IQuerySource {
  return {
    referenceValue: store ?? new Store(),
    getSelectorShape: jest.fn(),
    queryBindings: jest.fn(),
    queryQuads: jest.fn(),
    queryBoolean: jest.fn(),
    queryVoid: jest.fn(),
    toString: jest.fn(),
  };
}
