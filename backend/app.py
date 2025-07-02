from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS

try:
    from .models import db, Role, User, Vendor, Product, Project, ProductProject, Inventory, Client
except ImportError:  # allows running as 'python app.py'
    from models import db, Role, User, Vendor, Product, Project, ProductProject, Inventory, Client
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/interiordesign')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt = Bcrypt(app)
auth = HTTPBasicAuth()

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

@app.route('/employees', methods=['GET'])
def list_employees():
    employees = Employee.query.all()
    return jsonify([{'id': e.id, 'name': e.name} for e in employees])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if LeadStage.query.count() == 0:
            for name in ['New', 'Follow-Up', 'Sold', 'Lost']:
                db.session.add(LeadStage(name=name))
            db.session.commit()
        if Employee.query.count() == 0:
            for name in ['Stephanie Scher', 'Sable Murphy', 'Jennifer Stewart', 'Daniel Murphy']:
                db.session.add(Employee(name=name))
            db.session.commit()
    app.run(host='0.0.0.0', port=5000)
