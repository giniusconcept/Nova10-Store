import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from social_publish import assess, safe_public_media_url, manifest_ok, run

class SocialPublishTests(unittest.TestCase):
    def test_no_credentials_means_no_post(self):
        for platform in ("youtube", "instagram", "facebook", "tiktok"):
            info = assess(platform, {})
            self.assertFalse(info["configuration_complete"])
            self.assertFalse(info["publishing_enabled"])
    def test_even_with_credentials_dry_run_only(self):
        fake = dict(YOUTUBE_ACCESS_TOKEN="x", YOUTUBE_CHANNEL_ID="y",
                    META_ACCESS_TOKEN="x", INSTAGRAM_BUSINESS_ID="1",
                    FACEBOOK_PAGE_ID="2", PUBLIC_VIDEO_URL="https://example.org/clip.mp4",
                    TIKTOK_ACCESS_TOKEN="x", TIKTOK_APP_AUDITED="true")
        report = run(environ=fake)
        self.assertEqual(report["posts_published"], 0)
        self.assertEqual(report["social_requests_sent"], 0)
        self.assertTrue(all(p["configuration_complete"] for p in report["platforms"]))
        self.assertTrue(all(not p["publishing_enabled"] for p in report["platforms"]))
    def test_reject_unsafe_urls(self):
        for url in ("http://example.com/a.mp4", "file:///home/a.mp4",
                    "https://localhost/clip.mp4", "https://127.0.0.1/video",
                    "https://user:secret@example.com/file.mp4", "x"):
            self.assertFalse(safe_public_media_url(url))
    def test_media_validation(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td)/"fake.mp4"
            p.write_bytes(b"x")
            self.assertEqual(manifest_ok(p)[1],"video_outside_repository")

if __name__=="__main__":
    unittest.main()
