import { ActionContext, Bus } from '@comunica/core';
import { KeysRdfReason } from '@comunica/reasoning-context-entries';
import { Store } from 'n3';
import { ActorContextPreprocessReasoningDefaults } from '../lib/ActorContextPreprocessReasoningDefaults';
import { QuerySourceN3 } from '../lib/QuerySourceN3';

describe('ActorContextPreprocessReasoningDefaults', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorContextPreprocessReasoningDefaults instance', () => {
    let actor: ActorContextPreprocessReasoningDefaults;

    beforeEach(() => {
      actor = new ActorContextPreprocessReasoningDefaults({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ context: new ActionContext() })).resolves.toBe(true);
    });

    it('should use N3Store default when no implicitDatasetFactory is available', async() => {
      const { context } = await actor.run({ context: new ActionContext() });
      const factory = context.getSafe<() => any>(KeysRdfReason.implicitDatasetFactory)();

      expect(factory.type).toBe('QuerySourceN3');
      expect(factory.value).toBeInstanceOf(Store);
      expect(factory.source).toBeInstanceOf(QuerySourceN3);
      expect(factory.context).toStrictEqual(new ActionContext());
    });

    it('should use N3Store when implicitDatasetFactory is store input', async() => {
      const store = new Store();
      const { context } = await actor.run({
        context: new ActionContext({
          [KeysRdfReason.implicitDatasetFactory.name]: () => {
            const source = new QuerySourceN3(store);
            return {
              source,
              type: source.toString(),
              value: store,
            };
          },
        }),
      });
      const factory = context.getSafe<() => any>(KeysRdfReason.implicitDatasetFactory)();

      expect(factory.type).toBe('QuerySourceN3');
      expect(factory.value).toBe(store);
      expect(factory.source.referenceValue).toBe(store);
      expect(factory.context).toBeUndefined();
    });

    it('should use string when implicitDatasetFactory is string input', async() => {
      const { context } = await actor.run({
        context: new ActionContext({
          [KeysRdfReason.implicitDatasetFactory.name]: () => 'http://example.org',
        }),
      });
      const factory = context.getSafe<() => any>(KeysRdfReason.implicitDatasetFactory)();
      expect(factory).toBe('http://example.org');
    });
  });
});
