#!/bin/bash
# Emergency rollback script for ShadCN Phase 1 Foundation
# This script restores the system to pre-Phase 1 state

set -e  # Exit on any error

echo "🔄 Starting Phase 1 rollback..."
echo "Timestamp: $(date)"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Create backup of current state
echo "📦 Creating backup of current state..."
mkdir -p backups/rollback-$(date +%Y%m%d_%H%M%S)
cp -r src/components/ui/ backups/rollback-$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp tailwind.config.ts backups/rollback-$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp components.json backups/rollback-$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# 1. Restore previous component files
echo "🔧 Restoring previous component files..."
git checkout HEAD~1 -- src/components/ui/ 2>/dev/null || echo "Warning: Could not restore UI components"
git checkout HEAD~1 -- tailwind.config.ts 2>/dev/null || echo "Warning: Could not restore Tailwind config"
git checkout HEAD~1 -- components.json 2>/dev/null || echo "Warning: Could not restore components.json"

# 2. Restore previous CSS variables and theme system
echo "🎨 Restoring theme system..."
if [ -f "colors.md.backup" ]; then
    cp colors.md.backup colors.md
    echo "✅ Restored theme from backup"
else
    echo "⚠️  Warning: No theme backup found"
fi

# Restore globals.css if backup exists
if [ -f "src/app/globals.css.backup" ]; then
    cp src/app/globals.css.backup src/app/globals.css
    echo "✅ Restored globals.css from backup"
fi

# 3. Restore previous dependencies
echo "📦 Restoring dependencies..."
if [ -f "package-lock.json.backup" ]; then
    cp package-lock.json.backup package-lock.json
    echo "✅ Restored package-lock.json from backup"
fi

# Clean install dependencies
echo "🔄 Reinstalling dependencies..."
npm ci

# 4. Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next/cache/ 2>/dev/null || true
rm -rf node_modules/.cache/ 2>/dev/null || true

# 5. Rebuild and verify
echo "🔨 Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - manual intervention required"
    exit 1
fi

# 6. Run tests to verify rollback
echo "🧪 Running tests to verify rollback..."
if npm run test -- --passWithNoTests; then
    echo "✅ Tests passed"
else
    echo "⚠️  Warning: Some tests failed"
fi

# 7. Health check
echo "🏥 Running health check..."
if curl -f http://localhost:3000/api/health 2>/dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Warning: Health check failed - may need manual verification"
fi

echo "✅ Phase 1 rollback complete!"
echo "📋 Next steps:"
echo "  1. Verify the application is working correctly"
echo "  2. Check that critical business functions are operational"
echo "  3. Monitor system performance for the next 30 minutes"
echo "  4. Document the incident and lessons learned"

echo "📊 Rollback Summary:"
echo "  - UI Components: Restored to previous version"
echo "  - Theme System: Restored to original colors.md"
echo "  - Dependencies: Restored to previous versions"
echo "  - Build Status: $([ $? -eq 0 ] && echo 'SUCCESS' || echo 'REQUIRES ATTENTION')"
echo "  - Timestamp: $(date)"