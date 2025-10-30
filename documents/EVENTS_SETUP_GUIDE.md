# 🎫 Events System Setup Guide

## 🚨 **Issue Identified**

When you create events through `/admin/content`, they're being saved as announcements instead of proper events with QR ticketing capabilities.

## ✅ **Solution: Use the Dedicated Events Management Page**

### **Step 1: Access the Proper Events Management**

Instead of using `/admin/content` for events, use the dedicated Events Management page:

**🔗 URL**: `http://localhost:3000/admin/events`

### **Step 2: Create Events Properly**

1. **Go to Admin Dashboard**: `http://localhost:3000/admin`
2. **Click "Event Management"** (the new blue card with calendar icon)
3. **Click "Create Event"** button
4. **Fill out the proper event form** with:
   - Event Title
   - Category (Academic, Cultural, Sports, etc.)
   - Start Date & Time
   - End Date & Time
   - Venue
   - Capacity
   - Description
   - Public/Private setting

### **Step 3: Events vs Announcements**

| **Events Management** (`/admin/events`) | **Content Management** (`/admin/content`) |
|------------------------------------------|-------------------------------------------|
| ✅ Creates proper events with QR tickets | ❌ Creates announcements/news posts |
| ✅ Has registration system | ❌ No registration capability |
| ✅ Capacity management | ❌ No capacity tracking |
| ✅ Generates QR codes | ❌ No QR functionality |
| ✅ Shows in `/events` page | ❌ Shows in `/news` page |

## 🔄 **Complete Workflow**

### **For Administrators:**
1. **Create Event**: `/admin/events` → Click "Create Event"
2. **Manage Events**: View, edit, delete events from admin panel
3. **Monitor Registrations**: See registration counts and capacity

### **For Students/Users:**
1. **Browse Events**: `/events` → "Available Events" tab
2. **Register**: Click "Register Now" on any event
3. **Get Ticket**: Automatically appears in "My Tickets" tab
4. **Use QR Code**: Present QR code at event entrance

## 🛠️ **Database Setup (Optional)**

If you want to test with a real database:

### **Option 1: Install MongoDB Locally**
```bash
# Download and install MongoDB Community Server
# From: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod
```

### **Option 2: Use MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcc_portal
```

### **Option 3: Use Without Database (Testing)**
The frontend components work independently and can be tested without a database connection.

## 🎯 **Quick Test Without Database**

1. **Start your Next.js server**:
   ```bash
   npm run dev
   ```

2. **Visit the Events Management page**:
   ```
   http://localhost:3000/admin/events
   ```

3. **You'll see the proper event creation form** (even if it can't save to database yet)

4. **Visit the public events page**:
   ```
   http://localhost:3000/events
   ```

## 🔍 **Troubleshooting**

### **Problem**: Events created in `/admin/content` don't appear in `/events`
**Solution**: Use `/admin/events` instead of `/admin/content` for creating events.

### **Problem**: "Connection refused" error
**Solution**: Either install MongoDB or use the frontend-only testing approach.

### **Problem**: Events don't have QR codes
**Solution**: Make sure you're using the Events Management system, not Content Management.

## 📱 **Mobile Testing**

The events system is fully mobile-responsive:
- Browse events on mobile
- Register for events
- View QR tickets
- Scan QR codes with camera

## 🎉 **You're Ready!**

The Events Management system is now properly set up. Use `/admin/events` to create events that will appear in `/events` with full QR ticketing functionality!

---

**Next Steps:**
1. Try creating an event through `/admin/events`
2. View it in `/events` page
3. Test the registration flow
4. Set up MongoDB when ready for production use