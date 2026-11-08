# NOVA10 YouTube Shorts — official upload integration

**Implemented:** Python `videos.insert` uploader with OAuth refresh, resumable upload, dry-run and safety guards. **Not connected to a YouTube account.** No schedule and no production upload workflow are enabled.

## One-time Google authorization
1. Create/select a Google Cloud project in https://console.cloud.google.com/.
2. Enable YouTube Data API v3 under APIs & Services.
3. Configure the Google OAuth consent screen and create a suitable OAuth client.
4. Authorize the scope `https://www.googleapis.com/auth/youtube.upload` using an approved Google OAuth code flow requesting offline access. Never paste the authorization code, refresh token, client secret or password into a chat, issue or repository file.
5. Store the following as GitHub Actions Secrets in **giniusconcept/Nova10-Store**:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`
6. Validate and approve real product footage, verify supplier rights and product availability, then prepare an explicit video manifest.

## Upload protection
The uploader requires:
- Command line flag `--execute`
- Environment `ENABLE_YOUTUBE_UPLOAD=true` AND `YOUTUBE_UPLOAD_APPROVED=true`
- Manifest `youtube_upload_approved=true`, `rights_approved=true`, `content_approved=true`, `source_type=authentic_product_video`, `product_status=ACTIVE`
- Local real MP4 within the factory; no demo/internal preview.
- OAuth secrets, loaded at runtime; not committed.

Default visibility is **private**. Production schedule intentionally absent.
The next step after OAuth is a manually approved private-channel upload with remote video-ID verification, then carefully enable scheduled publishing.

Official references: https://developers.google.com/youtube/data/reference/rest/v3/videos/insert and https://developers.google.com/youtube/data/guides/authentication
