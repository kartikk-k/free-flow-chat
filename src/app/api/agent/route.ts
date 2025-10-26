import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';


export const maxDuration = 800;

export async function POST(req: NextRequest) {

    const { messages }: { messages: UIMessage[] } = await req.json();

    // const anthropic = createAnthropic({ apiKey: process.env.ANTROPIC_API_KEY! })
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })

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

        system: `Answer in short and concise sentences.`,

        stopWhen: stepCountIs(15),
        tools: {}

    });

    return result.toUIMessageStreamResponse();
}