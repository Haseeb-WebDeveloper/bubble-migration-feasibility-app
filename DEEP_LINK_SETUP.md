# 🔗 Deep Link Setup Guide for Magic Links

## Problem
Magic links open in browser instead of redirecting back to Expo Go app.

## Solution

### 1. Configure Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: Authentication → URL Configuration
   - Find the "Redirect URLs" section

2. **Add these Redirect URLs** (replace `192.168.100.3:8081` with your actual development server URL):

```
# For Expo Go Development (replace with your actual IP)
exp://192.168.100.3:8081/--/auth/callback

# For Custom Development Build
bubblefesibility://auth/callback

# For Web Development
http://localhost:8081/auth/callback

# For Production (when you publish)
bubblefesibility://auth/callback
```

3. **Save the configuration**

### 2. Find Your Development Server URL

To find your exact development server URL:

1. Run `bunx expo start`
2. Look for the line that says: `Metro waiting on exp://[YOUR_IP]:[PORT]`
3. Use that exact IP and port in the Supabase redirect URL

Example:
```
› Metro waiting on exp://192.168.100.3:8081
```
Then your redirect URL should be:
```
exp://192.168.100.3:8081/--/auth/callback
```

### 3. Test the Flow

1. **Start your Expo server**: `bunx expo start`
2. **Open Expo Go** on your phone
3. **Scan the QR code** to open your app
4. **Request a magic link** by entering your email
5. **Check your email** and click the magic link
6. **The link should now open in Expo Go** instead of the browser

### 4. Troubleshooting

#### If magic link still opens in browser:
1. **Check Supabase redirect URLs** - Make sure they match exactly
2. **Clear browser cache** - Sometimes cached redirects interfere
3. **Restart Expo server** - Run `bunx expo start -c` to clear cache
4. **Check device network** - Make sure phone and computer are on same network

#### If you get "Invalid redirect URL" error:
1. **Double-check the URL format** in Supabase dashboard
2. **Make sure the URL exactly matches** what's shown in your terminal
3. **Remove any trailing slashes** from the URLs

#### If the callback doesn't work:
1. **Check the console logs** for any error messages
2. **Make sure your app scheme is correct** (`bubblefesibility`)
3. **Verify the callback handler** is working properly

### 5. Production Setup

For production builds, you'll need to:

1. **Add production redirect URL** to Supabase:
   ```
   bubblefesibility://auth/callback
   ```

2. **Update app.json** with proper scheme configuration (already done)

3. **Test with development build** before publishing

---

## Quick Reference

**Development Redirect URL Format:**
```
exp://[YOUR_IP]:[PORT]/--/auth/callback
```

**Production Redirect URL:**
```
bubblefesibility://auth/callback
```

**Supabase Dashboard Location:**
```
Project Dashboard → Authentication → URL Configuration → Redirect URLs
```