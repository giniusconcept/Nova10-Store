import json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import Mock,patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"src"))
from youtube_uploader import validate_manifest,execute,upload

ROOT=Path(__file__).resolve().parents[1]
class YouTubeTests(unittest.TestCase):
    def setUp(self):
        self.media=ROOT/"output/test-youtube-approved.mp4"
        self.media.parent.mkdir(exist_ok=True)
        self.media.write_bytes(b"0"*1025)
        self.good=dict(product_id="shopify-123",title="Produit NOVA10",description="Fiche réelle",
            product_status="ACTIVE",rights_approved=True,content_approved=True,
            source_type="authentic_product_video",youtube_upload_approved=True,
            internal_preview=False,demo=False)
    def tearDown(self):
        self.media.unlink(missing_ok=True)
    def test_dry_run_never_sends(self):
        with tempfile.TemporaryDirectory() as td:
            m=Path(td)/"manifest.json";m.write_text(json.dumps(self.good))
            got=execute(m,self.media,"private",environ={})
            self.assertEqual(got["uploads"],0)
    def test_preview_blocked(self):
        p=dict(self.good,internal_preview=True)
        with self.assertRaisesRegex(ValueError,"preview"):
            validate_manifest(p,self.media,"private")
    def test_draft_blocked(self):
        p=dict(self.good,product_status="DRAFT")
        with self.assertRaisesRegex(ValueError,"ACTIVE"):
            validate_manifest(p,self.media,"private")
    def test_rights_blocked(self):
        p=dict(self.good,rights_approved=False)
        with self.assertRaisesRegex(ValueError,"rights"):
            validate_manifest(p,self.media,"private")
    def test_upload_requires_explicit_approval(self):
        with tempfile.TemporaryDirectory() as td:
            m=Path(td)/"manifest.json";m.write_text(json.dumps(self.good))
            with self.assertRaisesRegex(ValueError,"approval"):
                execute(m,self.media,"private",environ={},do_upload=True)
    def test_missing_oauth(self):
        with tempfile.TemporaryDirectory() as td:
            m=Path(td)/"manifest.json";m.write_text(json.dumps(self.good))
            with self.assertRaisesRegex(ValueError,"OAuth"):
                execute(m,self.media,"private",environ={"ENABLE_YOUTUBE_UPLOAD":"true",
                    "YOUTUBE_UPLOAD_APPROVED":"true"},do_upload=True)
    def test_private_is_default_gate(self):
        self.assertEqual(validate_manifest(self.good,self.media,"private")["privacy"],"private")
if __name__=="__main__":unittest.main()
