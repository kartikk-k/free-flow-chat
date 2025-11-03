import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';


export const maxDuration = 300;

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

    const COST = { // per million tokens in USD
        input: 30,
        output: 60,
    }

    const result = streamText({
        // model: anthropic('claude-sonnet-4-20250514'
        model: openai('gpt-4'),
        messages: convertToModelMessages(messages),

        onError: (e => {
            console.log("❌❌❌❌ Error in agent: ", e)
        }),

        onFinish: (e => {
            // console.log("✅✅✅✅ Agent finished: ", e)
            // finish reason
            // console.log("✅✅✅✅ Agent finished reason: ", e.finishReason)

            console.log("--------------------------------")
            console.log("USAGE DETAILS" + " - " + e.providerMetadata)
            console.log("--------------------------------")
            console.log("\n")

            console.log("INPUT TOKENS: ", e.usage?.inputTokens)
            console.log("OUTPUT TOKENS: ", e.usage?.outputTokens)
            console.log("TOTAL TOKENS: ", e.usage?.totalTokens)
            console.log("REASONING TOKENS: ", e.usage?.reasoningTokens)
            console.log("CACHED INPUT TOKENS: ", e.usage?.cachedInputTokens)
            console.log("\n")
            console.log("--------------------------------")
            console.log("COST DETAILS")
            console.log("--------------------------------")
            console.log("INPUT COST: ", e.usage?.inputTokens ? (e.usage?.inputTokens / 1000000) * COST.input : 0)
            console.log("OUTPUT COST: ", e.usage?.outputTokens ? (e.usage?.outputTokens / 1000000) * COST.output : 0)
            console.log("TOTAL COST: ", (e.usage!.inputTokens! / 1000000) * COST.input + (e.usage!.outputTokens! / 1000000) * COST.output)

            console.log("\n")
            console.log("--------------------------------")
            console.log("--------------------------------")
        }),

        // system: `Answer in short and concise sentences.`,

        stopWhen: stepCountIs(15),
        tools: {}

    });

    return result.toUIMessageStreamResponse();
}