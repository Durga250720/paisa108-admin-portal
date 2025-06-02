
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const LoanProcessing = () => {
  const approvedApplications = [
    {
      id: 'APP-21456',
      customer: 'Rahul Sharma',
      amount: '₹25,000',
      approvalDate: '3/3/2025',
      status: 'Ready for Disbursal',
      action: 'Completed'
    },
    {
      id: 'APP-34567',
      customer: 'Priya Patel',
      amount: '₹50,000',
      approvalDate: '3/1/2025',
      status: 'Approval with conditions',
      action: 'Completed'
    },
    {
      id: 'APP-56578',
      customer: 'Vikram Singh',
      amount: '₹20,000',
      approvalDate: '3/1/2025',
      status: 'Approved',
      action: 'Pending'
    },
    {
      id: 'APP-56789',
      customer: 'Neha Gupta',
      amount: '₹15,000',
      approvalDate: '3/1/2025',
      status: 'Ready for Disbursal',
      action: 'Completed'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready for Disbursal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Approval with conditions':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Approved':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready for Disbursal':
        return 'bg-green-100 text-green-800';
      case 'Approval with conditions':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    return action === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Loan Processing</h1>
          <p className="text-gray-600 mt-1">Track and manage approved loan applications</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Disbursal</p>
                <p className="text-2xl font-bold text-green-600 mt-1">8</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Documentation</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">5</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">3</p>
              </div>
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Approved Applications</span>
            <Badge className="bg-purple-100 text-purple-800">Filter: All Statuses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Application ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Approval Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Operations</th>
                </tr>
              </thead>
              <tbody>
                {approvedApplications.map((app, index) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-blue-600">{app.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {app.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{app.customer}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{app.amount}</td>
                    <td className="py-4 px-4 text-gray-600">{app.approvalDate}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(app.status)}
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getActionColor(app.action)}>
                        {app.action}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {app.status === 'Ready for Disbursal' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Disburse
                          </Button>
                        )}
                        {app.status === 'Approval with conditions' && (
                          <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600">
                            Review
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanProcessing;
