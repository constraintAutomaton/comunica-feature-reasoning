import type { IAction, IActorOutput } from '@comunica/core';
import type { IActorArgs, IActorTest, Mediate } from '@comunica/core';
import { Actor } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';
import { UnionIterator, type AsyncIterator } from 'asynciterator';
import type * as RDF from '@rdfjs/types';
import { KeysQueryOperation } from "@comunica/context-entries";
import { IQuerySourceWrapper } from "@comunica/types";

/**
 * A comunica actor for rdf-resolve-quad-pattern-intercept events.
 *
 * Actor types:
 * * Input:  IActionRdfResolveQuadPatternIntercept:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfResolveQuadPatternInterceptOutput: TODO: fill in.
 *
 * @see IActionRdfResolveQuadPatternIntercept
 * @see IActorRdfResolveQuadPatternInterceptOutput
 */
export abstract class ActorRdfResolveQuadPatternIntercept extends
  Actor<IActionRdfResolveQuadPatternIntercept, IActorTest, IActorRdfResolveQuadPatternInterceptOutput> {

  /**
   * @param args - @defaultNested {<default_bus> a <cc:components/Bus.jsonld#Bus>} bus
   */
  public constructor(args: IActorRdfResolveQuadPatternInterceptArgs) {
    super(args);
  }

  public async test(action: IActionRdfResolveQuadPatternIntercept): Promise<IActorTest> {
    return true;
  }

  public abstract runIntercept(action: IActionRdfResolveQuadPatternIntercept):
    Promise<IActionRdfResolveQuadPatternIntercept>;

  public async run(action: IActionRdfResolveQuadPatternIntercept): Promise<IActorRdfResolveQuadPatternInterceptOutput> {
    const interceptQuery = await this.runIntercept(action);
    const querySources = interceptQuery.context.getSafe<IQuerySourceWrapper[]>(KeysQueryOperation.querySources);
    const quads: AsyncIterator<RDF.Quad>[] = [];

    for (const querySource of querySources) {
      const quad = querySource.source.queryQuads(interceptQuery.pattern, interceptQuery.context);
      quads.push(quad);
    }
    return {
      data: new UnionIterator(quads, { autoStart: false })
    };
  }
}

export interface IActorRdfResolveQuadPatternInterceptArgs extends
  IActorArgs<IActionRdfResolveQuadPatternIntercept, IActorTest, IActorRdfResolveQuadPatternInterceptOutput> {
}

// Revert to type = pattern once https://github.com/LinkedSoftwareDependencies/Components.js/issues/90 is fixed
export interface IActionRdfResolveQuadPatternIntercept extends IAction {
  /**
     * The quad pattern to resolve.
     */
  pattern: Algebra.Pattern;
}
export interface IActorRdfResolveQuadPatternInterceptOutput extends IActorOutput {
  data: AsyncIterator<RDF.Quad>;
}
export type MediatorRdfResolveQuadPatternIntercept =
  Mediate<IActionRdfResolveQuadPatternIntercept, IActorRdfResolveQuadPatternInterceptOutput>;
