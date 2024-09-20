import type { IQuerySource, IActionContext } from '@comunica/types';
import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';
import { fromArray } from 'asynciterator';
import { Store } from 'n3';
import type { Operation } from 'sparqlalgebrajs/lib/algebra';

export function generateSource(store?: Store): IQuerySource {
  const effectiveStore = store ?? new Store();
  return {
    referenceValue: effectiveStore,
    getSelectorShape: jest.fn(),
    queryBindings: jest.fn(),
    queryQuads: jest.fn().mockImplementation((operation: Operation, context: IActionContext): AsyncIterator<RDF.Quad> => {
      const [ subject, predicate, object, graph ]: RDF.Term[] = [
        operation.subject,
        operation.predicate,
        operation.object,
        operation.graph,
      ];
      const quads = effectiveStore.getQuads(
        subject.termType === 'Variable' ? null : subject,
        predicate.termType === 'Variable' ? null : predicate,
        object.termType === 'Variable' ? null : object,
        graph.termType === 'Variable' ? null : graph,
      );

      return fromArray(quads);
    }),
    queryBoolean: jest.fn(),
    queryVoid: jest.fn(),
    toString: jest.fn(),
  };
}
