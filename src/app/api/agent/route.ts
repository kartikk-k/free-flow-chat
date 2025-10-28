import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';


export const maxDuration = 800;

export async function POST(req: NextRequest) {

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Get API key from query parameter
    const apiKey = req.nextUrl.searchParams.get('apiKey');

    // Use API key from query param if provided, otherwise fall back to environment variable
    const effectiveApiKey = apiKey;
    // const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!effectiveApiKey) {
        return new Response(
            JSON.stringify({ error: 'API key is required. Please add your OpenAI API key in settings.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // const anthropic = createAnthropic({ apiKey: process.env.ANTROPIC_API_KEY! })
    const openai = createOpenAI({ apiKey: effectiveApiKey })

    const result = streamText({
        // model: anthropic('claude-sonnet-4-20250514'
        model: openai('o3-mini'),
        messages: convertToModelMessages(messages),        

        onError: (e => {
            console.log("❌❌❌❌ Error in agent: ", e)
        }),

        onFinish: (e => {
            console.log("✅✅✅✅ Agent finished: ", e)
            // finish reason
            console.log("✅✅✅✅ Agent finished reason: ", e.finishReason)
        }),

        // system: `Answer in short and concise sentences.`,

        stopWhen: stepCountIs(15),
        tools: {}

    });

    return result.toUIMessageStreamResponse();
}