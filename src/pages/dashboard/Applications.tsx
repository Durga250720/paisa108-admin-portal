import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'; // Filter icon was commented out
import styles from '../../styles/Application.module.css';
import { config } from '../../config/environment';

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedBorrowerName, setSelectedBorrowerName] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null); // State to track action type

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}loan-application?pageNo=0&pageSize=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      console.log("API Response Data:", res.data); // For debugging API response structure
      // Adjust based on your actual API response structure.
      // If res.data is the array: setApplicationsData(res.data || []);
      // If res.data.content is the array: setApplicationsData(res.data.content || []);
      // Based on your console.log and setApplicationsData(res.data.data):
      setApplicationsData(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationsData([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCibilColor = (cibil: string | undefined) => {
    if (!cibil) return 'text-gray-600';
    const score = parseInt(cibil, 10);
    if (isNaN(score)) return 'text-gray-600';
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDateDDMMYYYY = (dateString: string | Date | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-'; // Check for invalid date
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return '-';
    }
  };

  const handleApproveClick = (appId: string, borrowerName: string) => {
    setActionType('approve'); // Set action type
    setSelectedApplicationId(appId);
    setSelectedBorrowerName(borrowerName);
    setShowConfirmation(true);
  };


  const handleConfirmApprove = async () => {
    if (!selectedApplicationId) return;

    setShowConfirmation(false);

    try {
      const response = await fetch(`${config.baseURL}loan-application/${selectedApplicationId}/status-update?status=APPROVED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      await fetchApplications();
    } catch (error) {
      console.error("Error approving application:", error);
    } finally {
      setSelectedApplicationId(null);
      setSelectedBorrowerName(null); // Reset selected data
      setActionType(null); // Reset action type
    }
  };

  const handleCancelApprove = () => {
    setShowConfirmation(false);
    setSelectedApplicationId(null);
    setSelectedBorrowerName(null); // Reset selected data
    setActionType(null); // Reset action type
  };

  // Handle Reject Click
  const handleRejectClick = (appId: string, borrowerName: string) => {
    setActionType('reject'); // Set action type
    setSelectedApplicationId(appId);
    setSelectedBorrowerName(borrowerName);
    setShowConfirmation(true);
  };

  // Handle Confirm Reject
  const handleConfirmReject = async () => {
    if (!selectedApplicationId) return;

    setShowConfirmation(false);

    try {
      const response = await fetch(`${config.baseURL}loan-application/${selectedApplicationId}/status-update?status=REJECTED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      await fetchApplications(); // Refetch data
    } catch (error) {
      console.error("Error rejecting application:", error);
    } finally {
      setSelectedApplicationId(null);
      setSelectedBorrowerName(null); // Reset selected data
      setActionType(null); // Reset action type
    }
  };


  return (
    <div className={`${styles.mainContainer}`}>
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
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`${styles.cardContainer} overflow-auto mt-2 bg-white shadow-sm rounded`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky px-4 top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Borrower</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Loan Amount</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">CIBIL</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application Date</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Type</th>
              {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Processing Time</th> */}
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
              <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-sm text-gray-500"> {/* Adjusted colSpan to 8 */}
                  Loading applications...
                </td>
              </tr>
            ) : applicationsData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-sm text-gray-500"> {/* Adjusted colSpan to 8 */}
                  No applications found.
                </td>
              </tr>
            ) : (
              applicationsData.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="text-sm font-normal py-4 px-4">
                    <span className="font-medium text-blue-600">{app.displayId}</span>
                  </td>
                  <td className="text-sm font-normal py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {app.borrower?.name ? app.borrower.name[0] : 'N/A'}
                        </span>
                      </div>
                      <span className="text-sm font-normal">{app.borrower?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-normal">{app.loanAmount}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-normal ${getCibilColor(app.cibil)}`}>
                      {app.cibil || '0'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-normal text-gray-600">
                    {formatDateDDMMYYYY(app.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-sm font-normal">
                    <Badge variant="outline">{app.applicationType || '-'}</Badge>
                  </td>
                  <td className="py-4 px-4 text-sm font-normal">
                    <Badge className={getStatusColor(app.applicationStatus)}>
                      {app.applicationStatus || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1"> {/* Reduced space for more buttons */}
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {app.applicationStatus === 'PENDING' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" title="Approve" onClick={() => handleApproveClick(app.id, app.borrower?.name || 'Borrower')}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Reject" onClick={() => handleRejectClick(app.id, app.borrower?.name || 'Borrower')}> {/* Added onClick */}
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" title="More Actions">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog for Approval */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-primary'>
              {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'} {/* Dynamic Title */}
            </DialogTitle>
            <DialogDescription className='pt-3 text-sm text-gray'>
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'reject'} the loan application for <strong>{selectedBorrowerName || 'this borrower'}</strong>? {/* Dynamic Description */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelApprove}>Cancel</Button> {/* Cancel button */}
            {actionType === 'approve' ? (
              <Button onClick={handleConfirmApprove} className='bg-primary'>Approve</Button>
            ) : (
              <Button onClick={handleConfirmReject} className='bg-red-600 hover:bg-red-700 px-6'>Reject</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
