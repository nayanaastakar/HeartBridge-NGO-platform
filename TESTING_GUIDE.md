# 🧪 Testing Guide - HeartBridge

## Prerequisites
- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:4200
- ✅ MongoDB connected

---

## 📝 Test Accounts

### Donor Accounts
```
Email: donor@heartbridge.com
Password: password123

Email: donor2@heartbridge.com
Password: password123

Email: donor3@heartbridge.com
Password: password123
```

### NGO Admin Accounts
```
Email: ngo1@heartbridge.com
Password: password123

Email: ngo2@heartbridge.com
Password: password123
```

---

## 🔍 Feature Testing Scenarios

### 1. Authentication Testing

**Test Case 1.1: Donor Login**
1. Navigate to http://localhost:4200
2. Click Login
3. Enter: donor@heartbridge.com / password123
4. ✅ Verify: Redirected to donor dashboard

**Test Case 1.2: NGO Admin Login**
1. Login with: ngo1@heartbridge.com / password123
2. ✅ Verify: Redirected to NGO dashboard with admin features

**Test Case 1.3: Invalid Login**
1. Enter wrong credentials
2. ✅ Verify: Error message appears

---

### 2. Donation System Testing

**Test Case 2.1: Make a Donation**
1. Login as donor
2. Navigate to NGO Marketplace
3. Click on any NGO
4. Click "Donate Now" button
5. Enter amount (e.g., ₹5000)
6. Select payment method
7. Submit
8. ✅ Verify: Donation appears in history

**Test Case 2.2: View Donation History**
1. Login as donor
2. Go to "My Donations" / "Donation History"
3. ✅ Verify: All past donations listed with details

**Test Case 2.3: Anonymous Donation**
1. Make a donation
2. Check "Make Anonymous" option
3. Submit
4. ✅ Verify: Donor name hidden in NGO view

---

### 3. Wish Management Testing

**Test Case 3.1: Create Wish (NGO Admin)**
1. Login as ngo1@heartbridge.com
2. Go to Wish Box
3. Click "Create New Wish"
4. Fill details: Title, Description, Amount, Deadline
5. Submit
6. ✅ Verify: Wish appears in list

**Test Case 3.2: View Wishes**
1. Go to Marketplace
2. Click on any NGO
3. ✅ Verify: Active wishes displayed with progress bars

**Test Case 3.3: Donate to Wish**
1. Login as donor
2. Find an active wish
3. Click "Contribute to Wish"
4. Enter amount
5. ✅ Verify: Progress bar updates, status shown

---

### 4. Emergency Fund Testing

**Test Case 4.1: View Emergency Funds**
1. Navigate to "Emergency Funds" section
2. ✅ Verify: All emergency funds listed by priority
3. ✅ Verify: High priority shown prominently

**Test Case 4.2: Emergency Fund Donation**
1. Select an emergency fund
2. Click "Help Now"
3. Enter amount
4. ✅ Verify: Contribution recorded

---

### 5. Adopt-a-Day Testing

**Test Case 5.1: View Adopt-a-Day**
1. Go to "Adopt a Day" section
2. ✅ Verify: Available days listed
3. ✅ Verify: Purpose and collection progress shown

**Test Case 5.2: Adopt a Day**
1. Select a day
2. Click "Adopt This Day"
3. Enter amount
4. ✅ Verify: Status changes to "adopted"
5. ✅ Verify: Appears in dashboard

---

### 6. Gratitude Wall Testing

**Test Case 6.1: View Gratitude Wall**
1. Navigate to "Gratitude Wall"
2. ✅ Verify: Public messages displayed
3. ✅ Verify: NGO and timestamp shown

**Test Case 6.2: Post Gratitude Message (NGO Admin)**
1. Login as ngo1@heartbridge.com
2. Go to Gratitude Wall
3. Click "Post a Thank You Message"
4. Enter Title: Min 5 characters
5. Enter Message: Min 10 characters
6. Click "Post"
7. ✅ Verify: Message appears immediately
8. ✅ Verify: Form clears for next message

**Test Case 6.3: Message Validation**
1. Try to post with title < 5 chars
2. ✅ Verify: Error message shown
3. Try message < 10 chars
4. ✅ Verify: Form disabled until valid

---

### 7. NGO Marketplace Testing

**Test Case 7.1: Browse NGOs**
1. Go to Marketplace
2. ✅ Verify: 15 NGOs displayed
3. ✅ Verify: All categories shown

**Test Case 7.2: Filter by Category**
1. Select "Old Age Homes"
2. ✅ Verify: Only 4 NGOs shown (Sunrise, Golden Years, Senior Citizens, Elder Care)
3. Select "Children Welfare NGOs"
4. ✅ Verify: 4 NGOs shown

**Test Case 7.3: View NGO Details**
1. Click on any NGO
2. ✅ Verify: Logo/Image displayed
3. ✅ Verify: Description visible
4. ✅ Verify: Contact info shown
5. ✅ Verify: Funding stats displayed
6. ✅ Verify: Active wishes listed
7. ✅ Verify: Recent donations shown

---

### 8. Dashboard Testing

**Test Case 8.1: Donor Dashboard**
1. Login as donor
2. ✅ Verify: Total donated shown
3. ✅ Verify: Recent donations listed
4. ✅ Verify: Favorite NGOs (if feature present)
5. ✅ Verify: Quick action buttons available

**Test Case 8.2: NGO Dashboard**
1. Login as ngo1@heartbridge.com
2. ✅ Verify: Total received amount shown
3. ✅ Verify: Active wishes displayed
4. ✅ Verify: Recent donors listed
5. ✅ Verify: Emergency funds section visible
6. ✅ Verify: Create new wish button available

**Test Case 8.3: Admin Dashboard**
1. System admin login (if available)
2. ✅ Verify: All NGOs listed
3. ✅ Verify: Statistics dashboard shown
4. ✅ Verify: User management available

---

### 9. Analytics Testing

**Test Case 9.1: NGO Analytics**
1. Login as ngo1@heartbridge.com
2. Go to Dashboard
3. ✅ Verify: Charts showing donation trends
4. ✅ Verify: Fund utilization stats
5. ✅ Verify: Donor demographics (if available)

**Test Case 9.2: System Analytics**
1. Admin dashboard
2. ✅ Verify: Total donations displayed
3. ✅ Verify: NGO performance metrics
4. ✅ Verify: Monthly trends

---

### 10. Responsive Design Testing

**Test Case 10.1: Desktop View**
1. Access on desktop
2. ✅ Verify: Full layout displayed
3. ✅ Verify: All features accessible

**Test Case 10.2: Tablet View**
1. Resize browser to tablet (768px width)
2. ✅ Verify: Responsive layout works
3. ✅ Verify: Navigation adapted

**Test Case 10.3: Mobile View**
1. Resize to mobile (375px width)
2. ✅ Verify: Mobile menu visible
3. ✅ Verify: Touch-friendly buttons
4. ✅ Verify: Cards stack vertically

---

### 11. Error Handling Testing

**Test Case 11.1: Network Error**
1. Stop backend server temporarily
2. Try to make a donation
3. ✅ Verify: Error message displayed
4. ✅ Verify: Helpful error text shown

**Test Case 11.2: Form Validation**
1. Try to donate without amount
2. ✅ Verify: Field validation error shown
3. Try negative amount
4. ✅ Verify: Min amount validation works

---

### 12. Performance Testing

**Test Case 12.1: Page Load Time**
1. Open DevTools (F12)
2. Navigate to marketplace
3. ✅ Verify: Loads within 3 seconds

**Test Case 12.2: NGO List Performance**
1. Load marketplace with 15 NGOs
2. ✅ Verify: Smooth scrolling
3. ✅ Verify: No lag when loading more

---

## 🔄 Quick Testing Workflow

### 5-Minute Demo
1. Open http://localhost:4200
2. Login as donor@heartbridge.com
3. Go to Marketplace
4. Donate ₹5000 to any NGO
5. Check donation history
6. View NGO details
7. Logout

### 15-Minute Demo
1. Donor login - make donations
2. Logout
3. NGO admin login - view dashboard
4. Create a wish
5. Post gratitude message
6. View analytics
7. Logout

### 30-Minute Full Test
1. Test all 5 user accounts
2. Test all 6 major features
3. Test error scenarios
4. Test responsive design
5. Test performance

---

## 📊 Expected Results Summary

| Component | Expected | Status |
|-----------|----------|--------|
| Backend API | Running on 3000 | ✅ |
| Frontend App | Running on 4200 | ✅ |
| MongoDB | Connected | ✅ |
| User Login | 5 test accounts | ✅ |
| NGOs | 15 organizations | ✅ |
| Sample Data | Pre-loaded | ✅ |
| All Features | Operational | ✅ |

---

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
node server.js
```

### Frontend won't start
```bash
cd frontend
npm install
node ../frontend-server.js
```

### MongoDB connection error
- Ensure MongoDB is running: `mongod`
- Check .env file has correct MONGODB_URI

### Port already in use
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Kill process on port 4200
lsof -ti :4200 | xargs kill -9
```

---

## ✅ Test Completion Checklist

- [ ] User Login/Registration working
- [ ] Donations system functional
- [ ] Wishes creation and tracking working
- [ ] Emergency funds operational
- [ ] Adopt-a-day feature working
- [ ] Gratitude wall posting available
- [ ] NGO marketplace browsable
- [ ] Analytics dashboard showing data
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] All sample data accessible

**All tests completed successfully! ✅**
