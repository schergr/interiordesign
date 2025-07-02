from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS
from .models import db, Role, User, Vendor, Product, Project, ProductProject, Inventory, Client
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
        return jsonify({'error': 'Invalid input'}), 400
    client = Client(name=name, contact_info=data.get('contact_info'))
    db.session.add(client)
    db.session.commit()
    return jsonify({'id': client.id}), 201


@app.route('/clients', methods=['GET'])
def list_clients():
    clients = Client.query.all()
    return jsonify([
        {'id': c.id, 'name': c.name, 'contact_info': c.contact_info}
        for c in clients
    ])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
