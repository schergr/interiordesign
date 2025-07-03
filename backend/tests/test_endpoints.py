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
        rv = client.post('/vendors', json={
            'name': 'Vendor1',
            'first_name': 'John',
            'last_name': 'Doe',
            'primary_email': 'john@example.com',
            'primary_phone': '111-2222'
        })
        assert rv.status_code == 201
        vendor_id = rv.get_json()['id']

        rv = client.post('/products', json={'sku': 'SKU1', 'name': 'Chair', 'price': '9.99', 'vendor_id': vendor_id})
        assert rv.status_code == 201

        rv = client.post('/clients', json={'name': 'Client1'})
        assert rv.status_code == 201

        rv = client.get('/vendors')
        assert rv.status_code == 200
        vendors = rv.get_json()
        assert len(vendors) == 1
        assert vendors[0]['first_name'] == 'John'

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


def test_crud_endpoints():
    with app.app_context():
        client = app.test_client()

        # Vendor CRUD
        rv = client.post('/vendors', json={'name': 'V1', 'primary_email': 'a@b.c'})
        vid = rv.get_json()['id']
        rv = client.get(f'/vendors/{vid}')
        assert rv.get_json()['primary_email'] == 'a@b.c'
        rv = client.put(f'/vendors/{vid}', json={'primary_email': 'd@e.f'})
        assert rv.status_code == 200
        rv = client.get(f'/vendors/{vid}')
        assert rv.get_json()['primary_email'] == 'd@e.f'
        rv = client.delete(f'/vendors/{vid}')
        assert rv.status_code == 204
        assert client.get('/vendors').get_json() == []

        # Product CRUD
        rv = client.post('/vendors', json={'name': 'PV'})
        vendor_id = rv.get_json()['id']
        rv = client.post('/products', json={'sku': 'S1', 'name': 'Prod', 'vendor_id': vendor_id})
        pid = rv.get_json()['id']
        rv = client.get(f'/products/{pid}')
        assert rv.get_json()['name'] == 'Prod'
        rv = client.put(f'/products/{pid}', json={'name': 'Prod2'})
        rv = client.get(f'/products/{pid}')
        assert rv.get_json()['name'] == 'Prod2'
        rv = client.delete(f'/products/{pid}')
        assert rv.status_code == 204
        assert client.get('/products').get_json() == []

        # Client CRUD
        rv = client.post('/clients', json={'name': 'C1'})
        cid = rv.get_json()['id']
        assert client.get(f'/clients/{cid}').status_code == 200
        rv = client.put(f'/clients/{cid}', json={'name': 'C2'})
        rv = client.get(f'/clients/{cid}')
        assert rv.get_json()['name'] == 'C2'
        rv = client.delete(f'/clients/{cid}')
        assert rv.status_code == 204
        assert client.get('/clients').get_json() == []

        # Project CRUD
        rv = client.post('/projects', json={'name': 'P1'})
        project_id = rv.get_json()['id']
        rv = client.get(f'/projects/{project_id}')
        assert rv.get_json()['name'] == 'P1'
        rv = client.put(f'/projects/{project_id}', json={'name': 'P2'})
        rv = client.get(f'/projects/{project_id}')
        assert rv.get_json()['name'] == 'P2'
        rv = client.delete(f'/projects/{project_id}')
        assert rv.status_code == 204
        assert client.get('/projects').get_json() == []

        # Lead CRUD
        rv = client.post('/leads', json={'name': 'L1', 'stage_id': 1})
        lead_id = rv.get_json()['id']
        rv = client.get(f'/leads/{lead_id}')
        assert rv.get_json()['name'] == 'L1'
        rv = client.put(f'/leads/{lead_id}', json={'name': 'L2'})
        rv = client.get(f'/leads/{lead_id}')
        assert rv.get_json()['name'] == 'L2'
        rv = client.delete(f'/leads/{lead_id}')
        assert rv.status_code == 204
        assert client.get('/leads').get_json() == []

        # Employee CRUD (pre-existing record)
        employees = client.get('/employees').get_json()
        emp_id = employees[0]['id']
        rv = client.get(f'/employees/{emp_id}')
        assert rv.status_code == 200
        rv = client.put(f'/employees/{emp_id}', json={'name': 'EmpNew'})
        rv = client.get(f'/employees/{emp_id}')
        assert rv.get_json()['name'] == 'EmpNew'
        before = len(client.get('/employees').get_json())
        rv = client.delete(f'/employees/{emp_id}')
        assert rv.status_code == 204
        after = len(client.get('/employees').get_json())
        assert after == before - 1


def test_additional_models():
    with app.app_context():
        client = app.test_client()

        # Room creation and retrieval
        rv = client.post('/rooms', json={'name': 'Living'})
        assert rv.status_code == 201
        room_id = rv.get_json()['id']
        rv = client.get(f'/rooms/{room_id}')
        assert rv.get_json()['name'] == 'Living'

        # Item creation linked to room
        rv = client.post('/items', json={'name': 'Couch', 'room_id': room_id})
        assert rv.status_code == 201
        item_id = rv.get_json()['id']
        rv = client.get(f'/items/{item_id}')
        assert rv.get_json()['name'] == 'Couch'

        # Proposal, Invoice, and Note creation
        rv = client.post('/projects', json={'name': 'ProjExtra'})
        proj_id = rv.get_json()['id']

        rv = client.post('/proposals', json={'project_id': proj_id, 'description': 'Desc'})
        proposal_id = rv.get_json()['id']
        assert client.get(f'/proposals/{proposal_id}').status_code == 200

        rv = client.post('/invoices', json={'proposal_id': proposal_id, 'amount': '10.00'})
        invoice_id = rv.get_json()['id']
        rv = client.get(f'/invoices/{invoice_id}')
        assert rv.get_json()['id'] == invoice_id

        rv = client.post('/notes', json={'text': 'Note1', 'project_id': proj_id})
        note_id = rv.get_json()['id']
        rv = client.get(f'/notes/{note_id}')
        assert rv.get_json()['text'] == 'Note1'
