import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { prompt, model, size, quality, style, n } = await request.json();

  try {
    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size,
      quality,
      style,
    });

    return NextResponse.json({ url: response.data[0].url });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
  }
}
