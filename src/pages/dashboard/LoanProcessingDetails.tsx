import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    CheckCircle,
    Eye,
    FileText,
    Loader2,
    Send,
    Upload,
    User,
    X,
    XCircle
} from 'lucide-react';
import {config} from '../../config/environment';
import styles from '../../styles/Application.module.css';
import {useToast} from '@/components/ui/use-toast';
import {formatIndianNumber} from '../../lib/utils';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";

// Updated interface to include all possible statuses
interface LoanProcessingDetailsData {
    _id: string;
    displayId: string;
    borrower: {
        name: string;
        displayId: string;
        email: string;
        risk: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    loanAmount: number;
    approvedAmount: number;
    totalTransferredAmount: number;
    digioDocuments: Record<string, string>;
    loanConfig: {
        loanInterestPercentage: number;
        processingFee: number;
        gstOnProcessingFee: number;
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
    applicationStatus: 'APPROVED' | 'APPROVED_WITH_CONDITION' | 'ESIGN_PENDING' | 'READY_FOR_DISBURSAL' | 'DISBURSED' | 'REJECTED';
    remarks?: string;
    totalRepaymentAmount: number;
}

// Helper component for the status tracker
const StatusStep = ({icon, title, isActive, isCompleted}: {
    icon: React.ReactNode,
    title: string,
    isActive: boolean,
    isCompleted: boolean
}) => (
    <div className="flex flex-col items-center space-y-2 flex-1 text-center z-10">
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
            {isCompleted ? <CheckCircle className="w-6 h-6 text-white"/> : icon}
        </div>
        <p className={`text-sm font-medium transition-colors ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
    </div>
);

// Helper component for displaying risk
const RiskBadge = ({risk}: { risk?: 'LOW' | 'MEDIUM' | 'HIGH' }) => {
    const riskInfo = useMemo(() => {
        switch (risk) {
            case 'LOW':
                return {className: 'bg-green-100 text-green-800', text: 'Low Risk'};
            case 'MEDIUM':
                return {className: 'bg-yellow-100 text-yellow-800', text: 'Medium Risk'};
            case 'HIGH':
                return {className: 'bg-red-100 text-red-800', text: 'High Risk'};
            default:
                return {className: 'bg-gray-100 text-gray-800', text: 'N/A'};
        }
    }, [risk]);

    return <Badge className={`${riskInfo.className} mb-2`}>{riskInfo.text}</Badge>;
};


const LoanProcessingDetails = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {toast} = useToast();
    const [applicationData, setApplicationData] = useState<LoanProcessingDetailsData | null>(null);
    const [loading, setLoading] = useState(true);

    // State for actions and dialogs
    const [isSendingESign, setIsSendingESign] = useState(false);
    const [isInitiatingFund, setIsInitiatingFund] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionRemark, setRejectionRemark] = useState('');

    // State for document preview
    const [openDocPreview, setIsOpenDocPreview] = useState(false);
    const [storeDoc, setIsStoreDoc] = useState<{ label: string; url: string } | null>(null);


    const fetchApplicationDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetch(`${config.baseURL}loan-application/${id}/details`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const res = await response.json();
            setApplicationData(res.data || null);
        } catch (error) {
            console.error("Error fetching application details:", error);
            toast({variant: "destructive", title: "Error", description: "Failed to fetch application details."});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    const handleSendESign = async () => {
        if (!id) return;
        setIsSendingESign(true);
        try {
            const url = `${config.baseURL}loan-application/admin/${id}/send-esign-link`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            toast({
                variant: "success",
                title: "E-Sign Link Sent",
                description: result.data || "The e-sign link has been successfully sent.",
            });
            fetchApplicationDetails();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "API Error",
                description: (error as Error).message || "Failed to send e-sign link.",
            });
        } finally {
            setIsSendingESign(false);
        }
    };

    const handleInitiateFund = async () => {
        if (!id) return;
        setIsInitiatingFund(true);
        try {
            const response = await fetch(`${config.baseURL}loan-application/${id}/status-update?status=DISBURSED`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'}
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            toast({
                variant: "success",
                title: "Loan Disbursed",
                description: 'Loan amount has been disbursed successfully.',
            });
            fetchApplicationDetails();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "API Error",
                description: (error as Error).message || "Failed to disburse loan.",
            });
        } finally {
            setIsInitiatingFund(false);
        }
    };

    const confirmRejectLoan = async () => {
        if (!id || !rejectionRemark) {
            toast({variant: "destructive", title: "Validation Error", description: "Rejection remark is required."});
            return;
        }
        setIsRejecting(true);
        try {
            const payload = {applicationId: id, text: rejectionRemark};
            const response = await fetch(`${config.baseURL}loan-application/admin/loan-reject`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            toast({
                variant: "success",
                title: "Application Rejected",
                description: "The loan application has been successfully rejected.",
            });
            setShowRejectDialog(false);
            setRejectionRemark('');
            fetchApplicationDetails();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Rejection Failed",
                description: (error as Error).message || "Could not reject the application.",
            });
        } finally {
            setIsRejecting(false);
        }
    };

    const handleDigoDocsView = (label: string, docUrl: string) => {
        setIsOpenDocPreview(true);
        setIsStoreDoc({label, url: docUrl});
    };

    const closeDocumentPreview = () => {
        setIsOpenDocPreview(false);
        setIsStoreDoc(null);
    };

    if (loading) {
        return (
            <div className={`${styles.mainContainer} flex items-center justify-center`}>
                <div className="text-lg text-gray-600">Loading application details...</div>
            </div>
        );
    }

    if (!applicationData) {
        return (
            <div className={`${styles.mainContainer} flex items-center justify-center py-20 text-center`}>
                <div>
                    <div className="text-lg text-gray-600">Application not found</div>
                    <Button onClick={() => navigate('/dashboard/loan-processing')} className="mt-4">Back to Loan
                        Processing</Button>
                </div>
            </div>
        );
    }

    const {
        applicationStatus,
        borrower,
        remarks,
        digioDocuments,
        loanConfig,
        loanAmount,
        approvedAmount,
        totalTransferredAmount,
        totalRepaymentAmount,
        bankDetail,
        cibil,
        employmentDetails
    } = applicationData;

    const processStatuses = ['APPROVED', 'ESIGN_PENDING', 'READY_FOR_DISBURSAL', 'DISBURSED'];
    const normalizedStatus = applicationStatus === 'APPROVED_WITH_CONDITION' ? 'APPROVED' : applicationStatus;
    const currentStatusIndex = processStatuses.indexOf(normalizedStatus);

    const isActionable = applicationStatus !== 'REJECTED' && applicationStatus !== 'DISBURSED';

    return (
        <div className={`${styles.mainContainer} scrollContainer`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard/loan-processing')} className="p-2">
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <div>
                        <h1 className="text-xl font-medium text-gray-900">Loan Processing Details</h1>
                        <p className="text-sm text-gray-600">Application ID: {applicationData.displayId}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Status Tracker */}
                {applicationStatus !== 'REJECTED' && (
                    <Card>
                        <CardHeader><CardTitle>Application Progress</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between relative">
                                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
                                <div className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
                                     style={{width: `${currentStatusIndex > 0 ? (currentStatusIndex / (processStatuses.length - 1)) * 100 : 0}%`}}></div>
                                <StatusStep icon={<CheckCircle className="w-6 h-6 text-white"/>} title="Approved"
                                            isCompleted={currentStatusIndex > 0} isActive={currentStatusIndex === 0}/>
                                <StatusStep icon={<FileText className="w-6 h-6 text-white"/>} title="eSign Pending"
                                            isCompleted={currentStatusIndex > 1} isActive={currentStatusIndex === 1}/>
                                <StatusStep icon={<Upload className="w-6 h-6 text-white"/>} title="Ready for Disbursal"
                                            isCompleted={currentStatusIndex > 2} isActive={currentStatusIndex === 2}/>
                                <StatusStep icon={<Banknote className="w-6 h-6 text-white"/>} title="Disbursed"
                                            isCompleted={currentStatusIndex >= 3} isActive={currentStatusIndex === 3}/>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rejected Card */}
                {applicationStatus === 'REJECTED' && (
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                            <XCircle className="w-5 h-5 text-red-600"/>
                            <CardTitle className="text-red-800">Application Rejected</CardTitle>
                        </CardHeader>
                        {remarks && <CardContent><p className="text-sm text-red-700">{remarks}</p></CardContent>}
                    </Card>
                )}

                {/* Remarks Card */}
                {remarks && applicationStatus !== 'REJECTED' && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600"/>
                            <CardTitle className="text-yellow-800">Underwriter Remarks</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-sm text-yellow-700">{remarks}</p></CardContent>
                    </Card>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Loan & Document Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Loan & Disbursement
                                Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Loan Terms</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Requested Amount</span><span
                                                className="text-sm font-medium">₹{formatIndianNumber(loanAmount)}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Approved Amount</span><span
                                                className="text-sm font-medium">₹{formatIndianNumber(approvedAmount)}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Processing Fee + GST</span><span
                                                className="text-sm font-medium">₹{formatIndianNumber(loanConfig.processingFee + loanConfig.gstOnProcessingFee)}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Amount to be Disbursed</span><span
                                                className="text-sm font-medium text-green-600">₹{formatIndianNumber(totalTransferredAmount)}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Total Repayment</span><span
                                                className="text-sm font-medium">₹{formatIndianNumber(totalRepaymentAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Disbursement Account</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Account Holder</span><span
                                                className="text-sm font-medium">{bankDetail.accountHolderName}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">Account Number</span><span
                                                className="text-sm font-medium">XXXXXX{bankDetail.accountNumber.slice(-4)}</span>
                                            </div>
                                            <div className="flex justify-between"><span
                                                className="text-sm text-gray-600">IFSC Code</span><span
                                                className="text-sm font-medium">{bankDetail.ifscNumber}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Signed Documents Card */}
                        {(applicationStatus === 'READY_FOR_DISBURSAL' || applicationStatus === 'DISBURSED') && Object.keys(digioDocuments).length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Signed Documents</CardTitle></CardHeader>
                                <CardContent>
                                    {Object.entries(digioDocuments).map(([label, url]) => (
                                        <div key={label}
                                             className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                                            <span className="text-sm font-medium text-gray-800">{label}</span>
                                            <Button variant="outline" size="sm"
                                                    onClick={() => handleDigoDocsView(label, url)}>
                                                <Eye className="w-4 h-4 mr-2"/> View
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Borrower Profile */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center space-x-2"><User
                                className="w-5 h-5"/><span>Borrower Profile</span></CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-base font-medium text-gray-900">{borrower.name}</p>
                                    <p className="text-sm text-gray-600">ID: {borrower.displayId}</p>
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between"><span className="text-sm text-gray-600">CIBIL Score</span><span
                                        className="text-sm font-medium text-green-600">{cibil}</span></div>
                                    <div className="flex justify-between"><span
                                        className="text-sm text-gray-600">Employment</span><span
                                        className="text-sm font-medium">{employmentDetails.employmentType}</span></div>
                                    <div className="flex justify-between"><span className="text-sm text-gray-600">Monthly Income</span><span
                                        className="text-sm font-medium">₹{formatIndianNumber(employmentDetails.takeHomeSalary)}</span>
                                    </div>
                                </div>
                                <div className="border-t pt-3">
                                    <span className="text-sm font-medium text-gray-900">Risk Assessment</span>
                                    <div className="mt-2"><RiskBadge risk={borrower.risk}/></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Application Actions */}
                {isActionable && (
                    <Card>
                        <CardHeader><CardTitle>Application Actions</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                            <Button onClick={handleSendESign}
                                    disabled={currentStatusIndex !== 0 || isSendingESign || isInitiatingFund || isRejecting}>
                                {isSendingESign ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <Send className="w-4 h-4 mr-2"/>}
                                {isSendingESign ? 'Sending...' : 'Send eSign Link'}
                            </Button>
                            <Button onClick={handleInitiateFund}
                                    disabled={currentStatusIndex < 2 || isSendingESign || isInitiatingFund || isRejecting}>
                                {isInitiatingFund ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <Upload className="w-4 h-4 mr-2"/>}
                                {isInitiatingFund ? 'Initiating...' : 'Initiate Fund Transfer'}
                            </Button>
                            <Button variant="destructive" onClick={() => setShowRejectDialog(true)}
                                    disabled={isSendingESign || isInitiatingFund || isRejecting}>
                                <X className="w-4 h-4 mr-2"/> Reject Application
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Rejection Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this loan application. This remark will be recorded.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter rejection remark here..."
                            value={rejectionRemark}
                            onChange={(e) => setRejectionRemark(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isRejecting}>Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmRejectLoan}
                                disabled={isRejecting || !rejectionRemark}>
                            {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            {openDocPreview && storeDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                     onClick={closeDocumentPreview}>
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">{storeDoc.label}</h3>
                            <Button variant="ghost" size="icon" onClick={closeDocumentPreview}><X className="w-5 h-5"/></Button>
                        </div>
                        <div className="border-b my-2"></div>
                        <div className="mt-3">
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(storeDoc.url)}&embedded=true`}
                                width="100%"
                                height="600px"
                                className="border-none"
                                title={`preview-${storeDoc.label}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanProcessingDetails;