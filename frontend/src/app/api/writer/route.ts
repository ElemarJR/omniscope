import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { section } = await req.json();

    if (!section) {
      return NextResponse.json(
        { error: 'Section data is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are an expert technical writer specializing in creating clear, professional documentation.
Your task is to generate content following these requirements:

Content requirements:
${section.content}

Format requirements:
${section.format}

Please ensure:
- Professional and clear language
- Proper technical terminology
- Logical flow and structure
- Adherence to specified format
- Engaging and informative tone
- Practical examples where appropriate
- The language needs to be in portuguese.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedContent = completion.choices[0].message.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: generatedContent }, { status: 200 });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
