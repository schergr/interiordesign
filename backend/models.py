from flask_sqlalchemy import SQLAlchemy

# Initialize database without app, to avoid circular import

db = SQLAlchemy()

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    role = db.relationship('Role')

class Vendor(db.Model):
    __tablename__ = 'vendors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    contact_info = db.Column(db.String(256))
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    primary_email = db.Column(db.String(128))
    secondary_email = db.Column(db.String(128))
    primary_phone = db.Column(db.String(32))
    secondary_phone = db.Column(db.String(32))
    description = db.Column(db.Text)
    address1 = db.Column(db.String(128))
    address2 = db.Column(db.String(128))
    city = db.Column(db.String(64))
    state = db.Column(db.String(32))
    zip_code = db.Column(db.String(10))
    tax_id = db.Column(db.String(64))
    site_url = db.Column(db.String(256))
    catalog_url = db.Column(db.String(256))
    products = db.relationship('Product', back_populates='vendor')
    documents = db.relationship('Document', back_populates='vendor')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_info': self.contact_info,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'primary_email': self.primary_email,
            'secondary_email': self.secondary_email,
            'primary_phone': self.primary_phone,
            'secondary_phone': self.secondary_phone,
            'description': self.description,
            'address1': self.address1,
            'address2': self.address2,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'tax_id': self.tax_id,
            'site_url': self.site_url,
            'catalog_url': self.catalog_url,
            'products': [p.name for p in self.products],
            'documents': [d.to_dict() for d in self.documents]
        }


class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'))
    vendor = db.relationship('Vendor', back_populates='documents')

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    price = db.Column(db.Numeric(10,2))
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'))
    vendor = db.relationship('Vendor', back_populates='products')

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'price': str(self.price),
            'vendor': self.vendor.name if self.vendor else None
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    client = db.relationship('Client')

class ProductProject(db.Model):
    __tablename__ = 'product_projects'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    quantity = db.Column(db.Integer, default=1)
    product = db.relationship('Product')
    project = db.relationship('Project')

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    quantity = db.Column(db.Integer, default=0)
    product = db.relationship('Product')

class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    primary_phone = db.Column(db.String(32))
    primary_email = db.Column(db.String(128))
    secondary_phone = db.Column(db.String(32))
    secondary_email = db.Column(db.String(128))
    referral_type = db.Column(db.String(64))
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    employee = db.relationship('Employee')
    contact_info = db.Column(db.String(256))

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)

class LeadStage(db.Model):
    __tablename__ = 'lead_stages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)

class Lead(db.Model):
    __tablename__ = 'leads'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    contact_info = db.Column(db.String(256))
    stage_id = db.Column(db.Integer, db.ForeignKey('lead_stages.id'))
    stage = db.relationship('LeadStage')

class ContractStatus(db.Model):
    __tablename__ = 'contract_statuses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)


class Contract(db.Model):
    __tablename__ = 'contracts'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'))
    status_id = db.Column(db.Integer, db.ForeignKey('contract_statuses.id'))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    amount = db.Column(db.Numeric(10,2))

    client = db.relationship('Client')
    employee = db.relationship('Employee')
    project = db.relationship('Project')
    lead = db.relationship('Lead')
    status = db.relationship('ContractStatus')


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    due_date = db.Column(db.Date)
    completed = db.Column(db.Boolean, default=False)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'))
    google_task_id = db.Column(db.String(128))

    contract = db.relationship('Contract')
class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    project = db.relationship('Project')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'project': self.project.name if self.project else None
        }

class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'))
    room = db.relationship('Room')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'room': self.room.name if self.room else None
        }

class Proposal(db.Model):
    __tablename__ = 'proposals'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    description = db.Column(db.Text)
    project = db.relationship('Project')

    def to_dict(self):
        return {
            'id': self.id,
            'project': self.project.name if self.project else None,
            'description': self.description
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey('proposals.id'))
    amount = db.Column(db.Numeric(10,2))
    proposal = db.relationship('Proposal')

    def to_dict(self):
        return {
            'id': self.id,
            'proposal_id': self.proposal_id,
            'amount': str(self.amount) if self.amount else None
        }

class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    project = db.relationship('Project')

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'project': self.project.name if self.project else None
        }
