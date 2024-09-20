import type { FragmentSelectorShape, IActionContext, IQueryBindingsOptions, IQuerySource, BindingsStream } from '@comunica/types';
import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';
import { fromIterable } from 'asynciterator';
import type { Store, Term } from 'n3';
import { BlankNode, NamedNode, DefaultGraph, DataFactory as N3DataFactory } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { Algebra, Factory } from 'sparqlalgebrajs';

const AF = new Factory();
const DF = new DataFactory<RDF.BaseQuad>();

export class QuerySourceN3 implements IQuerySource {
  protected static readonly SELECTOR_SHAPE: FragmentSelectorShape = {
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

  protected readonly source: Store;
  public referenceValue: Store;

  public constructor(source: Store) {
    this.source = source;
    this.referenceValue = source;
  }

  public async getSelectorShape(): Promise<FragmentSelectorShape> {
    return QuerySourceN3.SELECTOR_SHAPE;
  }

  public queryBindings(
    _operation: Algebra.Operation,
    _context: IActionContext,
    _options?: IQueryBindingsOptions,
  ): BindingsStream {
    throw new Error('queryQuads is not implemented in QuerySourceN3');
  }

  public queryQuads(
    operation: Algebra.Operation,
  ): AsyncIterator<RDF.Quad> {
    if (operation.type !== Algebra.types.PATTERN) {
      throw new Error('queryQuads only support pattern operation');
    }
    const [ subject, predicate, object, graph ]: (Term | undefined)[] = [
      QuerySourceN3.rdfTermToN3Term(operation.subject),
      QuerySourceN3.rdfTermToN3Term(operation.predicate),
      QuerySourceN3.rdfTermToN3Term(operation.object),
      QuerySourceN3.rdfTermToN3Term(operation.graph),
    ];
    const quads = this.source.match(
      subject,
      predicate,
      object,
      graph,
    );
    return fromIterable(quads);
  }

  public queryBoolean(
    _operation: Algebra.Ask,
    _context: IActionContext,
  ): Promise<boolean> {
    throw new Error('queryBoolean is not implemented in QuerySourceN3');
  }

  public queryVoid(
    _operation: Algebra.Update,
    _context: IActionContext,
  ): Promise<void> {
    throw new Error('queryVoid is not implemented in QuerySourceN3');
  }

  public toString(): string {
    return this.constructor.name;
  }

  /**
   * Convert an RDF.Term into an N3 term.
   * Will convert a variable into undefined because querying method in the store
   * consider undefine as wildcard and does not seem to handle variable has
   * wildcard, too.
   * @param {} term - RDF term
   * @returns {Term | undefined} resulting N3 term or undefined if an RDF variable was
   * sent or the term was undefined
   */
  public static rdfTermToN3Term(term: RDF.Term | undefined): Term | undefined {
    if (term === undefined) {
      return undefined;
    }
    switch (term.termType) {
      case 'BlankNode':
        return new BlankNode(term.value);
      case 'NamedNode':
        return new NamedNode(term.value);
      case 'Literal':
        return N3DataFactory.literal(term.value, term.datatype ?? term.language);
      case 'Variable':
        return undefined;
      case 'DefaultGraph':
        return new DefaultGraph();
      default:
        throw (`n3 does not support the RDF term type ${term.termType}`);
    }
  }
}
