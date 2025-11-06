import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Get Firecrawl API key from environment variable
        const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

        if (!firecrawlApiKey) {
            return NextResponse.json(
                { error: 'Firecrawl API key is not configured. Please add FIRECRAWL_API_KEY to your environment variables.' },
                { status: 500 }
            );
        }

        // Initialize Firecrawl
        const app = new Firecrawl({ apiKey: firecrawlApiKey });

        // Scrape the URL and get markdown content
        const scrapeResult = await app.scrape(url, {
            formats: ['markdown'],
        });

        return NextResponse.json({
            success: true,
            markdown: scrapeResult.markdown || '',
            metadata: {
                title: scrapeResult.metadata?.title || '',
                description: scrapeResult.metadata?.description || '',
                url: url
            }
        });

    } catch (error: any) {
        console.error('Error fetching webpage:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch webpage content' },
            { status: 500 }
        );
    }
}
