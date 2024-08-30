import { ActionContext } from '@comunica/core';
import { mediatorDereferenceRule } from '@comunica/reasoning-mocks';
import type { IActionContext } from '@comunica/types';
import 'jest-rdf';
import { MediatedRuleSource } from '../lib';

describe('MediatedRuleSource', () => {
  let context: IActionContext;

  beforeEach(() => {
    context = new ActionContext({});
  });

  describe('The MediatedRuleSource module', () => {
    it('should be a function', () => {
      expect(MediatedRuleSource).toBeInstanceOf(Function);
    });
  });

  describe('A MediatedRuleSource instance', () => {
    let source: MediatedRuleSource;

    beforeEach(() => {
      source = new MediatedRuleSource(context, 'my-unnested-rules', { mediatorDereferenceRule });
    });

    describe('match', () => {
      it('should return a stream', async() => {
        await expect(source.get().toArray()).resolves.toHaveLength(2);
        // Again - this should use the cache
        await expect(source.get().toArray()).resolves.toHaveLength(2);
      });
    });
  });
});
