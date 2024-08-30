import { ActorQuerySourceIdentifyRdfJs } from '@comunica/actor-query-source-identify-rdfjs';
import { KeysQueryOperation } from '@comunica/context-entries';
import type { IQuerySourceWrapper } from '@comunica/types';
import type * as RDF from '@rdfjs/types';
import { UnionIterator } from 'asynciterator';
import type { Store } from 'n3';
import { createMediator } from './util';

// Const federatedActor = new ActorRdfResolveQuadPatternFederated({
//   name: 'federated',
//   bus: new Bus({ name: 'bus' }),
//   mediatorResolveQuadPattern: createMediator(ActorRdfResolveQuadPatternRdfJsSource)
//  });

class MyActor extends ActorQuerySourceIdentifyRdfJs {
  public constructor(args: any) {
    super(args);
  }

  public async run(action: any): Promise<any> {
    const sources: Store[] = action.context.get(KeysQueryOperation.querySources) ?
        [ <Store>(<IQuerySourceWrapper>action.context.get(KeysQueryOperation.querySources)).source.referenceValue ] :
        [];

    const its = sources.map(
      source => super.run({ ...action, context: action.context.set(KeysQueryOperation.querySources, source) }),
    );

    return {
      data: new UnionIterator<RDF.Quad>((await Promise.all(its)).map((it: any) => it.data), { autoStart: false }),
    };
  }
}

export const mediatorRdfResolveQuadPattern: any = createMediator(MyActor);
