
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Eye, AlertTriangle, CheckCircle, Clock, BellRing, IndianRupee  } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import { useToast } from '@/components/ui/use-toast';

const Repayments = () => {
  const { toast } = useToast();
  const repayments = [
    {
      loanId: 'LN-12345',
      borrower: 'Rahul Sharma',
      dueDate: '2025-01-15',
      amount: '₹5,500',
      status: 'Paid',
      paymentDate: '2025-01-14',
      method: 'UPI'
    },
    {
      loanId: 'LN-12346',
      borrower: 'Priya Singh',
      dueDate: '2025-01-20',
      amount: '₹3,200',
      status: 'Overdue',
      paymentDate: null,
      method: null
    },
    {
      loanId: 'LN-12347',
      borrower: 'Amit Kumar',
      dueDate: '2025-01-25',
      amount: '₹4,800',
      status: 'Pending',
      paymentDate: null,
      method: null
    },
    {
      loanId: 'LN-12348',
      borrower: 'Sneha Patel',
      dueDate: '2025-01-12',
      amount: '₹2,100',
      status: 'Paid',
      paymentDate: '2025-01-12',
      method: 'Bank Transfer'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordPayment = () => {
    toast({
      variant: "warning",
      title: "Coming Soon",
      description: "We are working on it...!",
      duration: 3000
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return status !== 'Paid' && due < today;
  };

  return (
    <div className={`${styles.mainContainer}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Repayments</h1>
          <p className={`${styles.description} text-gray-600 mt-1`}>Track loan repayments and collections</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleRecordPayment}>
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Due Today</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₹25,000</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-1">₹12,500</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected Today</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹18,200</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">87%</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      <Card className='mt-1'>
        <CardContent className="p-2">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by loan ID or borrower..."
                className="pl-10"
              />
            </div>
            {/* <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Due Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Repayments Table */}
      <div className={`${styles.borrowerContainer} bg-white shadow-sm rounded mt-1`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 overflow-x-scroll">
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan ID</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Borrower</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Due Date</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Amount</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Payment Date</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Payment Method</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((repayment) => (
              <tr key={repayment.loanId} className="border-b border-gray-100 hover:bg-gray-50 overflow-x-scroll">
                <td className="py-4 px-4">
                  <span className="font-medium text-sm text-blue-600">{repayment.loanId}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {repayment.borrower.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-xs">{repayment.borrower}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`${isOverdue(repayment.dueDate, repayment.status) ? 'text-red-600 font-medium' : 'text-gray-600'} text-xs`}>
                    {new Date(repayment.dueDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium text-xs">{repayment.amount}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2 text-xs">
                    {getStatusIcon(repayment.status)}
                    <Badge className={getStatusColor(repayment.status)}>
                      {repayment.status}
                    </Badge>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600 text-xs">
                  {repayment.paymentDate
                    ? new Date(repayment.paymentDate).toLocaleDateString()
                    : '-'}
                </td>
                <td className="py-4 px-4 text-xs">
                  {repayment.method ? (
                    <Badge variant="outline">{repayment.method}</Badge>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {repayment.status === 'Pending' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <IndianRupee className="w-4 h-4" />
                      </Button>
                    )}
                    {repayment.status === 'Overdue' && (
                      <>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <BellRing className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <IndianRupee className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" className="bg-primary hover:bg-color-none">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repayments;
