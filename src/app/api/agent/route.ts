import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';
import Exa from 'exa-js';


export const maxDuration = 300;

export async function POST(req: NextRequest) {

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Get API keys from query parameters
    const apiKey = req.nextUrl.searchParams.get('apiKey');
    const exaApiKey = req.nextUrl.searchParams.get('exaApiKey');

    // Use API key from query param if provided, otherwise fall back to environment variable
    const effectiveApiKey = apiKey;
    const effectiveExaApiKey = exaApiKey || process.env.EXA_API_KEY;

    if (!effectiveApiKey) {
        return new Response(
            JSON.stringify({ error: 'API key is required. Please add your OpenAI API key in settings.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Get the last user message for web search
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    let userQuery = '';
    if (lastUserMessage?.parts && Array.isArray(lastUserMessage.parts)) {
        const firstPart = lastUserMessage.parts[0];
        if (firstPart && typeof firstPart === 'object' && 'text' in firstPart) {
            userQuery = firstPart.text || '';
        }
    }

    let searchResults = null;
    let searchContext = '';

    // Perform web search with Exa if API key is available
    if (effectiveExaApiKey && userQuery) {
        try {
            const exa = new Exa(effectiveExaApiKey);

            // Perform search with content retrieval
            const searchResponse = await exa.searchAndContents(userQuery, {
                type: 'auto',
                numResults: 5,
                text: { maxCharacters: 500 },
                highlights: true
            });

            searchResults = searchResponse.results;

            // Build context from search results
            if (searchResults && searchResults.length > 0) {
                searchContext = '\n\nWeb Search Results:\n' + searchResults.map((result: any, index: number) =>
                    `${index + 1}. ${result.title}\n   URL: ${result.url}\n   ${result.text || result.highlights?.join(' ') || ''}`
                ).join('\n\n');
            }
        } catch (error) {
            console.error('Exa search error:', error);
            // Continue without search results if there's an error
        }
    }

    // Add search context to messages if available
    const messagesWithContext = searchContext
        ? [
            ...messages.slice(0, -1),
            {
                ...lastUserMessage,
                content: userQuery + searchContext
            } as UIMessage
          ]
        : messages;

    // const anthropic = createAnthropic({ apiKey: process.env.ANTROPIC_API_KEY! })
    const openai = createOpenAI({ apiKey: effectiveApiKey })

    // Format search results as markdown to append
    let searchResultsMarkdown = '';
    if (searchResults && searchResults.length > 0) {
        searchResultsMarkdown = '\n\n---\n\n**Web Search Results:**\n\n' +
            searchResults.map((result: any, index: number) =>
                `${index + 1}. **[${result.title}](${result.url})**\n   ${result.text || result.highlights?.join(' ') || ''}`
            ).join('\n\n');
    }

    const result = streamText({
        // model: anthropic('claude-sonnet-4-20250514'
        model: openai('gpt-4'),
        messages: convertToModelMessages(messagesWithContext),

        onError: (e => {
        }),

        onFinish: async ({ text }) => {
            // Search results are appended via stream transformation
        },

        // stopWhen: stepCountIs(15),
        // tools: {}

    });

    // If no search results, return the normal UI stream
    if (!searchResultsMarkdown) {
        return result.toUIMessageStreamResponse();
    }

    // Create a custom async iterable that appends search results
    async function* appendSearchResults() {
        // Stream all the text from the AI
        for await (const chunk of result.textStream) {
            yield chunk;
        }
        // After streaming is done, append search results
        yield searchResultsMarkdown;
    }

    // Convert to UI message stream with appended search results
    const customTextStream = appendSearchResults();

    // We need to create a proper response stream
    // Use the result's internal stream but modify the text
    const uiStream = result.toUIMessageStreamResponse();
    const reader = uiStream.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
        async start(controller) {
            if (!reader) {
                controller.close();
                return;
            }

            try {
                let lastChunkWasText = false;

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        // Append search results as a text delta before closing
                        const searchData = `0:${JSON.stringify(searchResultsMarkdown)}\n`;
                        controller.enqueue(encoder.encode(searchData));
                        controller.close();
                        break;
                    }

                    // Pass through all data
                    controller.enqueue(value);
                }
            } catch (error) {
                controller.error(error);
            }
        }
    });

    return new Response(transformedStream, {
        headers: uiStream.headers,
    });
}