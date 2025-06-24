import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import { config } from '../../config/environment';
import { useToast } from '@/components/ui/use-toast';
import { formatIndianNumber, toTitleCase } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const LoanProcessing = () => {
  const [approvedApplications, setApprovedApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [confirmDisbursement, setDisbursementConfirmation] = useState<boolean>(false);
  const [applicationId,setApplicationId] = useState<any>('')

  useEffect(() => {

    fetchApprovedApplications();
  }, []); 

  const fetchApprovedApplications = async () => {
      setLoading(true);
      try {
        const url = `${config.baseURL}loan-application/loan-processing/filter?pageNo=0&pageSize=10`;

        const response = await fetch(url,{
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Assuming the new endpoint returns data in the same structure
        setApprovedApplications(result.data?.data || []);

      } catch (error: any) {
        console.error("Error fetching approved applications:", error);
        toast({
          variant: "destructive",
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
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-color-none';
    }
  };

  const updateViewDetails = () => {
    toast({
      variant:"warning",
      title:"Coming Soon",
      description:"We are working on it...!",
      duration:3000
    }) 
  }

  const openDisburedModel = (id:any) => {
    setDisbursementConfirmation(true);
    setApplicationId(id);
  }

  const disburementConfirmation = async () => {
    try {
      const response = await fetch(config.baseURL+`loan-application/${applicationId}/status-update?status=DISBURSED`,{
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const results : any = response.json();

      if(results != null){
        toast({
          variant:"success",
          title:"Loan Disbured",
          // description:`${results?.data?.approvedAmount} has been disbursed to ${results?.bankDetail?.accountNumber} successfully`,
          description:'Loan amount has been disbursed successfully',
          duration:3000
        });
        setDisbursementConfirmation(false);
        setApplicationId('');
        fetchApprovedApplications();
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

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Disbursal</p>
                <p className="text-xl font-bold text-green-600 mt-1">8</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Documentation</p>
                <p className="text-xl font-bold text-yellow-600 mt-1">5</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-xl font-bold text-blue-600 mt-1">3</p>
              </div>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Approved Applications Table */}
      <div className='mt-1'>
        {/* <div className='p-4'>
          <div className="flex items-center space-x-2">
            <span className='text-[1rem] font-medium text-primary'>Approved Applications</span>
            <Badge className="bg-purple-100 font-normal text-purple-800 hover:bg-color-none">Filter: All Statuses</Badge>
          </div>
        </div> */}
        {/* <CardContent className='p-0'> */}
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
                            {app.borrower?.name ? (app.borrower.name.split(' ').map((n: string) => n[0]).join('')).slice(0,2) : 'N/A'}
                          </span>
                        </div>
                        <span className="font-medium text-sm">{app.borrower?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-normal text-sm">₹ {formatIndianNumber(app.approvedAmount)}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{new Date(app.approvedAt || app.createdAt).toLocaleDateString()}</td>
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

                        <button className=" text-xs bg-green-600 px-2 py-2 rounded text-white"
                        onClick={() => openDisburedModel(app.id)}>
                          Disburse
                        </button>

                        {/* {app.applicationStatus === 'APPROVED_WITH_CONDITION' && (
                            <button className="text-xs bg-transparent px-3 py-2 border-yellow-500 text-yellow-600 rounded border">
                              Review
                            </button>
                          )} */}
                        {/* <button className=" text-xs bg-green-600 px-2 py-2 rounded text-white">
                            Disburse
                          </button> */}
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
        {/* </CardContent> */}
      </div>
      <Dialog open={confirmDisbursement} onOpenChange={setDisbursementConfirmation}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className='space-y-4'>
            <DialogTitle>Confirm Loan Disbursement</DialogTitle>
            <DialogDescription className='mt-3'>
              You're about to disburse the loan amount. Do you want to confirm?
            </DialogDescription>
          </DialogHeader>
          {/* <div className="space-y-3 py-4 flex-grow overflow-y-auto">
            <textarea name="Reason" className='w-[100%]  focus:outline-none focus:ring-0
                      border rounded-md p-2 text-[13px]' placeholder='Enter conditions for approve..'
              value={approvalCondition} onChange={(e) => setApprovalCoditions(e.target.value)}
              rows={5}></textarea>
          </div> */}
          <DialogFooter>
            <Button
              className='border border-primary-1 bg-primary hover:text-red-600 hover:bg-color-none text-xs flex items-center p-2 rounded-md'
              onClick={disburementConfirmation}
            >Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanProcessing;
