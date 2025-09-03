const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FinancialHealthTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = path.join(__dirname, '..', 'test-screenshots');
    this.testResults = {
      passed: [],
      failed: [],
      warnings: [],
      screenshots: []
    };
    this.testCredentials = {
      email: 'testowner@goodbuyhq.com',
      password: 'TestOwner123!'
    };
    this.expectedBusinessId = 'cmf49hdp00001ul0uias7iybz';
    this.baseUrl = 'http://localhost:3000';
  }

  async setup() {
    console.log('🚀 Setting up Puppeteer browser...');
    
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Set up console monitoring
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.testResults.failed.push(`Console Error: ${text}`);
        console.error(`🔴 Console Error: ${text}`);
      } else if (type === 'warning') {
        this.testResults.warnings.push(`Console Warning: ${text}`);
        console.warn(`⚠️  Console Warning: ${text}`);
      } else if (text.includes('React') || text.includes('Decimal') || text.includes('serializ')) {
        console.log(`📝 Console: ${text}`);
      }
    });

    // Set up page error monitoring
    this.page.on('pageerror', error => {
      this.testResults.failed.push(`Page Error: ${error.message}`);
      console.error(`🔴 Page Error: ${error.message}`);
    });

    console.log('✅ Browser setup complete');
  }

  async takeScreenshot(name, description = '') {
    const filename = `${Date.now()}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    
    this.testResults.screenshots.push({
      name,
      filename,
      filepath,
      description,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📸 Screenshot saved: ${filename} - ${description}`);
    return filepath;
  }

  async waitForNetworkIdle(timeout = 30000) {
    try {
      // Puppeteer uses waitForLoadState differently
      await this.page.waitForLoadState('networkidle0', { timeout });
    } catch (error) {
      // Fallback - use setTimeout wrapped in Promise
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async test1_NavigateToFinancialHealthPage() {
    console.log('🧪 Test 1: Navigate to Financial Health page');
    
    try {
      await this.page.goto(`${this.baseUrl}/financial-health`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      await this.takeScreenshot('01-initial-navigation', 'Initial navigation to financial health page');
      
      const title = await this.page.title();
      console.log(`📄 Page title: ${title}`);
      
      // Check if we're redirected to login
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
        this.testResults.passed.push('✅ Correctly redirected to authentication');
        console.log('✅ Correctly redirected to authentication');
      } else {
        this.testResults.warnings.push('⚠️ Not redirected to authentication - might be already logged in');
        console.log('⚠️ Not redirected to authentication - might be already logged in');
      }
      
      return true;
    } catch (error) {
      this.testResults.failed.push(`❌ Navigation failed: ${error.message}`);
      console.error(`❌ Navigation failed: ${error.message}`);
      return false;
    }
  }

  async test2_HandleAuthentication() {
    console.log('🧪 Test 2: Handle Authentication');
    
    try {
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
        await this.takeScreenshot('02-login-page', 'Login page displayed');
        
        // Look for email input field
        const emailSelector = 'input[name="email"], input[type="email"], input[placeholder*="email"]';
        await this.page.waitForSelector(emailSelector, { timeout: 10000 });
        
        // Fill in credentials
        await this.page.type(emailSelector, this.testCredentials.email);
        
        const passwordSelector = 'input[name="password"], input[type="password"]';
        await this.page.waitForSelector(passwordSelector, { timeout: 5000 });
        await this.page.type(passwordSelector, this.testCredentials.password);
        
        await this.takeScreenshot('03-credentials-entered', 'Credentials entered');
        
        // Submit login form
        const submitSelector = 'button[type="submit"], button:contains("Sign in"), button:contains("Login")';
        await this.page.click(submitSelector);
        
        // Wait for navigation after login
        await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
        
        this.testResults.passed.push('✅ Authentication completed');
        console.log('✅ Authentication completed');
      } else {
        this.testResults.passed.push('✅ Already authenticated');
        console.log('✅ Already authenticated');
      }
      
      // Ensure we're on the financial health page
      if (!this.page.url().includes('/financial-health')) {
        await this.page.goto(`${this.baseUrl}/financial-health`, { 
          waitUntil: 'networkidle0',
          timeout: 15000 
        });
      }
      
      await this.takeScreenshot('04-post-auth-page', 'Page after authentication');
      return true;
      
    } catch (error) {
      this.testResults.failed.push(`❌ Authentication failed: ${error.message}`);
      console.error(`❌ Authentication failed: ${error.message}`);
      await this.takeScreenshot('04-auth-error', 'Authentication error state');
      return false;
    }
  }

  async test3_VerifyPageLoadsWithoutErrors() {
    console.log('🧪 Test 3: Verify page loads without React serialization errors');
    
    try {
      // Wait for page to fully load
      await this.waitForNetworkIdle();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Allow time for React to render
      
      await this.takeScreenshot('05-page-loaded', 'Financial health page fully loaded');
      
      // Check for specific React error patterns
      const pageContent = await this.page.content();
      const reactErrors = [
        'Objects are not valid as a React child',
        'Decimal objects are not supported',
        'object Date',
        'Cannot convert',
        'Serialization'
      ];
      
      let hasReactErrors = false;
      for (const errorPattern of reactErrors) {
        if (pageContent.toLowerCase().includes(errorPattern.toLowerCase())) {
          hasReactErrors = true;
          this.testResults.failed.push(`❌ React serialization error found: ${errorPattern}`);
          console.error(`❌ React serialization error found: ${errorPattern}`);
        }
      }
      
      if (!hasReactErrors) {
        this.testResults.passed.push('✅ No React serialization errors detected');
        console.log('✅ No React serialization errors detected');
      }
      
      // Check if page has expected elements
      const hasHeading = await this.page.$('h1, h2') !== null;
      if (hasHeading) {
        const headingText = await this.page.$eval('h1, h2', el => el.textContent);
        console.log(`📄 Page heading: ${headingText}`);
        this.testResults.passed.push(`✅ Page has heading: ${headingText}`);
      }
      
      return !hasReactErrors;
      
    } catch (error) {
      this.testResults.failed.push(`❌ Page load verification failed: ${error.message}`);
      console.error(`❌ Page load verification failed: ${error.message}`);
      return false;
    }
  }

  async test4_VerifyBusinessListAndTechCorp() {
    console.log('🧪 Test 4: Verify business list loads and TechCorp Solutions appears');
    
    try {
      // Wait for businesses to load
      await this.waitForNetworkIdle();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for business list elements
      const businessSelectors = [
        '[data-testid*="business"]',
        '.business-item',
        '.business-card',
        'li:contains("TechCorp")',
        '*:contains("TechCorp Solutions")'
      ];
      
      let businessFound = false;
      let businessListFound = false;
      
      for (const selector of businessSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            businessListFound = true;
            console.log(`📋 Found ${elements.length} business elements with selector: ${selector}`);
            
            // Check if TechCorp is in the list
            const pageText = await this.page.content();
            if (pageText.includes('TechCorp Solutions') || pageText.includes('TechCorp')) {
              businessFound = true;
              this.testResults.passed.push('✅ TechCorp Solutions found in business list');
              console.log('✅ TechCorp Solutions found in business list');
              break;
            }
          }
        } catch (err) {
          // Continue to next selector
        }
      }
      
      // Alternative approach: check page content directly
      if (!businessFound) {
        const pageText = await this.page.content();
        if (pageText.includes('TechCorp') || pageText.includes(this.expectedBusinessId)) {
          businessFound = true;
          this.testResults.passed.push('✅ TechCorp data found in page content');
          console.log('✅ TechCorp data found in page content');
        }
      }
      
      if (!businessListFound) {
        this.testResults.warnings.push('⚠️ No business list elements found with standard selectors');
        console.log('⚠️ No business list elements found with standard selectors');
      }
      
      if (!businessFound) {
        this.testResults.failed.push('❌ TechCorp Solutions not found in business list');
        console.error('❌ TechCorp Solutions not found in business list');
      }
      
      await this.takeScreenshot('06-business-list', 'Business list verification');
      
      // Check for loading states
      const hasLoadingIndicator = await this.page.$('.loading, .spinner, [data-loading="true"]') !== null;
      if (hasLoadingIndicator) {
        this.testResults.warnings.push('⚠️ Loading indicator still visible');
        console.log('⚠️ Loading indicator still visible');
      }
      
      return businessFound;
      
    } catch (error) {
      this.testResults.failed.push(`❌ Business list verification failed: ${error.message}`);
      console.error(`❌ Business list verification failed: ${error.message}`);
      return false;
    }
  }

  async test5_VerifyAnalyzeHealthButton() {
    console.log('🧪 Test 5: Verify Analyze Health button visibility and functionality');
    
    try {
      await this.waitForNetworkIdle();
      
      // Look for Analyze Health button with various selectors
      const buttonSelectors = [
        'button:contains("Analyze Health")',
        '[data-testid*="analyze"]',
        'button[href*="dashboard/health"]',
        'a[href*="dashboard/health"]',
        '.analyze-button',
        'button:contains("Analyze")'
      ];
      
      let buttonFound = false;
      let buttonElement = null;
      
      for (const selector of buttonSelectors) {
        try {
          // For CSS selectors that don't support :contains, check manually
          if (selector.includes(':contains')) {
            const buttons = await this.page.$$('button, a');
            for (const button of buttons) {
              const text = await button.evaluate(el => el.textContent || '');
              if (text.toLowerCase().includes('analyze')) {
                buttonElement = button;
                buttonFound = true;
                console.log(`🔘 Found Analyze Health button with text: "${text}"`);
                break;
              }
            }
            if (buttonFound) break;
          } else {
            buttonElement = await this.page.$(selector);
            if (buttonElement) {
              buttonFound = true;
              console.log(`🔘 Found Analyze Health button with selector: ${selector}`);
              break;
            }
          }
        } catch (err) {
          // Continue to next selector
        }
      }
      
      if (buttonFound && buttonElement) {
        this.testResults.passed.push('✅ Analyze Health button found');
        
        // Check if button is visible and enabled
        const isVisible = await buttonElement.isVisible();
        const isEnabled = await buttonElement.evaluate(el => !el.disabled);
        
        if (isVisible) {
          this.testResults.passed.push('✅ Analyze Health button is visible');
          console.log('✅ Analyze Health button is visible');
        } else {
          this.testResults.failed.push('❌ Analyze Health button is not visible');
          console.error('❌ Analyze Health button is not visible');
        }
        
        if (isEnabled) {
          this.testResults.passed.push('✅ Analyze Health button is enabled');
          console.log('✅ Analyze Health button is enabled');
        } else {
          this.testResults.warnings.push('⚠️ Analyze Health button is disabled');
          console.log('⚠️ Analyze Health button is disabled');
        }
        
        await this.takeScreenshot('07-analyze-button-found', 'Analyze Health button located');
        
        // Test button click
        if (isVisible && isEnabled) {
          console.log('🖱️ Testing button click...');
          await buttonElement.click();
          await this.page.waitForTimeout(2000); // Wait for potential navigation
          
          const newUrl = this.page.url();
          if (newUrl.includes('/dashboard/health') || newUrl.includes(this.expectedBusinessId)) {
            this.testResults.passed.push('✅ Button click navigates to health dashboard');
            console.log(`✅ Button click navigates to health dashboard: ${newUrl}`);
          } else {
            this.testResults.warnings.push(`⚠️ Button click might not navigate correctly. Current URL: ${newUrl}`);
            console.log(`⚠️ Button click might not navigate correctly. Current URL: ${newUrl}`);
          }
          
          await this.takeScreenshot('08-after-button-click', 'Page after clicking Analyze Health button');
        }
        
        return true;
        
      } else {
        this.testResults.failed.push('❌ Analyze Health button not found');
        console.error('❌ Analyze Health button not found');
        
        // Debug: Get all buttons and their text
        const allButtons = await this.page.$$eval('button, a', buttons => 
          buttons.map(btn => ({
            tag: btn.tagName,
            text: btn.textContent || '',
            class: btn.className || '',
            href: btn.href || '',
            id: btn.id || ''
          })).filter(btn => btn.text.trim() !== '').slice(0, 10)
        );
        
        console.log('🔍 All buttons found on page:', JSON.stringify(allButtons, null, 2));
        this.testResults.warnings.push(`⚠️ Available buttons: ${JSON.stringify(allButtons)}`);
        
        await this.takeScreenshot('07-no-analyze-button', 'Page when Analyze Health button not found');
        return false;
      }
      
    } catch (error) {
      this.testResults.failed.push(`❌ Button verification failed: ${error.message}`);
      console.error(`❌ Button verification failed: ${error.message}`);
      return false;
    }
  }

  async test6_VerifyDashboardNavigation() {
    console.log('🧪 Test 6: Verify dashboard navigation');
    
    try {
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/dashboard/health')) {
        this.testResults.passed.push('✅ Successfully navigated to health dashboard');
        console.log(`✅ Successfully navigated to health dashboard: ${currentUrl}`);
        
        // Wait for dashboard to load
        await this.waitForNetworkIdle();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await this.takeScreenshot('09-dashboard-loaded', 'Health dashboard loaded');
        
        // Check for dashboard elements
        const dashboardElements = await this.page.$$eval('*', elements => 
          elements.filter(el => 
            el.textContent && (
              el.textContent.includes('Health') ||
              el.textContent.includes('Dashboard') ||
              el.textContent.includes('TechCorp')
            )
          ).slice(0, 5).map(el => ({
            tag: el.tagName,
            text: el.textContent.substring(0, 100)
          }))
        );
        
        if (dashboardElements.length > 0) {
          this.testResults.passed.push(`✅ Dashboard content loaded with ${dashboardElements.length} relevant elements`);
          console.log(`✅ Dashboard content loaded with ${dashboardElements.length} relevant elements`);
        }
        
        return true;
        
      } else {
        this.testResults.failed.push(`❌ Not on dashboard page. Current URL: ${currentUrl}`);
        console.error(`❌ Not on dashboard page. Current URL: ${currentUrl}`);
        
        // Try to navigate directly to dashboard
        const dashboardUrl = `${this.baseUrl}/dashboard/health/${this.expectedBusinessId}`;
        console.log(`🔄 Attempting direct navigation to: ${dashboardUrl}`);
        
        await this.page.goto(dashboardUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        await this.takeScreenshot('09-direct-dashboard-nav', 'Direct dashboard navigation attempt');
        
        const newUrl = this.page.url();
        if (newUrl.includes('/dashboard/health')) {
          this.testResults.passed.push('✅ Direct navigation to dashboard successful');
          console.log('✅ Direct navigation to dashboard successful');
          return true;
        } else {
          this.testResults.failed.push('❌ Direct navigation to dashboard failed');
          console.error('❌ Direct navigation to dashboard failed');
          return false;
        }
      }
      
    } catch (error) {
      this.testResults.failed.push(`❌ Dashboard navigation verification failed: ${error.message}`);
      console.error(`❌ Dashboard navigation verification failed: ${error.message}`);
      return false;
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 6,
        passed: this.testResults.passed.length,
        failed: this.testResults.failed.length,
        warnings: this.testResults.warnings.length,
        screenshots: this.testResults.screenshots.length
      },
      results: this.testResults,
      recommendations: []
    };
    
    // Add recommendations based on results
    if (this.testResults.failed.length > 0) {
      report.recommendations.push('❌ Critical issues found that need immediate attention');
    }
    
    if (this.testResults.warnings.length > 0) {
      report.recommendations.push('⚠️ Some warnings detected - review for potential improvements');
    }
    
    if (this.testResults.failed.length === 0) {
      report.recommendations.push('✅ All critical functionality is working correctly');
    }
    
    const reportPath = path.join(this.screenshotDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 TEST REPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`📸 Screenshots: ${report.summary.screenshots}`);
    console.log(`📄 Report saved: ${reportPath}`);
    console.log('='.repeat(50));
    
    if (this.testResults.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.failed.forEach(failure => console.log(`  ${failure}`));
    }
    
    if (this.testResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.testResults.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (this.testResults.passed.length > 0) {
      console.log('\n✅ PASSED TESTS:');
      this.testResults.passed.forEach(pass => console.log(`  ${pass}`));
    }
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Financial Health Dashboard End-to-End Testing');
    console.log('='.repeat(60));
    
    try {
      await this.setup();
      
      const tests = [
        this.test1_NavigateToFinancialHealthPage,
        this.test2_HandleAuthentication,
        this.test3_VerifyPageLoadsWithoutErrors,
        this.test4_VerifyBusinessListAndTechCorp,
        this.test5_VerifyAnalyzeHealthButton,
        this.test6_VerifyDashboardNavigation
      ];
      
      for (let i = 0; i < tests.length; i++) {
        console.log(`\n${'='.repeat(60)}`);
        try {
          await tests[i].call(this);
        } catch (error) {
          this.testResults.failed.push(`❌ Test ${i + 1} crashed: ${error.message}`);
          console.error(`❌ Test ${i + 1} crashed: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      }
      
      const report = await this.generateReport();
      await this.cleanup();
      
      return report;
      
    } catch (error) {
      console.error(`💥 Testing setup failed: ${error.message}`);
      await this.cleanup();
      throw error;
    }
  }
}

// If running directly
if (require.main === module) {
  (async () => {
    const tester = new FinancialHealthTester();
    try {
      await tester.runAllTests();
      process.exit(0);
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = FinancialHealthTester;