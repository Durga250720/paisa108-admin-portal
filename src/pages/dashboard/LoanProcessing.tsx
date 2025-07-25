import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    AlertTriangle,
    BellRing,
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,
    FileDown,
    FileUp,
    Loader2,
    RefreshCw,
    X
} from 'lucide-react';
import styles from '../../styles/Application.module.css';
import {config} from '../../config/environment';
import {useToast} from '@/components/ui/use-toast';
import {cn, formatIndianNumber, toTitleCase} from '../../lib/utils';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {DateRange} from "react-day-picker";
import {format} from "date-fns";
import axiosInstance from '@/lib/axiosInstance';

interface Borrower {
    borrowerId: string;
    name: string;
    phone: string;
    email: string;
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
    employmentDetails?;
    loanDocuments?;
    addressDetail?;
    bankDetail?;
    loanProgress?;
    loanWorkflow?;
    loanConfig?;
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
    updatedAt?: string;
    applicationType: string;
    applicationStatus: 'APPROVED' | 'APPROVED_WITH_CONDITION' | 'ESIGN_PENDING' | 'READY_FOR_DISBURSAL' | 'DISBURSED' | string;
    exported?: boolean;
    flags?: string[];
    remarks?: string;
    approvalConditions?: string;
}

const useDebounce = <T, >(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const LoanProcessing = () => {
    const navigate = useNavigate();
    const [approvedApplications, setApprovedApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const {toast} = useToast();
    const [confirmDisbursement, setDisbursementConfirmation] = useState<boolean>(false);
    const [confirmESign, setConfirmESign] = useState<boolean>(false);
    const [applicationId, setApplicationId] = useState<string>('');
    const [borrowerEmail, setBorrowerEmail] = useState<string>('');

    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const [searchText, setSearchText] = useState('');
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });
    const debouncedSearchText = useDebounce(searchText, 500); // 500ms delay


    const fetchApprovedApplications = useCallback(async () => {
        setLoading(true);
        // try {
            const params = new URLSearchParams({
                pageNo: '0',
                pageSize: '10',
            });

            if (debouncedSearchText) {
                params.append('searchText', debouncedSearchText);
            }

            if (date?.from) {
                const formattedStartDate = format(date.from, 'dd-MM-yyyy');
                params.append('startDate', formattedStartDate);
                const formattedEndDate = date.to ? format(date.to, 'dd-MM-yyyy') : formattedStartDate;
                params.append('endDate', formattedEndDate);
            }

            axiosInstance.put(`${config.baseURL}loan-application/loan-processing/filter?${params.toString()}`)
            .then(
                (res:any) => {
                    console.log(res.data.data)
                    setApprovedApplications(res.data.data.data || []);
                    setLoading(false);
                }
            )
            .catch(
                (err:any) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: err.response.data.message || "Failed to fetch approved applications.",
                    });
                    setApprovedApplications([]);
                    setLoading(false);
                }
            )

        //     const url = `${config.baseURL}loan-application/loan-processing/filter?${params.toString()}`;

        //     const response = await fetch(url, {
        //         method: "PUT",
        //         headers: {
        //             'Content-Type': 'application/json',
        //         }
        //     });

        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }

        //     const result = await response.json();
        //     setApprovedApplications(result.data?.data || []);

        // } catch (error) {
        //     console.error("Error fetching approved applications:", error);
        //     toast({
        //         variant: "destructive",
        //         title: "Error",
        //         description: (error as Error).message || "Failed to fetch approved applications.",
        //     });
        //     setApprovedApplications([]);
        // } finally {
        //     setLoading(false);
        // }
    }, [debouncedSearchText, date, toast]);

    useEffect(() => {
        fetchApprovedApplications();
    }, [fetchApprovedApplications]);

    const handleExport = async () => {
        // This check is a safeguard, as the button will be disabled for multi-day ranges.
        const isDateRangeSelected = date?.from && date?.to && format(date.from, 'yyyyMMdd') !== format(date.to, 'yyyyMMdd');
        if (isDateRangeSelected) {
            toast({
                variant: "default",
                title: "Cannot Export Date Range",
                description: "Please select a single day in the date filter to export.",
            });
            return;
        }

        setIsExporting(true);
        toast({title: "Exporting...", description: "Generating disbursal file."});

        // Use the selected date (from `date` state) or default to today
        const exportDate = date?.from || new Date();

        // try {
            const formattedDate = format(exportDate, 'dd-MM-yyyy');
            const downloadFileName = `loan_disbursal_list_${formattedDate}.xlsx`;
            const url = `${config.baseURL}loan-application/disbursal/export?date=${formattedDate}`;

            axiosInstance.get(url,{headers: {'accept': '*/*'}})
            .then(
                (res:any) =>{
                    const blob = res.data.data.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.setAttribute('download', downloadFileName);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(downloadUrl);

                    toast({
                        variant: "success",
                        title: "Export Successful",
                        description: "The disbursal file has been downloaded."
                    });
                    fetchApprovedApplications();
                    setIsExporting(false);
                }
            )
            .catch(
                (err:any) => {
                    setIsExporting(false);
                    toast({variant: "destructive", title: "Export Failed", description: err.response.data.message});
                }
            )

        //     const response = await fetch(url, {method: 'GET', headers: {'accept': '*/*'}});

        //     if (!response.ok) {
        //         throw new Error(`Failed to export file. Status: ${response.status}`);
        //     }

        //     const blob = await response.blob();
        //     const downloadUrl = window.URL.createObjectURL(blob);
        //     const link = document.createElement('a');
        //     link.href = downloadUrl;
        //     link.setAttribute('download', downloadFileName);
        //     document.body.appendChild(link);
        //     link.click();
        //     link.remove();
        //     window.URL.revokeObjectURL(downloadUrl);

        //     toast({
        //         variant: "success",
        //         title: "Export Successful",
        //         description: "The disbursal file has been downloaded."
        //     });
        //     fetchApprovedApplications(); // Refresh to show updated 'exported' status
        // } catch (error) {
        //     console.error("Error exporting data:", error);
        //     toast({variant: "destructive", title: "Export Failed", description: (error as Error).message});
        // } finally {
        //     setIsExporting(false);
        // }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (event.target) event.target.value = '';

        setIsImporting(true);
        toast({title: "Importing...", description: "Uploading and processing file."});
        const formData = new FormData();
        formData.append('file', file);

        // try {
            const url = `${config.baseURL}loan-application/disbursal/import`;
            axiosInstance.post(url,formData)
            .then(
                (res:any) => {
                    toast({ variant: "success", title: "Import Successful", description: "File processed. Refreshing data." });
                    fetchApprovedApplications(); 
                    setIsImporting(false);
                }
            )
            .catch(
                (err:any) => {
                    // console.error("Error importing file:", error);
                    toast({ variant: "destructive", title: "Import Failed", description: err.response.data.message });
                    setIsImporting(false); 
                }
            )
        //     const response = await fetch(url, {
        //         method: 'POST',
        //         headers: {'accept': 'application/json'},
        //         body: formData,
        //     });

        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }

        //     toast({variant: "success", title: "Import Successful", description: "File processed. Refreshing data."});
        //     fetchApprovedApplications(); // Refresh data on success
        // } catch (error) {
        //     console.error("Error importing file:", error);
        //     toast({variant: "destructive", title: "Import Failed", description: (error as Error).message});
        // } finally {
        //     setIsImporting(false);
        // }
    };


    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-4 h-4 text-green-600"/>;
            case 'APPROVED_WITH_CONDITION':
                return <AlertTriangle className="w-4 h-4 text-yellow-600"/>;
            case 'ESIGN_PENDING':
                return <Clock className="w-4 h-4 text-orange-600"/>;
            case 'READY_FOR_DISBURSAL':
                return <BellRing className="w-4 h-4 text-purple-600"/>;
            case 'DISBURSED':
                return <CheckCircle className="w-4 h-4 text-blue-600"/>;
            default:
                return <Clock className="w-4 h-4 text-gray-600"/>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800 hover:bg-color-none';
            case 'APPROVED_WITH_CONDITION':
                return 'bg-yellow-100 text-yellow-800 hover:bg-color-none';
            case 'ESIGN_PENDING':
                return 'bg-orange-100 text-orange-800 hover:bg-color-none';
            case 'READY_FOR_DISBURSAL':
                return 'bg-purple-100 text-purple-800 hover:bg-color-none';
            case 'DISBURSED':
                return 'bg-blue-100 text-blue-800 hover:bg-color-none';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-color-none';
        }
    };

    const updateViewDetails = (applicationId: string) => {
        navigate(`/dashboard/loan-processing/${applicationId}`);
    }

    const openDisburedModel = (id: string) => {
        setDisbursementConfirmation(true);
        setApplicationId(id);
    }

    const openESignModel = (id: string, email: string) => {
        setConfirmESign(true);
        setApplicationId(id);
        setBorrowerEmail(email);
    }

    const sendESignRequest = async () => {
        setIsSending(true);
        // try {

            axiosInstance.put(`${config.baseURL}loan-application/admin/${applicationId}/send-esign-link`)
            .then(
                (res:any) => {
                    toast({
                        variant: "success",
                        title: "E-Sign Link Sent",
                        description: res.data.data || "The e-sign link has been successfully sent to the borrower.",
                        duration: 3000
                    });
                    setConfirmESign(false);
                    setApplicationId('');
                    setBorrowerEmail('');
                    fetchApprovedApplications();
                    setIsSending(false);
                }
            )
            .catch(
                (err:any) => {
                    toast({
                        variant: "destructive",
                        title: "API Error",
                        description: err.response.data.message || "Failed to send e-sign link.",
                        duration: 3000,
                    });
                    setIsSending(false);
                }
            )
        //     const response = await fetch(url, {
        //         method: "PUT",
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //         }
        //     });

        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }

        //     const result = await response.json();

        //     toast({
        //         variant: "success",
        //         title: "E-Sign Link Sent",
        //         description: result.data || "The e-sign link has been successfully sent to the borrower.",
        //         duration: 3000
        //     });
        //     setConfirmESign(false);
        //     setApplicationId('');
        //     setBorrowerEmail('');
        //     fetchApprovedApplications();
        // } catch (error) {
        //     console.error("Error sending e-sign link:", error);
        //     toast({
        //         variant: "destructive",
        //         title: "API Error",
        //         description: (error as Error).message || "Failed to send e-sign link.",
        //         duration: 3000,
        //     });
        // } finally {
        //     setIsSending(false);
        // }
    }

    const disburementConfirmation = async () => {
        // try {
            axiosInstance.put(
                config.baseURL + `loan-application/${applicationId}/status-update?status=DISBURSED`    
            )
            .then(
                (res:any) => {
                    toast({
                        variant: "success",
                        title: "Loan Disbursed",
                        description: 'Loan amount has been disbursed successfully',
                        duration: 3000
                    });
                    setDisbursementConfirmation(false);
                    setApplicationId('');
                    fetchApprovedApplications();
                }
            )
            .catch(
                (err:any) =>{
                    toast({
                        variant: "destructive",
                        title: "API Error",
                        description: err.response.data.message || "Failed to disburse loan.",
                        duration: 3000,
                    });
                }
            )
        //     const response = await fetch(config.baseURL + `loan-application/${applicationId}/status-update?status=DISBURSED`, {
        //         method: "PUT",
        //         headers: {
        //             'Content-Type': 'application/json',
        //         }
        //     });

        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        //     }

        //     toast({
        //         variant: "success",
        //         title: "Loan Disbursed",
        //         description: 'Loan amount has been disbursed successfully',
        //         duration: 3000
        //     });
        //     setDisbursementConfirmation(false);
        //     setApplicationId('');
        //     fetchApprovedApplications();

        // } catch (error) {
        //     console.error("Error disbursing loan:", error);
        //     toast({
        //         variant: "destructive",
        //         title: "API Error",
        //         description: (error as Error).message || "Failed to disburse loan.",
        //         duration: 3000,
        //     });
        // }
    }

    const clearFilters = () => {
        setSearchText('');
        setDate(undefined);
    };

    // Check if the selected date is a multi-day range
    const isDateRange = date?.from && date?.to && format(date.from, 'yyyyMMdd') !== format(date.to, 'yyyyMMdd');

    return (
        <div className={`${styles.mainContainer}`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xl font-medium text-primary">Loan Processing</div>
                    <p className={`${styles.description} text-gray-600 mt-1`}>Track and manage approved loan
                        applications</p>
                </div>
            </div>

            {/* --- Filter and action buttons section --- */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        placeholder="Search by name, ID..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="h-9 w-full sm:w-[250px]"
                        disabled={loading}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "h-9 w-full justify-start text-left font-normal sm:w-[260px]",
                                    !date && "text-muted-foreground"
                                )}
                                disabled={loading}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {/* --- MODIFIED: Improved date display logic --- */}
                                {date?.from ? (
                                    (date.to && format(date.from, 'yyyyMMdd') !== format(date.to, 'yyyyMMdd')) ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    {(searchText || date) && (
                        <Button variant="secondary" onClick={clearFilters} className="h-9">
                            <X className="mr-2 h-4 w-4"/>
                            Clear
                        </Button>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={importInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <Button variant="outline" onClick={handleImportClick} disabled={isImporting || loading}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                            <FileUp size={16} className="mr-2"/>}
                        Import
                    </Button>
                    {/* --- MODIFIED: Export button is disabled for date ranges --- */}
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting || loading || !!isDateRange}
                        title={isDateRange ? "Export is only available for a single day. Please select one day." : "Export disbursal file"}
                    >
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                            <FileDown size={16} className="mr-2"/>}
                        Export
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => fetchApprovedApplications()} disabled={loading}
                            title="Reload Applications">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""}/>
                    </Button>
                </div>
            </div>


            <div className='mt-1'>
                <div className={`${styles.cardContainer1} overflow-auto mt-2 bg-white shadow-sm rounded`}>
                    <table className="w-full h-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Application
                                ID
                            </th>
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Customer
                                Name
                            </th>
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Amount</th>
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Approval
                                Date
                            </th>
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                            <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Operations</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-sm text-gray-500">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Loading approved applications...
                                    </div>
                                </td>
                            </tr>
                        ) : approvedApplications.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-sm text-gray-500">
                                    No approved applications found.
                                </td>
                            </tr>
                        ) : (
                            approvedApplications?.map((app) => (
                                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <span
                                            className="font-medium text-sm text-blue-600">{app.displayId || app.id}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
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
                                            {app.applicationStatus === 'READY_FOR_DISBURSAL' && (
                                                <Badge
                                                    className={app.exported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {app.exported ? 'Exported' : 'Not Exported'}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            {(app.applicationStatus === 'APPROVED' || app.applicationStatus === 'APPROVED_WITH_CONDITION') && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openESignModel(app.id, app.borrower?.email || 'N/A')}
                                                >
                                                    Pending Sign
                                                </Button>
                                            )}

                                            {app.applicationStatus === 'ESIGN_PENDING' && (
                                                <Button size="sm" disabled>E-Sign Sent</Button>
                                            )}

                                            {app.applicationStatus === 'READY_FOR_DISBURSAL' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openDisburedModel(app.id)}
                                                    disabled={!app.exported}
                                                    title={!app.exported ? "Loan must be exported before it can be disbursed." : "Click to disburse loan"}
                                                >
                                                    Disburse
                                                </Button>
                                            )}

                                            {!['APPROVED', 'APPROVED_WITH_CONDITION', 'ESIGN_PENDING', 'READY_FOR_DISBURSAL', 'DISBURSED', 'CLOSED'].includes(app.applicationStatus) && (
                                                <span className="text-sm text-gray-500">Action N/A</span>
                                            )}

                                            <Button
                                                variant="link"
                                                className="h-auto p-0 text-xs"
                                                onClick={() => updateViewDetails(app.id)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={confirmDisbursement} onOpenChange={setDisbursementConfirmation}>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                    <DialogHeader className='space-y-4'>
                        <DialogTitle>Confirm Loan Disbursement</DialogTitle>
                        <DialogDescription className='mt-3'>
                            You're about to disburse the loan amount. Do you want to confirm?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={disburementConfirmation}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmESign} onOpenChange={setConfirmESign}>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                    <DialogHeader className='space-y-4'>
                        <DialogTitle>Confirm E-Sign Request</DialogTitle>
                        <DialogDescription className='mt-3'>
                            You're about to send an e-sign request to the borrower.
                            <br/>
                            Borrower Email: <span className="font-semibold text-blue-700">{borrowerEmail}</span>
                            <br/>
                            Do you want to confirm?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSending}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={sendESignRequest} disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isSending ? 'Sending...' : 'Send'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LoanProcessing;