/** @odoo-module */
import { registry } from '@web/core/registry';
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { formatDateTime } from "@web/core/l10n/dates";

const { Component, useState, onWillStart, onMounted } = owl;

export class OdooDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        
        // Initialize with today's date
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        this.state = useState({
            kpiData: {
                total_amount: 0,
                total_orders: 0,
                avg_order_value: 0
            },
            quotationData: {
                total_amount: 0,
                total_quotations: 0,
                avg_quotation_value: 0
            },
            receiptData: {
                total_amount: 0,
                total_reciepts: 0,
                avg_reciept_value: 0
            },
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: 'คำสั่งขาย',
                        data: [],
                        borderColor: 'rgb(3, 255, 255)',
                        tension: 0.1
                    },
                    {
                        label: 'ใบเสนอราคาที่ยังไม่ได้ยืนยัน',
                        data: [],
                        borderColor: 'rgb(31, 188, 118)',
                        tension: 0.1
                    },
                    {
                        label: 'ใบแจ้งหนี้ RC',
                        data: [],
                        borderColor: 'rgb(227, 185, 19)',
                        tension: 0.1
                    }
                ]
            },
            topProducts: [],
            startDate: firstDayOfMonth,
            endDate: today
        });

        // Bind methods to this component
        this.onDateChange = this.onDateChange.bind(this);
        this.loadKPIData = this.loadKPIData.bind(this);
        this.formatDateForAPI = this.formatDateForAPI.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);

        onWillStart(async () => {
            await this.loadKPIData();
        });

        onMounted(() => {
            this.initChart();
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDateForAPI(date) {
        if (!date) return null;
        
        // Ensure we have a valid date object
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            console.error("Invalid date:", date);
            return null;
        }
        
        // Format as YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    async loadKPIData() {
        try {
            // Format dates as YYYY-MM-DD
            const startDate = this.formatDateForAPI(this.state.startDate);
            const endDate = this.formatDateForAPI(this.state.endDate);
            
            // Load sales order KPIs
            const kpiData = await this.orm.call(
                'dashboard.handler',
                'get_sale_order_kpis',
                [startDate, endDate]
            );
            
            // Load quotation KPIs
            const quotationData = await this.orm.call(
                'dashboard.handler',
                'get_quotation_kpis',
                [startDate, endDate]
            );
            
            // Load receipt KPIs
            const receiptData = await this.orm.call(
                'dashboard.handler',
                'get_rc_kpis',
                [startDate, endDate]
            );

            // Load daily data for chart
            const dailyData = await this.orm.call(
                'dashboard.handler',
                'get_daily_data',
                [startDate, endDate]
            );

            // Load top selling products
            const topProducts = await this.orm.call(
                'dashboard.handler',
                'get_top_selling_products',
                [startDate, endDate, 20]
            );

            // Update state
            this.state.kpiData = kpiData;
            this.state.quotationData = quotationData;
            this.state.receiptData = receiptData;
            this.state.topProducts = topProducts;

            // Update chart data
            this.state.chartData.labels = dailyData.map(item => item.date);
            this.state.chartData.datasets[0].data = dailyData.map(item => item.sales_amount);
            this.state.chartData.datasets[1].data = dailyData.map(item => item.quotation_amount);
            this.state.chartData.datasets[2].data = dailyData.map(item => item.invoice_amount);
            
            // Update chart if it exists
            if (this.chart) {
                this.chart.data = this.state.chartData;
                this.chart.update();
            }
            
        } catch (error) {
            console.error("Error loading KPI data:", error);
        }
    }

    async onDateChange() {
        await this.loadKPIData();
    }

    initChart() {
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: this.state.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    point: {
                        radius: 5,
                        hoverRadius: 8,
                        borderWidth: 2,
                        backgroundColor: 'white'
                    },
                    line: {
                        tension: 0.3
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        },
                        onClick: (evt, legendItem, legend) => {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const meta = ci.getDatasetMeta(index);
                            
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                            
                            // Apply animation when toggling visibility
                            ci.update('active');
                        }
                    },
                    title: {
                        display: true,
                        text: 'ข้อมูลรายวัน'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        });
    }
}

OdooDashboard.template = "odoo_dashboard.OdooDashboard";
registry.category("actions").add("odoo_dashboard", OdooDashboard);

// Add template for top products table
const dashboardTemplate = `
    <div class="o_dashboard_container">
        <div class="o_dashboard_header">
            <h1>Sales Dashboard</h1>
            <DatePicker onDateChange="onDateChange" />
        </div>
        
        <div class="o_dashboard_kpis">
            <div class="o_dashboard_kpi_card">
                <h3>Sales Orders</h3>
                <div class="o_dashboard_kpi_value">
                    <span t-esc="state.kpiData.total_orders" />
                </div>
                <div class="o_dashboard_kpi_amount">
                    <span t-esc="formatCurrency(state.kpiData.total_amount)" />
                </div>
            </div>
            
            <div class="o_dashboard_kpi_card">
                <h3>Quotations</h3>
                <div class="o_dashboard_kpi_value">
                    <span t-esc="state.quotationData.total_quotations" />
                </div>
                <div class="o_dashboard_kpi_amount">
                    <span t-esc="formatCurrency(state.quotationData.total_amount)" />
                </div>
            </div>
            
            <div class="o_dashboard_kpi_card">
                <h3>Invoices</h3>
                <div class="o_dashboard_kpi_value">
                    <span t-esc="state.receiptData.total_reciepts" />
                </div>
                <div class="o_dashboard_kpi_amount">
                    <span t-esc="formatCurrency(state.receiptData.total_amount)" />
                </div>
            </div>
        </div>
        
        <div class="o_dashboard_chart">
            <LineChart data="state.chartData" />
        </div>
        
        <div class="o_dashboard_top_products">
            <h2>Top Selling Products</h2>
            <table class="o_dashboard_products_table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Code</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <t t-foreach="state.topProducts" t-as="product">
                        <tr>
                            <td class="o_dashboard_product_image">
                                <t t-if="product.image_url">
                                    <img t-att-src="'data:image/png;base64,' + product.image_url" alt="Product Image" />
                                </t>
                                <t t-else="">
                                    <div class="o_dashboard_no_image">
                                        <i class="fa fa-image"></i>
                                    </div>
                                </t>
                            </td>
                            <td><span t-esc="product.name" /></td>
                            <td><span t-esc="product.default_code" /></td>
                            <td><span t-esc="product.quantity" /></td>
                            <td><span t-esc="formatCurrency(product.amount)" /></td>
                            <td><span t-esc="formatCurrency(product.list_price)" /></td>
                        </tr>
                    </t>
                </tbody>
            </table>
        </div>
    </div>
`;

// Add CSS for the new components
const dashboardStyle = `
    .o_dashboard_container {
        padding: 20px;
    }
    
    .o_dashboard_header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .o_dashboard_kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .o_dashboard_kpi_card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .o_dashboard_kpi_value {
        font-size: 24px;
        font-weight: bold;
        color: #875A7B;
    }
    
    .o_dashboard_kpi_amount {
        font-size: 18px;
        color: #666;
    }
    
    .o_dashboard_chart {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }
    
    .o_dashboard_top_products {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .o_dashboard_products_table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .o_dashboard_products_table th,
    .o_dashboard_products_table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    
    .o_dashboard_products_table th {
        background-color: #f8f9fa;
        font-weight: bold;
    }
    
    .o_dashboard_product_image {
        width: 50px;
        height: 50px;
    }
    
    .o_dashboard_product_image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .o_dashboard_no_image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;
        border-radius: 4px;
        color: #875A7B;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            opacity: 1;
        }
    }
`;

// Register the template and style
registry.category("templates").add("odoo_dashboard.Dashboard", dashboardTemplate);
registry.category("assets_backend").add("odoo_dashboard.style", dashboardStyle);
