import { NextRequest, NextResponse } from 'next/server';
import { businessAnalysisAgent } from '@/lib/business-analysis-agent';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Business description is required' },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const enhancedDescription = await businessAnalysisAgent.enhanceBusinessDescription(description);

    return NextResponse.json({
      success: true,
      original: description,
      enhanced: enhancedDescription,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Description enhancement API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to enhance description',
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}