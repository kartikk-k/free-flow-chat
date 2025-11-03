import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';
import { getModelConfig, getProviderFromModelId, DEFAULT_MODELS, getBestDefaultModel } from '@/lib/models/config';
import type { ProviderId } from '@/lib/models/config';

export const maxDuration = 300;

/**
 * Get the appropriate AI model instance based on model ID and API keys
 */
function getModel(modelId: string, apiKeys: Record<ProviderId, string | null>) {
    const provider = getProviderFromModelId(modelId);
    
    if (!provider) {
        // Fallback to OpenAI default if model not found
        const openaiKey = apiKeys.openai;
        if (!openaiKey) {
            throw new Error('OpenAI API key is required');
        }
        const openai = createOpenAI({ apiKey: openaiKey });
        return openai(DEFAULT_MODELS.openai);
    }

    const apiKey = apiKeys[provider];
    if (!apiKey) {
        throw new Error(`${provider} API key is required for model ${modelId}`);
    }

    switch (provider) {
        case 'openai': {
            const openai = createOpenAI({ apiKey });
            return openai(modelId);
        }
        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey });
            return anthropic(modelId);
        }
        case 'google': {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(modelId);
        }
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { messages, modelId }: { messages: UIMessage[]; modelId?: string } = await req.json();

        // Get API keys from query parameters
        const openaiKey = req.nextUrl.searchParams.get('openaiKey');
        const anthropicKey = req.nextUrl.searchParams.get('anthropicKey');
        const googleKey = req.nextUrl.searchParams.get('googleKey');

        // Build API keys object
        const apiKeys: Record<ProviderId, string | null> = {
            openai: openaiKey,
            anthropic: anthropicKey,
            google: googleKey,
        };

        // Determine which model to use
        // Only use default if no modelId was explicitly provided
        let targetModelId = modelId;

        // If no modelId provided, use best available based on API keys
        if (!targetModelId || targetModelId.trim() === '') {
            targetModelId = getBestDefaultModel(apiKeys);
        }

        // Validate model exists
        let modelConfig = getModelConfig(targetModelId);
        if (!modelConfig) {
            // If model was explicitly provided but not found, return error
            if (modelId && modelId.trim() !== '') {
                return new Response(
                    JSON.stringify({ error: `Model "${targetModelId}" not found. Please select a valid model.` }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            // If it was a default that's not found, try to find any valid model for the provider
            const fallbackModelId = getBestDefaultModel(apiKeys);
            const fallbackConfig = getModelConfig(fallbackModelId);
            if (fallbackConfig) {
                targetModelId = fallbackModelId;
                modelConfig = fallbackConfig;
            } else {
                return new Response(
                    JSON.stringify({ error: `No valid model configuration available` }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Get the model instance
        let model;
        try {
            model = getModel(targetModelId, apiKeys);
        } catch (error: any) {
            console.error('Error creating model instance:', error);
            const errorMessage = error.message || 'API key is required. Please add your API key in settings.';
            return new Response(
                JSON.stringify({ error: errorMessage }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = streamText({
            model,
            messages: convertToModelMessages(messages),

            onError: (e) => {
                console.error("Error in agent: ", e);
            },

            stopWhen: stepCountIs(15),
            tools: {}
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error('Error in API route:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}