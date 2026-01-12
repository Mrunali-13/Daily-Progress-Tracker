import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.TASKS.BASE);
                const tasks = response.data;

                const newStats = tasks.reduce((acc, task) => {
                    acc.total++;
                    if (task.status === 'PENDING') acc.pending++;
                    if (task.status === 'IN_PROGRESS') acc.inProgress++;
                    if (task.status === 'COMPLETED') acc.completed++;
                    if (task.priority === 'HIGH') acc.highPriority++;
                    if (task.priority === 'MEDIUM') acc.mediumPriority++;
                    if (task.priority === 'LOW') acc.lowPriority++;
                    return acc;
                }, {
                    total: 0,
                    pending: 0,
                    inProgress: 0,
                    completed: 0,
                    highPriority: 0,
                    mediumPriority: 0,
                    lowPriority: 0
                });

                setStats(newStats);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statusChartData = {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [
            {
                data: [stats.pending, stats.inProgress, stats.completed],
                backgroundColor: ['#6366F1', '#F59E0B', '#10B981'],
                hoverBackgroundColor: ['#4F46E5', '#D97706', '#059669']
            }
        ]
    };

    const statusChartOptions = {
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        maintainAspectRatio: false,
        aspectRatio: 1
    };

    const priorityChartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
            {
                label: 'Tasks Count',
                data: [stats.lowPriority, stats.mediumPriority, stats.highPriority],
                backgroundColor: ['#9CA3AF', '#3B82F6', '#EF4444'],
                borderWidth: 1
            }
        ]
    };

    const priorityChartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        },
        maintainAspectRatio: false,
        aspectRatio: 1.5
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-20rem">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    return (
        <div className="flex flex-column gap-4">
            <h2 className="text-2xl font-bold m-0">User Dashboard</h2>

            {/* Quick Stats Cards */}
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="shadow-2 border-left-3 border-blue-500 overflow-hidden">
                        <div className="flex align-items-center gap-3">
                            <div className="dashboard-card-icon bg-blue-100 flex-shrink-0">
                                <i className="pi pi-list text-blue-500 text-2xl"></i>
                            </div>
                            <div className="flex flex-column">
                                <span className="text-500 font-medium text-sm mb-1 uppercase tracking-wider">Total Tasks</span>
                                <span className="text-900 font-bold text-2xl">{stats.total}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="shadow-2 border-left-3 border-orange-500 overflow-hidden">
                        <div className="flex align-items-center gap-3">
                            <div className="dashboard-card-icon bg-orange-100 flex-shrink-0">
                                <i className="pi pi-clock text-orange-500 text-2xl"></i>
                            </div>
                            <div className="flex flex-column">
                                <span className="text-500 font-medium text-sm mb-1 uppercase tracking-wider">Pending</span>
                                <span className="text-900 font-bold text-2xl">{stats.pending + stats.inProgress}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="shadow-2 border-left-3 border-green-500 overflow-hidden">
                        <div className="flex align-items-center gap-3">
                            <div className="dashboard-card-icon bg-green-100 flex-shrink-0">
                                <i className="pi pi-check-circle text-green-500 text-2xl"></i>
                            </div>
                            <div className="flex flex-column">
                                <span className="text-500 font-medium text-sm mb-1 uppercase tracking-wider">Completed</span>
                                <span className="text-900 font-bold text-2xl">{stats.completed}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="shadow-2 border-left-3 border-red-500 overflow-hidden">
                        <div className="flex align-items-center gap-3">
                            <div className="dashboard-card-icon bg-red-100 flex-shrink-0">
                                <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
                            </div>
                            <div className="flex flex-column">
                                <span className="text-500 font-medium text-sm mb-1 uppercase tracking-wider">High Priority</span>
                                <span className="text-900 font-bold text-2xl">{stats.highPriority}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid">
                <div className="col-12 md:col-12 lg:col-5">
                    <Card title="Task Distribution by Status" className="shadow-2">
                        <div className="h-20rem flex justify-content-center align-items-center">
                            <Chart type="pie" data={statusChartData} options={statusChartOptions} style={{ width: '80%' }} />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-12 lg:col-7">
                    <Card title="Tasks by Priority" className="shadow-2">
                        <div className="h-20rem">
                            <Chart type="bar" data={priorityChartData} options={priorityChartOptions} style={{ height: '100%' }} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
