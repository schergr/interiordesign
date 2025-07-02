from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from sqlalchemy.exc import OperationalError
import time

try:
    from .models import (
        db, Role, User, Vendor, Product, Project, ProductProject, Inventory,
        Client, Employee, LeadStage, Lead, ContractStatus, Contract, Task,
        Room, Item, Proposal, Invoice, Note
    )
except ImportError:  # allows running as 'python app.py'
    from models import (
        db, Role, User, Vendor, Product, Project, ProductProject, Inventory,
        Client, Employee, LeadStage, Lead, ContractStatus, Contract, Task,
        Room, Item, Proposal, Invoice, Note
    )
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/interiordesign')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt = Bcrypt(app)
auth = HTTPBasicAuth()


def get_tasks_service():
    creds_file = os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE')
    if not creds_file or not os.path.exists(creds_file):
        return None
    creds = Credentials.from_service_account_file(
        creds_file, scopes=['https://www.googleapis.com/auth/tasks']
    )
    return build('tasks', 'v1', credentials=creds)


def sync_task_to_google(task):
    service = get_tasks_service()
    if not service:
        return
    body = {'title': task.name}
    if task.due_date:
        body['due'] = f"{task.due_date.isoformat()}T00:00:00Z"
    try:
        res = service.tasks().insert(tasklist='@default', body=body).execute()
        task.google_task_id = res.get('id')
        db.session.commit()
    except Exception as exc:
        print('Google Tasks sync failed:', exc)

@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        return user
    return None

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid input'}), 400
    username = data.get('username')
    password = data.get('password')
    role_name = data.get('role', 'Designer')

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'User already exists'}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.session.add(role)
        db.session.commit()

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password_hash=pw_hash, role_id=role.id)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': f'User {username} created'}), 201

@app.route('/vendors', methods=['POST'])
def create_vendor():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    vendor = Vendor(name=name, contact_info=data.get('contact_info'))
    db.session.add(vendor)
    db.session.commit()
    return jsonify({'id': vendor.id}), 201


@app.route('/vendors', methods=['GET'])
def list_vendors():
    vendors = Vendor.query.all()
    return jsonify([
        {'id': v.id, 'name': v.name, 'contact_info': v.contact_info}
        for v in vendors
    ])


@app.route('/vendors/<int:vendor_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)
    if request.method == 'GET':
        return jsonify({
            'id': vendor.id,
            'name': vendor.name,
            'contact_info': vendor.contact_info,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'contact_info']:
            if field in data:
                setattr(vendor, field, data[field])
        db.session.commit()
        return jsonify({'id': vendor.id})
    else:
        db.session.delete(vendor)
        db.session.commit()
        return '', 204


@app.route('/products', methods=['GET'])
def list_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


@app.route('/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}
    if not data.get('sku') or not data.get('name'):
        return jsonify({'error': 'Invalid input'}), 400
    product = Product(
        sku=data['sku'],
        name=data['name'],
        price=data.get('price'),
        vendor_id=data.get('vendor_id')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'id': product.id}), 201


@app.route('/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        return jsonify({
            'id': product.id,
            'sku': product.sku,
            'name': product.name,
            'price': str(product.price) if product.price else None,
            'vendor_id': product.vendor_id,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['sku', 'name', 'price', 'vendor_id']:
            if field in data:
                setattr(product, field, data[field])
        db.session.commit()
        return jsonify({'id': product.id})
    else:
        db.session.delete(product)
        db.session.commit()
        return '', 204


@app.route('/clients', methods=['POST'])
def create_client():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        fn = data.get('first_name', '')
        ln = data.get('last_name', '')
        name = f"{fn} {ln}".strip()
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    client = Client(
        name=name,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        primary_phone=data.get('primary_phone'),
        primary_email=data.get('primary_email'),
        secondary_phone=data.get('secondary_phone'),
        secondary_email=data.get('secondary_email'),
        referral_type=data.get('referral_type'),
        employee_id=data.get('employee_id'),
        contact_info=data.get('contact_info')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify({'id': client.id}), 201


@app.route('/clients', methods=['GET'])
def list_clients():
    clients = Client.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'first_name': c.first_name,
            'last_name': c.last_name,
            'primary_phone': c.primary_phone,
            'primary_email': c.primary_email,
            'secondary_phone': c.secondary_phone,
            'secondary_email': c.secondary_email,
            'referral_type': c.referral_type,
            'employee': c.employee.name if c.employee else None,
            'contact_info': c.contact_info
        }
        for c in clients
    ])


@app.route('/clients/<int:client_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_client(client_id):
    client = Client.query.get_or_404(client_id)
    if request.method == 'GET':
        return jsonify({
            'id': client.id,
            'name': client.name,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'primary_phone': client.primary_phone,
            'primary_email': client.primary_email,
            'secondary_phone': client.secondary_phone,
            'secondary_email': client.secondary_email,
            'referral_type': client.referral_type,
            'employee_id': client.employee_id,
            'contact_info': client.contact_info,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in [
            'name', 'first_name', 'last_name', 'primary_phone', 'primary_email',
            'secondary_phone', 'secondary_email', 'referral_type', 'employee_id',
            'contact_info'
        ]:
            if field in data:
                setattr(client, field, data[field])
        db.session.commit()
        return jsonify({'id': client.id})
    else:
        db.session.delete(client)
        db.session.commit()
        return '', 204

@app.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    project = Project(
        name=name,
        description=data.get('description'),
        start_date=data.get('start_date'),
        client_id=data.get('client_id')
    )
    db.session.add(project)
    db.session.commit()
    for pid in data.get('product_ids', []):
        db.session.add(ProductProject(product_id=pid, project_id=project.id))
    db.session.commit()
    return jsonify({'id': project.id}), 201

@app.route('/projects', methods=['GET'])
def list_projects():
    projects = Project.query.all()
    result = []
    for p in projects:
        products = ProductProject.query.filter_by(project_id=p.id).all()
        result.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'start_date': p.start_date.isoformat() if p.start_date else None,
            'client': p.client.name if p.client else None,
            'products': [
                {
                    'id': pp.product.id,
                    'name': pp.product.name,
                    'quantity': pp.quantity
                } for pp in products
            ]
        })
    return jsonify(result)


@app.route('/projects/<int:project_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_project(project_id):
    project = Project.query.get_or_404(project_id)
    if request.method == 'GET':
        return jsonify({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'client_id': project.client_id,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'description', 'start_date', 'client_id']:
            if field in data:
                setattr(project, field, data[field])
        db.session.commit()
        return jsonify({'id': project.id})
    else:
        db.session.delete(project)
        db.session.commit()
        return '', 204

@app.route('/leadstages', methods=['GET'])
def list_lead_stages():
    stages = LeadStage.query.all()
    return jsonify([{'id': s.id, 'name': s.name} for s in stages])

@app.route('/leads', methods=['POST'])
def create_lead():
    data = request.get_json() or {}
    name = data.get('name')
    stage_id = data.get('stage_id')
    if not name or not stage_id:
        return jsonify({'error': 'Invalid input'}), 400
    lead = Lead(name=name, contact_info=data.get('contact_info'), stage_id=stage_id)
    db.session.add(lead)
    db.session.commit()
    return jsonify({'id': lead.id}), 201

@app.route('/leads', methods=['GET'])
def list_leads():
    leads = Lead.query.all()
    return jsonify([
        {
            'id': l.id,
            'name': l.name,
            'contact_info': l.contact_info,
            'stage': l.stage.name if l.stage else None
        } for l in leads
    ])


@app.route('/leads/<int:lead_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_lead(lead_id):
    lead = Lead.query.get_or_404(lead_id)
    if request.method == 'GET':
        return jsonify({
            'id': lead.id,
            'name': lead.name,
            'contact_info': lead.contact_info,
            'stage_id': lead.stage_id,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'contact_info', 'stage_id']:
            if field in data:
                setattr(lead, field, data[field])
        db.session.commit()
        return jsonify({'id': lead.id})
    else:
        db.session.delete(lead)
        db.session.commit()
        return '', 204


@app.route('/contractstatuses', methods=['GET'])
def list_contract_statuses():
    statuses = ContractStatus.query.all()
    return jsonify([{'id': s.id, 'name': s.name} for s in statuses])


@app.route('/contracts', methods=['POST'])
def create_contract():
    data = request.get_json() or {}
    contract = Contract(
        client_id=data.get('client_id'),
        employee_id=data.get('employee_id'),
        project_id=data.get('project_id'),
        lead_id=data.get('lead_id'),
        status_id=data.get('status_id'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        amount=data.get('amount'),
    )
    db.session.add(contract)
    db.session.commit()
    return jsonify({'id': contract.id}), 201


@app.route('/contracts', methods=['GET'])
def list_contracts():
    contracts = Contract.query.all()
    return jsonify([
        {
            'id': c.id,
            'client': c.client.name if c.client else None,
            'employee': c.employee.name if c.employee else None,
            'project': c.project.name if c.project else None,
            'lead': c.lead.name if c.lead else None,
            'status': c.status.name if c.status else None,
            'amount': str(c.amount) if c.amount else None,
        }
        for c in contracts
    ])


@app.route('/contracts/<int:contract_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    if request.method == 'GET':
        return jsonify({
            'id': contract.id,
            'client_id': contract.client_id,
            'employee_id': contract.employee_id,
            'project_id': contract.project_id,
            'lead_id': contract.lead_id,
            'status_id': contract.status_id,
            'start_date': contract.start_date.isoformat() if contract.start_date else None,
            'end_date': contract.end_date.isoformat() if contract.end_date else None,
            'amount': str(contract.amount) if contract.amount else None,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in [
            'client_id', 'employee_id', 'project_id', 'lead_id',
            'status_id', 'start_date', 'end_date', 'amount'
        ]:
            if field in data:
                setattr(contract, field, data[field])
        db.session.commit()
        return jsonify({'id': contract.id})
    else:
        db.session.delete(contract)
        db.session.commit()
        return '', 204


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    task = Task(
        name=name,
        due_date=data.get('due_date'),
        completed=data.get('completed', False),
        contract_id=data.get('contract_id'),
    )
    db.session.add(task)
    db.session.commit()
    sync_task_to_google(task)
    return jsonify({'id': task.id}), 201


@app.route('/tasks', methods=['GET'])
def list_tasks():
    tasks = Task.query.all()
    return jsonify([
        {
            'id': t.id,
            'name': t.name,
            'completed': t.completed,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'contract_id': t.contract_id,
        }
        for t in tasks
    ])


@app.route('/tasks/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_task(task_id):
    task = Task.query.get_or_404(task_id)
    if request.method == 'GET':
        return jsonify({
            'id': task.id,
            'name': task.name,
            'completed': task.completed,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'contract_id': task.contract_id,
        })
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'completed', 'due_date', 'contract_id']:
            if field in data:
                setattr(task, field, data[field])
        db.session.commit()
        return jsonify({'id': task.id})
    else:
        db.session.delete(task)
        db.session.commit()
        return '', 204

@app.route('/employees', methods=['GET'])
def list_employees():
    employees = Employee.query.all()
    return jsonify([{'id': e.id, 'name': e.name} for e in employees])


@app.route('/employees/<int:employee_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    if request.method == 'GET':
        return jsonify({'id': employee.id, 'name': employee.name})
    elif request.method == 'PUT':
        data = request.get_json() or {}
        if 'name' in data:
            employee.name = data['name']
            db.session.commit()
        return jsonify({'id': employee.id})
    else:
        db.session.delete(employee)
        db.session.commit()
        return '', 204

# -------------------- New Models --------------------

@app.route('/rooms', methods=['POST'])
def create_room():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    room = Room(name=name, project_id=data.get('project_id'))
    db.session.add(room)
    db.session.commit()
    return jsonify({'id': room.id}), 201


@app.route('/rooms', methods=['GET'])
def list_rooms():
    rooms = Room.query.all()
    return jsonify([r.to_dict() for r in rooms])


@app.route('/rooms/<int:room_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_room(room_id):
    room = Room.query.get_or_404(room_id)
    if request.method == 'GET':
        return jsonify(room.to_dict())
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'project_id']:
            if field in data:
                setattr(room, field, data[field])
        db.session.commit()
        return jsonify({'id': room.id})
    else:
        db.session.delete(room)
        db.session.commit()
        return '', 204


@app.route('/items', methods=['POST'])
def create_item():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Invalid input'}), 400
    item = Item(name=name, room_id=data.get('room_id'))
    db.session.add(item)
    db.session.commit()
    return jsonify({'id': item.id}), 201


@app.route('/items', methods=['GET'])
def list_items():
    items = Item.query.all()
    return jsonify([i.to_dict() for i in items])


@app.route('/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_item(item_id):
    item = Item.query.get_or_404(item_id)
    if request.method == 'GET':
        return jsonify(item.to_dict())
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['name', 'room_id']:
            if field in data:
                setattr(item, field, data[field])
        db.session.commit()
        return jsonify({'id': item.id})
    else:
        db.session.delete(item)
        db.session.commit()
        return '', 204


@app.route('/proposals', methods=['POST'])
def create_proposal():
    data = request.get_json() or {}
    proposal = Proposal(project_id=data.get('project_id'), description=data.get('description'))
    db.session.add(proposal)
    db.session.commit()
    return jsonify({'id': proposal.id}), 201


@app.route('/proposals', methods=['GET'])
def list_proposals():
    proposals = Proposal.query.all()
    return jsonify([p.to_dict() for p in proposals])


@app.route('/proposals/<int:proposal_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_proposal(proposal_id):
    proposal = Proposal.query.get_or_404(proposal_id)
    if request.method == 'GET':
        return jsonify(proposal.to_dict())
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['project_id', 'description']:
            if field in data:
                setattr(proposal, field, data[field])
        db.session.commit()
        return jsonify({'id': proposal.id})
    else:
        db.session.delete(proposal)
        db.session.commit()
        return '', 204


@app.route('/invoices', methods=['POST'])
def create_invoice():
    data = request.get_json() or {}
    invoice = Invoice(proposal_id=data.get('proposal_id'), amount=data.get('amount'))
    db.session.add(invoice)
    db.session.commit()
    return jsonify({'id': invoice.id}), 201


@app.route('/invoices', methods=['GET'])
def list_invoices():
    invoices = Invoice.query.all()
    return jsonify([inv.to_dict() for inv in invoices])


@app.route('/invoices/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    if request.method == 'GET':
        return jsonify(invoice.to_dict())
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['proposal_id', 'amount']:
            if field in data:
                setattr(invoice, field, data[field])
        db.session.commit()
        return jsonify({'id': invoice.id})
    else:
        db.session.delete(invoice)
        db.session.commit()
        return '', 204


@app.route('/notes', methods=['POST'])
def create_note():
    data = request.get_json() or {}
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Invalid input'}), 400
    note = Note(text=text, project_id=data.get('project_id'))
    db.session.add(note)
    db.session.commit()
    return jsonify({'id': note.id}), 201


@app.route('/notes', methods=['GET'])
def list_notes():
    notes = Note.query.all()
    return jsonify([n.to_dict() for n in notes])


@app.route('/notes/<int:note_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_note(note_id):
    note = Note.query.get_or_404(note_id)
    if request.method == 'GET':
        return jsonify(note.to_dict())
    elif request.method == 'PUT':
        data = request.get_json() or {}
        for field in ['text', 'project_id']:
            if field in data:
                setattr(note, field, data[field])
        db.session.commit()
        return jsonify({'id': note.id})
    else:
        db.session.delete(note)
        db.session.commit()
        return '', 204

def create_tables_with_retry(retries: int = 5, delay: int = 2):
    """Create all tables, retrying if the database isn't ready."""
    for attempt in range(1, retries + 1):
        try:
            db.create_all()
            return True
        except OperationalError as exc:
            print(
                f"Database not ready (attempt {attempt}/{retries}): {exc}\nRetrying in {delay}s..."
            )
            time.sleep(delay)
    print(f"Failed to initialize database after {retries} attempts.")
    return False


if __name__ == '__main__':
    with app.app_context():
        if not create_tables_with_retry():
            exit(1)
        if LeadStage.query.count() == 0:
            for name in ['New', 'Follow-Up', 'Sold', 'Lost']:
                db.session.add(LeadStage(name=name))
            db.session.commit()
        if Employee.query.count() == 0:
            for name in ['Stephanie Scher', 'Sable Murphy', 'Jennifer Stewart', 'Daniel Murphy']:
                db.session.add(Employee(name=name))
            db.session.commit()
        if ContractStatus.query.count() == 0:
            for name in ['Draft', 'Active', 'Completed']:
                db.session.add(ContractStatus(name=name))
            db.session.commit()
    app.run(host='0.0.0.0', port=5000)
