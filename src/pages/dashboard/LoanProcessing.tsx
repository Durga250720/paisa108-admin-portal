import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import { config } from '../../config/environment';
import { useToast } from '@/components/ui/use-toast';
import { formatIndianNumber, toTitleCase } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose // Import DialogClose for the Cancel button
} from '@/components/ui/dialog';

// --- New: Define an interface for better type safety ---
interface Borrower {
  borrowerId: string;
  name: string;
  phone: string;
  email: string; // Ensure email is part of the borrower interface
  dob?: string;
  gender?: string;
  displayId?: string;
  score?: number;
  borrowerProfileImage?: string;
  risk?: string;
}

interface LoanApplication {
  id: string;
  displayId?: string;
  borrower?: Borrower;
  employmentDetails?: any; // You might want to define a more specific type here
  loanDocuments?: any[]; // You might want to define a more specific type here
  addressDetail?: any;
  bankDetail?: any; // You might want to define a more specific type here
  loanProgress?: any;
  loanWorkflow?: any;
  loanConfig?: any;
  loanAmount: number;
  approvedAmount: number;
  loanPurpose?: string;
  existingLoans: boolean;
  cibil?: number;
  totalRepaymentAmount?: number;
  repaymentDate?: string;
  totalTransferredAmount?: number;
  disbursedDate?: string;
  createdAt: string;
  updatedAt?: string; // Added updatedAt to the interface as it's used for display
  applicationType: string;
  // --- MODIFIED: Added ESIGN_PENDING to the status list ---
  applicationStatus: 'APPROVED' | 'APPROVED_WITH_CONDITION' | 'ESIGN_PENDING' | 'E_SIGNED' | 'DISBURSED' | string;
  flags?: string[];
  remarks?: string;
  approvalConditions?: string;
}

const LoanProcessing = () => {
  // --- Updated: Use the new interface for approvedApplications state ---
  const [approvedApplications, setApprovedApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false); // State for button loading
  const { toast } = useToast();
  const [confirmDisbursement, setDisbursementConfirmation] = useState<boolean>(false);
  // --- New: State for E-Sign confirmation dialog ---
  const [confirmESign, setConfirmESign] = useState<boolean>(false);
  // --- Updated: applicationId type to string, and new state for borrowerEmail ---
  const [applicationId, setApplicationId] = useState<string>('');
  const [borrowerEmail, setBorrowerEmail] = useState<string>('');

  useEffect(() => {
    fetchApprovedApplications();
  }, []);

  const fetchApprovedApplications = async () => {
    setLoading(true);
    try {
      // Note: Using PUT for filter is unusual; GET is standard for fetching data.
      // Sticking to PUT as per existing code, but consider changing if possible.
      const url = `${config.baseURL}loan-application/loan-processing/filter?pageNo=0&pageSize=10`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // --- Improved error handling: try to parse error message from response body ---
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setApprovedApplications(result.data?.data || []);

    } catch (error: any) {
      console.error("Error fetching approved applications:", error);
      toast({
        variant: "destructive", // Changed from "failed" to "destructive" as per shadcn/ui toast variants
        title: "Error",
        description: error.message || "Failed to fetch approved applications.",
      });
      setApprovedApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'APPROVED_WITH_CONDITION':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
        // --- MODIFIED: Added ESIGN_PENDING case ---
      case 'ESIGN_PENDING':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'E_SIGNED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 hover:bg-color-none';
      case 'APPROVED_WITH_CONDITION':
        return 'bg-yellow-100 text-yellow-800 hover:bg-color-none';
        // --- MODIFIED: Added ESIGN_PENDING case ---
      case 'ESIGN_PENDING':
        return 'bg-orange-100 text-orange-800 hover:bg-color-none';
      case 'E_SIGNED':
        return 'bg-blue-100 text-blue-800 hover:bg-color-none';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-color-none';
    }
  };

  const updateViewDetails = () => {
    toast({
      variant: "warning",
      title: "Coming Soon",
      description: "We are working on it...!",
      duration: 3000
    })
  }

  const openDisburedModel = (id: string) => {
    setDisbursementConfirmation(true);
    setApplicationId(id);
  }

  // --- New: Function to open the E-Sign confirmation dialog ---
  const openESignModel = (id: string, email: string) => {
    setConfirmESign(true);
    setApplicationId(id);
    setBorrowerEmail(email);
  }

  // --- UPDATED: Function to send E-Sign link ---
  const sendESignRequest = async () => {
    setIsSending(true);
    try {
      const url = `${config.baseURL}loan-application/admin/${applicationId}/send-esign-link`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        variant: "success",
        title: "E-Sign Link Sent",
        description: result.data || "The e-sign link has been successfully sent to the borrower.",
        duration: 3000
      });
      setConfirmESign(false);
      setApplicationId('');
      setBorrowerEmail('');
      // Refetching applications to get the new ESIGN_PENDING status
      fetchApprovedApplications();
    } catch (error: any) {
      console.error("Error sending e-sign link:", error);
      toast({
        variant: "destructive",
        title: "API Error",
        description: error.message || "Failed to send e-sign link.",
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  }

  const disburementConfirmation = async () => {
    try {
      const response = await fetch(config.baseURL + `loan-application/${applicationId}/status-update?status=DISBURSED`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const results: any = await response.json();

      toast({
        variant: "success",
        title: "Loan Disbursed",
        description: 'Loan amount has been disbursed successfully',
        duration: 3000
      });
      setDisbursementConfirmation(false);
      setApplicationId('');
      fetchApprovedApplications(); // Refresh the list after status update

    } catch (error: any) {
      console.error("Error disbursing loan:", error);
      toast({
        variant: "destructive",
        title: "API Error",
        description: error.message || "Failed to disburse loan.",
        duration: 3000,
      });
    }
  }

  return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-medium text-primary">Loan Processing</div>
            <p className={`${styles.description} text-gray-600 mt-1`}>Track and manage approved loan applications</p>
          </div>
          <div className="flex">
            <button onClick={fetchApprovedApplications} className="p-2 rounded-md hover:bg-color-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-gray-200 bg-white" title="Reload Applications">
              <RefreshCw size={18} className="text-primary" />
            </button>
          </div>
        </div>


        {/* Approved Applications Table */}
        <div className='mt-1'>
          <div className={`${styles.cardContainer1} overflow-auto mt-2 bg-white shadow-sm rounded`}>
            <table className="w-full h-full">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application ID</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Customer Name</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Amount</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Approval Date</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Operations</th>
              </tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-sm text-gray-500">
                      Loading approved applications...
                    </td>
                  </tr>
              ) : approvedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-sm text-gray-500">
                      No approved applications found.
                    </td>
                  </tr>
              ) : (
                  approvedApplications.map((app) => (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-sm text-blue-600">{app.displayId || app.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {app.borrower?.name ? (app.borrower.name.split(' ').map((n: string) => n[0]).join('')).slice(0, 2) : 'N/A'}
                          </span>
                            </div>
                            <span className="font-medium text-sm">{app.borrower?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-normal text-sm">₹ {formatIndianNumber(app.approvedAmount)}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{new Date(app.updatedAt || app.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 text-sm font-normal">
                            {getStatusIcon(app.applicationStatus)}
                            <Badge className={getStatusColor(app.applicationStatus)}>
                              {toTitleCase(app.applicationStatus.split('_').join(' '))}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {/* --- MODIFIED: Updated conditional rendering for Operations buttons --- */}
                            {(app.applicationStatus === 'APPROVED' || app.applicationStatus === 'APPROVED_WITH_CONDITION') && (
                                <Button
                                    size="sm"
                                    onClick={() => openESignModel(app.id, app.borrower?.email || 'N/A')}
                                >
                                  Pending Sign
                                </Button>
                            )}

                            {app.applicationStatus === 'ESIGN_PENDING' && (
                                <Button size="sm" disabled>
                                  E-Sign Sent
                                </Button>
                            )}

                            {app.applicationStatus === 'E_SIGNED' && (
                                <Button
                                    size="sm"
                                    onClick={() => openDisburedModel(app.id)}
                                >
                                  Disburse
                                </Button>
                            )}

                            {/* Placeholder for statuses where no action is available */}
                            {!['APPROVED', 'APPROVED_WITH_CONDITION', 'ESIGN_PENDING', 'E_SIGNED'].includes(app.applicationStatus) && (
                                <span className="text-sm text-gray-500">Action N/A</span>
                            )}

                            <button className='text-xs bg-transparent px-3 py-2 text-black-500 rounded border-none'
                                    onClick={updateViewDetails}>
                              View Details
                            </button>

                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Existing: Disbursement Confirmation Dialog --- */}
        <Dialog open={confirmDisbursement} onOpenChange={setDisbursementConfirmation}>
          <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader className='space-y-4'>
              <DialogTitle>Confirm Loan Disbursement</DialogTitle>
              <DialogDescription className='mt-3'>
                You're about to disburse the loan amount. Do you want to confirm?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {/* Cancel button */}
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              {/* Confirm button */}
              <Button onClick={disburementConfirmation}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- New: E-Sign Confirmation Dialog --- */}
        <Dialog open={confirmESign} onOpenChange={setConfirmESign}>
          <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader className='space-y-4'>
              <DialogTitle>Confirm E-Sign Request</DialogTitle>
              <DialogDescription className='mt-3'>
                You're about to send an e-sign request to the borrower.
                <br />
                Borrower Email: <span className="font-semibold text-blue-700">{borrowerEmail}</span>
                <br />
                Do you want to confirm?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {/* Cancel button */}
              <DialogClose asChild>
                <Button variant="outline" disabled={isSending}>Cancel</Button>
              </DialogClose>
              {/* Send button */}
              <Button onClick={sendESignRequest} disabled={isSending}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default LoanProcessing;