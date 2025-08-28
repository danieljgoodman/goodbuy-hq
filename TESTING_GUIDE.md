# 🧪 Communication System Testing Guide

## ✅ Test Accounts Created

| Role                | Email                  | Password      | User Type      |
| ------------------- | ---------------------- | ------------- | -------------- |
| **Business Owner**  | `seller@goodbuyhq.com` | `Seller123!`  | BUSINESS_OWNER |
| **Buyer/Investor**  | `buyer@goodbuyhq.com`  | `Buyer123!`   | BUYER          |
| **Business Broker** | `broker@goodbuyhq.com` | `Broker123!`  | BROKER         |
| **System Admin**    | `test@goodbuyhq.com`   | `Test123456!` | ADMIN          |

## 🎯 Complete Testing Checklist

### 1️⃣ **Basic Login & Setup**

**✅ Test Login:**

1. Go to http://localhost:3000/auth/signin
2. Login with `buyer@goodbuyhq.com` / `Buyer123!`
3. Verify dashboard loads correctly
4. Check user profile shows "Michael Investor"

**✅ Test Account Switching:**

1. Logout and login as `seller@goodbuyhq.com` / `Seller123!`
2. Verify different user type permissions
3. Check business listing appears for seller

---

### 2️⃣ **Messaging System Testing**

**✅ Test Existing Conversation:**

1. Login as **buyer** (`buyer@goodbuyhq.com`)
2. Go to http://localhost:3000/messages
3. You should see conversation "Inquiry about TechFlow SaaS Platform"
4. Click on conversation to view 3 existing messages
5. Send a new message: "I'd like to schedule a call for tomorrow"

**✅ Test Message Receipt:**

1. Open new browser window/tab (or incognito)
2. Login as **seller** (`seller@goodbuyhq.com`)
3. Go to http://localhost:3000/messages
4. Verify you see the same conversation
5. Check the new message from buyer appears
6. Reply: "Great! I'm available 10 AM - 4 PM PST"

**✅ Real-Time Messaging Test:**

1. **Keep both browser windows open** (buyer + seller)
2. **Buyer window**: Send message "Perfect! How about 2 PM?"
3. **Seller window**: Verify message appears **instantly** without refresh
4. **Seller window**: Type a response and send
5. **Buyer window**: Verify instant appearance
6. Test typing indicators (start typing but don't send)

---

### 3️⃣ **Document Sharing Testing**

**✅ Test Document Upload:**

1. As **seller**, in the conversation
2. Look for attachment/document sharing option
3. Upload a test file (PDF, image, or document)
4. Add description: "Financial statements Q3 2024"
5. Set access level to "SHARED"
6. Share document

**✅ Test Document Access:**

1. As **buyer**, refresh messages
2. Verify document notification appears
3. Click to download/view document
4. Check document access is logged

**✅ Test Document Security:**

1. Try to access document URL directly without login
2. Should be denied
3. Verify only thread participants can access

---

### 4️⃣ **Meeting Scheduler Testing**

**✅ Schedule Meeting:**

1. As **buyer**, in the conversation
2. Look for "Schedule meeting" option
3. Create meeting:
   - **Title**: "TechFlow SaaS Discussion"
   - **Date/Time**: Tomorrow 2:00 PM
   - **Duration**: 1 hour
   - **Type**: Virtual meeting
   - **Attendees**: Add seller
4. Send meeting invite

**✅ Meeting Response:**

1. As **seller**, check for meeting notification
2. Accept/decline meeting
3. Add notes if desired

**✅ Meeting Reminders:**

1. Check meeting appears in both calendars
2. Verify reminder system (check database for scheduled reminders)

---

### 5️⃣ **Email Notifications Testing**

**⚠️ Prerequisites:** Set up email service first (SendGrid or AWS SES)

**✅ Configure Email Service:**

```bash
# Add to .env.local
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
NEXT_PUBLIC_ENABLE_EMAIL=true
```

**✅ Test Email Notifications:**

```bash
# Run email test
npx tsx scripts/test-email-setup.ts
```

**✅ Test Live Email Notifications:**

1. **Send message** from buyer to seller
2. **Check seller's email** for notification
3. **Schedule meeting** - check attendees get email invites
4. **Share document** - verify email notifications sent

---

### 6️⃣ **Mobile Interface Testing**

**✅ Responsive Design Test:**

1. Open http://localhost:3000/messages on phone browser
2. Or use Chrome DevTools → Mobile view
3. Test message interface:
   - Thread list should stack vertically
   - Messages should be touch-friendly
   - Input should work with mobile keyboard

**✅ Mobile Features:**

1. Test touch scrolling through messages
2. Test mobile menu navigation
3. Verify emoji picker works on mobile
4. Test file upload from mobile

---

### 7️⃣ **Advanced Features Testing**

**✅ Message Features:**

- [ ] Reply to specific messages
- [ ] Edit sent messages (within 24 hours)
- [ ] Delete messages
- [ ] Emoji reactions
- [ ] @mentions (if implemented)
- [ ] Message search

**✅ Thread Management:**

- [ ] Archive conversations
- [ ] Add/remove participants
- [ ] Change thread subject
- [ ] Thread settings/permissions

**✅ Notification Preferences:**

- [ ] Go to user settings/preferences
- [ ] Toggle email notifications on/off
- [ ] Test digest frequency settings
- [ ] Verify privacy controls

---

### 8️⃣ **Security & Privacy Testing**

**✅ Access Control:**

- [ ] Try accessing other users' conversations (should fail)
- [ ] Test document access permissions
- [ ] Verify audit trail logging
- [ ] Check data encryption

**✅ Privacy Features:**

- [ ] Test blocking direct messages
- [ ] Hide online status
- [ ] Disable read receipts
- [ ] Test data export/deletion

---

## 🐛 **Testing Troubleshooting**

### Common Issues & Solutions:

**🔧 Messages not loading:**

```bash
# Check database connection
DATABASE_URL="postgresql://danielgoodman@localhost/goodbuy_hq_dev" psql -c "SELECT COUNT(*) FROM messages;"
```

**🔧 Real-time not working:**

- Check browser console for WebSocket errors
- Ensure Socket.io is properly configured
- Try refreshing both browser windows

**🔧 Email notifications not working:**

- Verify SMTP configuration in .env.local
- Check email service credentials
- Test with: `npx tsx scripts/test-email-setup.ts`

**🔧 Mobile interface issues:**

- Clear browser cache
- Test in different mobile browsers
- Check console for responsive CSS errors

---

## 📊 **Test Results Tracking**

Create a simple checklist to track your testing:

```
✅ Basic login works
✅ Messaging interface loads
✅ Real-time messaging works
✅ Document sharing works
✅ Meeting scheduler works
⏳ Email notifications (needs email service)
✅ Mobile interface responsive
✅ Security controls working
```

---

## 🚀 **Performance Testing**

**✅ Load Testing:**

1. Create multiple conversations
2. Send many messages rapidly
3. Upload multiple documents
4. Check response times

**✅ Browser Testing:**

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 🎯 **Success Criteria**

Your communication system passes testing if:

1. **✅ All 4 test accounts can login**
2. **✅ Real-time messaging works between users**
3. **✅ Documents can be shared securely**
4. **✅ Meetings can be scheduled**
5. **✅ Mobile interface is usable**
6. **✅ Email notifications work (when configured)**
7. **✅ Security controls prevent unauthorized access**
8. **✅ Audit trail captures all activities**

---

## 💡 **Next Steps After Testing**

Once testing is complete:

1. **Configure production email service**
2. **Set up WebSocket server for production**
3. **Configure backup and monitoring**
4. **Train users on the system**
5. **Set up analytics and reporting**

Your secure communication system is enterprise-ready! 🎉
