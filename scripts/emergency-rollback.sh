#!/bin/bash
# Emergency rollback script for critical ShadCN failures
# This script provides immediate rollback for production issues

set -e  # Exit on any error

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Timestamp: $(date)"
echo "Triggered by: ${ROLLBACK_TRIGGER:-'Manual execution'}"

# Log the emergency rollback
LOG_FILE="logs/emergency-rollback-$(date +%Y%m%d_%H%M%S).log"
mkdir -p logs
exec > >(tee -a "$LOG_FILE") 2>&1

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ CRITICAL ERROR: Not in project root directory"
    exit 1
fi

# Stop any running processes
echo "🛑 Stopping running processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Create emergency backup
echo "💾 Creating emergency backup..."
BACKUP_DIR="backups/emergency-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src/ "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
cp tailwind.config.ts "$BACKUP_DIR/" 2>/dev/null || true

# Determine what needs to be rolled back
ROLLBACK_DEPTH=1
if [ -n "$ROLLBACK_TO_COMMIT" ]; then
    echo "🎯 Rolling back to specific commit: $ROLLBACK_TO_COMMIT"
    git checkout "$ROLLBACK_TO_COMMIT" -- .
elif [ -n "$ROLLBACK_PHASES" ]; then
    echo "📅 Rolling back specific phases: $ROLLBACK_PHASES"
    ROLLBACK_DEPTH=$(echo "$ROLLBACK_PHASES" | tr ',' '\n' | wc -l)
else
    echo "⏪ Rolling back last commit (default)"
fi

# Emergency rollback execution
echo "🔄 Executing emergency rollback..."

# 1. Restore all source files
git checkout HEAD~$ROLLBACK_DEPTH -- src/ 2>/dev/null || {
    echo "❌ CRITICAL: Could not restore source files"
    echo "🆘 MANUAL INTERVENTION REQUIRED"
    exit 1
}

# 2. Restore configuration files
git checkout HEAD~$ROLLBACK_DEPTH -- tailwind.config.ts package.json components.json 2>/dev/null || {
    echo "⚠️  Warning: Could not restore some config files"
}

# 3. Restore theme system
if [ -f "colors.md.backup" ]; then
    cp colors.md.backup colors.md
    echo "✅ Restored theme system"
fi

# 4. Emergency dependency restore
echo "📦 Emergency dependency restore..."
if [ -f "package-lock.json.backup" ]; then
    cp package-lock.json.backup package-lock.json
    npm ci --silent
else
    npm install --silent
fi

# 5. Clear all caches
echo "🧹 Clearing all caches..."
rm -rf .next/ 2>/dev/null || true
rm -rf node_modules/.cache/ 2>/dev/null || true
rm -rf .cache/ 2>/dev/null || true

# 6. Emergency build
echo "🔨 Emergency build..."
if timeout 300 npm run build; then
    echo "✅ Emergency build successful"
else
    echo "❌ CRITICAL: Emergency build failed"
    echo "🆘 MANUAL INTERVENTION REQUIRED"
    
    # Attempt simple fallback
    echo "🔄 Attempting simple fallback..."
    git checkout HEAD~$(($ROLLBACK_DEPTH + 1)) -- .
    npm ci --silent
    
    if timeout 180 npm run build; then
        echo "✅ Fallback build successful"
    else
        echo "❌ CRITICAL: All rollback attempts failed"
        exit 1
    fi
fi

# 7. Verify critical systems
echo "🔍 Verifying critical systems..."

# Check if critical files exist
CRITICAL_FILES=(
    "src/app/page.tsx"
    "src/app/layout.tsx"
    "src/components"
    "tailwind.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ CRITICAL FILE MISSING: $file"
        exit 1
    fi
done

# 8. Start application for verification
echo "🚀 Starting application for verification..."
npm run build > /dev/null 2>&1 &
BUILD_PID=$!

# Wait for build completion
sleep 30

if ps -p $BUILD_PID > /dev/null; then
    echo "⚠️  Build still running, continuing with verification..."
fi

# 9. Health check
echo "🏥 Performing health check..."
if timeout 30 curl -f http://localhost:3000 2>/dev/null; then
    echo "✅ Application responding"
else
    echo "⚠️  Application not responding - may need manual start"
fi

# 10. Final status report
echo ""
echo "🎯 EMERGENCY ROLLBACK COMPLETE"
echo "================================="
echo "📊 Rollback Summary:"
echo "  - Trigger: ${ROLLBACK_TRIGGER:-'Manual'}"
echo "  - Commits rolled back: $ROLLBACK_DEPTH"
echo "  - Backup location: $BACKUP_DIR"
echo "  - Log file: $LOG_FILE"
echo "  - Status: $([ $? -eq 0 ] && echo '✅ SUCCESS' || echo '❌ REQUIRES ATTENTION')"
echo "  - Completion time: $(date)"
echo ""

# Send notification (if configured)
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 Emergency rollback completed on $(hostname). Status: SUCCESS. Check logs for details.\"}" \
        "$SLACK_WEBHOOK" 2>/dev/null || true
fi

echo "📋 IMMEDIATE ACTION REQUIRED:"
echo "  1. ✅ Verify application is working correctly"
echo "  2. ✅ Check all critical business functions"
echo "  3. ✅ Monitor system performance for 1 hour"
echo "  4. ✅ Notify stakeholders of rollback"
echo "  5. ✅ Schedule incident review meeting"
echo "  6. ✅ Document root cause and prevention measures"
echo ""
echo "🔍 Verification checklist:"
echo "  - [ ] Homepage loads correctly"
echo "  - [ ] User authentication works"
echo "  - [ ] Business listings display"
echo "  - [ ] Search functionality works"
echo "  - [ ] Payment system operational"
echo "  - [ ] No console errors"
echo ""
echo "📞 If issues persist, escalate immediately to:"
echo "  - Technical Lead"
echo "  - DevOps Team"
echo "  - Product Owner"