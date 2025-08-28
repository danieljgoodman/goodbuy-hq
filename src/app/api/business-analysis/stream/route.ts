import { NextRequest } from 'next/server';
import { businessAnalysisAgent } from '@/lib/business-analysis-agent';
import type { BusinessData } from '@/types/business';

export async function POST(request: NextRequest) {
  try {
    const businessData: BusinessData = await request.json();

    if (!businessData.businessName || !businessData.industry) {
      return new Response(
        JSON.stringify({ error: 'Business name and industry are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start', 
              message: 'Starting business analysis...' 
            })}\n\n`)
          );

          await businessAnalysisAgent.streamBusinessAnalysis(
            businessData,
            (chunk: string) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'chunk', 
                  content: chunk 
                })}\n\n`)
              );
            }
          );

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete', 
              message: 'Analysis complete' 
            })}\n\n`)
          );

        } catch (error: any) {
          console.error('Streaming analysis error:', error);
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: error.message || 'Analysis failed' 
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error: any) {
    console.error('Stream API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to start streaming analysis',
        message: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}