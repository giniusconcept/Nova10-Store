# NOVA10 VIDEO FACTORY V1

Status: **rendering MVP; no social accounts connected and no public posts enabled**.

## Architecture
Approved Shopify / CJ product media -> Python content templates -> FFmpeg vertical MP4 renderer -> GitHub Actions -> video plus SHA-256 audit -> future API publishers -> Shopify conversion reporting.

## Run
Actions > NOVA10 Video Factory > Run workflow > demo=true.
The generated video says NOVA10 DEMO, uses only neutral text and cannot be mistaken for authentic supplier footage.
Retrieve the run artifact after success (the target repository is PUBLIC; never include customer data, unpublished product assets or tokens in artifacts). Artifacts expire in seven days.

Local test (requires ffmpeg and DejaVu font):
python -m unittest discover -s tests -v
python src/factory.py --demo

For commercial renders: include authorized media under assets/, configure its path, set approved_media=true only after rights review, add the real Shopify HTTPS product URL, then run with demo=false.

## Remaining work
Live Shopify catalogue connector, licensing review, authorization of YouTube Data API, Meta Graph API, and TikTok Content Posting API, externally reachable hosting for Instagram, token refresh, durable publication deduplication, API uploads, scheduled production and business analytics. Public TikTok API posting requires platform approval. No credentials should be committed; use GitHub Secrets.
No claim is made that these steps are done. The workflows do not publish videos.

## Financial control
No paid subscriptions are required for the demo. This repository is PUBLIC: standard GitHub-hosted runner usage is free under GitHub's public-repository policy. Do not upload confidential assets or credentials. Disable or limit billing above the free quota.
