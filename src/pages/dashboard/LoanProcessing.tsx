import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import styles from '../../styles/Application.module.css';

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
      id: 'APP-34567',
      customer: 'Priya Patel',
      amount: '₹50,000',
      approvalDate: '3/1/2025',
      status: 'Approval with conditions',
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
      id: 'APP-34567',
      customer: 'Priya Patel',
      amount: '₹50,000',
      approvalDate: '3/1/2025',
      status: 'Approval with conditions',
      action: 'Completed'
    },{
      id: 'APP-34567',
      customer: 'Priya Patel',
      amount: '₹50,000',
      approvalDate: '3/1/2025',
      status: 'Approval with conditions',
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
      id: 'APP-34567',
      customer: 'Priya Patel',
      amount: '₹50,000',
      approvalDate: '3/1/2025',
      status: 'Approval with conditions',
      action: 'Completed'
    },{
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
        return 'bg-green-100 text-green-800 hover:bg-color-none';
      case 'Approval with conditions':
        return 'bg-yellow-100 text-yellow-800 hover:bg-color-none';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 hover:bg-color-none';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-color-none';
    }
  };

  const getActionColor = (action: string) => {
    return action === 'Completed' 
      ? 'bg-green-100 text-green-800 hover:bg-color-none' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-color-none';
  };

  return (
    <div className={`${styles.mainContainer}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-medium text-primary">Loan Processing</div>
          <p className={`${styles.description} text-gray-600 mt-1`}>Track and manage approved loan applications</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Disbursal</p>
                <p className="text-xl font-bold text-green-600 mt-1">8</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Documentation</p>
                <p className="text-xl font-bold text-yellow-600 mt-1">5</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-xl font-bold text-blue-600 mt-1">3</p>
              </div>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved Applications Table */}
      <div className='mt-1 h-[80%]'>
        <div className='p-4'>
          <div className="flex items-center space-x-2">
            <span className='text-[1rem] font-medium text-primary'>Approved Applications</span>
            <Badge className="bg-purple-100 font-normal text-purple-800 hover:bg-color-none">Filter: All Statuses</Badge>
          </div>
        </div>
        {/* <CardContent className='p-0'> */}
          <div className={`${styles.cardContainer1} bg-white shadow-sm rounded`}>
            <table className="w-full h-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Customer Name</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Amount</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Approval Date</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Action</th>
                  <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Operations</th>
                </tr>
              </thead>
              <tbody>
                {approvedApplications.map((app, index) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-sm text-blue-600">{app.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {app.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-sm">{app.customer}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-normal text-sm">{app.amount}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{app.approvalDate}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-sm font-normal">
                        {getStatusIcon(app.status)}
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-normal">
                      <Badge className={getActionColor(app.action)}>
                        {app.action}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {app.status === 'Ready for Disbursal' && (
                          <button className=" text-xs bg-green-600 px-2 py-2 rounded text-white">
                            Disburse
                          </button>
                        )}
                        {app.status === 'Approval with conditions' && (
                          <button className="text-xs bg-transparent px-3 py-2 border-yellow-500 text-yellow-600 rounded border">
                            Review
                          </button>
                        )}
                        <button className='text-xs bg-transparent px-3 py-2 text-black-500 rounded border-none'>
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        {/* </CardContent> */}
      </div>
    </div>
  );
};

export default LoanProcessing;
