# Manual Testing Checklist for Financial Health Dashboard

## Test Environment
- **Server URL**: http://localhost:3000
- **Test User**: testowner@goodbuyhq.com
- **Test Password**: TestOwner123!
- **Expected Business**: TechCorp Solutions (ID: cmf49hdp00001ul0uias7iybz)

## Pre-Test Verification

### ✅ API Endpoints Working
- [x] **Businesses API**: `curl http://localhost:3000/api/businesses?status=ACTIVE`
  - Returns JSON with `businesses` array
  - TechCorp Solutions appears in results
  - Decimal fields (askingPrice, revenue, etc.) are converted to numbers
  - No "Objects are not valid as a React child" errors

### ❓ Authentication Status
- [ ] **Auth Session**: `curl http://localhost:3000/api/auth/session`
  - Check if session is active or returns null

## Manual Testing Steps

### Step 1: Initial Navigation
**Action**: Navigate to http://localhost:3000/financial-health

**Expected Results**:
- [ ] Page loads without errors
- [ ] If not authenticated, redirected to sign-in page
- [ ] No console errors related to React serialization
- [ ] No "Objects are not valid as a React child" errors
- [ ] No "Decimal objects are not supported" errors

**Screenshot**: Take screenshot of initial page load

---

### Step 2: Authentication (if redirected)
**Action**: Login with test credentials
- Email: `testowner@goodbuyhq.com`
- Password: `TestOwner123!`

**Expected Results**:
- [ ] Login form accepts credentials
- [ ] Successful authentication
- [ ] Redirected back to financial-health page
- [ ] No authentication errors

**Screenshot**: Take screenshot after successful login

---

### Step 3: Financial Health Page Load
**Action**: Verify the financial health page loads correctly

**Expected Results**:
- [ ] Page displays without React errors
- [ ] Business list is visible
- [ ] TechCorp Solutions appears in the list
- [ ] No console errors in browser dev tools
- [ ] Loading states work correctly

**Browser Console Check**:
```javascript
// Open browser dev tools and check for errors:
// 1. No "Objects are not valid as a React child" errors
// 2. No "Decimal objects are not supported" errors  
// 3. No serialization errors
// 4. API calls to /api/businesses succeed
```

**Screenshot**: Take screenshot of loaded page with business list

---

### Step 4: Business Data Verification
**Action**: Verify TechCorp Solutions data displays correctly

**Expected Business Data**:
- [ ] **Name**: TechCorp Solutions
- [ ] **Industry**: Software Development
- [ ] **Location**: San Francisco, CA
- [ ] **Revenue**: $500,000 (formatted as number, not object)
- [ ] **Asking Price**: $1,250,000 (formatted as number, not object)
- [ ] **Status**: Active

**Data Format Check**:
- [ ] All financial numbers display as formatted currency
- [ ] No "[object Object]" or "[object Date]" text visible
- [ ] Dates display in readable format

**Screenshot**: Take screenshot showing TechCorp data

---

### Step 5: Analyze Health Button
**Action**: Locate and test the "Analyze Health" button

**Expected Results**:
- [ ] "Analyze Health" button is visible for TechCorp Solutions
- [ ] Button is clickable (not disabled)
- [ ] Button has proper styling/appearance
- [ ] Hover states work correctly

**Screenshot**: Take screenshot highlighting the Analyze Health button

---

### Step 6: Button Click Navigation
**Action**: Click the "Analyze Health" button

**Expected Results**:
- [ ] Click triggers navigation
- [ ] Navigates to: `/dashboard/health/cmf49hdp00001ul0uias7iybz`
- [ ] No JavaScript errors during navigation
- [ ] URL changes correctly

**Navigation Verification**:
```
Expected URL Pattern: http://localhost:3000/dashboard/health/[businessId]
Actual URL: ________________________________
```

**Screenshot**: Take screenshot of URL bar showing correct navigation

---

### Step 7: Health Dashboard Page
**Action**: Verify the health dashboard loads

**Expected Results**:
- [ ] Health dashboard page loads
- [ ] TechCorp Solutions data is displayed
- [ ] No React serialization errors
- [ ] Dashboard components render correctly
- [ ] Financial data displays properly

**Error Checks**:
- [ ] No 404 errors
- [ ] No 500 server errors
- [ ] No React component errors
- [ ] No missing data errors

**Screenshot**: Take screenshot of loaded health dashboard

---

## Error Scenarios to Test

### React Serialization Errors
**Check for these specific error messages**:
- [ ] "Objects are not valid as a React child (found: [object Date])"
- [ ] "Objects are not valid as a React child (found: [object Object])"
- [ ] "Decimal objects are not supported"
- [ ] Any serialization-related errors

### API Response Format
**Verify API returns correct format**:
```json
{
  "businesses": [
    {
      "id": "string",
      "askingPrice": 1250000,  // number, not Decimal object
      "revenue": 500000,       // number, not Decimal object
      // ... other fields
    }
  ]
}
```

### NextAuth Issues
**Check for authentication problems**:
- [ ] No "Cannot find module './vendor-chunks/next-auth.js'" errors
- [ ] Session management works correctly
- [ ] Login/logout functionality works

## Success Criteria

### ✅ All Tests Pass If:
1. **Navigation**: Can navigate to financial-health page without errors
2. **Authentication**: Login process works smoothly
3. **Data Loading**: Business list loads with TechCorp Solutions visible
4. **No Serialization Errors**: Zero React serialization errors in console
5. **Button Functionality**: Analyze Health button is visible and clickable
6. **Navigation**: Button click navigates to correct health dashboard URL
7. **Dashboard Loading**: Health dashboard displays TechCorp data correctly

### ❌ Critical Issues:
- Any React serialization errors
- TechCorp Solutions not appearing in business list
- Analyze Health button not working
- Navigation failures
- Data display issues (showing [object Object] instead of values)

## Test Results Summary

**Date**: ________________  
**Tester**: _______________  
**Browser**: ______________

| Test Step | Status | Notes |
|-----------|---------|-------|
| 1. Initial Navigation | ⏳ | |
| 2. Authentication | ⏳ | |  
| 3. Page Load | ⏳ | |
| 4. Data Verification | ⏳ | |
| 5. Button Visibility | ⏳ | |
| 6. Button Navigation | ⏳ | |
| 7. Dashboard Load | ⏳ | |

**Overall Result**: ⏳ PENDING

**Critical Issues Found**: ________________

**Screenshots Saved**: ___________________