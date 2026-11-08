import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"src"))
from preview import safe_url,generate
class PreviewTests(unittest.TestCase):
    def test_approved_cdn(self):
        self.assertIn("cdn.shopify.com",safe_url("https://cdn.shopify.com/s/files/1/demo.jpg"))
    def test_bad_domain(self):
        with self.assertRaises(ValueError):
            safe_url("https://cdn.shopify.com.evil.example/s/files/x")
    def test_bad_protocol(self):
        with self.assertRaises(ValueError):
            safe_url("http://cdn.shopify.com/s/files/x")
    def test_publication_guard(self):
        with self.assertRaisesRegex(ValueError,"Internal preview"):
            generate({"rights_approved":True,"draft":False,"product_status":"ACTIVE"})
if __name__=="__main__":unittest.main()
