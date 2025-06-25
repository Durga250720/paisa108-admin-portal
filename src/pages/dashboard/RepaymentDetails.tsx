import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, FileText, IndianRupee, Clock, AlertTriangle, CheckCircle, Mail, Phone, History, Link as LinkIcon } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import { useToast } from "@/components/ui/use-toast";

// --- Type Definitions ---
type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH' | 'CHEQUE';

// This interface matches an item in the new `paymentHistory` array.
interface PaymentHistoryItem {
  amount: number;
  paidAt: string;
  repaymentType: string;
  mode: PaymentMode;
  referenceId: string;
  attachments: string[];
  upiId: string | null;
  cardNumber: string | null;
  cardHolderName: string | null;
  bankName: string | null;
  chequeNumber: string | null;
}

// This interface matches the updated detailed API response.
interface RepaymentDetail {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerMobile: string;
  borrowerDisplayId: string;
  loanId: string;
  loanDisplayId: string;
  createdAt: string;
  updatedAt: string;
  dueLoanAmount: number;
  dueDate: string;
  lateDays: number;
  lateFeeCharged: number;
  lateFeePerDay: number;
  amountToBePaid: number;
  amountPaid: number;
  pendingAmount: number;
  lastPaidAt: string | null;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paymentHistory: PaymentHistoryItem[];
  latePayment: boolean;
}

// --- Helper Functions ---
const toTitleCase = (str: string | null) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const RepaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [repayment, setRepayment] = useState<RepaymentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepaymentDetails = useCallback(async () => {
    if (!id) {
      setError("Repayment ID is missing from the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://dev-paisa108.tejsoft.com/repayment/${id}/details`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          // Add Authorization header if needed
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch repayment details for ID: ${id}`);
      }

      const result = await response.json();
      setRepayment(result.data);

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "API Error",
        description: err.message || "Could not fetch repayment data.",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchRepaymentDetails();
  }, [fetchRepaymentDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getStatusBadge = (status: RepaymentDetail['status']) => {
    let classes = '';
    let icon = <Clock className="w-4 h-4 mr-2" />;
    switch (status) {
      case 'PAID':
        classes = 'bg-green-100 text-green-800 border border-green-200';
        icon = <CheckCircle className="w-4 h-4 mr-2" />;
        break;
      case 'OVERDUE':
        classes = 'bg-red-100 text-red-800 border border-red-200';
        icon = <AlertTriangle className="w-4 h-4 mr-2" />;
        break;
      case 'PENDING':
      case 'PARTIAL':
        classes = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        icon = <Clock className="w-4 h-4 mr-2" />;
        break;
      default:
        classes = 'bg-gray-100 text-gray-800 border border-gray-200';
        break;
    }
    return (
        <Badge className={`${classes} text-sm py-1 px-3`}>
          {icon}
          {toTitleCase(status)}
        </Badge>
    );
  };

  if (loading) {
    return (
        <div className={`${styles.mainContainer} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading repayment details...</p>
          </div>
        </div>
    );
  }

  if (error || !repayment) {
    return (
        <div className={`${styles.mainContainer} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-lg text-red-600">{error || 'Repayment not found.'}</p>
            <Button onClick={() => navigate('/dashboard/repayments')} className="mt-4">
              Back to Repayments
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className={`${styles.mainContainer} scrollContainer`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/repayments')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-medium text-primary">Repayment Details</h1>
              <p className="text-sm text-gray-600">For Loan: {repayment.loanDisplayId}</p>
            </div>
          </div>
          {getStatusBadge(repayment.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-500">Total Due</p>
                  <p className="font-semibold text-lg">{formatCurrency(repayment.amountToBePaid)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount Paid</p>
                  <p className="font-semibold text-lg text-green-600">{formatCurrency(repayment.amountPaid)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending Amount</p>
                  <p className="font-semibold text-lg text-red-600">{formatCurrency(repayment.pendingAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(repayment.dueDate).split(',')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Paid On</p>
                  <p className="font-medium">{formatDate(repayment.lastPaidAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* --- NEW: Payment History Section --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {repayment.paymentHistory && repayment.paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {repayment.paymentHistory.map((item, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-green-600 text-lg">{formatCurrency(item.amount)}</p>
                                <p className="text-xs text-gray-500">{formatDate(item.paidAt)}</p>
                              </div>
                              <Badge variant="outline">{item.mode}</Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              <div className="flex"><strong className="w-28 text-gray-500 font-medium">Reference ID:</strong> <span className="text-gray-800">{item.referenceId || 'N/A'}</span></div>
                              {item.mode === 'UPI' && item.upiId && <div className="flex"><strong className="w-28 text-gray-500 font-medium">UPI ID:</strong> <span className="text-gray-800">{item.upiId}</span></div>}
                              {item.mode === 'CARD' && item.cardNumber && <div className="flex"><strong className="w-28 text-gray-500 font-medium">Card Number:</strong> <span className="text-gray-800">{item.cardNumber}</span></div>}
                              {item.mode === 'CARD' && item.cardHolderName && <div className="flex"><strong className="w-28 text-gray-500 font-medium">Card Holder:</strong> <span className="text-gray-800">{item.cardHolderName}</span></div>}
                              {item.mode === 'CHEQUE' && item.chequeNumber && <div className="flex"><strong className="w-28 text-gray-500 font-medium">Cheque No:</strong> <span className="text-gray-800">{item.chequeNumber}</span></div>}
                              {item.mode === 'NETBANKING' && item.bankName && <div className="flex"><strong className="w-28 text-gray-500 font-medium">Bank Name:</strong> <span className="text-gray-800">{item.bankName}</span></div>}
                            </div>
                            {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <h4 className="text-xs font-semibold text-gray-600 mb-2">Attachments</h4>
                                  <div className="space-y-2">
                                    {item.attachments.map((att, attIndex) => (
                                        <a key={attIndex} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-xs">
                                          <LinkIcon className="w-3 h-3 mr-2" />
                                          View Attachment {attIndex + 1}
                                        </a>
                                    ))}
                                  </div>
                                </div>
                            )}
                          </div>
                      ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No payment history available.</p>
                )}
              </CardContent>
            </Card>

            {repayment.latePayment && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-700 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Late Fee Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-orange-600">Late Days</p>
                      <p className="font-semibold text-orange-800">{repayment.lateDays}</p>
                    </div>
                    <div>
                      <p className="text-orange-600">Late Fee Charged</p>
                      <p className="font-semibold text-orange-800">{formatCurrency(repayment.lateFeeCharged)}</p>
                    </div>
                    <div>
                      <p className="text-orange-600">Late Fee Per Day</p>
                      <p className="font-semibold text-orange-800">{formatCurrency(repayment.lateFeePerDay)}</p>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold">{repayment.borrowerName}</p>
                  <p className="text-gray-500">ID: {repayment.borrowerDisplayId}</p>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{repayment.borrowerEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{repayment.borrowerMobile}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default RepaymentDetails;