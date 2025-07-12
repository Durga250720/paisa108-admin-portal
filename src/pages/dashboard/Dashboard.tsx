import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {AlertCircle, CreditCard, FileText, IndianRupee, TrendingUp, Users} from 'lucide-react';
import {Skeleton} from '@/components/ui/skeleton';

const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) { // Crores
        return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) { // Lakhs
        return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000) { // Thousands
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

const getStatusBadgeClasses = (status: string): string => {
    switch (status.toUpperCase()) {
        case 'APPROVED':
        case 'DISBURSED':
        case 'CLOSED':
            return 'bg-green-100 text-green-800';

        case 'PENDING':
        case 'IN_REVIEW':
        case 'APPROVED_WITH_CONDITION':
            return 'bg-yellow-100 text-yellow-800';

        case 'ESIGN_PENDING':
        case 'E_SIGNED':
            return 'bg-blue-100 text-blue-800';

        case 'REJECTED':
        case 'DEFAULTED':
            return 'bg-red-100 text-red-800';

        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getDisplayStatus = (status: string): string => {
    return status
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


interface LoanApplication {
    applicationId: string;
    displayId: string;
    borrowerName: string;
    loanAmount: number;
    createdAt: string;
    status: string;
}

interface DashboardData {
    totalApplications: number;
    applicationPercentageChange: number;
    activeBorrowers: number;
    activeBorrowersPercentageChange: number;
    totalDisbursedAmount: number;
    disbursedAmountPercentageChange: number;
    totalPendingRepaymentAmount: number;
    pendingRepaymentAmountPercentageChange: number;
    loanApplications: LoanApplication[];
}


const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://dev-paisa108.tejsoft.com/loan-application/admin-dashboard');
                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }
                const result = await response.json();
                setData(result.data);
            } catch (e) {
                setError(e.message || 'An unexpected error occurred.');
                console.error("Dashboard API Error:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = data ? [
        {
            title: 'Total Applications',
            value: data.totalApplications.toLocaleString('en-IN'),
            change: `${data.applicationPercentageChange >= 0 ? '+' : ''}${data.applicationPercentageChange}%`,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Active Borrowers',
            value: data.activeBorrowers.toLocaleString('en-IN'),
            change: `${data.activeBorrowersPercentageChange >= 0 ? '+' : ''}${data.activeBorrowersPercentageChange}%`,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Total Disbursed',
            value: formatCurrency(data.totalDisbursedAmount),
            change: `${data.disbursedAmountPercentageChange >= 0 ? '+' : ''}${data.disbursedAmountPercentageChange}%`,
            icon: IndianRupee,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Pending Repayments',
            value: formatCurrency(data.totalPendingRepaymentAmount),
            change: `${data.pendingRepaymentAmountPercentageChange >= 0 ? '+' : ''}${data.pendingRepaymentAmountPercentageChange}%`,
            icon: CreditCard,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        }
    ] : [];

    const renderStatSkeletons = () => (
        Array.from({length: 4}).map((_, index) => (
            <Card key={index}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-5 w-32 mb-2"/>
                            <Skeleton className="h-7 w-24 mb-2"/>
                            <Skeleton className="h-4 w-40"/>
                        </div>
                        <Skeleton className="w-12 h-12 rounded-lg"/>
                    </div>
                </CardContent>
            </Card>
        ))
    );

    const renderApplicationSkeletons = () => (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                    <div>
                        <Skeleton className="h-5 w-32 mb-2"/>
                        <Skeleton className="h-4 w-40"/>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full"/>
                </div>
            ))}
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-12 h-12 mb-4"/>
                <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your loans today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? renderStatSkeletons() : stats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.change} from last month
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? renderApplicationSkeletons() : (
                            <div className="space-y-4">
                                {data?.loanApplications.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No recent applications found.</p>
                                ) : (
                                    data?.loanApplications.map((app) => (
                                        <div key={app.applicationId}
                                             className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{app.borrowerName}</p>
                                                {/* For better relative time like "2 hours ago", consider using a library like `date-fns` (e.g., formatDistanceToNow) */}
                                                <p className="text-sm text-gray-600">{formatCurrency(app.loanAmount)} • {new Date(app.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(app.status)}`}>
                        {getDisplayStatus(app.status)}
                      </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                                <FileText className="w-8 h-8 text-purple-600 mb-2 mx-auto"/>
                                <p className="text-sm font-medium text-purple-700">New Application</p>
                            </button>
                            <button
                                className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <Users className="w-8 h-8 text-blue-600 mb-2 mx-auto"/>
                                <p className="text-sm font-medium text-blue-700">Add Borrower</p>
                            </button>
                            <button
                                className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                                <TrendingUp className="w-8 h-8 text-green-600 mb-2 mx-auto"/>
                                <p className="text-sm font-medium text-green-700">Process Loan</p>
                            </button>
                            <button
                                className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                                <CreditCard className="w-8 h-8 text-orange-600 mb-2 mx-auto"/>
                                <p className="text-sm font-medium text-orange-700">Record Payment</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
