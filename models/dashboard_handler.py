from odoo import models, fields, api, _
from odoo.tools import date_utils
from datetime import date, datetime, timedelta
from collections import defaultdict


class DashboardHandler(models.Model):
    _name = "dashboard.handler"
    _description = "Prepare Data for Dashboard"

    # SALES ORDER KPI
    @api.model
    def get_sale_order_kpis(self, start_date, end_date):
        domain = [
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
            ('state', 'in', ['sale', 'done'])
        ]
        
        orders = self.env['sale.order'].search(domain)
        
        total_amount = sum(orders.mapped('amount_total'))
        total_orders = len(orders)
        #การหาค่าเฉลี่ยของราคารวม
        avg_order_value = total_amount / total_orders if total_orders > 0 else 0
        
        return {
            'total_amount': total_amount,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value
        }
    # QUOTATION KPI
    @api.model
    def get_quotation_kpis(self, start_date, end_date):
        domain = [
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
            ('state', 'in', ['draft', 'sent'])
        ]
        
        quotations = self.env['sale.order'].search(domain)
        
        total_amount = sum(quotations.mapped('amount_total'))
        total_quotations = len(quotations)
        #การหาค่าเฉลี่ยของราคารวม
        avg_quotation_value = total_amount / total_quotations if total_quotations > 0 else 0
        
        return {
            'total_amount': total_amount,
            'total_quotations': total_quotations,
            'avg_quotation_value': avg_quotation_value
        }
    # RECEIPT KPI
    @api.model
    def get_rc_kpis(self, start_date, end_date):
        domain = [
            ('invoice_date', '>=', start_date),
            ('invoice_date', '<=', end_date),
            ('move_type', 'in', ['out_invoice']),
            ('state', 'in', ['posted'])
        ]
        receipts = self.env['account.move'].search(domain)
        
        total_amount = sum(receipts.mapped('amount_total'))
        total_receipts = len(receipts)
        #การหาค่าเฉลี่ยของราคารวม
        avg_receipt_value = total_amount / total_receipts if total_receipts > 0 else 0
        
        return {
            'total_amount': total_amount,
            'total_reciepts': total_receipts,
            'avg_reciept_value': avg_receipt_value
        }

    # DAILY DATA CHART
    @api.model
    def get_daily_data(self, start_date, end_date):
        """Get daily data for the line chart"""
        # Convert string dates to datetime objects
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Initialize data structure
        daily_data = defaultdict(lambda: {
            'sales_amount': 0,
            'quotation_amount': 0,
            'invoice_amount': 0
        })
        
        # Get sales orders data
        sale_domain = [
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
            ('state', 'in', ['sale', 'done'])
        ]
        sales = self.env['sale.order'].search(sale_domain)
        for sale in sales:
            date_str = sale.date_order.strftime('%Y-%m-%d')
            daily_data[date_str]['sales_amount'] += sale.amount_total
        
        # Get quotations data
        quotation_domain = [
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
            ('state', 'in', ['draft', 'sent'])
        ]
        quotations = self.env['sale.order'].search(quotation_domain)
        for quotation in quotations:
            date_str = quotation.date_order.strftime('%Y-%m-%d')
            daily_data[date_str]['quotation_amount'] += quotation.amount_total
        
        # Get invoice data
        invoice_domain = [
            ('invoice_date', '>=', start_date),
            ('invoice_date', '<=', end_date),
            ('move_type', '=', 'out_invoice'),
            ('state', '=', 'posted')
        ]
        invoices = self.env['account.move'].search(invoice_domain)
        for invoice in invoices:
            date_str = invoice.invoice_date.strftime('%Y-%m-%d')
            daily_data[date_str]['invoice_amount'] += invoice.amount_total
        
        # Convert to list format for frontend
        result = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            data = daily_data[date_str]
            result.append({
                'date': date_str,
                'sales_amount': data['sales_amount'],
                'quotation_amount': data['quotation_amount'],
                'invoice_amount': data['invoice_amount']
            })
            current_date += timedelta(days=1)
        
        return result
        
