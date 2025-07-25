import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'; // Filter icon was commented out
import styles from '../../styles/Application.module.css';
import { config } from '../../config/environment';
import { useToast } from '@/components/ui/use-toast';
import { formatDateDDMMYYYY, toTitleCase } from '../../lib/utils';
import NewApplicationSheet from '../../components/NewApplicationSheet';
import axiosInstance from '@/lib/axiosInstance';

const Applications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [remark, setRemark] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedBorrowerName, setSelectedBorrowerName] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  const DEBOUNCE_DELAY = 300; // milliseconds

  const fetchApplications = async () => {
    setLoading(true);
    let fetchUrl = `${config.baseURL}loan-application?pageNo=0&pageSize=10`;

    if (searchTerm && searchTerm.trim() !== '') {
      fetchUrl += `&searchText=${encodeURIComponent(searchTerm.trim())}`;
    }

    if (statusFilter && statusFilter !== 'all') {
      fetchUrl += `&applicationStatus=${statusFilter}`;
    }
    await axiosInstance.get(fetchUrl)
      .then(
        (res: any) => {
          setLoading(false);
          setApplicationsData(res.data?.data.data || []);
        }
      )
      .catch(
        (err: any) => {
          setApplicationsData([]);
          setLoading(false)
        }
      )

    // try {
    //   let fetchUrl = `${config.baseURL}loan-application?pageNo=0&pageSize=10`;

    //   // Conditionally add query parameters
    //   if (searchTerm && searchTerm.trim() !== '') {
    //     fetchUrl += `&searchText=${encodeURIComponent(searchTerm.trim())}`;
    //   }

    //   if (statusFilter && statusFilter !== 'all') {
    //     fetchUrl += `&applicationStatus=${statusFilter}`;
    //   }

    //   const response = await fetch(fetchUrl);
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const res = await response.json();
    //   setApplicationsData(res.data?.data || []);
    // } catch (error) {
    //   console.error("Error fetching applications:", error);
    //   setApplicationsData([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [debouncedSearchTerm, statusFilter]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'DISBURSED':
        return 'bg-purple-50 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
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


  const handleViewClick = (appId: string) => {
    navigate(`/dashboard/applications/${appId}`);
  };

  const handleApproveClick = (appId: string, borrowerName: string) => {
    setActionType('approve');
    setSelectedApplicationId(appId);
    setSelectedBorrowerName(borrowerName);
    setShowConfirmation(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedApplicationId) return;

    setShowConfirmation(false);

    await axiosInstance.put(`${config.baseURL}loan-application/${selectedApplicationId}/status-update?status=APPROVED`)
    .then(
      (res:any) => {
        fetchApplications();
        setSelectedApplicationId(null);
        setSelectedBorrowerName(null);
        setActionType(null);
      }
    )
    .catch(
      (err:any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response.data.message || "Failed to create loan application. Please try again.",
        });
      }
    )

    // try {
    //   const response = await fetch(`${config.baseURL}loan-application/${selectedApplicationId}/status-update?status=APPROVED`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //   });
    //   if (!response.ok) {
    //     const errorText = await response.text();
    //     throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    //   }
    //   await fetchApplications();
    // } catch (error) {
    //   console.error("Error approving application:", error);
    // } finally {
    //   setSelectedApplicationId(null);
    //   setSelectedBorrowerName(null);
    //   setActionType(null);
    // }
  };

  const handleCancelApprove = () => {
    setShowConfirmation(false);
    setSelectedApplicationId(null);
    setSelectedBorrowerName(null);
    setActionType(null);
    setRemark(''); // Clear remark on cancel
  };

  // Handle Reject Click
  const handleRejectClick = (appId: string, borrowerName: string) => {
    setActionType('reject');
    setSelectedApplicationId(appId);
    setSelectedBorrowerName(borrowerName);
    setShowConfirmation(true);
    setRemark(''); // Clear remark when opening dialog for rejection
  };

  const [showNewApplicationSheet, setShowNewApplicationSheet] = useState(false);

  const newApplicationCreation = () => {
    setShowNewApplicationSheet(true);
  }

  const handleConfirmReject = async () => {
    if (!selectedApplicationId) return;

    setShowConfirmation(false);

    try {
      const response = await fetch(`${config.baseURL}loan-application/${selectedApplicationId}/status-update?status=REJECTED&remark=${remark}`, {
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
      setRemark(''); // Clear remark after successful rejection
    }
  };
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handlePutInReview = async (id: any) => {
    toast({
      description: "Updating status to 'In Review'...",
    });
    await axiosInstance.put(`${config.baseURL}loan-application/${id}/start-review`)
    .then(
      (res:any) =>{
        toast({
          variant: "success",
          title: "Success",
          description: "Application status updated to 'In Review'.",
        });

        fetchApplications();
      }
    )
    .catch(
      (err:any) =>{
        toast({ variant: "destructive", title: "Error", description: "Failed to update status. Please try again." });
      }
    )
    // try {
    //   const response = await fetch(`${config.baseURL}loan-application/${id}/start-review`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //   });

    //   if (!response.ok) {
    //     const errorText = await response.text();
    //     throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    //   }

    //   toast({
    //     variant: "success",
    //     title: "Success",
    //     description: "Application status updated to 'In Review'.",
    //   });

    //   await fetchApplications();
    // } catch (error) {
    //   console.error("Error putting application in review:", error);
    //   toast({ variant: "destructive", title: "Error", description: "Failed to update status. Please try again." });
    // }
  }


  return (
    <div className={`${styles.mainContainer}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-primary">Loan Applications</h1>
          <p className={`${styles.description} text-gray-600 mt-1`}>Manage and review loan applications</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button onClick={fetchApplications} className="p-2 rounded-md hover:bg-color-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-gray-200 bg-white" title="Reload Applications">
            <RefreshCw size={18} className="text-primary" />
          </button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={newApplicationCreation}>
            New Application
          </Button>
        </div>
      </div>

      <Card className='mt-2'>
        <CardContent className="p-3">
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-md text-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID or name..."
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
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
              {/* <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Flag</th> */}
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
                  <td className="text-xs font-normal py-4 px-4">
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
                    <Badge variant="outline">{toTitleCase(app.applicationType) || '-'}</Badge>
                  </td>
                  <td className="py-4 px-4 text-sm font-normal">
                    <Badge className={`${getStatusColor(app.applicationStatus)} hover:bg-color-none px-3 py-1`}>
                      {toTitleCase(app.applicationStatus.split('_').join(' ')) || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    {
                      app.applicationStatus === 'PENDING' ?
                        <Badge className={`hover:bg-color-none px-3 py-1 cursor-pointer`} onClick={() => handlePutInReview(app.id)}>
                          In Review
                        </Badge>
                        :
                        <div className="flex items-center space-x-1"> {/* Reduced space for more buttons */}
                          <Button variant="ghost" size="sm" title="View Details" onClick={() => handleViewClick(app?.id)}>
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
                          {/* <Button variant="ghost" size="sm" title="More Actions">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button> */}
                        </div>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-primary'>
              {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'} {/* Dynamic Title */}
            </DialogTitle>
            <DialogDescription className='pt-3 text-sm text-gray'>
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'reject'} the loan application for <strong>{selectedBorrowerName || 'this borrower'}</strong>? {/* Dynamic Description */}
            </DialogDescription>
            {actionType === 'reject' && (
              <div className="pt-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection <sup>*</sup></label>
                <Input
                  id="rejectionReason"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter reason..."
                  className='mt-2' />
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelApprove}>Cancel</Button> {/* Cancel button */}
            {actionType === 'approve' ? (
              <Button onClick={handleConfirmApprove} className='bg-primary'>Approve</Button>
            ) : (
              <Button
                onClick={handleConfirmReject}
                className='bg-red-600 hover:bg-red-700 px-6 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={actionType === 'reject' && remark.trim() === ''}
              >Reject</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Application Sheet */}
      <NewApplicationSheet
        open={showNewApplicationSheet}
        onOpenChange={setShowNewApplicationSheet}
        onSubmit={() => {
          setShowNewApplicationSheet(false);
          fetchApplications();
        }}
      />
    </div>
  );
};

export default Applications;
