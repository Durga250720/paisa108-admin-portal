import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/config/environment.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AlertTriangle,
    ArrowLeft,
    Briefcase,
    Building2,
    Cake,
    CalendarDays,
    CircleDollarSign,
    FileText,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    User,
} from 'lucide-react';
import { cn, formatIndianNumber } from '@/lib/utils.ts';
import axiosInstance from '@/lib/axiosInstance';

// --- Type Definitions for API Response ---
interface KycDocument {
    documentType: 'AADHAAR' | 'PAN';
    documentNumber: string;
    verified: boolean;
    apiResponse?: {
        result?: {
            dataFromAadhaar?: {
                maskedAadhaarNumber?: string;
            };
        };
    };
}

interface CibilData {
    score: number;
    rating: string;
}

interface EmploymentDetails {
    employmentType: string;
    companyName: string;
    designation: string;
    takeHomeSalary: number;
    totalExperienceInMonths: number;
}

interface Document {
    documentType: string;
    documentUrls: string[];
}

interface BorrowerProfile {
    id: string;
    displayId: string;
    name: string;
    email: string;
    mobile: string;
    dob: string;
    profileImage: string;
    fathersName: string;
    gender: string;
    kycDocuments: KycDocument[];
    borrowerCibilData: CibilData;
    employmentDetails: EmploymentDetails;
    payslips: Document;
    bankStatement: Document;
    totalLoansCount: number;
    active: boolean;
    blackListed: boolean;
    kycverified: boolean;
}

interface LoanHistory {
    id: string;
    displayId: string;
    loanAmount: number;
    approvedAmount: number;
    applicationStatus: string;
    createdAt: string;
    repaymentDate: string;
    totalRepaymentAmount: number;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-gray-500">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <div className="text-sm font-medium text-gray-800">{value || 'N/A'}</div>
        </div>
    </div>
);

const BorrowerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [borrower, setBorrower] = useState<BorrowerProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState<boolean>(true);

    useEffect(() => {
        if (id) {
            fetchBorrowerProfile();
            fetchLoanHistory();
        }
    }, [id]);

    const fetchBorrowerProfile = async () => {
        setLoading(true);
        // try {
            axiosInstance.get(`${config.baseURL}borrower/${id}/profile`)
            .then(
                (res:any) => {
                    setBorrower(res.data.data);
                    setLoading(false);
                }
            )
            .catch(
                (err:any) => {
                    toast({
                        variant: 'destructive',
                        title: 'API Error',
                        description: err.response.data.message || 'Failed to fetch borrower details.',
                    });
                    setLoading(false);
                }
            )
        //     const response = await fetch(`${config.baseURL}borrower/${id}/profile`);
        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }
        //     const result = await response.json();
        //     setBorrower(result.data);
        // } catch (error) {
        //     toast({
        //         variant: 'destructive',
        //         title: 'API Error',
        //         description: (error as Error).message || 'Failed to fetch borrower details.',
        //     });
        // } finally {
        //     setLoading(false);
        // }
    };

    const fetchLoanHistory = async () => {
        if (!id) return;
        setHistoryLoading(true);
        // try {
            axiosInstance.get(`${config.baseURL}loan-application/${id}/loan-history`)
            .then(
                (res:any) => {
                    setLoanHistory(res.data.data || []);
                    setHistoryLoading(false);
                }
            )
            .catch(
                (err:any) => {
                    toast({
                        variant: 'destructive',
                        title: 'API Error',
                        description: err.response.data.message || 'Failed to fetch loan history.',
                    });
                    setHistoryLoading(false);
                }
            )
        //     const response = await fetch(`${config.baseURL}loan-application/${id}/loan-history`);
        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }
        //     const result = await response.json();
        //     setLoanHistory(result.data || []);
        // } catch (error) {
        //     toast({
        //         variant: 'destructive',
        //         title: 'API Error',
        //         description: (error as Error).message || 'Failed to fetch loan history.',
        //     });
        // } finally {
        //     setHistoryLoading(false);
        // }
    };

    const getCibilColor = (score: number) => {
        if (score >= 750) return 'text-green-600';
        if (score >= 650) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getLoanStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
        const upperStatus = status.toUpperCase();
        if (upperStatus === 'DISBURSED') return 'default';
        if (upperStatus.includes('REJECTED') || upperStatus.includes('FAILED')) return 'destructive';
        if (upperStatus.includes('PENDING') || upperStatus.includes('SUBMITTED') || upperStatus.includes('UNDERWRITING'))
            return 'outline';
        return 'secondary';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading Borrower Details...</p>
            </div>
        );
    }

    if (!borrower) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-semibold">Borrower Not Found</h2>
                <p className="mt-2 text-gray-600">The requested borrower profile could not be loaded.</p>
                <Button onClick={() => navigate('/dashboard/borrowers')} className="mt-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Borrowers List
                </Button>
            </div>
        );
    }

    const panDoc = borrower.kycDocuments.find(doc => doc.documentType === 'PAN');
    const aadhaarDoc = borrower.kycDocuments.find(doc => doc.documentType === 'AADHAAR');

    return (
        <div className='scrollContainer'>
            {/* Header */}
            <div className="header h-[5%]">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-sm flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Borrowers List
                </Button>
            </div>
            <div className='h-[95%] mt-2'>
                <div className="mb-6">
                    <Card>
                        <CardContent
                            className="p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                                <AvatarImage src={borrower.profileImage} alt={borrower.name} />
                                <AvatarFallback className="text-3xl bg-purple-100 text-purple-600">
                                    {borrower.name
                                        .split(' ')
                                        .map(n => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow text-center md:text-left">
                                <div className="text-lg font-bold text-gray-800">{borrower.name}</div>
                                <p className="text-sm text-gray-500 mt-1">{borrower.displayId}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                                    <Badge variant={borrower.active ? 'default' : 'secondary'}
                                        className={`${borrower.active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                                        {borrower.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant={borrower.kycverified ? 'default' : 'outline'}
                                        className={`${borrower.kycverified ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                                        {borrower.kycverified ? 'KYC Verified' : 'KYC Pending'}
                                    </Badge>
                                    {borrower.blackListed && <Badge variant="destructive">Blacklisted</Badge>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className='bg-[#F0F8FF]'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Personal & Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem
                                    icon={<Mail size={20} />}
                                    label="Email Address"
                                    value={
                                        <a href={`mailto:${borrower.email}`} className="text-blue-600 hover:underline">
                                            {borrower.email}
                                        </a>
                                    }
                                />
                                <DetailItem icon={<Phone size={20} />} label="Mobile Number" value={borrower.mobile} />
                                <DetailItem icon={<Cake size={20} />} label="Date of Birth"
                                    value={formatDate(borrower.dob)} />
                                <DetailItem icon={<User size={20} />} label="Father's Name" value={borrower.fathersName} />
                                <DetailItem icon={<User size={20} />} label="Gender" value={borrower.gender} />
                            </CardContent>
                        </Card>

                        <Card className='bg-[#FDFDF5]'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem
                                    icon={<Briefcase size={20} />}
                                    label="Employment Type"
                                    value={<Badge variant="outline">{borrower?.employmentDetails ? borrower?.employmentDetails?.employmentType : 'N/A'}</Badge>}
                                />
                                <DetailItem
                                    icon={<Building2 size={20} />}
                                    label="Company Name"
                                    value={borrower?.employmentDetails?.companyName}
                                />
                                <DetailItem
                                    icon={<User size={20} />}
                                    label="Designation"
                                    value={borrower?.employmentDetails?.designation}
                                />
                                <DetailItem
                                    icon={<CircleDollarSign size={20} />}
                                    label="Take Home Salary"
                                    value={`₹ ${formatIndianNumber(borrower?.employmentDetails?.takeHomeSalary)}`}
                                />
                                <DetailItem
                                    icon={<CalendarDays size={20} />}
                                    label="Total Experience"
                                    value={borrower?.employmentDetails ? `${borrower?.employmentDetails?.totalExperienceInMonths} months` : 'N/A'}
                                />
                            </CardContent>
                        </Card>

                        <Card className='bg-[#FDFEFF]'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Loan History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {historyLoading ? (
                                    <div className="flex items-center justify-center p-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <p className="ml-3 text-gray-600">Loading Loan History...</p>
                                    </div>
                                ) : loanHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {loanHistory.map(loan => (
                                            <div key={loan?.id} className={`p-3 border rounded-lg bg-gray-50/50
                                            ${loan?.applicationStatus === 'CLOSED' ? 'bg-green-50' :
                                                    loan?.applicationStatus === 'DISBURSED' ? 'bg-yellow-50' :
                                                        loan?.applicationStatus === 'REJECTED' ? 'bg-red-50' : ''}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-semibold text-gray-800">{loan?.displayId}</p>
                                                    <Badge
                                                        variant={getLoanStatusVariant(loan?.applicationStatus)}
                                                        className={cn('capitalize', {
                                                            'bg-green-100 text-green-800':
                                                                loan?.applicationStatus === 'DISBURSED',
                                                        })}
                                                    >
                                                        {loan?.applicationStatus.toLowerCase().replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Requested Amount</p>
                                                        <p className="font-medium">₹ {formatIndianNumber(loan?.loanAmount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Approved Amount</p>
                                                        <p className="font-medium">₹ {formatIndianNumber(loan?.approvedAmount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Applied On</p>
                                                        <p className="font-medium">{formatDate(loan?.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Repayment Date</p>
                                                        <p className="font-medium">{formatDate(loan?.repaymentDate)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500">No loan history found for this borrower.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Verification & Risk</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-md font-semibold mb-2">CIBIL Score</h3>
                                    <div
                                        className={`text-4xl font-bold ${getCibilColor(borrower?.borrowerCibilData?.score)}`}>
                                        {borrower?.borrowerCibilData?.score}
                                    </div>
                                    <p className="text-sm text-gray-500">{borrower?.borrowerCibilData?.rating}</p>
                                </div>
                                <hr />
                                <div>
                                    <h3 className="text-md font-semibold mb-2">KYC Documents</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Aadhaar</span>
                                            {aadhaarDoc?.verified ? (
                                                <Badge variant="default" className="flex items-center">
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Pending</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">PAN Card</span>
                                            {panDoc?.verified ? (
                                                <Badge variant="default" className="flex items-center">
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Pending</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='bg-green-100'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Uploaded Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {
                                    borrower?.payslips?.documentUrls?.length > 0 && (
                                        <a href={borrower?.payslips?.documentUrls[0]} target="_blank" rel="noopener noreferrer" className='mb-4'>
                                            <Button variant="outline" className="w-full justify-start">
                                                <FileText className="w-4 h-4 mr-2" /> View Payslip
                                            </Button>
                                        </a>
                                    )
                                }
                                {
                                    borrower?.bankStatement?.documentUrls?.length > 0 && (
                                        <a href={borrower?.bankStatement?.documentUrls[0]} target="_blank" rel="noopener noreferrer" style={{ marginTop: "20px" }}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <FileText className="w-4 h-4 mr-2" /> View Bank Statement
                                            </Button>
                                        </a>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BorrowerDetail;