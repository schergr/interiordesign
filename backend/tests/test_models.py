import sys, os; sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.models import Product

def test_product_to_dict():
    p = Product(id=1, sku='SKU123', name='Chair', price=99.99)
    expected = {
        'id': 1,
        'sku': 'SKU123',
        'name': 'Chair',
        'price': '99.99',
        'vendor': None
    }
    assert p.to_dict() == expected
