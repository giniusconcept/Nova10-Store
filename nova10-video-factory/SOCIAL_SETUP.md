# NOVA10 Video Factory — social channel connection: status and safety

**Status: NOT CONNECTED.** No automatic social publishing, no OAuth tokens configured by this change, and no videos uploaded. The CLI `python src/social_publish.py` audits readiness in OFFLINE DRY RUN; it never sends a network request.

## Each platform's required user-side authorization

- YouTube: Google Cloud project with YouTube Data API v3 enabled, OAuth application and account consent. Upload scopes and platform policy must be verified. Use a short-lived access token and refresh flow, not a permanent password.
- Instagram: Instagram professional account with supported permissions; Meta app and OAuth. Upload workflow needs a platform-accessible HTTPS video URL and asynchronous media processing confirmation.
- Facebook Reels: Facebook Page publishing permissions and a Meta app.
- TikTok: approved Content Posting API integration, user authorization, account permissions and public publishing approval/audit.

## Secret names reserved

- `YOUTUBE_ACCESS_TOKEN`, `YOUTUBE_CHANNEL_ID`
- `META_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ID`, `FACEBOOK_PAGE_ID`
- `PUBLIC_VIDEO_URL` (not a password; must point to permitted publicly fetchable media)
- `TIKTOK_ACCESS_TOKEN`, `TIKTOK_APP_AUDITED`

Add secrets only after an OAuth integration has been reviewed. Never commit passwords or tokens. This repository is private, but confidentiality also requires safe artifact and log handling.

## Operational sequence

1. Obtain account authorizations and verify what the current official APIs permit.
2. Build provider-specific upload adapters; require explicit publication approvals.
3. Build idempotency keys, token refresh, media hosting and status polling.
4. Perform controlled test on a real approved media asset and verify the remote post ID.
5. Enable schedules only after the previous stages pass.

No connector is allowed to bypass product-media licensing checks or post internal preview videos. Keep scheduled publication OFF until end-to-end signoff.
