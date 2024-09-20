import { QuerySourceN3 } from '../lib/QuerySourceN3';
import { Factory } from 'sparqlalgebrajs';
import type * as RDF from '@rdfjs/types';
import { BlankNode, NamedNode, Store, DataFactory as N3DataFactory, DefaultGraph } from 'n3';
import 'jest-rdf';
import { DataFactory } from 'rdf-data-factory';

const AF = new Factory();
const DF = new DataFactory<RDF.BaseQuad>();

describe('QuerySourceN3', () => {
  describe('constructor', () => {
    it('should have the same reference has the source provided', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      expect(querySource.referenceValue).toBe(source);
    });
  });

  describe('getSelectorShape', () => {
    it('should return the default selector shape', async() => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      const expectedSelectorShape = {
        type: 'operation',
        operation: {
          operationType: 'pattern',
          pattern: AF.createPattern(DF.variable('s'), DF.variable('p'), DF.variable('o'), DF.variable('g')),
        },
        variablesOptional: [
          DF.variable('s'),
          DF.variable('p'),
          DF.variable('o'),
          DF.variable('g'),
        ],
      };

      await expect(querySource.getSelectorShape()).resolves.toStrictEqual(expectedSelectorShape);
    });
  });

  describe('queryBindings', () => {
    it('should throw an error because it is not implemented', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      expect(() => querySource.queryBindings(<any>undefined, <any>undefined))
        .toThrow('queryQuads is not implemented in QuerySourceN3');
    });
  });

  describe('queryQuads', () => {
    it('should thow an error when a non pattern operation is sent', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);
      const operation = AF.createAlt([]);

      expect(() => querySource.queryQuads(operation)).toThrow('queryQuads only support pattern operation');
    });

    it('should return no quad given an empty store', async() => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);
      const operation = AF.createPattern(DF.variable('s'), DF.variable('p'), DF.variable('o'), DF.variable('g'));

      const quads = querySource.queryQuads(operation);

      await expect((quads.toArray())).resolves.toHaveLength(0);
    });

    it('should query triples', async() => {
      const quadsInStore = [
        N3DataFactory.quad(DF.blankNode(), DF.namedNode('foo'), DF.blankNode(), DF.blankNode()),
        N3DataFactory.quad(DF.blankNode(), DF.namedNode('bar'), DF.blankNode(), DF.blankNode()),
        N3DataFactory.quad(DF.blankNode(), DF.namedNode('too'), DF.blankNode()),
      ];
      const source = new Store(quadsInStore);
      expect(source.size).toBe(quadsInStore.length);

      const querySource = new QuerySourceN3(source);
      const operation = AF.createPattern(DF.variable('s'), DF.variable('p'), DF.variable('o'), DF.variable('g'));

      const quads = querySource.queryQuads(operation);

      await expect(quads.toArray()).resolves.toBeRdfIsomorphic(quadsInStore);
    });
  });

  describe('queryBoolean', () => {
    it('should throw an error because it is not implemented', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      expect(() => querySource.queryBoolean(<any>undefined, <any>undefined))
        .toThrow('queryBoolean is not implemented in QuerySourceN3');
    });
  });

  describe('queryVoid', () => {
    it('should throw an error because it is not implemented', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      expect(() => querySource.queryVoid(<any>undefined, <any>undefined))
        .toThrow('queryVoid is not implemented in QuerySourceN3');
    });
  });

  describe('toString', () => {
    it('should return the name of the class', () => {
      const source = new Store();
      const querySource = new QuerySourceN3(source);

      expect(querySource.toString()).toBe('QuerySourceN3');
    });
  });

  describe('rdfTermToN3Term', () => {
    it('should handle undefined', () => {
      expect(QuerySourceN3.rdfTermToN3Term(undefined)).toBeUndefined();
    });

    it('should handle a blank node', () => {
      const id = 'foo';
      const term = DF.blankNode(id);
      const expectedN3Term = new BlankNode(id);

      expect(QuerySourceN3.rdfTermToN3Term(term)).toStrictEqual(expectedN3Term);
    });

    it('should handle a named node', () => {
      const id = 'foo';
      const term = DF.namedNode(id);
      const expectedN3Term = new NamedNode(id);

      expect(QuerySourceN3.rdfTermToN3Term(term)).toStrictEqual(expectedN3Term);
    });

    it('should handle a literal', () => {
      const id = '15';
      const dataType = DF.namedNode('http://www.w3.org/2001/XMLSchema#byte');
      const term = DF.literal(id, dataType);
      const expectedN3Term = N3DataFactory.literal(id, dataType);

      expect(QuerySourceN3.rdfTermToN3Term(term)).toStrictEqual(expectedN3Term);
    });

    it('should handle a variable', () => {
      const id = 'foo';
      const term = DF.variable(id);

      expect(QuerySourceN3.rdfTermToN3Term(term)).toBeUndefined();
    });

    it('should handle a default graph', () => {
      const term = DF.defaultGraph();
      const expectedN3Term = new DefaultGraph();

      expect(QuerySourceN3.rdfTermToN3Term(term)).toStrictEqual(expectedN3Term);
    });

    it('should throw an error on quad', () => {
      const term = DF.quad(DF.blankNode(), DF.blankNode(), DF.blankNode());

      expect(() => QuerySourceN3.rdfTermToN3Term(term)).toThrow(`n3 does not support the RDF term type ${term.termType}`);
    });
  });
});
