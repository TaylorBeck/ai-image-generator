import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as fal from '@fal-ai/serverless-client';

interface FalResult {
  images: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  const { prompt, model, size, quality, style, n, responseFormat, user, image_size, num_inference_steps, seed, enable_safety_checker } = await request.json();

  try {
    if (model === 'flux-schnell') {
      const result = await fal.subscribe('fal-ai/flux/schnell', {
        input: {
          prompt,
          image_size,
          num_inference_steps,
          seed,
          num_images: n,
          enable_safety_checker,
        },
      }) as FalResult;

      return NextResponse.json({ images: result.images });
    } else {
      const response = await openai.images.generate({
        model,
        prompt,
        n,
        size,
        quality,
        style,
        response_format: responseFormat,
        user,
      });

      if (responseFormat === 'b64_json') {
        return NextResponse.json({ b64_json: response.data[0].b64_json });
      } else {
        return NextResponse.json({ url: response.data[0].url });
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
  }
}
