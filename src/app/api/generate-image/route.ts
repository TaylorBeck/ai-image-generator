import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { prompt, model, size, quality, style, n, responseFormat, user } = await request.json();

  try {
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
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
  }
}
