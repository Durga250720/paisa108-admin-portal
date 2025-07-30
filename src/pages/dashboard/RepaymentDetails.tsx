import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    History,
    IndianRupee,
    Link as LinkIcon,
    Mail,
    Phone,
    User,
    XCircle
} from 'lucide-react';
import styles from '../../styles/Application.module.css';
import {useToast} from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import axiosInstance from "@/lib/axiosInstance.ts";

// --- Type Definitions ---
type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH' | 'CHEQUE';

// This interface matches an item in the `paymentHistory` array.
interface PaymentHistoryItem {
    amount: number;
    paidAt: string | null; // Updated: Can be null for failed payments
    repaymentType: string;
    mode: PaymentMode;
    attachments: string[];
    referenceId: string;
    paymentReceiptId: string;
    pgPaymentId: string | null;
    upiId: string | null;
    cardNumber: string | null;
    cardHolderName: string | null;
    bankName: string | null;
    chequeNumber: string | null;
    paid: boolean;
}

// This interface matches the detailed API response, including waiver fields.
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
    lateFeeCharged: number; // This is the *remaining* late fee
    lateFeePerDay: number;
    amountToBePaid: number;
    amountPaid: number;
    pendingAmount: number;
    lastPaidAt: string | null;
    status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    paymentHistory: PaymentHistoryItem[];
    latePayment: boolean;
    waivedLateFeeAmount?: number;
    lateFeeWaivedAt?: string | null;
    lateFeeWaiverRemarks?: string | null;
    lateFeeWaived?: boolean;
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
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {toast} = useToast();

    const [repayment, setRepayment] = useState<RepaymentDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for the waive fee modal
    const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
    const [amountToWaive, setAmountToWaive] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isWaiving, setIsWaiving] = useState(false);

    const fetchRepaymentDetails = useCallback(async () => {
        if (!id) {
            setError("Repayment ID is missing from the URL.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/repayment/${id}/details`);
            const result = response.data;
            setRepayment(result.data);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
            toast({
                variant: "destructive",
                title: "API Error",
                description: err?.response?.data?.message || err.message || "Could not fetch repayment data.",
            });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        fetchRepaymentDetails();
    }, [fetchRepaymentDetails]);

    const handleWaiveLateFee = async () => {
        if (!repayment || !repayment.id) return;

        const waiveAmount = parseFloat(amountToWaive);
        const remainingFee = repayment.lateFeeCharged ?? 0;

        if (isNaN(waiveAmount) || waiveAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid positive amount to waive."
            });
            return;
        }

        if (waiveAmount > remainingFee) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: `Amount cannot be greater than the remaining late fee of ${formatCurrency(remainingFee)}.`
            });
            return;
        }

        if (!remarks.trim()) {
            toast({
                variant: "destructive",
                title: "Remarks Required",
                description: "Please provide remarks for waiving the fee."
            });
            return;
        }

        setIsWaiving(true);

        try {
            const response = await axiosInstance.put('/repayment/waive-late-fee', {
                repaymentId: repayment.id,
                amountToWaive: waiveAmount,
                remarks: remarks.trim(),
            });

            const updatedRepayment = response.data;
            setRepayment(updatedRepayment.data); // Refresh data
            toast({title: "Success", description: "Late fee waived successfully."});
            setIsWaiveModalOpen(false); // Close modal on success

        } catch (err) {
            toast({
                variant: "destructive",
                title: "API Error",
                description: err?.response?.data?.message || err.message || "Could not waive late fee.",
            });
        } finally {
            setIsWaiving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'}).format(amount);
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
        let icon = <Clock className="w-4 h-4 mr-2"/>;
        switch (status) {
            case 'PAID':
                classes = 'bg-green-100 text-green-800 border border-green-200';
                icon = <CheckCircle className="w-4 h-4 mr-2"/>;
                break;
            case 'OVERDUE':
                classes = 'bg-red-100 text-red-800 border border-red-200';
                icon = <AlertTriangle className="w-4 h-4 mr-2"/>;
                break;
            case 'PENDING':
            case 'PARTIAL':
                classes = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
                icon = <Clock className="w-4 h-4 mr-2"/>;
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

    // --- Derived Late Fee Values ---
    const totalIncurredLateFee = (repayment.lateFeeCharged ?? 0) + (repayment.waivedLateFeeAmount ?? 0);
    const remainingLateFee = repayment.lateFeeCharged ?? 0;
    const showLateFeeCard = totalIncurredLateFee > 0;
    const isFullyWaived = repayment.lateFeeWaived === true;

    return (
        <div className={`${styles.mainContainer} scrollContainer`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard/repayments')} className="p-2">
                        <ArrowLeft className="w-5 h-5"/>
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
                                <IndianRupee className="w-5 h-5 mr-2"/>
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-primary flex items-center">
                                <History className="w-5 h-5 mr-2"/>
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {repayment.paymentHistory && repayment.paymentHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {repayment.paymentHistory.map((item) => (
                                        <div
                                            key={item.referenceId} // Use stable key
                                            className={`p-4 border rounded-lg ${
                                                item.paid
                                                    ? 'bg-green-50/50 border-green-200'
                                                    : 'bg-red-50/50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`font-semibold text-lg ${item.paid ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(item.amount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.paid ? formatDate(item.paidAt) : 'Payment Attempt Failed'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline">{item.mode}</Badge>
                                                    {item.paid ? (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5"/>
                                                            Paid
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive"
                                                               className="bg-red-100 text-red-800 border-red-200">
                                                            <XCircle className="w-3.5 h-3.5 mr-1.5"/>
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                <div className="flex">
                                                    <strong className="w-32 text-gray-500 font-medium shrink-0">Receipt
                                                        ID:</strong>
                                                    <span
                                                        className="text-gray-800 break-all">{item.paymentReceiptId || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <strong className="w-32 text-gray-500 font-medium shrink-0">PG
                                                        Payment ID:</strong>
                                                    <span
                                                        className="text-gray-800 break-all">{item.pgPaymentId || 'N/A'}</span>
                                                </div>
                                                <div className="flex">
                                                    <strong className="w-32 text-gray-500 font-medium shrink-0">Reference
                                                        ID:</strong>
                                                    <span
                                                        className="text-gray-800 break-all">{item.referenceId || 'N/A'}</span>
                                                </div>
                                                {item.mode === 'UPI' && item.upiId && <div className="flex"><strong
                                                    className="w-32 text-gray-500 font-medium shrink-0">UPI ID:</strong>
                                                    <span
                                                        className="text-gray-800">{item.upiId}</span></div>}
                                                {item.mode === 'CARD' && item.cardNumber &&
                                                    <div className="flex"><strong
                                                        className="w-32 text-gray-500 font-medium shrink-0">Card
                                                        Number:</strong>
                                                        <span className="text-gray-800">{item.cardNumber}</span></div>}
                                                {item.mode === 'CARD' && item.cardHolderName &&
                                                    <div className="flex"><strong
                                                        className="w-32 text-gray-500 font-medium shrink-0">Card
                                                        Holder:</strong>
                                                        <span className="text-gray-800">{item.cardHolderName}</span>
                                                    </div>}
                                                {item.mode === 'CHEQUE' && item.chequeNumber &&
                                                    <div className="flex"><strong
                                                        className="w-32 text-gray-500 font-medium shrink-0">Cheque
                                                        No:</strong>
                                                        <span className="text-gray-800">{item.chequeNumber}</span>
                                                    </div>}
                                                {item.mode === 'NETBANKING' && item.bankName &&
                                                    <div className="flex"><strong
                                                        className="w-32 text-gray-500 font-medium shrink-0">Bank
                                                        Name:</strong>
                                                        <span className="text-gray-800">{item.bankName}</span></div>}
                                            </div>
                                            {item.attachments && item.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Attachments</h4>
                                                    <div className="space-y-2">
                                                        {item.attachments.map((att, attIndex) => (
                                                            <a key={attIndex} href={att} target="_blank"
                                                               rel="noopener noreferrer"
                                                               className="flex items-center text-blue-600 hover:underline text-xs">
                                                                <LinkIcon className="w-3 h-3 mr-2"/>
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

                    {showLateFeeCard && (
                        <Card
                            className={isFullyWaived ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
                            <CardHeader>
                                <CardTitle
                                    className={isFullyWaived ? "text-lg text-green-700 flex items-center" : "text-lg text-orange-700 flex items-center"}>
                                    {isFullyWaived ? <CheckCircle className="w-5 h-5 mr-2"/> :
                                        <AlertTriangle className="w-5 h-5 mr-2"/>}
                                    {isFullyWaived ? "Late Fee Waived" : "Late Fee Details"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-600">Total Incurred Fee</p>
                                    <p className="font-semibold text-gray-800">{formatCurrency(totalIncurredLateFee)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Late Days</p>
                                    <p className="font-semibold text-gray-800">{repayment.lateDays}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Fee Per Day</p>
                                    <p className="font-semibold text-gray-800">{formatCurrency(repayment.lateFeePerDay)}</p>
                                </div>

                                {(repayment.waivedLateFeeAmount ?? 0) > 0 && (
                                    <div className="col-span-full mt-4 pt-4 border-t">
                                        <h4 className="text-md font-semibold text-gray-800 mb-2">Waiver Information</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-green-600">Amount Waived</p>
                                                <p className="font-semibold text-green-700">{formatCurrency(repayment.waivedLateFeeAmount!)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Waived On</p>
                                                <p className="font-semibold text-gray-800">{formatDate(repayment.lateFeeWaivedAt)}</p>
                                            </div>
                                            {repayment.lateFeeWaiverRemarks && (
                                                <div className="col-span-full">
                                                    <p className="text-gray-600">Waiver Remarks</p>
                                                    <p className="text-sm text-gray-800 italic">"{repayment.lateFeeWaiverRemarks}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            {remainingLateFee > 0 && !isFullyWaived && (
                                <CardFooter>
                                    <Dialog open={isWaiveModalOpen} onOpenChange={(open) => {
                                        setIsWaiveModalOpen(open);
                                        if (open) {
                                            // Pre-fill form with remaining amount
                                            setAmountToWaive(remainingLateFee.toString());
                                            setRemarks('');
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline"
                                                    className="border-orange-600 text-orange-600 hover:bg-orange-100 hover:text-orange-700">
                                                Waive Remaining Fee ({formatCurrency(remainingLateFee)})
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Waive Late Fee</DialogTitle>
                                                <DialogDescription>
                                                    Enter the amount to waive and provide remarks. The maximum
                                                    is {formatCurrency(remainingLateFee)}.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="amount" className="text-right">
                                                        Amount
                                                    </Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        value={amountToWaive}
                                                        onChange={(e) => setAmountToWaive(e.target.value)}
                                                        className="col-span-3"
                                                        placeholder={`Max ${remainingLateFee}`}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="remarks" className="text-right">
                                                        Remarks
                                                    </Label>
                                                    <Textarea
                                                        id="remarks"
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        className="col-span-3"
                                                        placeholder="Reason for waiving the fee"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline"
                                                        onClick={() => setIsWaiveModalOpen(false)}>Cancel</Button>
                                                <Button type="submit" onClick={handleWaiveLateFee} disabled={isWaiving}>
                                                    {isWaiving ? 'Waiving...' : 'Confirm Waive'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            )}
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-primary flex items-center">
                                <User className="w-5 h-5 mr-2"/>
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
                                    <Mail className="w-4 h-4 mr-3 text-gray-400"/>
                                    <span>{repayment.borrowerEmail}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-3 text-gray-400"/>
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