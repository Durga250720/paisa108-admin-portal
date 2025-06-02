
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Phone, Mail } from 'lucide-react';

const Borrowers = () => {
  const borrowers = [
    {
      id: 'BRW-39201',
      name: 'Ravan Kumar',
      contact: '+91 9876543210',
      email: 'ravan.kumar@email.com',
      cibil: '756',
      monthlyIncome: '₹ 45,000',
      employment: 'Salaried',
      activeLoans: 1,
      riskLevel: 'Medium',
      status: 'Active'
    },
    {
      id: 'BRW-39202',
      name: 'Priya Singh',
      contact: '+91 9876543211',
      email: 'priya.singh@email.com',
      cibil: '820',
      monthlyIncome: '₹ 60,000',
      employment: 'Salaried',
      activeLoans: 0,
      riskLevel: 'Low',
      status: 'Active'
    },
    {
      id: 'BRW-39203',
      name: 'Amit Sharma',
      contact: '+91 9876543212',
      email: 'amit.sharma@email.com',
      cibil: '650',
      monthlyIncome: '₹ 35,000',
      employment: 'Self employed',
      activeLoans: 2,
      riskLevel: 'High',
      status: 'Blocked'
    },
    {
      id: 'BRW-39204',
      name: 'Sneha Patel',
      contact: '+91 9876543213',
      email: 'sneha.patel@email.com',
      cibil: '742',
      monthlyIncome: '₹ 50,000',
      employment: 'Business Owner',
      activeLoans: 1,
      riskLevel: 'Medium',
      status: 'Active'
    }
  ];

  const getCibilColor = (cibil: string) => {
    const score = parseInt(cibil);
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Borrowers</h1>
          <p className="text-gray-600 mt-1">Manage borrower profiles and information</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Borrower
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">1,245</p>
              <p className="text-sm text-gray-600 mt-1">Total Borrowers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">892</p>
              <p className="text-sm text-gray-600 mt-1">Active Borrowers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">23</p>
              <p className="text-sm text-gray-600 mt-1">Blocked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">745</p>
              <p className="text-sm text-gray-600 mt-1">Avg CIBIL Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search borrowers..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Borrowers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Borrowers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Borrower ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">CIBIL Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Monthly Income</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Active Loans</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((borrower) => (
                  <tr key={borrower.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-blue-600">{borrower.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {borrower.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{borrower.name}</p>
                          <p className="text-sm text-gray-600">{borrower.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{borrower.contact}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${getCibilColor(borrower.cibil)}`}>
                        {borrower.cibil}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{borrower.monthlyIncome}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{borrower.employment}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium">{borrower.activeLoans}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getRiskColor(borrower.riskLevel)}>
                        {borrower.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(borrower.status)}>
                        {borrower.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
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

export default Borrowers;
