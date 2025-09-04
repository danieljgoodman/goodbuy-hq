# State Management

Based on your existing React Hook Form integration and established patterns, I'm defining state management approaches that handle AI analysis complexity while preserving current form and application state patterns.

## Store Structure

```
state/
├── global/                       # Application-wide state
│   ├── auth-store.ts            # User authentication (existing)
│   ├── theme-store.ts           # Theme and UI preferences (existing)
│   └── subscription-store.ts    # NEW: Subscription tier and usage tracking
├── ai/                          # NEW: AI analysis state management
│   ├── analysis-store.ts        # Active analysis sessions and results
│   ├── streaming-store.ts       # Real-time analysis progress and WebSocket state
│   ├── health-store.ts          # Business health scoring cache and history
│   └── confidence-store.ts      # Analysis confidence tracking and validation
├── portfolio/                   # NEW: Portfolio management state
│   ├── portfolio-store.ts       # Portfolio organization and bulk operations
│   ├── comparison-store.ts      # Multi-business comparison state
│   └── bulk-analysis-store.ts   # Batch processing queue and results
├── reports/                     # NEW: Professional reporting state
│   ├── report-builder-store.ts  # Report customization and template state
│   ├── export-queue-store.ts    # PDF/Excel generation queue management
│   └── white-label-store.ts     # Branding and customization preferences
└── forms/                       # Enhanced form state (building on existing)
    ├── business-form-store.ts   # Business data entry (enhanced validation)
    ├── upload-store.ts          # CSV/Excel upload processing state
    └── validation-store.ts      # Intelligent data mapping and validation
```

## State Management Template

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// AI Analysis State Types
interface AIAnalysisState {
  // Active analysis sessions
  activeAnalyses: Record<string, AnalysisSession>
  
  // Streaming state for real-time progress
  streamingConnections: Record<string, WebSocketConnection>
  
  // Analysis results cache
  results: Record<string, AnalysisResult>
  
  // Loading and error states
  isAnalyzing: boolean
  error: string | null
  
  // Actions
  startAnalysis: (businessId: string, type: AnalysisType) => Promise<void>
  updateProgress: (sessionId: string, progress: ProgressUpdate) => void
  completeAnalysis: (sessionId: string, result: AnalysisResult) => void
  clearError: () => void
}

// Store implementation following existing patterns
export const useAIAnalysisStore = create<AIAnalysisState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      activeAnalyses: {},
      streamingConnections: {},
      results: {},
      isAnalyzing: false,
      error: null,

      // Analysis lifecycle management
      startAnalysis: async (businessId: string, type: AnalysisType) => {
        set((state) => {
          state.isAnalyzing = true
          state.error = null
          
          const sessionId = `${businessId}-${type}-${Date.now()}`
          state.activeAnalyses[sessionId] = {
            id: sessionId,
            businessId,
            type,
            status: 'initializing',
            progress: 0,
            startTime: new Date(),
          }
        })

        try {
          // Integration with existing API patterns
          const response = await fetch(`/api/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, type }),
          })

          if (!response.ok) throw new Error('Analysis failed to start')
          
          const { sessionId, streamUrl } = await response.json()
          
          // Establish WebSocket connection for real-time updates
          get().setupStreaming(sessionId, streamUrl)
          
        } catch (error) {
          set((state) => {
            state.isAnalyzing = false
            state.error = error instanceof Error ? error.message : 'Unknown error'
          })
        }
      },

      // Real-time progress updates
      updateProgress: (sessionId: string, progress: ProgressUpdate) => {
        set((state) => {
          if (state.activeAnalyses[sessionId]) {
            state.activeAnalyses[sessionId].progress = progress.percentage
            state.activeAnalyses[sessionId].status = progress.stage
            state.activeAnalyses[sessionId].partialResults = progress.partialResults
          }
        })
      },

      // Analysis completion handling
      completeAnalysis: (sessionId: string, result: AnalysisResult) => {
        set((state) => {
          state.isAnalyzing = false
          
          // Move from active to completed
          const analysis = state.activeAnalyses[sessionId]
          if (analysis) {
            state.results[sessionId] = {
              ...result,
              sessionId,
              businessId: analysis.businessId,
              completedAt: new Date(),
            }
            
            // Clean up active analysis
            delete state.activeAnalyses[sessionId]
          }
          
          // Clean up streaming connection
          if (state.streamingConnections[sessionId]) {
            state.streamingConnections[sessionId].close()
            delete state.streamingConnections[sessionId]
          }
        })
      },

      // Error handling
      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      // WebSocket connection management
      setupStreaming: (sessionId: string, streamUrl: string) => {
        const ws = new WebSocket(streamUrl)
        
        ws.onmessage = (event) => {
          const update = JSON.parse(event.data) as ProgressUpdate
          get().updateProgress(sessionId, update)
        }
        
        ws.onclose = () => {
          set((state) => {
            delete state.streamingConnections[sessionId]
          })
        }
        
        ws.onerror = () => {
          set((state) => {
            state.error = 'Streaming connection failed'
            delete state.streamingConnections[sessionId]
          })
        }
        
        set((state) => {
          state.streamingConnections[sessionId] = ws
        })
      },
    }))
  )
)

// Custom hooks for component integration
export const useAIAnalysis = (businessId?: string) => {
  const store = useAIAnalysisStore()
  
  // Filter active analyses for specific business
  const businessAnalyses = businessId 
    ? Object.values(store.activeAnalyses).filter(a => a.businessId === businessId)
    : Object.values(store.activeAnalyses)
    
  // Get results for business
  const businessResults = businessId
    ? Object.values(store.results).filter(r => r.businessId === businessId)
    : Object.values(store.results)
  
  return {
    activeAnalyses: businessAnalyses,
    results: businessResults,
    isAnalyzing: store.isAnalyzing,
    error: store.error,
    startAnalysis: store.startAnalysis,
    clearError: store.clearError,
  }
}
```

---
