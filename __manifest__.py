{
    'name': 'Need Dashboard',
    'version': '1.0',
    'category': 'Sales',
    'summary': 'Custom Dashboard for Sales and Invoices',
    'description': """
        Custom Dashboard for Odoo 17 Community Edition
        Features:
        - Sales Order KPIs
        - Quotation KPIs
        - Invoice KPIs
        - Daily Data Charts
    """,
    'author': 'Sarawut Khantiyoo',
    'website': 'https://www.needshopping.co',
    'depends': ['base', 'sale', 'account'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/res_config_settings_views.xml',
        'views/dashboard_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'https://cdn.jsdelivr.net/npm/chart.js',
            'odoo_dashboard/static/src/components/dashboard/dashboard.js',
            'odoo_dashboard/static/src/components/dashboard/dashboard.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}