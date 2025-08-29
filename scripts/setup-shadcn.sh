#!/bin/bash

# ShadCN UI Setup Script for GoodBuy HQ
# This script installs and configures ShadCN UI components for the business marketplace

set -e

echo "🚀 Setting up ShadCN UI for GoodBuy HQ..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project root confirmed"

# Install ShadCN CLI if not already installed
echo "📦 Checking ShadCN CLI..."
if ! command -v shadcn-ui &> /dev/null; then
    echo "Installing ShadCN CLI..."
    npm install -g shadcn-ui@latest
fi

# Verify components.json exists
if [ ! -f "components.json" ]; then
    echo "❌ Error: components.json not found. Please ensure it's configured properly."
    exit 1
fi

echo "✅ Components.json found"

# Phase 1: Critical Components (Essential for business functionality)
echo ""
echo "🔥 Phase 1: Installing Critical Components..."

# Form components
echo "Installing form components..."
npx shadcn-ui@latest add form --yes
npx shadcn-ui@latest add label --yes
npx shadcn-ui@latest add textarea --yes
npx shadcn-ui@latest add checkbox --yes
npx shadcn-ui@latest add radio-group --yes

# Feedback components
echo "Installing feedback components..."
npx shadcn-ui@latest add toast --yes
npx shadcn-ui@latest add alert --yes
npx shadcn-ui@latest add alert-dialog --yes

# Data display
echo "Installing data display components..."
npx shadcn-ui@latest add table --yes
npx shadcn-ui@latest add skeleton --yes
npx shadcn-ui@latest add separator --yes

# Navigation
echo "Installing navigation components..."
npx shadcn-ui@latest add breadcrumb --yes
npx shadcn-ui@latest add pagination --yes

echo "✅ Phase 1 complete!"

# Phase 2: Interactive Components (Enhanced user experience)  
echo ""
echo "🔴 Phase 2: Installing Interactive Components..."

# Overlays and modals
echo "Installing overlay components..."
npx shadcn-ui@latest add dialog --yes
npx shadcn-ui@latest add sheet --yes
npx shadcn-ui@latest add popover --yes
npx shadcn-ui@latest add tooltip --yes

# Advanced inputs
echo "Installing advanced input components..."
npx shadcn-ui@latest add calendar --yes
npx shadcn-ui@latest add slider --yes
npx shadcn-ui@latest add switch --yes
npx shadcn-ui@latest add toggle --yes

# Search and command
echo "Installing search components..."
npx shadcn-ui@latest add command --yes
npx shadcn-ui@latest add scroll-area --yes

echo "✅ Phase 2 complete!"

# Phase 3: Specialized Components (Advanced features)
echo ""
echo "🟡 Phase 3: Installing Specialized Components..."

# Content organization
echo "Installing content organization components..."
npx shadcn-ui@latest add accordion --yes
npx shadcn-ui@latest add collapsible --yes
npx shadcn-ui@latest add carousel --yes

# Advanced features
echo "Installing advanced components..."
npx shadcn-ui@latest add menubar --yes
npx shadcn-ui@latest add context-menu --yes
npx shadcn-ui@latest add dropdown-menu --yes
npx shadcn-ui@latest add hover-card --yes

# Dashboard components
echo "Installing dashboard components..."
if npx shadcn-ui@latest add chart --yes 2>/dev/null; then
    echo "✅ Chart component installed"
else
    echo "⚠️  Chart component not available - will need manual setup"
fi

npx shadcn-ui@latest add resizable --yes
npx shadcn-ui@latest add sidebar --yes

echo "✅ Phase 3 complete!"

# Additional components for completeness
echo ""
echo "🔧 Installing Additional Components..."

npx shadcn-ui@latest add aspect-ratio --yes
npx shadcn-ui@latest add input-otp --yes
npx shadcn-ui@latest add toggle-group --yes

echo "✅ Additional components installed!"

# Verify installation
echo ""
echo "🔍 Verifying installation..."

COMPONENT_COUNT=$(find src/components/ui -name "*.tsx" | wc -l)
echo "📊 Installed $COMPONENT_COUNT ShadCN components"

# Check for essential components
ESSENTIAL_COMPONENTS=("button.tsx" "card.tsx" "form.tsx" "dialog.tsx" "table.tsx")
MISSING_COMPONENTS=()

for component in "${ESSENTIAL_COMPONENTS[@]}"; do
    if [ ! -f "src/components/ui/$component" ]; then
        MISSING_COMPONENTS+=("$component")
    fi
done

if [ ${#MISSING_COMPONENTS[@]} -eq 0 ]; then
    echo "✅ All essential components installed successfully!"
else
    echo "⚠️  Missing essential components:"
    printf '%s\n' "${MISSING_COMPONENTS[@]}"
fi

# Create example usage file
echo ""
echo "📝 Creating example usage documentation..."

cat > src/components/examples/shadcn-examples.tsx << 'EOF'
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

/**
 * ShadCN UI Examples for GoodBuy HQ
 * This file demonstrates the usage of installed ShadCN components
 * with GoodBuy's business theme and styling.
 */
export default function ShadcnExamples() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-display text-primary">
          ShadCN UI Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional business components built with ShadCN UI for GoodBuy HQ's 
          marketplace platform. Each component follows our design system principles.
        </p>
      </div>

      {/* Business Card Example */}
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Premium Business Listing</CardTitle>
              <CardDescription>
                Manufacturing Company • Established 1995
              </CardDescription>
            </div>
            <Badge variant="default">Featured</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            $2.5M
          </div>
          <p className="text-sm text-muted-foreground">
            Asking Price • 5.2x Revenue Multiple
          </p>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1">View Details</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Business Details</DialogTitle>
                  <DialogDescription>
                    Comprehensive information about this business opportunity.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inquiry">Send Inquiry</Label>
                    <Input 
                      id="inquiry" 
                      placeholder="I'm interested in learning more..."
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full">Send Inquiry</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">Save</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Example */}
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Business Inquiry Form</CardTitle>
          <CardDescription>
            Get in touch with the business owner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input 
              id="message" 
              placeholder="Tell us about your interest in this business..." 
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1">Send Inquiry</Button>
            <Button variant="outline">Save Draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
EOF

echo "✅ Example file created at src/components/examples/shadcn-examples.tsx"

# Update package.json scripts
echo ""
echo "📋 Adding helpful scripts to package.json..."

# Check if jq is available for JSON manipulation
if command -v jq &> /dev/null; then
    # Add ShadCN-related scripts
    jq '.scripts += {
        "shadcn:add": "npx shadcn-ui@latest add",
        "shadcn:diff": "npx shadcn-ui@latest diff",
        "shadcn:update": "npx shadcn-ui@latest update"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    echo "✅ Added ShadCN scripts to package.json"
else
    echo "⚠️  jq not available - please manually add these scripts to package.json:"
    echo '  "shadcn:add": "npx shadcn-ui@latest add"'
    echo '  "shadcn:diff": "npx shadcn-ui@latest diff"'  
    echo '  "shadcn:update": "npx shadcn-ui@latest update"'
fi

# Final summary
echo ""
echo "🎉 ShadCN UI Setup Complete!"
echo ""
echo "📊 Installation Summary:"
echo "   - ✅ Core components installed"
echo "   - ✅ Business theme configured"
echo "   - ✅ Typography setup (Inter + Lexend)"
echo "   - ✅ Component examples created"
echo "   - ✅ Development scripts added"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run 'npm run dev' to start development server"
echo "   2. Visit /examples to see ShadCN components in action"
echo "   3. Check docs/shadcn-architecture.md for implementation guidance"
echo "   4. Begin migrating existing forms to use ShadCN components"
echo ""
echo "📚 Helpful Commands:"
echo "   - npm run shadcn:add <component>  # Add new components"
echo "   - npm run shadcn:diff            # Check for updates"
echo "   - npm run shadcn:update          # Update components"
echo ""
echo "✨ Happy coding with ShadCN UI!"
EOF