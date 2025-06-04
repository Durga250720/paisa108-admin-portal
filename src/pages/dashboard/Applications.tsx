
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import styles from '../../styles/Application.module.css';

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const applications = [
    {
      id: 'APP-26851',
      borrower: 'Rahul Sharma',
      amount: '₹25,000',
      cibil: '761',
      date: '13 Apr 2025',
      type: 'New',
      processing: '3.5 hours',
      status: 'Approved'
    },
    {
      id: 'APP-36650',
      borrower: 'Priya Patel',
      amount: '₹15,000',
      cibil: '795',
      date: '13 Apr 2025',
      type: 'New',
      processing: '3 hours',
      status: 'Pending'
    },
    {
      id: 'APP-28649',
      borrower: 'Amit Kumar',
      amount: '₹15,000',
      cibil: '625',
      date: '12 Apr 2025',
      type: 'New',
      processing: '2 hours',
      status: 'Rejected'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
    {
      id: 'APP-36648',
      borrower: 'Sneha Gupta',
      amount: '₹20,000',
      cibil: '681',
      date: '12 Apr 2025',
      type: 'New',
      processing: 'In progress',
      status: 'Pending'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCibilColor = (cibil: string) => {
    const score = parseInt(cibil);
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`${styles.mainContainer}`}>
      {/* <div className="space-y-6"> */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-primary">Loan Applications</h1>
          <p className={`${styles.description} text-gray-600 mt-1`}>Manage and review loan applications</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          New Application
        </Button>
      </div>

      <Card className='mt-2'>
        <CardContent className="p-3">
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-md text-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${styles.cardContainer} mt-2`}>
        <CardContent className='p-0'>
          <div className="overflow-x-auto h-100">
            <table className="w-full h-100">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky px-4 top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Borrower</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">CIBIL</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application Date</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Type</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Processing Time</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="text-sm font-normal py-4 px-4">
                      <span className="font-medium text-blue-600">{app.id}</span>
                    </td>
                    <td className="text-sm font-normal py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {app.borrower.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-normal">{app.borrower}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-normal">{app.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-normal ${getCibilColor(app.cibil)}`}>
                        {app.cibil}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-normal text-gray-600">{app.date}</td>
                    <td className="py-4 px-4 text-sm font-normal">
                      <Badge variant="outline">{app.type}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm font-normal">{app.processing}</td>
                    <td className="py-4 px-4 text-sm font-normal">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {app.status === 'Pending' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
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
      {/* </div> */}
    </div>
  );
};

export default Applications;
