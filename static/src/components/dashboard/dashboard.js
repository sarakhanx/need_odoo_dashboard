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
            startDate: firstDayOfMonth,
            endDate: today,
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
            }
        });

        // Bind methods to this component
        this.onDateChange = this.onDateChange.bind(this);
        this.loadKPIData = this.loadKPIData.bind(this);

        onWillStart(async () => {
            await this.loadKPIData();
        });

        onMounted(() => {
            this.initChart();
        });
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
            
            // Update state
            this.state.kpiData = kpiData;
            this.state.quotationData = quotationData;
            this.state.receiptData = receiptData;
            
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
