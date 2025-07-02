import sys, os; sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.models import Product, ContractStatus, Contract, Task

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


def test_contract_and_task_models():
    status = ContractStatus(id=1, name='Draft')
    contract = Contract(id=2, client_id=1, status=status)
    task = Task(id=3, name='Test', contract=contract)
    assert contract.status.name == 'Draft'
    assert task.contract is contract
