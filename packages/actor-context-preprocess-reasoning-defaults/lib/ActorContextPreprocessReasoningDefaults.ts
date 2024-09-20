import type { IActorContextPreprocessOutput, IActorContextPreprocessArgs } from '@comunica/bus-context-preprocess';
import { ActorContextPreprocess } from '@comunica/bus-context-preprocess';
import type { IActorTest, IAction } from '@comunica/core';
import { KeysRdfReason } from '@comunica/reasoning-context-entries';
import { Store } from 'n3';
import { QuerySourceN3 } from './QuerySourceN3';

/**
 * A comunica Reasoning Defaults Context Preprocess Actor.
 */
export class ActorContextPreprocessReasoningDefaults extends ActorContextPreprocess {
  public constructor(args: IActorContextPreprocessArgs) {
    super(args);
  }

  public async test(action: IAction): Promise<IActorTest> {
    return true;
  }

  public async run(action: IAction): Promise<IActorContextPreprocessOutput> {
    return {
      context: action.context
        .setDefault(KeysRdfReason.implicitDatasetFactory, () => {
          const store = new Store();
          const source = new QuerySourceN3(store);
          return {
            source,
            context: action.context,
            type: source.toString(),
            value: store,
          };
        }),
    };
  }
}
