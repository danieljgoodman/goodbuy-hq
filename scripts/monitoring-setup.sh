#!/bin/bash
# Setup monitoring infrastructure for ShadCN rollback system
# This script configures automated monitoring and alerting

set -e

echo "📊 Setting up ShadCN monitoring infrastructure..."
echo "Timestamp: $(date)"

# Create monitoring directories
echo "📁 Creating monitoring directories..."
mkdir -p monitoring/{logs,metrics,alerts,dashboards}
mkdir -p scripts/health-checks
mkdir -p .github/workflows

# Create performance monitoring script
cat > scripts/health-checks/performance-monitor.js << 'EOF'
#!/usr/bin/env node
// Performance monitoring script for ShadCN components
const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
  performanceScore: 85,
  bundleSize: 500 * 1024, // 500KB
  renderTime: 16, // 60fps
  errorRate: 0.01, // 1%
};

async function checkPerformance() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    status: 'healthy'
  };

  try {
    // Check bundle size
    const statsPath = path.join(process.cwd(), '.next/analyze/bundle.json');
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      const totalSize = stats.assets.reduce((total, asset) => total + asset.size, 0);
      
      results.checks.bundleSize = {
        actual: totalSize,
        threshold: THRESHOLDS.bundleSize,
        status: totalSize < THRESHOLDS.bundleSize ? 'healthy' : 'critical'
      };
      
      if (results.checks.bundleSize.status === 'critical') {
        results.status = 'critical';
      }
    }

    // Check application response time
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:3000');
      const responseTime = Date.now() - startTime;
      
      results.checks.responseTime = {
        actual: responseTime,
        threshold: 1000, // 1 second
        status: responseTime < 1000 ? 'healthy' : 'warning'
      };
    } catch (error) {
      results.checks.responseTime = {
        error: error.message,
        status: 'critical'
      };
      results.status = 'critical';
    }

    // Check error logs
    const errorLogPath = path.join(process.cwd(), 'logs/errors.log');
    if (fs.existsSync(errorLogPath)) {
      const errorLog = fs.readFileSync(errorLogPath, 'utf8');
      const recentErrors = errorLog.split('\n').filter(line => {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return line && new Date(line.split(' ')[0]).getTime() > oneDayAgo;
      });
      
      results.checks.errorRate = {
        actual: recentErrors.length,
        threshold: 10,
        status: recentErrors.length < 10 ? 'healthy' : 'warning'
      };
    }

  } catch (error) {
    results.error = error.message;
    results.status = 'critical';
  }

  // Write results
  const outputPath = path.join(process.cwd(), 'monitoring/metrics/performance-latest.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Trigger alerts if needed
  if (results.status === 'critical') {
    console.error('🚨 CRITICAL PERFORMANCE ISSUE DETECTED');
    console.error(JSON.stringify(results, null, 2));
    process.exit(1);
  } else if (results.status === 'warning') {
    console.warn('⚠️ Performance warning detected');
    console.warn(JSON.stringify(results, null, 2));
  } else {
    console.log('✅ All performance checks passed');
  }

  return results;
}

checkPerformance().catch(error => {
  console.error('❌ Performance monitoring failed:', error);
  process.exit(1);
});
EOF

chmod +x scripts/health-checks/performance-monitor.js

# Create component health check script
cat > scripts/health-checks/component-health.js << 'EOF'
#!/usr/bin/env node
// Component health monitoring for ShadCN components
const fs = require('fs');
const path = require('path');

const CRITICAL_COMPONENTS = [
  'button.tsx',
  'card.tsx', 
  'form.tsx',
  'input.tsx',
  'dialog.tsx'
];

async function checkComponents() {
  const results = {
    timestamp: new Date().toISOString(),
    components: {},
    status: 'healthy'
  };

  const uiPath = path.join(process.cwd(), 'src/components/ui');
  
  if (!fs.existsSync(uiPath)) {
    results.status = 'critical';
    results.error = 'UI components directory not found';
    return results;
  }

  for (const component of CRITICAL_COMPONENTS) {
    const componentPath = path.join(uiPath, component);
    
    if (fs.existsSync(componentPath)) {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Basic syntax check
        const hasExport = content.includes('export');
        const hasReact = content.includes('React') || content.includes('import');
        
        results.components[component] = {
          exists: true,
          size: content.length,
          hasExport,
          hasReact,
          status: hasExport && hasReact ? 'healthy' : 'warning'
        };
        
        if (results.components[component].status === 'warning') {
          results.status = 'warning';
        }
      } catch (error) {
        results.components[component] = {
          exists: true,
          error: error.message,
          status: 'critical'
        };
        results.status = 'critical';
      }
    } else {
      results.components[component] = {
        exists: false,
        status: 'critical'
      };
      results.status = 'critical';
    }
  }

  // Write results
  const outputPath = path.join(process.cwd(), 'monitoring/metrics/components-latest.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  if (results.status === 'critical') {
    console.error('🚨 CRITICAL COMPONENT ISSUE DETECTED');
    console.error(JSON.stringify(results, null, 2));
    process.exit(1);
  } else if (results.status === 'warning') {
    console.warn('⚠️ Component warning detected');
    console.warn(JSON.stringify(results, null, 2));
  } else {
    console.log('✅ All component checks passed');
  }

  return results;
}

checkComponents().catch(error => {
  console.error('❌ Component monitoring failed:', error);
  process.exit(1);
});
EOF

chmod +x scripts/health-checks/component-health.js

# Create automated monitoring cron job
cat > scripts/start-monitoring.sh << 'EOF'
#!/bin/bash
# Start automated monitoring for ShadCN system

echo "🚀 Starting ShadCN monitoring system..."

# Create monitoring log directory
mkdir -p logs/monitoring

# Start performance monitoring (every 30 seconds)
while true; do
    echo "$(date): Running performance check..." >> logs/monitoring/monitor.log
    node scripts/health-checks/performance-monitor.js >> logs/monitoring/performance.log 2>&1
    
    if [ $? -ne 0 ]; then
        echo "$(date): ⚠️ Performance check failed, triggering investigation..." >> logs/monitoring/monitor.log
        # Could trigger rollback here based on severity
    fi
    
    sleep 30
done &

# Start component monitoring (every 60 seconds)
while true; do
    echo "$(date): Running component check..." >> logs/monitoring/monitor.log
    node scripts/health-checks/component-health.js >> logs/monitoring/components.log 2>&1
    
    if [ $? -ne 0 ]; then
        echo "$(date): ⚠️ Component check failed, requires attention..." >> logs/monitoring/monitor.log
    fi
    
    sleep 60
done &

echo "✅ Monitoring system started"
echo "📊 Logs available in logs/monitoring/"
echo "🛑 To stop monitoring: pkill -f 'start-monitoring'"
EOF

chmod +x scripts/start-monitoring.sh

# Create GitHub Action for automated monitoring
cat > .github/workflows/shadcn-monitoring.yml << 'EOF'
name: ShadCN Monitoring & Safety

on:
  push:
    branches: [main]
    paths:
      - 'src/components/ui/**'
      - 'tailwind.config.ts'
      - 'components.json'
  pull_request:
    branches: [main]
    paths:
      - 'src/components/ui/**'
      - 'tailwind.config.ts' 
      - 'components.json'
  schedule:
    - cron: '*/30 * * * *' # Every 30 minutes

jobs:
  safety-monitoring:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Run performance checks
        run: node scripts/health-checks/performance-monitor.js
      
      - name: Run component health checks
        run: node scripts/health-checks/component-health.js
      
      - name: Bundle size analysis
        run: |
          npm run build
          du -sh .next/static > bundle-size.txt
          cat bundle-size.txt
          
          # Check if bundle size exceeds threshold
          SIZE=$(du -s .next/static | cut -f1)
          if [ $SIZE -gt 500 ]; then
            echo "❌ Bundle size exceeded: ${SIZE}KB > 500KB"
            exit 1
          fi
      
      - name: Accessibility check
        run: |
          if command -v axe &> /dev/null; then
            axe http://localhost:3000 --exit
          else
            echo "⚠️ Axe-core not available, skipping accessibility check"
          fi
      
      - name: Emergency rollback on failure
        if: failure()
        run: |
          echo "🚨 Safety checks failed, preparing rollback..."
          chmod +x scripts/emergency-rollback.sh
          
          # In production, this would trigger rollback
          echo "Would trigger emergency rollback here"
          
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '🚨 ShadCN monitoring detected issues - immediate attention required'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      
      - name: Store monitoring data
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: monitoring-data
          path: monitoring/metrics/
          retention-days: 30
EOF

# Create monitoring dashboard template
cat > monitoring/dashboards/health-dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShadCN Health Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 8px 16px; border-radius: 4px; font-weight: bold; }
        .healthy { background: #10b981; color: white; }
        .warning { background: #f59e0b; color: white; }
        .critical { background: #ef4444; color: white; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        h1 { color: #1f2937; margin-bottom: 30px; }
        h2 { color: #374151; margin-top: 0; }
    </style>
</head>
<body>
    <h1>🏥 ShadCN System Health Dashboard</h1>
    
    <div class="dashboard">
        <div class="card">
            <h2>Overall Status</h2>
            <div id="overall-status" class="status healthy">Healthy</div>
            <p id="last-updated">Last updated: Loading...</p>
        </div>
        
        <div class="card">
            <h2>Performance Metrics</h2>
            <div class="metric">
                <span>Bundle Size:</span>
                <span id="bundle-size">Loading...</span>
            </div>
            <div class="metric">
                <span>Response Time:</span>
                <span id="response-time">Loading...</span>
            </div>
            <div class="metric">
                <span>Error Rate:</span>
                <span id="error-rate">Loading...</span>
            </div>
        </div>
        
        <div class="card">
            <h2>Component Health</h2>
            <div id="component-status">Loading...</div>
        </div>
        
        <div class="card">
            <h2>Recent Activity</h2>
            <canvas id="activity-chart" width="400" height="200"></canvas>
        </div>
    </div>

    <script>
        async function loadDashboard() {
            try {
                // Load performance data
                const perfResponse = await fetch('../metrics/performance-latest.json');
                const perfData = await perfResponse.json();
                
                // Load component data  
                const compResponse = await fetch('../metrics/components-latest.json');
                const compData = await compResponse.json();
                
                updateDashboard(perfData, compData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                document.getElementById('overall-status').textContent = 'Error Loading';
                document.getElementById('overall-status').className = 'status critical';
            }
        }
        
        function updateDashboard(perfData, compData) {
            // Update overall status
            const overallStatus = document.getElementById('overall-status');
            overallStatus.textContent = perfData.status === 'healthy' ? 'Healthy' : 
                                       perfData.status === 'warning' ? 'Warning' : 'Critical';
            overallStatus.className = `status ${perfData.status}`;
            
            // Update last updated
            document.getElementById('last-updated').textContent = 
                `Last updated: ${new Date(perfData.timestamp).toLocaleString()}`;
            
            // Update performance metrics
            if (perfData.checks.bundleSize) {
                document.getElementById('bundle-size').textContent = 
                    `${Math.round(perfData.checks.bundleSize.actual / 1024)}KB`;
            }
            
            if (perfData.checks.responseTime) {
                document.getElementById('response-time').textContent = 
                    `${perfData.checks.responseTime.actual}ms`;
            }
            
            if (perfData.checks.errorRate) {
                document.getElementById('error-rate').textContent = 
                    `${perfData.checks.errorRate.actual}`;
            }
            
            // Update component status
            const componentDiv = document.getElementById('component-status');
            componentDiv.innerHTML = '';
            
            Object.entries(compData.components).forEach(([name, data]) => {
                const div = document.createElement('div');
                div.className = 'metric';
                div.innerHTML = `
                    <span>${name}:</span>
                    <span class="status ${data.status}">${data.status}</span>
                `;
                componentDiv.appendChild(div);
            });
        }
        
        // Load dashboard on page load
        loadDashboard();
        
        // Refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
EOF

echo "✅ Monitoring infrastructure setup complete!"
echo ""
echo "📊 Created monitoring components:"
echo "  - Performance monitoring script"
echo "  - Component health checking"  
echo "  - Automated monitoring daemon"
echo "  - GitHub Actions workflow"
echo "  - Health dashboard template"
echo ""
echo "🚀 To start monitoring:"
echo "  ./scripts/start-monitoring.sh"
echo ""
echo "📈 Dashboard available at:"
echo "  monitoring/dashboards/health-dashboard.html"
echo ""
echo "📋 Next steps:"
echo "  1. Configure Slack webhook for alerts (optional)"
echo "  2. Start monitoring daemon"
echo "  3. Verify GitHub Actions workflow"
echo "  4. Test rollback procedures in staging"