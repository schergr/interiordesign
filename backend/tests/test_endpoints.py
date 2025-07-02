import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
import werkzeug
if not hasattr(werkzeug, '__version__'):
    werkzeug.__version__ = '0'
from backend.app import app, db, Employee, LeadStage, ContractStatus


def setup_function(function):
    with app.app_context():
        db.drop_all()
        db.create_all()
        for name in ['New', 'Follow-Up', 'Sold', 'Lost']:
            db.session.add(LeadStage(name=name))
        for name in ['Stephanie Scher', 'Sable Murphy', 'Jennifer Stewart', 'Daniel Murphy']:
            db.session.add(Employee(name=name))
        for name in ['Draft', 'Active', 'Completed']:
            db.session.add(ContractStatus(name=name))
        db.session.commit()


def test_vendor_client_product_flow():
    with app.app_context():
        client = app.test_client()
        rv = client.post('/vendors', json={'name': 'Vendor1'})
        assert rv.status_code == 201
        vendor_id = rv.get_json()['id']

        rv = client.post('/products', json={'sku': 'SKU1', 'name': 'Chair', 'price': '9.99', 'vendor_id': vendor_id})
        assert rv.status_code == 201

        rv = client.post('/clients', json={'name': 'Client1'})
        assert rv.status_code == 201

        rv = client.get('/vendors')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 1

        rv = client.get('/products')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 1

        rv = client.get('/clients')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 1

        rv = client.get('/leadstages')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 4


def test_contract_and_task_flow():
    with app.app_context():
        client = app.test_client()

        rv = client.post('/clients', json={'name': 'ClientA'})
        client_id = rv.get_json()['id']

        rv = client.post('/projects', json={'name': 'Proj'})
        project_id = rv.get_json()['id']

        rv = client.post('/contracts', json={'client_id': client_id, 'project_id': project_id, 'status_id': 1})
        assert rv.status_code == 201
        contract_id = rv.get_json()['id']

        rv = client.get('/contracts')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 1

        rv = client.post('/tasks', json={'name': 'Task1', 'contract_id': contract_id})
        assert rv.status_code == 201

        rv = client.get('/tasks')
        assert rv.status_code == 200
        assert len(rv.get_json()) == 1
