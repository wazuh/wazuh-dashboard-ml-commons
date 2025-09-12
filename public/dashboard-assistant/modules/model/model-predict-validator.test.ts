/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelPredictValidator } from './model-predict-validator';
import type { ModelPredictResponse } from './domain/types';

const baseResponse = (): ModelPredictResponse => ({
  inference_results: [
    {
      status_code: 200,
      output: [
        {
          dataAsMap: {},
        },
      ],
      error: undefined,
      status: 'ok',
      task_id: 't',
      model_id: 'm',
    },
  ],
});

describe('ModelPredictValidator', () => {
  it('accepts OpenAI-like choices payload', () => {
    const res = baseResponse();
    res.inference_results[0].output[0].dataAsMap = {
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: { role: 'assistant', content: 'hello' },
        },
      ],
    } as any;
    expect(ModelPredictValidator.validate(res)).toBe(true);
  });

  it('accepts Claude-like content payload', () => {
    const res = baseResponse();
    res.inference_results[0].output[0].dataAsMap = {
      content: [{ type: 'text', text: 'world' }],
    } as any;
    expect(ModelPredictValidator.validate(res)).toBe(true);
  });

  it('rejects when inference_results missing/empty', () => {
    expect(() => ModelPredictValidator.validate({ inference_results: [] } as any)).toThrow(
      'inference_results'
    );
  });

  it('rejects non-200 status_code', () => {
    const res = baseResponse();
    res.inference_results[0].status_code = 400;
    expect(() => ModelPredictValidator.validate(res)).toThrow('status code is 400');
  });

  it('rejects when output missing', () => {
    const res = baseResponse();
    // @ts-expect-error force invalid
    res.inference_results[0].output = [];
    expect(() => ModelPredictValidator.validate(res)).toThrow('output');
  });

  it('rejects when dataAsMap missing', () => {
    const res = baseResponse();
    // @ts-expect-error force invalid
    delete (res.inference_results[0].output[0] as any).dataAsMap;
    expect(() => ModelPredictValidator.validate(res)).toThrow('dataAsMap');
  });

  it('rejects when no supported content present', () => {
    const res = baseResponse();
    res.inference_results[0].output[0].dataAsMap = {} as any;
    expect(() => ModelPredictValidator.validate(res)).toThrow('valid content');
  });
});
