import { KeysQueryOperation } from '@comunica/context-entries';
import { ActionContext } from '@comunica/core';
import { KeysRdfReason } from '@comunica/reasoning-context-entries';
import { generateSource } from '@comunica/reasoning-mocks';
import type { IReasonGroup } from '@comunica/reasoning-types';
import type { IActionContext, IQuerySourceWrapper } from '@comunica/types';
import type * as RDF from '@rdfjs/types';
import { DataFactory, Store } from 'n3';
import {
  getExplicitSources,
  setImplicitSource,
  getContextWithImplicitDataset,
} from '../lib/ActorRdfReason';

const { namedNode, quad } = DataFactory;

describe('getContextWithImplicitDataset', () => {
  let store: Store;
  let factory: () => Store;
  let data: IReasonGroup;

  beforeEach(() => {
    store = new Store();
    data = {
      dataset: { source: generateSource(store), value: store },
      status: { type: 'full', reasoned: false },
      context: new ActionContext(),
    };
    factory = () => new Store();
  });

  it('Should throw an error if there is no data object or source generator', () => {
    expect(() => getContextWithImplicitDataset(new ActionContext())).toThrow();
  });

  it('Should keep the original data key object if one is present', () => {
    let context = new ActionContext({ [KeysRdfReason.data.name]: data });
    let newContext = getContextWithImplicitDataset(context);

    expect(context).toEqual(newContext);
    expect(newContext.get<IReasonGroup>(KeysRdfReason.data)?.dataset.source.referenceValue === store).toBe(true);

    context = new ActionContext({
      [KeysRdfReason.data.name]: data,
      [KeysRdfReason.implicitDatasetFactory.name]: factory,
    });

    newContext = getContextWithImplicitDataset(context);

    expect(context).toEqual(newContext);
    expect(newContext.get<IReasonGroup>(KeysRdfReason.data)?.dataset.source.referenceValue === store).toBe(true);
  });

  it('Should generate a data object if none are present', () => {
    const context = new ActionContext({ [KeysRdfReason.implicitDatasetFactory.name]: factory });
    expect(getContextWithImplicitDataset(context).get(KeysRdfReason.data)).toBeDefined();
    expect(getContextWithImplicitDataset(context).get<IReasonGroup>(KeysRdfReason.data)?.dataset).toBeInstanceOf(Store);
  });

  describe('setImplicitSource', () => {
    let context: IActionContext;
    let indicatorQuad: RDF.Quad;
    beforeEach(() => {
      context = new ActionContext({
        [KeysRdfReason.implicitDatasetFactory.name]: factory,
        [KeysRdfReason.data.name]: data,
      });
      indicatorQuad = quad(
        namedNode('http://example.org/subject'),
        namedNode('http://example.org/predicate'),
        namedNode('http://example.org/object'),
        namedNode('http://example.org/graph'),
      );
      store.addQuad(indicatorQuad);
    });

    it('With no original querySources', () => {
      const newContext = setImplicitSource(context);
      expect(newContext.get<IReasonGroup>(KeysRdfReason.data)?.dataset.source.referenceValue).toBeRdfDatasetContaining(indicatorQuad);
      expect(newContext.get<IQuerySourceWrapper>(KeysQueryOperation.querySources)?.source.referenceValue).toBeRdfDatasetContaining(indicatorQuad);
    });

    it('With a original querySources', () => {
      const newContext = setImplicitSource(context.set(KeysQueryOperation.querySources, new Store()));
      expect(newContext.get<IReasonGroup>(KeysRdfReason.data)?.dataset.source.referenceValue).toBeRdfDatasetContaining(indicatorQuad);
      expect(newContext.get<IQuerySourceWrapper>(KeysQueryOperation.querySources)?.source.referenceValue).toBeRdfDatasetContaining(indicatorQuad);
    });
  });

  describe('getExplicitSources', () => {
    it('explicit sources should be Queryable', () => {
      expect(getExplicitSources(new ActionContext())).toEqual([]);
      const contextOneEntry = new ActionContext({
        [KeysQueryOperation.querySources.name]: [ 'source1' ],
      });
      expect(getExplicitSources(contextOneEntry)).toEqual([ 'source1' ]);
      const context = new ActionContext({
        [KeysQueryOperation.querySources.name]: [ 'source0', 'source2' ],
      });
      expect(getExplicitSources(context)).toEqual([ 'source0', 'source2' ]);
      // TODO: Address this case
      // expect(getExplicitSources(new ActionContext({
      //   [KeysRdfResolveQuadPattern.source.name]: 'source1',
      //   [KeysRdfResolveQuadPattern.sources.name]: ['source0', 'source2']
      // }))).toEqual(['source0', 'source2']);
    });
  });
});
