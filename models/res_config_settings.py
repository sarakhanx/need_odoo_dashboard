from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    entry_strategy = fields.Selection([
        ('all', 'Show All'),
        ('filter', 'Show Filtered')
    ], string='Entry Display Strategy', default='all',
        config_parameter='odoo_dashboard.entry_strategy')

    update_device = fields.Boolean(
        string="Update Device",
        config_parameter='odoo_dashboard.update_device')

    device_api_base_url = fields.Char(
        string="Device API Base URL",
        config_parameter='odoo_dashboard.device_api_base_url',
        help="Base URL for the device API endpoint") 