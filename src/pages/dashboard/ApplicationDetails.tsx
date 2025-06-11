
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, CheckCircle, FileText, CreditCard, Eye } from 'lucide-react';
import { config } from '../../config/environment';
import styles from '../../styles/Application.module.css';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchApplicationDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}loan-application/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      console.log("Application Details:", res.data);
      setApplicationData(res.data || {});
    } catch (error) {
      console.error("Error fetching application details:", error);
      setApplicationData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const formatDateDDMMYYYY = (dateString: string | Date | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return '-';
    }
  };

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

  if (loading) {
    return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading application details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationData || Object.keys(applicationData).length === 0) {
    return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-lg text-gray-600">Application not found</div>
            <Button onClick={() => navigate('/dashboard/applications')} className="mt-4">
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContainer}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/applications')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-medium text-primary">Application Details</h1>
            <p className="text-sm text-gray-600">Application ID: {applicationData.displayId}</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Pending Approval
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Loan Details</CardTitle>
              <p className="text-sm text-gray-600">Review the loan terms and disbursement details</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="text-lg font-semibold">₹{applicationData.loanAmount || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tenure</p>
                    <p className="text-base">6 months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="text-base">12.5% p.a</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Fee</p>
                    <p className="text-base">₹3,000</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="text-lg font-semibold">₹54,173</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Repayment</p>
                    <p className="text-base">₹3,25,038</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purpose</p>
                    <p className="text-base">Medical Expenses</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Disbursement Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank Account</p>
                    <p className="text-base">XXXXXX0876</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="text-base">SBI001234S6</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Application Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Application Progress</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">KYC</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600">Credit Check</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600">Underwriting</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600">Decision</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">KYC Verification</h4>
                  <p className="text-sm text-gray-600 mb-4">Verify the customer's identity documents before proceeding with the loan application.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">PAN Card</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Aadhaar Card</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Salary Slips</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">Bank Statement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                    Complete KYC & Proceed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Borrower Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Borrower Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{applicationData.borrower?.name || 'Rajesh Kumar'}</p>
                <p className="text-sm text-gray-600">ID: RAK-35001</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">CIBIL Score</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">{applicationData.cibil || '754'}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Employment</p>
                  <p className="text-sm font-medium">Salaried</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-sm font-medium">₹1,35,000</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Existing EMI</p>
                  <p className="text-sm font-medium">₹2,000</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Current DTI Ratio</p>
                  <p className="text-sm font-medium text-green-600">16.7%</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Assessment</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Approve with standard terms</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
