# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Environment variables configured

## Required Environment Variables

### Client-side (must start with VITE_)
```
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Optional Client-side
```
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_ZORA_RPC_URL=your_custom_rpc_url
VITE_ADMIN_REFERRAL_ADDRESS=your_admin_wallet_address
```

### Optional Server-side
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=your_neon_postgres_url
```

## Deployment Steps

1. **Install Vercel CLI** (optional, for CLI deployment)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import project in Vercel dashboard
   - Add environment variables in Vercel project settings
   - Vercel will auto-deploy

3. **Deploy via CLI**
   ```bash
   vercel
   ```
   - Follow prompts to link project
   - Add environment variables via `vercel env add`

## Important Notes

- **Telegram Bot**: The Telegram bot functionality uses polling which doesn't work well with Vercel's serverless architecture. Consider disabling or using webhooks instead.
- **WebSockets**: The `ws` package for WebSocket support won't work on Vercel. Consider using alternatives like Pusher or Ably for real-time features.
- **Database**: Make sure to use a serverless-friendly database like Neon PostgreSQL with the `@neondatabase/serverless` driver.
- **Migrations**: Auto-migrations are disabled in production to avoid cold start delays. Run migrations manually using `npm run db:push` before deploying.
- **Build Time**: First deployment may take 5-10 minutes due to dependency installation.

## Vercel Configuration

The project includes:
- `vercel.json` - Deployment configuration
- `api/index.ts` - Serverless function wrapper for Express app
- `.vercelignore` - Files to exclude from deployment

## Post-Deployment

After deployment:
1. Verify environment variables are set correctly
2. Test API endpoints: `https://your-app.vercel.app/api/coins`
3. Check frontend functionality
4. Monitor Vercel function logs for any errors

## Troubleshooting

- **Build Failures**: Check build logs in Vercel dashboard
- **Environment Variables**: Ensure all required variables are set and start with `VITE_` for client-side
- **API Errors**: Check Vercel function logs
- **Database Connection**: Verify DATABASE_URL is correct and accessible

## Alternative: Deploy Backend Separately

If you encounter issues with the serverless architecture, consider:
1. Deploy frontend to Vercel
2. Deploy backend to a platform that supports long-running processes (Railway, Render, Fly.io)
3. Update API URLs in frontend to point to separate backend
