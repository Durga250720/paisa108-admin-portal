import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Phone, Mail, RefreshCw } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/config/environment.ts';
import { useNavigate } from 'react-router-dom';
import NewBorrowerSheet from '@/components/NewBorrowerSheet';
import { formatIndianNumber, toTitleCase } from '../../lib/utils';

const Borrowers = () => {

  const [listBorrrowers, setListBorrowers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewBorrowerSheetOpen, setIsNewBorrowerSheetOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBorrowers();
  }, [])

  const fetchBorrowers = async () => {
      setLoading(true);

      const payload = {
        "pageNo": 0,
        "pageSize": 10
      }
      try {
        const response = await fetch(config.baseURL + `borrower/filter`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const results = await response.json();

        if (results != null) {
          setListBorrowers(results.data.data);
          setLoading(false);
        }

      } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast({
          variant: "failed",
          title: "API Error",
          description: errorMessage,
          duration: 3000,
        });
        setLoading(false);
      }
    }



  const getCibilColor = (cibil: string) => {
    const score = parseInt(cibil);
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 text-sm';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 text-sm';
      case 'High':
        return 'bg-red-100 text-red-800 text-sm';
      default:
        return 'bg-gray-100 text-gray-800 text-sm';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 text-xs'
      : 'bg-red-100 text-red-800 text-xs';
  };

  const addNewBorrower = () => {
    setIsNewBorrowerSheetOpen(true);
  }

  const handleNewBorrowerSubmit = () => {
    setIsNewBorrowerSheetOpen(false);
    fetchBorrowers(); // Refresh the borrowers list
  }

  const seeBorrowerPhoneNumber = () => {
    toast({
      variant: "warning",
      title: "Coming Soon",
      description: "We are working on init....!",
      duration: 3000
    })
  }

  const seeBorrowerEmail = () => {
    toast({
      variant: "warning",
      title: "Coming Soon",
      description: "We are working on init....!",
      duration: 3000
    })
  }


  return (
    <div className={`${styles.mainContainer}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-medium text-primary">Borrowers</div>
          <p className={`${styles.description} text-gray-600 mt-1`}>Manage borrower profiles and information</p>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <button onClick={fetchBorrowers} className="p-2 rounded-md hover:bg-color-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-gray-200 bg-white" title="Reload Applications">
              <RefreshCw size={18} className="text-primary" />
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-sm text-white flex items-center gap-2 px-2 py-2 rounded"
            onClick={addNewBorrower}>
            <Plus className="w-3 h-3" />
            Add New Borrower
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-1">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">1,245</p>
              <p className="text-sm text-gray-600 mt-1">Total Borrowers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">892</p>
              <p className="text-sm text-gray-600 mt-1">Active Borrowers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">23</p>
              <p className="text-sm text-gray-600 mt-1">Blocked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">745</p>
              <p className="text-sm text-gray-600 mt-1">Avg CIBIL Score</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      <Card className='mt-1'>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search borrowers..."
                className="pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Borrowers Table */}
      <div className={`${styles.borrowerContainer} bg-white shadow-sm rounded mt-1`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 overflow-x-scroll">
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Borrower ID</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Name</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Contact</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">CIBIL Score</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Monthly Income</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Employment</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Active Loans</th>
              {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Risk Level</th> */}
              {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th> */}
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-gray-500"> {/* Adjusted colSpan to 8 */}
                    Loading borrowers...
                  </td>
                </tr>
              ) : listBorrrowers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-gray-500"> {/* Adjusted colSpan to 8 */}
                    No borrowers found.
                  </td>
                </tr>
              ) : (
                listBorrrowers.map((borrower) => (
                  <tr key={borrower.id} className="border-b border-gray-100 hover:bg-gray-50 overflow-x-scroll">
                    <td className="py-4 px-4">
                      <span className="font-medium text-sm text-blue-600">{borrower.displayId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {borrower.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-xs">{borrower.name}</p>
                          <p className="text-xs text-gray-600">{borrower.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{borrower.mobile}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium text-sm ${getCibilColor(borrower?.borrowerCibilData?.score)}`}>
                        {borrower?.borrowerCibilData?.score}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-sm">{borrower?.employmentDetails ? formatIndianNumber(borrower?.employmentDetails?.takeHomeSalary) : 'N/A'}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className='text-xs font-normal'>{borrower?.employmentDetails ? toTitleCase(borrower?.employmentDetails?.employmentType) : 'N/A'}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-sm">{borrower.totalLoansCount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/borrowers/${borrower.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={seeBorrowerPhoneNumber}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={seeBorrowerEmail}>
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            }
          </tbody>
        </table>
      </div>

      <NewBorrowerSheet
        open={isNewBorrowerSheetOpen}
        onOpenChange={setIsNewBorrowerSheetOpen}
        onSubmit={handleNewBorrowerSubmit}
      />
    </div>
  );
};

export default Borrowers;
