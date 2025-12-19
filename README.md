# SSB V2 - Watch SSB

## 🚀 Deployment Instructions for Vercel

1. **Upload to GitHub**: 
   - Drag and drop all files (excluding `node_modules` and `.next`) to your GitHub repository.
   - **Tip**: If you have many files, use **GitHub Desktop** for a more reliable upload than the website.

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
   - Import your GitHub repository.

3. **Configure Environment Variables**:
   - Copy the values from your local `.env` file into the Vercel Project Settings under **Environment Variables**.
   - **Crucial**: Ensure `FIREBASE_PRIVATE_KEY` is pasted exactly (including the `-----BEGIN PRIVATE KEY-----` parts).

4. **Deploy**:
   - Vercel will automatically detect Next.js and build your site.

## 🛠️ Project Structure
- `/app`: Main application routes (Next.js App Router).
- `/components`: Reusable UI components (Header, GlobalChat, etc.).
- `/lib`: Server-side utilities (Firebase Admin, Iron Session).
- `/public`: Static assets (Logos, SVGs).

## 🔐 Security Features
- **2FA**: TOTP-based authentication.
- **Admin Dashboard**: Secure routes for moderation and stats.
- **Session Management**: Secure cookies via `iron-session`.
