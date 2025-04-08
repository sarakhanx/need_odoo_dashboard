{
    'name': 'NEED Dashboard',
    'version': '17.0.1.0.0',
    'author': 'NEED',
    'website': "https://erp.needshopping.co",
    'license': 'AGPL-3',
    'depends': ['web', 'sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/dashboard_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'https://cdn.jsdelivr.net/npm/chart.js',
            'odoo_dashboard/static/src/components/**/*.js',
            'odoo_dashboard/static/src/components/**/*.xml',
            'odoo_dashboard/static/src/components/**/*.scss'
        ]
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}