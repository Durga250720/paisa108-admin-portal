import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CreditCard, Link, Upload, X } from 'lucide-react';
import { config } from '../../config/environment';
import styles from '../../styles/Application.module.css';
import { useToast } from '@/components/ui/use-toast';
import { formatIndianNumber } from '../../lib/utils';

interface LoanProcessingDetailsData {
  id: string;
  displayId: string;
  borrower: {
    name: string;
    displayId: string;
    email: string;
    risk: string;
  };
  loanAmount: number;
  approvedAmount: number;
  loanConfig: {
    loanInterest: number;
    processingFee: number;
    platformFee: number;
    loanProtectionFee: number;
  };
  bankDetail: {
    accountNumber: string;
    ifscNumber: string;
    accountHolderName: string;
  };
  loanPurpose: string;
  employmentDetails: {
    employmentType: string;
    takeHomeSalary: number;
  };
  cibil: number;
  applicationStatus: string;
}

const LoanProcessingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applicationData, setApplicationData] = useState<LoanProcessingDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}loan-application/${id}/details`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      setApplicationData(res.data || {});
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch application details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupENACH = () => {
    setShowPaymentSetup(true);
  };

  const handleInitiateFund = () => {
    toast({
      title: "Fund Initiation",
      description: "Fund transfer has been initiated successfully.",
    });
  };

  const handleRejectLoan = () => {
    toast({
      variant: "destructive",
      title: "Loan Rejected",
      description: "The loan application has been rejected.",
    });
  };

  if (loading) {
    return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading application details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-lg text-gray-600">Application not found</div>
            <Button onClick={() => navigate('/dashboard/loan-processing')} className="mt-4">
              Back to Loan Processing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const loanInterestPercentage = applicationData.loanConfig?.loanInterest || 12.5;
  const processingFee = applicationData.loanConfig?.processingFee || 0;
  const totalRepayment = applicationData.loanAmount + (applicationData.loanAmount * loanInterestPercentage / 100);
  const monthlyEMI = totalRepayment / 6; // Assuming 6 months tenure

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`${styles.mainContainer} scrollContainer`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/loan-processing')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-medium text-gray-900">Approved Application</h1>
            <p className="text-sm text-gray-600">Application ID: {applicationData.displayId}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Content - Loan Details and Borrower Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Loan Details</CardTitle>
              <p className="text-sm text-gray-600">Review the loan terms and disbursement details</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loan Terms and Repayment Details in two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Loan Terms</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Loan Amount</span>
                      <span className="text-sm font-medium">₹{formatIndianNumber(applicationData.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tenure</span>
                      <span className="text-sm font-medium">6 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Interest Rate</span>
                      <span className="text-sm font-medium">{loanInterestPercentage}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Processing Fee</span>
                      <span className="text-sm font-medium">₹{formatIndianNumber(processingFee)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Repayment Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly EMI</span>
                      <span className="text-sm font-medium">₹{formatIndianNumber(Math.round(monthlyEMI))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Repayment</span>
                      <span className="text-sm font-medium">₹{formatIndianNumber(Math.round(totalRepayment))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Purpose</span>
                      <span className="text-sm font-medium">{applicationData.loanPurpose || 'Medical Expenses'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disbursement Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Disbursement Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank Account</span>
                    <span className="text-sm font-medium">XXXXXX{applicationData.bankDetail?.accountNumber?.slice(-4) || '9876'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">IFSC Code</span>
                    <span className="text-sm font-medium">{applicationData.bankDetail?.ifscNumber || 'SBIN0123456'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrower Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Borrower Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-base font-medium text-gray-900">{applicationData.borrower?.name}</p>
                <p className="text-sm text-gray-600">ID: {applicationData.borrower?.displayId}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CIBIL Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(applicationData.cibil || 732) / 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">{applicationData.cibil || 732}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employment</span>
                  <span className="text-sm font-medium">{applicationData.employmentDetails?.employmentType || 'Salaried'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Income</span>
                  <span className="text-sm font-medium">₹{formatIndianNumber(applicationData.employmentDetails?.takeHomeSalary || 135000)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Existing EMI</span>
                  <span className="text-sm font-medium">₹{formatIndianNumber(22000)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current DTI Ratio</span>
                  <span className="text-sm font-medium text-green-600">16.3%</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Risk Assessment</span>
                </div>
                <Badge className={`${getRiskColor(applicationData.borrower?.risk)} mb-2`}>
                  {applicationData.borrower?.risk === 'MEDIUM' ? 'Medium Risk' : 
                   applicationData.borrower?.risk === 'LOW' ? 'Low Risk' : 
                   applicationData.borrower?.risk === 'HIGH' ? 'High Risk' : 'Medium Risk'}
                </Badge>
                <p className="text-sm text-gray-600">Approve with standard terms</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Application Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Setup eNACH */}
              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Setup eNACH</h3>
                <p className="text-sm text-gray-600 mb-4">Set up eNACH mandate for recurring payments</p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSetupENACH}
                >
                  Setup eNACH
                </Button>
              </div>

              {/* UPI Autopay */}
              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Link className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">UPI Autopay</h3>
                <p className="text-sm text-gray-600 mb-4">Not available for EMIs over ₹15,000</p>
                <Button variant="secondary" disabled className="w-full">
                  Not Available
                </Button>
              </div>

              {/* Initiate Fund */}
              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Initiate Fund</h3>
                <p className="text-sm text-gray-600 mb-4">Setup eNACH or UPI Autopay first</p>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={handleInitiateFund}
                >
                  Initiate Fund
                </Button>
              </div>

              {/* Reject Loan */}
              <div className="border rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Reject Loan</h3>
                <p className="text-sm text-gray-600 mb-4">Reject this loan application</p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleRejectLoan}
                >
                  Reject Loan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Setup Details - Shows when Setup eNACH is clicked */}
        {showPaymentSetup && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Payment Setup Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">eNACH Details</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Account Holder</span>
                        <p className="font-medium text-gray-900">{applicationData.borrower?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">IFSC Code</span>
                        <p className="font-medium text-gray-900">{applicationData.bankDetail?.ifscNumber || 'HDFC0001234'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Account Number</span>
                        <p className="font-medium text-gray-900">XXXX4567</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Mandate Status</span>
                        <p className="font-medium text-green-600">Registered & Active</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                    <Link className="w-4 h-4 mr-2" />
                    Change Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoanProcessingDetails;
