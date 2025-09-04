# Styling Guidelines

Based on your existing Tailwind CSS 3.4.17 configuration and established colors.md theming system, I'm defining styling approaches that extend current design patterns while supporting AI-specific visualizations, professional reporting, and subscription-based feature presentation.

## Styling Approach

Your existing Tailwind CSS foundation provides excellent support for AI SaaS enhancements through utility-first patterns that integrate seamlessly with ShadCN UI components. The established approach uses:

**Component-First Styling**: ShadCN UI components provide consistent, accessible styling that extends naturally to AI-specific visualizations like health score rings, streaming progress indicators, and portfolio comparison tables.

**CSS Variables Integration**: Your existing colors.md theming system supports dynamic theme switching essential for professional white-labeling and client customization features required for broker and advisor use cases.

**Responsive Design Continuity**: Existing responsive patterns accommodate complex AI dashboards and real-time streaming interfaces while maintaining mobile usability for portfolio management and subscription features.

**Professional Aesthetic**: Current styling supports the sophisticated business intelligence presentation required for financial services while extending to accommodate AI analysis confidence indicators and professional report generation.

## Global Theme Variables

```css
/* /app/globals.css - Enhanced theme system building on existing patterns */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Existing color system (preserved) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    /* NEW: AI-specific color system */
    --ai-confidence-high: 142.1 76.2% 36.3%; /* Green for high confidence */
    --ai-confidence-medium: 47.9 95.8% 53.1%; /* Amber for medium confidence */
    --ai-confidence-low: 0 84.2% 60.2%; /* Red for low confidence */
    --ai-processing: 221.2 83.2% 53.3%; /* Blue for processing states */
    --ai-streaming: 142.1 70.6% 45.3%; /* Animated green for streaming */

    /* NEW: Health score gradient system */
    --health-excellent: 142.1 76.2% 36.3%; /* 80-100 score range */
    --health-good: 173.4 58.5% 39.4%; /* 60-79 score range */
    --health-fair: 47.9 95.8% 53.1%; /* 40-59 score range */
    --health-poor: 0 84.2% 60.2%; /* 0-39 score range */

    /* NEW: Professional reporting colors */
    --report-primary: 222.2 47.4% 11.2%; /* Professional dark blue */
    --report-secondary: 215.4 16.3% 46.9%; /* Muted text */
    --report-accent: 142.1 76.2% 36.3%; /* Success green */
    --report-neutral: 210 40% 96%; /* Light backgrounds */

    /* NEW: Subscription tier colors */
    --tier-free: 215.4 16.3% 46.9%; /* Muted gray */
    --tier-professional: 221.2 83.2% 53.3%; /* Professional blue */
    --tier-enterprise: 271.5 81.3% 55.9%; /* Premium purple */
  }

  .dark {
    /* Existing dark theme (preserved) */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    /* NEW: Dark mode AI colors */
    --ai-confidence-high: 142.1 70.6% 45.3%;
    --ai-confidence-medium: 47.9 95.8% 53.1%;
    --ai-confidence-low: 0 72.2% 50.6%;
    --ai-processing: 217.2 91.2% 59.8%;
    --ai-streaming: 142.1 76.2% 36.3%;

    /* NEW: Dark mode health scores */
    --health-excellent: 142.1 70.6% 45.3%;
    --health-good: 173.4 58.5% 39.4%;
    --health-fair: 47.9 95.8% 53.1%;
    --health-poor: 0 72.2% 50.6%;

    /* NEW: Dark mode professional reporting */
    --report-primary: 210 40% 98%;
    --report-secondary: 215 20.2% 65.1%;
    --report-accent: 142.1 70.6% 45.3%;
    --report-neutral: 217.2 32.6% 17.5%;
  }
}

@layer components {
  /* NEW: AI-specific component classes */
  .ai-confidence-indicator {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium;
  }

  .ai-confidence-high {
    @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400;
    background-color: hsl(var(--ai-confidence-high) / 0.1);
    color: hsl(var(--ai-confidence-high));
  }

  .ai-confidence-medium {
    @apply bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400;
    background-color: hsl(var(--ai-confidence-medium) / 0.1);
    color: hsl(var(--ai-confidence-medium));
  }

  .ai-confidence-low {
    @apply bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400;
    background-color: hsl(var(--ai-confidence-low) / 0.1);
    color: hsl(var(--ai-confidence-low));
  }

  /* NEW: Health score ring component styles */
  .health-score-ring {
    @apply relative inline-flex items-center justify-center;
  }

  .health-score-ring svg {
    @apply transform -rotate-90;
  }

  .health-score-ring .background-ring {
    @apply stroke-muted;
  }

  .health-score-ring .progress-ring {
    @apply transition-all duration-1000 ease-out;
    stroke-linecap: round;
  }

  .health-excellent .progress-ring {
    stroke: hsl(var(--health-excellent));
  }

  .health-good .progress-ring {
    stroke: hsl(var(--health-good));
  }

  .health-fair .progress-ring {
    stroke: hsl(var(--health-fair));
  }

  .health-poor .progress-ring {
    stroke: hsl(var(--health-poor));
  }

  /* NEW: Streaming animation for AI analysis */
  .ai-streaming-pulse {
    @apply animate-pulse;
    animation-duration: 2s;
  }

  .ai-streaming-progress {
    @apply relative overflow-hidden;
  }

  .ai-streaming-progress::after {
    @apply absolute inset-0 -translate-x-full;
    content: '';
    background: linear-gradient(
      90deg,
      transparent,
      hsl(var(--ai-streaming) / 0.4),
      transparent
    );
    animation: streaming-shimmer 2s infinite;
  }

  /* NEW: Professional report styling */
  .report-layout {
    @apply max-w-4xl mx-auto bg-card text-card-foreground;
    color: hsl(var(--report-primary));
  }

  .report-header {
    @apply border-b-2 pb-6 mb-8;
    border-color: hsl(var(--report-primary));
  }

  .report-section {
    @apply mb-8 last:mb-0;
  }

  .report-table {
    @apply w-full border-collapse;
  }

  .report-table th,
  .report-table td {
    @apply border p-3 text-left;
    border-color: hsl(var(--border));
  }

  .report-table th {
    @apply font-semibold bg-muted;
    background-color: hsl(var(--report-neutral));
  }

  /* NEW: Subscription tier styling */
  .tier-badge {
    @apply inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide;
  }

  .tier-free {
    @apply bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300;
  }

  .tier-professional {
    @apply bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400;
  }

  .tier-enterprise {
    @apply bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400;
  }
}

@layer utilities {
  /* NEW: Animation utilities for AI features */
  @keyframes streaming-shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes health-score-fill {
    0% {
      stroke-dashoffset: 283;
    }
    100% {
      stroke-dashoffset: var(--progress-offset);
    }
  }

  .animate-streaming-shimmer {
    animation: streaming-shimmer 2s infinite;
  }

  .animate-health-score-fill {
    animation: health-score-fill 2s ease-out forwards;
  }
}
```

---
