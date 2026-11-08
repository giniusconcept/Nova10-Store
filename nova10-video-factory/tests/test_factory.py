import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"src"))
from factory import tracking,validate
class Tests(unittest.TestCase):
    def test_utm(self):
        self.assertIn("utm_source=youtube",tracking("https://example.com/products/a","youtube"))
    def test_empty(self):
        self.assertEqual("",tracking("","youtube"))
    def test_rights(self):
        with self.assertRaises(ValueError):
            validate({"id":"p","title":"P","media":"assets/p.mp4","approved_media":False})
    def test_path(self):
        with self.assertRaises(ValueError):
            validate({"id":"p","title":"P","media":"../../secrets.mp4","approved_media":True})
if __name__=="__main__": unittest.main()
