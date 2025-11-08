import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button, buttonVariants} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ChevronLeft, ChevronRight, Eye, Mail, Phone, Plus, RefreshCw, Search, Trash2, UserCheck} from 'lucide-react';
import styles from '../../styles/Application.module.css';
import React, {useCallback, useEffect, useState} from 'react';
import {useToast} from '@/components/ui/use-toast';
import {config} from '@/config/environment.ts';
import {useNavigate} from 'react-router-dom';
import NewBorrowerSheet from '@/components/NewBorrowerSheet';
import {formatIndianNumber} from '../../lib/utils';
import axiosInstance from '@/lib/axiosInstance';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Define a type for the borrower object for better type safety and autocompletion
interface Borrower {
    id: string;
    displayId: string;
    name: string;
    email: string;
    mobile: string;
    borrowerCibilData?: { score: string };
    employmentDetails?: { takeHomeSalary: number; employmentType: string };
    totalLoansCount: number;
    deleted: boolean;
    userId: string;
    createdAt: string;
}

const Borrowers = () => {
    const [listBorrrowers, setListBorrowers] = useState<Borrower[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isNewBorrowerSheetOpen, setIsNewBorrowerSheetOpen] = useState<boolean>(false);
    const {toast} = useToast();
    const navigate = useNavigate();

    // --- State for Pagination ---
    const [currentPage, setCurrentPage] = useState(0); // API pages are 0-indexed
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    // State for managing confirmation dialogs
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [borrowerIdToDelete, setBorrowerIdToDelete] = useState<string | null>(null);
    const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState<boolean>(false);
    const [borrowerIdToReactivate, setBorrowerIdToReactivate] = useState<string | null>(null);

    const fetchBorrowers = useCallback(async () => {
        setLoading(true);
        const payload = {
            "pageNo": currentPage,
            "pageSize": PAGE_SIZE
        };
        try {
            const res = await axiosInstance.put(config.baseURL + `borrower/filter`, payload);
            const responseData = res.data.data;
            setListBorrowers(responseData?.data || []);

            const totalItems = responseData?.count || 0;
            setTotalPages(Math.ceil(totalItems / PAGE_SIZE));

        } catch (err) {
            toast({
                variant: "failed",
                title: "API Error",
                description: err.response?.data?.message || "Failed to fetch borrowers. Please try again.",
                duration: 3000,
            });
            // Reset pages on error to avoid confusion
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [toast, currentPage]);

    useEffect(() => {
        fetchBorrowers();
    }, [fetchBorrowers]);

    // --- Delete Account Logic ---
    const handleDeleteClick = (borrowerId: string) => {
        setBorrowerIdToDelete(borrowerId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteAccount = async () => {
        if (!borrowerIdToDelete) return;
        try {
            await axiosInstance.delete(config.baseURL + `api/auth/${borrowerIdToDelete}/delete-account`);
            toast({
                variant: "success",
                title: "Account Deleted",
                description: "Borrower account has been successfully deleted.",
                duration: 3000,
            });
            fetchBorrowers(); // Refresh the list
        } catch (err) {
            toast({
                variant: "failed",
                title: "API Error",
                description: err.response?.data?.message || "Failed to delete account. Please try again.",
                duration: 3000,
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setBorrowerIdToDelete(null);
        }
    };

    // --- Reactivate Account Logic ---
    const handleReactivateClick = (borrowerId: string) => {
        setBorrowerIdToReactivate(borrowerId);
        setIsReactivateDialogOpen(true);
    };

    const confirmReactivateAccount = async () => {
        if (!borrowerIdToReactivate) return;
        try {
            await axiosInstance.put(config.baseURL + `api/auth/${borrowerIdToReactivate}/reactivate-account`);
            toast({
                variant: "success",
                title: "Account Reactivated",
                description: "Borrower account has been successfully reactivated.",
                duration: 3000,
            });
            fetchBorrowers(); // Refresh the list
        } catch (err) {
            toast({
                variant: "failed",
                title: "API Error",
                description: err.response?.data?.message || "Failed to reactivate account. Please try again.",
                duration: 3000,
            });
        } finally {
            setIsReactivateDialogOpen(false);
            setBorrowerIdToReactivate(null);
        }
    };

    const getCibilColor = (cibil: string | undefined) => {
        if (!cibil) return 'text-gray-600';
        const score = parseInt(cibil);
        if (score >= 750) return 'text-green-600';
        if (score >= 650) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusBadgeClass = (deleted: boolean) => {
        return deleted
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800';
    };

    const addNewBorrower = () => {
        setIsNewBorrowerSheetOpen(true);
    }

    const handleNewBorrowerSubmit = () => {
        setIsNewBorrowerSheetOpen(false);
        fetchBorrowers(); // Refresh the borrowers list
    }

    const seeBorrowerPhoneNumber = () => {
        toast({
            variant: "warning",
            title: "Coming Soon",
            description: "We are working on it!",
            duration: 3000
        })
    }

    const seeBorrowerEmail = () => {
        toast({
            variant: "warning",
            title: "Coming Soon",
            description: "We are working on it!",
            duration: 3000
        })
    }


    return (
        <div className={`${styles.mainContainer}`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xl font-medium text-primary">Borrowers</div>
                    <p className={`${styles.description} text-gray-600 mt-1`}>Manage borrower profiles and
                        information</p>
                </div>
                <div className="flex items-center gap-2 justify-center">
                    <button onClick={fetchBorrowers}
                            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-white"
                            title="Reload Borrowers">
                        <RefreshCw size={18} className={`text-primary ${loading ? 'animate-spin' : ''}`}/>
                    </button>
                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-sm text-white flex items-center gap-2 px-2 py-2 rounded"
                        onClick={addNewBorrower}>
                        <Plus className="w-3 h-3"/>
                        Add New Borrower
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card className='mt-1'>
                <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                            <Input
                                placeholder="Search borrowers..."
                                className="pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Borrowers Table */}
            <div className={`${styles.borrowerContainer} bg-white shadow-sm rounded mt-1`}>
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-200 overflow-x-scroll">
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Borrower
                            ID
                        </th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Name</th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Joined
                            On
                        </th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Contact</th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">CIBIL
                            Score
                        </th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Monthly
                            Income
                        </th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Active
                            Loans
                        </th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Status</th>
                        <th className="sticky top-0 z-10 bg-primary-50 text-primary text-sm font-medium text-left p-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        loading ? (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-sm text-gray-500">
                                    Loading borrowers...
                                </td>
                            </tr>
                        ) : listBorrrowers.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-sm text-gray-500">
                                    No borrowers found.
                                </td>
                            </tr>
                        ) : (
                            listBorrrowers.map((borrower) => (
                                <tr key={borrower.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 overflow-x-scroll">
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-sm text-blue-600">{borrower.displayId}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                              <span className="text-sm font-medium text-purple-600">
                                                {(borrower.name || '').split(' ').map(n => n[0]).join('')}
                                              </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-xs">{borrower.name}</p>
                                                <p className="text-xs text-gray-600">{borrower.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">
                                        {new Date(borrower.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400"/>
                                            <span className="text-sm">{borrower.mobile}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                      <span
                                          className={`font-medium text-sm ${getCibilColor(borrower?.borrowerCibilData?.score)}`}>
                                        {borrower?.borrowerCibilData?.score || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 font-medium text-sm">{borrower?.employmentDetails ? formatIndianNumber(borrower?.employmentDetails?.takeHomeSalary) : 'N/A'}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="font-medium text-sm">{borrower.totalLoansCount}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <Badge
                                            className={`${getStatusBadgeClass(borrower.deleted)} text-xs font-medium`}>
                                            {borrower.deleted ? 'Deleted' : 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => navigate(`/dashboard/borrowers/${borrower.id}`)}
                                                    title="View Details">
                                                <Eye className="w-4 h-4"/>
                                            </Button>
                                            {borrower.deleted ? (
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleReactivateClick(borrower.id)}
                                                        title="Reactivate Account">
                                                    <UserCheck className="w-4 h-4 text-green-600"/>
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleDeleteClick(borrower.userId)}
                                                        title="Delete Account">
                                                    <Trash2 className="w-4 h-4 text-red-600"/>
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={seeBorrowerPhoneNumber}
                                                    title="View Phone">
                                                <Phone className="w-4 h-4"/>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={seeBorrowerEmail}
                                                    title="View Email">
                                                <Mail className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                    </tbody>
                </table>

                {/* --- Pagination Controls (New and Improved) --- */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 0 || loading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1"/>
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages - 1 || loading}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1"/>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <NewBorrowerSheet
                open={isNewBorrowerSheetOpen}
                onOpenChange={setIsNewBorrowerSheetOpen}
                onSubmit={handleNewBorrowerSubmit}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the borrower's account as 'Deleted'. This is a reversible action.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBorrowerIdToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteAccount}
                            className={buttonVariants({variant: "destructive"})}
                        >
                            Yes, delete account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reactivate Confirmation Dialog */}
            <AlertDialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reactivate this account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore the borrower's account to 'Active' status. Are you sure you want to
                            continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBorrowerIdToReactivate(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmReactivateAccount}>
                            Yes, reactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Borrowers;