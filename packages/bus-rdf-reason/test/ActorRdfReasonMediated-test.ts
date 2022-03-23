import { MediatorOptimizeRule } from "@comunica/bus-optimize-rule";
import { IActionRdfResolveQuadPattern, IActorRdfResolveQuadPatternOutput, MediatorRdfResolveQuadPattern } from "@comunica/bus-rdf-resolve-quad-pattern";
import { IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput, MediatorRdfUpdateQuads } from "@comunica/bus-rdf-update-quads";
import { IActorRuleResolveOutput, MediatorRuleResolve } from "@comunica/bus-rule-resolve";
import { KeysRdfUpdateQuads, KeysRdfResolveQuadPattern } from "@comunica/context-entries";
import { ActionContext, Actor, Bus, IActorTest } from "@comunica/core";
import { Rule } from "@comunica/reasoning-types";
import { quad, namedNode, variable } from "@rdfjs/data-model";
import { UnionIterator, wrap, fromArray } from "asynciterator";
import { promisifyEventEmitter } from "event-emitter-promisify";
import { Store } from "n3";
// import { ActorRdfReasonRuleRestriction } from "../../actor-rdf-reason-rule-restriction/lib/ActorRdfReasonRuleRestriction";
import { IActionRdfReason, IActorRdfReasonOutput, implicitGroupFactory, IPartialReasonedStatus, IReasonGroup, IReasonStatus, KeysRdfReason } from "../lib/ActorRdfReason";
import { actorParams, mediatorOptimizeRule, mediatorRdfResolveQuadPattern, mediatorRdfUpdateQuads, mediatorRuleResolve, mediators } from '@comunica/reasoning-mocks'
import 'jest-rdf';
import { ActorRdfReasonMediated, IActionRdfReasonExecute, IActorRdfReasonMediatedArgs } from "../lib";
import { Factory } from 'sparqlalgebrajs';
import * as RDF from '@rdfjs/types';
const factory = new Factory();

class MyClass extends ActorRdfReasonMediated {
  public constructor(args: IActorRdfReasonMediatedArgs) {
    super(args);
  }

  public async test(action: IActionRdfReason): Promise<IActorTest> {
    return true;
  }

  public async  execute(action: IActionRdfReasonExecute): Promise<void> {
    return Promise.resolve();
  }
}

// TODO: Test resolution of promises

describe('ActorRdfReasonMediated', () => {
  let bus: Bus<Actor<IActionRdfReason, IActorTest, IActorRdfReasonOutput>, IActionRdfReason, IActorTest, IActorRdfReasonOutput>;
  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfReasonMediated instance', () => {
    let actor: ActorRdfReasonMediated;
    let action: IActionRdfReason;
    let data: IReasonGroup;
    let destination: Store;
    let source: Store;
    let execute: Function;

    beforeEach(() => {
      actor = new MyClass({
        name: 'actor',
        bus,
        mediatorOptimizeRule,
        mediatorRdfResolveQuadPattern,
        mediatorRdfUpdateQuads,
        mediatorRuleResolve
      });

      data = implicitGroupFactory(
        new ActionContext({
          [KeysRdfReason.implicitDatasetFactory.name]: () => new Store(),
        }),
      );

      destination = new Store();

      source = new Store();

      action = {
        context: new ActionContext({
          [KeysRdfReason.data.name]: data,
          [KeysRdfReason.rules.name]: 'my-unnested-rules',
          [KeysRdfUpdateQuads.destination.name]: destination,
          [KeysRdfResolveQuadPattern.source.name]: source,
        }),
      };
    });

    it('Should always test true - since that what we have declared our mock class should do', () => {
      expect(actor.test(action)).resolves.toEqual(true);
    });

    describe('The actor has been run but not executed', () => {
      beforeEach(async () => {
        execute = (await actor.run(action)).execute;
      });

      it('Should not be reasoned if execute is not called', async () => {
        expect(data.status).toMatchObject<IReasonStatus>({ type: 'full', reasoned: false });
      });

      describe('The actor has been run and executed', () => {
        beforeEach(async () => {
          await execute();
        });
  
        it('Should be reasoned after execute is not called', async () => {
          expect(data.status).toMatchObject<IReasonStatus>(({ type: 'full', reasoned: true, done: Promise.resolve() }));
        });
      });
    });

    describe('Testing the actor on a pattern', () => {
      beforeEach(() => {
        action = { ...action, pattern: factory.createPattern(variable('s'), namedNode('http://example.org#type'), variable('?o')) };
      });

      it('Should be able to test the actor on a patterned action', () => {
        expect(actor.test(action)).resolves.toEqual(true);
      });

      it('Should be full not reasoned before the run action is called', () => {
        expect(data.status).toMatchObject<IReasonStatus>({ type: 'full', reasoned: false });
      });

      describe('.run is called but execute is not yet run', () => {
        beforeEach(async () => {
          execute = (await actor.run(action)).execute;
        });

        it('Should be full not reasoned before the run action is called', () => {
          expect(data.status).toMatchObject<IReasonStatus>({ type: 'full', reasoned: false });
        });

        describe('execute is called', () => {
          beforeEach(async () => {
            await execute();
          });

          it('Should have partial reasoning applied', () => {
            const { status } = data;
            expect(status.type).toEqual('partial');
            const { patterns } = status as IPartialReasonedStatus;
            expect(patterns.size).toEqual(1);
            const [ [ term, state ] ]  = patterns.entries();

            expect(term.equals( quad(variable('s'), namedNode('http://example.org#type'), variable('?o')))).toBe(true);
            expect(state).toMatchObject({ type: 'full', reasoned: true, done: Promise.resolve() });
          });
        });
      });
    });
  });
});