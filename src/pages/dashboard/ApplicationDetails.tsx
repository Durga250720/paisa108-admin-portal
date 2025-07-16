
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, CheckCircle, FileText, CreditCard, Eye, XCircle, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import DocumentVerificationDialog from '../../components/DocumentVerificationDialog';
import { config } from '../../config/environment';
import styles from '../../styles/Application.module.css';
import { useToast } from "@/components/ui/use-toast";
import { formatIndianNumber, toTitleCase } from '../../lib/utils';

// Placeholder API call functions
const simulateApiCall = (stepName: string, success: boolean = true): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (success) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

const completeKycStep = () => simulateApiCall("KYC Step");
const completeCreditCheckStep = () => simulateApiCall("Credit Check Step");
const completeUnderwritingStep = () => simulateApiCall("Underwriting Step");
// Specific API calls for the Decision step
const approveApplicationApiCall = () => simulateApiCall("Approve Application");
const approveWithConditionsApiCall = () => simulateApiCall("Approve with Conditions");

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decessionRemark, setDecessionRemark] = useState('');
  const [approvalCondition, setApprovalCoditions] = useState('');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState('');
  const [actionApiCall, setActionApiCall] = useState<any>();
  const [stepToComplete, setStepToComplete] = useState<any>();

  const { toast } = useToast()
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showApproveWithConditionsDialog, setShowApproveWithConditionsDialog] = useState(false)
  const [documentPreviewUrls, setDocumentPreviewUrls] = useState<any>([]);
  const [documentPreviewTitle, setDocumentPreviewTitle] = useState<string>('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationDocInfo, setVerificationDocInfo] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);


  // State for workflow tabs
  type WorkflowStepId = 'KYC' | 'CREDIT_CHECK' | 'UNDERWRITING' | 'DECISION';
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowStepId>('KYC');
  const [workflowProgress, setWorkflowProgress] = useState<number>(0);
  const [highestCompletedStepIndex, setHighestCompletedStepIndex] = useState<number>(-1);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);


  const workflowSteps: {
    id: WorkflowStepId;
    label: string;
    icon: React.ElementType;
    progress: number;
  }[] = [
      { id: 'KYC', label: 'KYC', icon: User, progress: 25 },
      { id: 'CREDIT_CHECK', label: 'Credit Check', icon: CheckCircle, progress: 50 },
      { id: 'UNDERWRITING', label: 'Underwriting', icon: FileText, progress: 75 },
      { id: 'DECISION', label: 'Decision', icon: CreditCard, progress: 100 },
    ];

  // Update workflowProgress whenever highestCompletedStepIndex changes
  useEffect(() => {
    if (highestCompletedStepIndex === -1) {
      setWorkflowProgress(0);
    } else if (highestCompletedStepIndex < workflowSteps.length) {
      setWorkflowProgress(workflowSteps[highestCompletedStepIndex].progress);
    }
  }, [highestCompletedStepIndex]);

  const handleWorkflowTabClick = (stepId: WorkflowStepId) => {
    const clickedStepIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (clickedStepIndex <= highestCompletedStepIndex + 1) {
      setActiveWorkflowTab(stepId);
    } else {
      toast({
        variant: "default",
        title: "Sequence Error",
        description: "Please complete the previous steps before navigating to this one.",
      });
    }
  };

  const handleWorkflowAction = async (
    actionApiCall: () => Promise<boolean>,
    stepIdToComplete: WorkflowStepId,
    withconditon?: boolean
  ) => {
    if (stepIdToComplete === 'CREDIT_CHECK') {
      try {
        const response = await fetch(config.baseURL + `loan-application/admin/${applicationData?.id}/loan-credit-check`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();
        if (result) {
          afterApiCallHandlingStepper(actionApiCall, stepIdToComplete);
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
      }
    }
    if (stepIdToComplete === 'UNDERWRITING') {
      // Check if underwriting is already pending
      if (applicationData?.underwriting === 'PENDING') {
        toast({
          variant: "default",
          title: "Underwriting Pending",
          description: "Verification email has already been sent. Please wait for borrower response.",
          duration: 3000,
        });
        return;
      }

      try {
        const response = await fetch(config.baseURL + `loan-application/${applicationData?.id}/send-underwriting-mail`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const results = await response.json();

        console.log(results)

        if (results != null) {
          // Update application data with the latest status
          setApplicationData(results.data || {});

          if (results?.data.underwriting === 'PENDING') {
            toast({
              variant: "default",
              title: "Verification Email Sent",
              description: "Underwriting verification email has been sent to the borrower.",
              duration: 3000,
            });
          } else if (results?.data.underwriting !== 'PENDING' && results?.data.underwriting !== 'NOT_STARTED') {
            afterApiCallHandlingStepper(actionApiCall, stepIdToComplete);
          }
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
        })
      }
    }
    if (stepIdToComplete === 'DECISION' && !withconditon) {
      const payload = {
        "applicationId": applicationData?.id,
        "text": null
      }

      try {
        const response = await fetch(config.baseURL + `loan-application/admin/loan-approve`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const results = await response.json();

        if (results != null) {
          afterApiCallHandlingStepper(actionApiCall, stepIdToComplete);
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
        })
      }
    }
    if (stepIdToComplete === 'DECISION' && withconditon) {
      setShowApproveWithConditionsDialog(true)
      setActionApiCall(actionApiCall);
      setStepToComplete(stepIdToComplete);
    }
  };

  const approveWithConditions = async () => {
    const payload = {
      "applicationId": applicationData?.id,
      "text": approvalCondition
    }

    try {
      const response = await fetch(config.baseURL + `loan-application/admin/loan-approve`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const results = await response.json();

      if (results != null) {
        afterApiCallHandlingStepper(() => simulateApiCall("Approve with Conditions"), stepToComplete);
        setShowApproveWithConditionsDialog(false);
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
      })
    }
  }


  const afterApiCallHandlingStepper = async (
    actionApiCall: () => Promise<boolean>,
    stepIdToComplete: WorkflowStepId,
    withconditon?: boolean
  ) => {
    const stepToCompleteIndex = workflowSteps.findIndex(step => step.id === stepIdToComplete);
    const stepDetails = workflowSteps[stepToCompleteIndex];

    if (!stepDetails || stepToCompleteIndex !== highestCompletedStepIndex + 1) {
      toast({ variant: "destructive", title: "Error", description: "Cannot proceed with this step at this time." });
      return;
    }

    if (stepDetails.id === 'KYC' && !applicationData?.loanWorkflow?.KYC) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please verify all KYC documents before proceeding.",
      });
      return;
    }

    setIsProceeding(true);
    try {
      const success = await actionApiCall();
      if (success) {
        setHighestCompletedStepIndex(stepToCompleteIndex);
        if (stepToCompleteIndex < workflowSteps.length - 1) {
          setActiveWorkflowTab(workflowSteps[stepToCompleteIndex + 1].id);
          toast({ variant: "success", title: "Step Completed", description: `${stepDetails.label} completed successfully.` });
        } else {
          toast({ variant: "success", title: "Workflow Complete", description: "The application process has been fully completed." });
        }
      } else {
        toast({ variant: "destructive", title: "Action Failed", description: `Could not complete the action for ${stepDetails.label}. Please try again.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "API Error", description: `An error occurred while processing the action for ${stepDetails.label}.` });
    } finally {
      setIsProceeding(false);
    }
  }

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

      // Initialize highestCompletedStepIndex and activeWorkflowTab based on loanWorkflow status
      if (res.data?.loanWorkflow) {
        const workflow = res.data.loanWorkflow;
        let completedIndex = -1;
        let initialActiveTab: WorkflowStepId = 'KYC';

        if (workflow.DECISION) {
          completedIndex = workflowSteps.findIndex(s => s.id === 'DECISION');
          initialActiveTab = 'DECISION';
        } else if (workflow.UNDERWRITING) {
          completedIndex = workflowSteps.findIndex(s => s.id === 'UNDERWRITING');
          initialActiveTab = 'DECISION'; // Next step after underwriting
        } else if (workflow.CREDIT_CHECK) {
          completedIndex = workflowSteps.findIndex(s => s.id === 'CREDIT_CHECK');
          initialActiveTab = 'UNDERWRITING'; // Next step after credit check
        } else if (workflow.KYC) {
          completedIndex = workflowSteps.findIndex(s => s.id === 'KYC');
          initialActiveTab = 'CREDIT_CHECK'; // Next step after KYC
        }

        setUserEmail(res.data.borrower.email)
        setHighestCompletedStepIndex(completedIndex);
        setActiveWorkflowTab(initialActiveTab);
      } else {
        setHighestCompletedStepIndex(-1); // No loanWorkflow data
        setActiveWorkflowTab('KYC'); // Default to first step
      }
    } catch (error) {
      setApplicationData({});
      setHighestCompletedStepIndex(-1); // Reset on error
      setActiveWorkflowTab('KYC'); // Default to first step
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
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



  const detailsVerified = (value: any) => {
    let isVerified: any;
    applicationData?.loanDocuments.forEach(element => {
      if (element.documentType === value) {
        isVerified = element.adminVerificationStatus
      }
    });
    return isVerified;
  }

  const handleOpenDocumentPreview = (docType: string) => {
    if (!applicationData?.loanDocuments) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Loan documents are not available.",
      })
      return;
    }

    const document = applicationData.loanDocuments.find(
      (doc: any) => doc.documentType === docType
    );

    console.log(document)

    if (document && document.documentUrls && document.documentUrls.length > 0) {
      setDocumentPreviewUrls(document.documentUrls);
      setDocumentPreviewTitle(docType.replace(/_/g, ' ') + ' Preview');
      setShowDocumentPreview(true);
    } else {
      toast({
        variant: "default",
        // title: "Not Found",
        description: `No documents available for preview for ${docType.replace(/_/g, ' ')}.`,
      })
    }
  };

  const flatFee = applicationData?.loanConfig?.platformFee;
  const loanInterestPercentage = (applicationData?.loanConfig?.loanInterestPercentage) / 100;
  const interest = applicationData?.loanAmount * loanInterestPercentage; // This might need to be dynamic based on loanAmount
  const loanProtectionFee = applicationData?.loanConfig?.loanProtectionFee;
  const loanProcessingFee = applicationData?.loanConfig?.processingFee;
  const gstOnProcessingFee = loanProcessingFee * 0.18
  const totalAmount = applicationData?.loanAmount + interest;
  const disbursingAmount = applicationData?.loanAmount - loanProtectionFee - gstOnProcessingFee - loanProcessingFee - flatFee;

  const getApplicationStatusClasses = (value) => {
    switch (value?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'DISBURSED':
        return 'bg-purple-50 text-purple-800 border border-purple-200';
      default: // Default for UNKNOWN or other statuses
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  }

  const handleDocumentVerification = (docType: string) => {
    const document = applicationData?.loanDocuments.find(
      (doc: any) => doc.documentType === docType
    );

    if (!document) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Document details for ${docType.replace(/_/g, ' ')} not found.`,
      });
      return;
    }

    setVerificationDocInfo({
      type: docType,
      number: document.documentNumber || null,
      urls: document.documentUrls || [],
    });
    setShowVerificationDialog(true);
  };

  const handleSubmitVerification = async (status: 'VERIFIED' | 'REJECTED', remark: string) => {
    if (!verificationDocInfo || !id) return;

    setIsVerifying(true);
    try {
      const payload = {
        documentType: verificationDocInfo.type,
        documentNumber: verificationDocInfo.number,
        verified: status === 'VERIFIED' ? true : false,
        remark: remark,
      };

      const response = await fetch(`${config.baseURL}loan-application/admin/${applicationData?.id}/verify-kyc-doc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast({ title: 'Success', description: `${verificationDocInfo.type.replace(/_/g, ' ')} has been ${status.toLowerCase()} successfully.` });
      setShowVerificationDialog(false);
      fetchApplicationDetails(); // Refresh data
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message || `Failed to ${status.toLowerCase()} ${verificationDocInfo.type.replace(/_/g, ' ')}. Please try again.` });
    } finally {
      setIsVerifying(false);
      setVerificationDocInfo(null);
    }
  };

  const handleRemarkForApplication = async () => {
    const payload = {
      "applicationId": applicationData?.id,
      "text": decessionRemark
    }
    try {
      const response = await fetch(config.baseURL + `loan-application/admin/loan-remark`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const results = await response.json();

      if (results != null) {
        toast({
          variant: "success",
          title: "Remark Added",
          description: "Application remark has been recorded",
          duration: 5000
        });
        setDecessionRemark('');
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
    }
  }

  if (loading) {
    return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-center w-[100%] h-[100%]">
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
            <Button onClick={() => navigate('/dashboard/applications')} className="mt-4">
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContainer} scrollContainer`}>
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
        <Button className={`${getApplicationStatusClasses(applicationData?.applicationStatus)} cursor-auto hover:bg-color-none rounded-lg`}>
          {applicationData?.applicationStatus === 'APPROVED' && '✓ '}
          {applicationData?.applicationStatus === 'PENDING' && '⏳ '}
          {applicationData?.applicationStatus === 'REJECTED' && '✕ '}
          {toTitleCase(applicationData?.applicationStatus || 'Unknown')}
        </Button>
      </div>


      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-lg font-semibold">₹ {formatIndianNumber(applicationData.loanAmount) || '0'}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-gray-600">Tenure</p>
                    <p className="text-base">6 months</p>
                  </div> */}
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="text-base">{applicationData?.loanConfig ? (applicationData?.loanConfig?.loanInterestPercentage).toFixed(2) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Fee</p>
                    <p className="text-base">₹ {formatIndianNumber(loanProcessingFee)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Repayment</p>
                    <p className="text-lg font-medium">₹ {formatIndianNumber(applicationData?.totalRepaymentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disbursing Amount</p>
                    <p className="text-base font-normal">₹ {formatIndianNumber(applicationData?.totalTransferredAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purpose</p>
                    <p className="text-base">{applicationData?.loanPurpose ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Disbursement Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank Account</p>
                    <p className="text-base">XXXXXX{applicationData?.bankDetail?.accountNumber.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="text-base">{applicationData?.bankDetail?.ifscNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrower Profile */}
          {/* This card is now the second item in the grid defined above */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Borrower Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{applicationData.borrower?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">ID: {applicationData?.borrower?.displayId}</p>
              </div>

              <div className="space-y-2">
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
                  <p className="text-sm font-medium">{applicationData?.employmentDetails?.employmentType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-sm font-medium">₹ {formatIndianNumber(applicationData?.employmentDetails?.takeHomeSalary)}</p>
                </div>

              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Assessment</span>
                  <Badge className={`${getStatusColor(applicationData?.borrower?.risk)}`}>
                    {
                      applicationData?.borrower?.risk === 'NOT_AVAILABLE' ?
                        'N/A' :
                        applicationData?.borrower?.risk + 'Risk'
                    }
                  </Badge>
                </div>
                {/* <p className="text-sm text-gray-600 mt-2">Approve with standard terms</p> */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Application Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Application Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Application Progress</span>
                  <span className="text-sm font-medium">{workflowProgress}%</span>
                </div>
                <Progress value={workflowProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {workflowSteps.map((step, index) => {
                  let iconBgColor = 'bg-gray-100';
                  let iconColor = 'text-gray-400';
                  let ringClass = '';
                  let labelColor = 'text-gray-500';
                  let isClickable = false;

                  if (index <= highestCompletedStepIndex) { // Completed
                    iconBgColor = 'bg-purple-100';
                    iconColor = 'text-purple-600';
                    labelColor = 'text-purple-700';
                    isClickable = true;
                  } else if (index === highestCompletedStepIndex + 1) { // Next actionable step
                    iconBgColor = 'bg-blue-50';
                    iconColor = 'text-blue-600';
                    labelColor = 'text-blue-700';
                    isClickable = true;
                  } else { // Future, locked step
                    iconBgColor = 'bg-gray-50';
                    iconColor = 'text-gray-300';
                    labelColor = 'text-gray-400';
                  }

                  if (activeWorkflowTab === step.id && isClickable) {
                    ringClass = 'ring-2 ring-purple-500';
                    iconBgColor = 'bg-purple-100'; // Emphasize active tab if it's clickable
                    iconColor = 'text-purple-600';
                    labelColor = 'text-purple-600 font-medium';
                  }

                  return (<button
                    key={step.id}
                    className={`text-center focus:outline-none cursor-auto`}
                    disabled={!isClickable}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${iconBgColor} ${ringClass} ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => handleWorkflowTabClick(step.id)}
                    >
                      <step.icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <p className={`text-xs ${labelColor}`}>
                      {step.label}
                    </p>
                  </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                {/* KYC Tab Content */}
                {activeWorkflowTab === 'KYC' && (
                  <div className='border p-4 rounded-lg'>
                    <h4 className="text-sm font-medium text-black-600 mb-2">KYC Verification</h4>
                    <p className="text-[13px] text-gray-500 mb-3">Verify the customer's identity documents before proceeding with the loan application.</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">PAN Card
                            <span className='ml-2 text-xs text-orange-500'>
                              (
                              {
                                applicationData?.loanDocuments.find(doc => doc.documentType === 'PAN')!.documentNumber
                              }
                              )
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${detailsVerified('PAN') === 'APPROVED' ? 'bg-green-100 text-green-800'
                              : detailsVerified('PAN') === 'REJECTED' ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }  hover:bg-color-none py-[4px]`}>
                            {detailsVerified('PAN') === 'APPROVED' ?
                              <>
                                <div className='flex gap-1 items-center text-[11px]'>
                                  <CheckCircle size={12} className="text-green-700 relative bottom-[1px]" />
                                  Verified
                                </div>
                              </>
                              :
                              detailsVerified('PAN') === 'PENDING' ?
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <AlertCircle size={12} className="text-yellow-700 relative bottom-[1px]" />
                                    Verification Required
                                  </div>
                                </>
                                :
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <XCircle size={12} className="text-red-700 relative bottom-[1px]" />
                                    Rejected
                                  </div>
                                </>
                            }
                          </Badge>
                          {
                            detailsVerified('PAN') === 'REJECTED' || detailsVerified('PAN') === 'APPROVED' ?
                              '' :
                              <Button variant="outline" size="sm" className='text-xs bg-primary hover:bg-color-none hover:text-white-100' onClick={() => handleDocumentVerification('PAN')}>
                                Verify
                              </Button>
                          }
                          {
                            applicationData?.loanDocuments.find(
                              doc => doc.documentType === 'PAN' && doc.documentUrls != null
                            ) ?
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDocumentPreview('PAN')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              : ''
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">Aadhaar Card
                            <span className='ml-2 text-xs text-orange-500'>
                              (
                              {
                                applicationData?.loanDocuments.find(doc => doc.documentType === 'AADHAAR')!.documentNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
                              }
                              )
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${detailsVerified('AADHAAR') === 'APPROVED' ? 'bg-green-100 text-green-800'
                              : (detailsVerified('AADHAAR') == 'PENDING' || detailsVerified('AADHAAR') === null) ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            } 
                            hover:bg-color-none py-[4px]`}>
                            {detailsVerified('AADHAAR') === 'APPROVED' ?
                              <>
                                <div className='flex gap-1 items-center text-[11px]'>
                                  <CheckCircle size={12} className="text-green-700 relative bottom=[1px]" />
                                  Verified
                                </div>
                              </>
                              :
                              (detailsVerified('AADHAAR') === 'PENDING' || !detailsVerified('AADHAAR')) ?
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <AlertCircle size={12} className="text-yellow-700 relative bottom-[1px]" />
                                    Verification Required
                                  </div>
                                </>
                                :
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <XCircle size={12} className="text-red-700 relative bottom-[1px]" />
                                    Rejected
                                  </div>
                                </>
                            }
                          </Badge>
                          {
                            detailsVerified('AADHAAR') === 'REJECTED' || detailsVerified('AADHAAR') === 'APPROVED' ?
                              '' :
                              <Button variant="outline" size="sm" className='text-xs bg-primary hover:bg-color-none hover:text-white-100' onClick={() => handleDocumentVerification('AADHAAR')}>
                                Verify
                              </Button>
                          }
                          {
                            applicationData?.loanDocuments.find(
                              doc => doc.documentType === 'AADHAAR' && doc.documentUrls != null
                            ) ?
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDocumentPreview('AADHAAR')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              : ''
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">Salary Slips</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${detailsVerified('SALARY_SLIP') === 'APPROVED' ? 'bg-green-100 text-green-800'
                              :
                              (detailsVerified('SALARY_SLIP') === 'PENDING' || detailsVerified('SALARY_SLIP') === null) ?
                                'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            } hover:bg-color-none py-[4px]`}>
                            {detailsVerified('SALARY_SLIP') === 'APPROVED' ?
                              <>
                                <div className='flex gap-1 items-center text-[11px]'>
                                  <CheckCircle size={12} className="text-green-700 relative bottom-[1px]" />
                                  Verified
                                </div>
                              </>
                              :
                              (detailsVerified('SALARY_SLIP') === null || detailsVerified('SALARY_SLIP') === 'PENDING') ?
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <AlertCircle size={12} className="text-yellow-700 relative bottom-[1px]" />
                                    Verification Required
                                  </div>
                                </>
                                :
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <XCircle size={12} className="text-red-700 relative bottom-[1px]" />
                                    Rejected
                                  </div>
                                </>
                            }
                          </Badge>
                          {
                            (detailsVerified('SALARY_SLIP') === 'REJECTED' || detailsVerified('SALARY_SLIP') === 'APPROVED') ?
                              "" :
                              <Button variant="outline" size="sm" className='text-xs bg-primary hover:bg-color-none hover:text-white-100'
                                onClick={() => handleDocumentVerification('SALARY_SLIP')}>
                                Verify
                              </Button>
                          }
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDocumentPreview('SALARY_SLIP')}>
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
                          <Badge className={`${detailsVerified('BANK_STATEMENT') == 'APPROVED' ? 'bg-green-100 text-green-800'
                              :
                              (detailsVerified('BANK_STATEMENT') === 'PENDING' || detailsVerified('BANK_STATEMENT') === null)
                                ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            } hover:bg-color-none py-[4px]`}>
                            {detailsVerified('BANK_STATEMENT') === 'APPROVED' ?
                              <>
                                <div className='flex gap-1 items-center text-[11px]'>
                                  <CheckCircle size={12} className="text-green-700 relative bottom-[1px]" />
                                  Verified
                                </div>
                              </>
                              :
                              (detailsVerified('BANK_STATEMENT') === 'PENDING' || detailsVerified('BANK_STATEMENT') === null) ?
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <AlertCircle size={12} className="text-yellow-700 relative bottom-[1px]" />
                                    Verification Required
                                  </div>
                                </>
                                :
                                <>
                                  <div className='flex gap-1 items-center text-[11px]'>
                                    <XCircle size={12} className="text-red-700 relative bottom-[1px]" />
                                    Verification Required
                                  </div>
                                </>
                            }
                          </Badge>
                          {
                            (detailsVerified('BANK_STATEMENT') === 'REJECTED' || detailsVerified('BANK_STATEMENT') === 'APPROVED') ?
                              "" :
                              <Button variant="outline" size="sm" className='text-xs bg-primary hover:bg-color-none hover:text-white-100'
                                onClick={() => handleDocumentVerification('BANK_STATEMENT')}>
                                Verify
                              </Button>
                          }
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDocumentPreview('BANK_STATEMENT')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleWorkflowAction(completeKycStep, 'KYC')}
                      disabled={isProceeding || workflowSteps.findIndex(s => s.id === 'KYC') !== highestCompletedStepIndex + 1}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isProceeding && activeWorkflowTab === 'KYC' ? 'Processing...' : 'Complete KYC & Proceed'}
                    </Button>
                  </div>
                )}


                {activeWorkflowTab === 'CREDIT_CHECK' && (
                  <div className='border p-4 rounded-lg'>
                    <h4 className="text-sm font-medium text-black-600 mb-2">Credit Check & Risk Assessment</h4>
                    <p className="text-[13px] text-gray-500 mb-3">Perform a credit check to assess the borrower's creditworthiness and determine risk level.</p>
                    {
                      !isProceeding && activeWorkflowTab === 'CREDIT_CHECK' ?
                        <Button
                          variant='outline'
                          className='mt-4 bg-purple-100 hover:bg-color-none text-purple-600 hover:text-purple-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
                          onClick={() => handleWorkflowAction(completeCreditCheckStep, 'CREDIT_CHECK')}
                          disabled={workflowSteps.findIndex(s => s.id === 'CREDIT_CHECK') !== highestCompletedStepIndex + 1}
                        >
                          <CreditCard className="w-4 h-4" />
                          Run Credit Check
                        </Button>
                        :
                        <Button variant='outline' className='mt-4 bg-purple-100 hover:bg-color-none text-purple-600 hover:text-purple-600 flex items-center space-x-2 cursor-not-allowed' disabled>
                          Processing...
                        </Button>
                    }
                    {/* <div className="flex items-center gap-2 text-green-600 text-[14px] mt-4">
                      <CheckCircle className='w-5 h-5 text-green-600'/>
                      Credit Check Completed
                    </div>
                    <div className="mt-4 border border-amber-200 p-4 rounded-lg bg-amber-50">
                      <div className="text-amber-800 font-medium mb-2">
                          Loan Amount Recommendation
                      </div>
                      <div className="text-[13px] text-amber-700 mb-2">
                        Based on the credit assessment, the maximum recommended loan amount is:
                      </div>
                      <div className="text-lg font-bold text-amber-900">
                        ₹ {formatIndianNumber(75000)}
                      </div>
                      <div className="text-xs text-amber-700 mt-2">
                        The requested loan amount exceeds the recommended limit based on the borrower's credit profile.
                      </div>
                    </div> */}
                  </div>
                )}

                {/* Underwriting Tab Content */}
                {activeWorkflowTab === 'UNDERWRITING' && (
                  <div className='border p-4 rounded-lg'>
                    <h4 className="text-sm font-medium text-black-600 mb-2">Digital Underwriting</h4>
                    <p className="text-[13px] text-gray-500 mb-3">Send verification email to the borrower for digital verification and document signing.</p>

                    {/* Show underwriting status if pending */}
                    {applicationData?.underwriting === 'PENDING' && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Underwriting Status: Pending
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Verification email has been sent. Waiting for borrower response.
                        </p>
                      </div>
                    )}

                    {
                      applicationData?.loanWorkflow.UNDERWRITING ?
                        ""
                        :
                        <div className="mt-4 flex flex-col space-y-2">
                          <label className='text-sm font-medium text-black-600'>Borrower's Email Address</label>
                          <input
                            id="username"
                            type="text"
                            placeholder="Enter borrower's email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="inputField"
                            required
                            style={{ width: '25%', fontSize: '13px' }}
                            disabled={applicationData?.underwriting === 'PENDING'}
                          />
                        </div>
                    }
                    {
                      applicationData?.loanWorkflow.UNDERWRITING && activeWorkflowTab === 'UNDERWRITING' ?
                        <div className="flex items-center gap-2 text-green-600 text-[14px] mt-4 font-medium">
                          <CheckCircle className='w-5 h-5 text-green-600' />
                          Digital Underwriting Completed
                        </div>
                        :
                        <>
                          {
                            !isProceeding ?
                              <Button
                                variant='outline'
                                className='mt-4 bg-purple-100 hover:bg-color-none text-purple-600 hover:text-purple-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={() => handleWorkflowAction(completeUnderwritingStep, 'UNDERWRITING')}
                                disabled={workflowSteps.findIndex(s => s.id === 'UNDERWRITING') !== highestCompletedStepIndex + 1 || applicationData?.underwriting === 'PENDING'}
                              >
                                <Mail className="w-4 h-4" />
                                {applicationData?.underwriting === 'PENDING' ? 'Email Sent - Pending Response' : 'Send Verification Email'}
                              </Button>
                              :
                              <Button variant='outline' className='mt-4 bg-purple-100 hover:bg-color-none text-purple-600 hover:text-purple-600 flex items-center space-x-2 cursor-not-allowed' disabled>
                                Processing...
                              </Button>
                          }
                        </>
                    }
                    {/* Add Underwriting specific content here */}
                  </div>
                )}

                {/* Decision Tab Content (Placeholder) */}
                {activeWorkflowTab === 'DECISION' && (
                  <div className='border p-4 rounded-lg'>
                    <h4 className="text-sm font-medium text-black-600 mb-2">Decision</h4>
                    <p className="text-[13px] text-gray-500 mb-3">Review the application and make a final decision.</p>
                    {
                      applicationData?.loanWorkflow.DECISION ?
                        <>
                          <div className="mt-2 border border-amber-200 p-4 rounded-md bg-amber-50">
                            <div className="text-amber-800 font-sm mb-2">
                              {
                                applicationData?.approvalConditions === null ?
                                  <span className='flex items-center gap-2 text-[14px] font-medium'> <CheckCircle className="w-4 h-4" /> Approved</span>
                                  :
                                  <span className='flex items-center gap-2 text-[14px] font-medium'> <ShieldCheck className="w-4 h-4" /> Approved with Conditions</span>
                              }
                            </div>
                            {
                              applicationData?.approvalConditions != null ?
                                <div className='mt-2'>
                                  <div className="text-sm text-amber-800">
                                    Conditions :
                                  </div>
                                  <div className="text-sm text-amber-800" dangerouslySetInnerHTML={{ __html: applicationData?.approvalConditions }}></div>
                                </div>
                                :
                                ""
                            }
                          </div>
                        </>
                        :
                        <>
                          <div className="mt-3">
                            <div className="text-sm font-medium text-black-600 mb-2">Add Remark</div>
                            <textarea name="Reason" className='w-[100%]  focus:outline-none focus:ring-0
                      border rounded-md p-2 text-[13px]' placeholder='Enter your remark about this application'
                              value={decessionRemark} onChange={(e) => setDecessionRemark(e.target.value)}
                              rows={5}></textarea>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <div className="remark">
                              <Button onClick={handleRemarkForApplication}>
                                Remark
                              </Button>
                            </div>
                            <div className="approveBtns flex items-center space-x-2">
                              <Button
                                onClick={() => handleWorkflowAction(approveApplicationApiCall, 'DECISION', false)}
                                disabled={isProceeding || workflowSteps.findIndex(s => s.id === 'DECISION') !== highestCompletedStepIndex + 1}
                                className="bg-green-50 text-green-600 text-[13px] hover:bg-green-100 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{isProceeding && activeWorkflowTab === 'DECISION' ? 'Processing...' : 'Approve Application'}</span>
                              </Button>
                              <Button
                                onClick={() => handleWorkflowAction(approveWithConditionsApiCall, 'DECISION', true)}
                                disabled={isProceeding || workflowSteps.findIndex(s => s.id === 'DECISION') !== highestCompletedStepIndex + 1}
                                className="hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-[13px] flex items-center space-x-1"
                                variant='outline'
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{isProceeding && activeWorkflowTab === 'DECISION' ? 'Processing...' : 'Approve with Conditions'}</span>
                              </Button>
                            </div>
                          </div>
                        </>
                    }
                  </div>
                )}

                <div className="pt-6 border-t">
                  <Button className="border border-red-300 hover:text-red-600 hover:bg-color-none text-red-600 flex items-center space-x-2" variant='outline'>
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{documentPreviewTitle}</DialogTitle>
            <DialogDescription>
              Showing uploaded document(s). You can open them in a new tab for a larger view.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-grow overflow-y-auto">
            {documentPreviewUrls.length > 0 ? (
              documentPreviewUrls.map((doc, index) => (
                <div key={index} className="border rounded-md p-3">
                  <p className="text-sm text-gray-500 mb-2">Document {index + 1}</p>
                  <iframe
                    src={doc.url}
                    width="100%"
                    height="500px"
                    className="border"
                    title={`preview-${doc.passCode}`}
                  />
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 block text-center"
                  >
                    Open in new tab
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-10">No documents to display.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* approve with conditions */}
      <Dialog open={showApproveWithConditionsDialog} onOpenChange={setShowApproveWithConditionsDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Approve with Conditions</DialogTitle>
            <DialogDescription>
              Specify conditions that must be met before the loan can be disbursed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 flex-grow overflow-y-auto">
            <textarea name="Reason" className='w-[100%]  focus:outline-none focus:ring-0
                      border rounded-md p-2 text-[13px]' placeholder='Enter conditions for approve..'
              value={approvalCondition} onChange={(e) => setApprovalCoditions(e.target.value)}
              rows={5}></textarea>
          </div>
          <DialogFooter>
            <Button
              className='border border-primary-1 bg-primary hover:text-red-600 hover:bg-color-none text-xs flex items-center p-2 rounded-md'
              disabled={approvalCondition === ''}
              onClick={approveWithConditions}
            >Approve with conditions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Verification Dialog */}
      <DocumentVerificationDialog
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        documentType={verificationDocInfo?.type || ''}
        documentNumber={verificationDocInfo?.number || null}
        documentUrls={verificationDocInfo || null}
        onSubmit={handleSubmitVerification}
        isLoading={isVerifying}
      />
    </div>
  );
};

export default ApplicationDetails;
