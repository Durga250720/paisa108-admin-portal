import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Eye, AlertTriangle, CheckCircle, Clock, BellRing, IndianRupee, ChevronLeft, ChevronRight, RefreshCw, ChevronsUpDown, Check, Upload, FileText, Trash2 } from 'lucide-react';
import styles from '../../styles/Application.module.css';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// --- S3/AWS Imports ---
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import {config} from "@/config/environment";
import axiosInstance from '@/lib/axiosInstance';



// --- AWS S3 Setup ---
// This setup is at the module level, created once.
const s3BucketConfig = config.componentImageUploading.S3TransferUtility.Default;
const cognitoAuthConfig = config.componentImageUploading.CredentialsProvider.CognitoIdentity.Default;

const cognitoClient = new CognitoIdentityClient({
  region: cognitoAuthConfig.Region,
});

const s3Credentials = fromCognitoIdentityPool({
  client: cognitoClient,
  identityPoolId: cognitoAuthConfig.PoolId,
});

const s3Client = new S3Client({
  region: s3BucketConfig.Region,
  credentials: s3Credentials,
});

const uploadFileToS3 = async (file: File, pathPrefix: string, userName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${pathPrefix}/${userName}/${Date.now()}-${sanitizedFileName}`;

    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error(`FileReader failed to read ${file.name}`));
        return;
      }
      const arrayBuffer = event.target.result as ArrayBuffer;
      const body = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: s3BucketConfig.Bucket,
        Key: key,
        Body: body,
        ContentType: file.type,
      });

      try {
        await s3Client.send(command);
        const url = `https://${s3BucketConfig.Bucket}.s3.${s3BucketConfig.Region}.amazonaws.com/${key}`;
        resolve(url);
      } catch (error) {
        console.error(`Error uploading ${file.name} to S3:`, error);
        const awsError = error as Error;
        reject(new Error(`S3 Upload Failed for ${file.name}: ${awsError.message}`));
      }
    };

    reader.onerror = (error) => {
      console.error(`FileReader error for ${file.name}:`, error);
      reject(new Error(`Failed to read file ${file.name}`));
    };

    reader.readAsArrayBuffer(file);
  });
};


// --- Type Definitions ---
type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH' | 'CHEQUE';

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

interface Repayment {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerMobile: string;
  borrowerDisplayId: string | null;
  loanDisplayId: string;
  pendingAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  lastPaidAt: string | null;
  lastPaymentMode: PaymentMode | null;
  paymentHistory?: PaymentHistoryItem[];
  latePayment?: boolean;
}

interface RepaymentFilterRequest {
  pageNo: number;
  size: number;
  searchRequest?: string;
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
}

// --- Record Payment Form Schema and Types ---
const paymentSchema = z.object({
  repaymentId: z.string().min(1, "A repayment must be selected."),
  amountPaid: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  paymentMode: z.enum(['UPI', 'CARD', 'NETBANKING', 'CASH', 'CHEQUE'], { required_error: "Payment mode is required." }),
  transactionReference: z.string().min(1, "Transaction reference is required."),
  attachment: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  notes: z.string().optional(),
  cardUPIOrChequeNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  bankName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMode === 'CARD') {
    if (!data.cardHolderName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Card holder name is required.", path: ['cardHolderName'] });
    }
    if (!data.cardUPIOrChequeNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Card number is required.", path: ['cardUPIOrChequeNumber'] });
    }
  }
  if (data.paymentMode === 'NETBANKING') {
    if (!data.bankName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank name is required.", path: ['bankName'] });
    }
    if (!data.cardUPIOrChequeNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number is required.", path: ['cardUPIOrChequeNumber'] });
    }
  }
  if (data.paymentMode === 'UPI' && !data.cardUPIOrChequeNumber?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "UPI ID is required.", path: ['cardUPIOrChequeNumber'] });
  }
  if (data.paymentMode === 'CHEQUE' && !data.cardUPIOrChequeNumber?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cheque number is required.", path: ['cardUPIOrChequeNumber'] });
  }
});


type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  selectedRepayment: Repayment | null;
}

// --- Record Payment Sheet Component ---
const RecordPaymentSheet: React.FC<RecordPaymentSheetProps> = ({ isOpen, onOpenChange, onSuccess, selectedRepayment }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repayableList, setRepayableList] = useState<any[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      repaymentId: '',
      amountPaid: 0,
      paymentMode: 'UPI',
      transactionReference: '',
      attachment: '',
      notes: '',
      cardUPIOrChequeNumber: '',
      cardHolderName: '',
      bankName: '',
    },
  });

  // Fetch all payable repayments for the combobox selector
  useEffect(() => {
    async function fetchRepayableItems() {
      if (isOpen && !selectedRepayment) {
          // Fetch all payable repayments to populate the selector
          axiosInstance.get(`${config.baseURL}`+'repayment/payable')
          .then(
            (res:any) => {
              if (res.data.data != null) {
                setRepayableList(res?.data?.data?.data || []); 
              }
            }
          )
          .catch(
            (err:any) => {
              toast({ variant: 'destructive', title: 'Error', description: err.response.data.message });
            }
          )
      }
    }
    fetchRepayableItems();
  }, [isOpen, selectedRepayment, toast]);

  // Reset form when a new repayment is selected or sheet is opened
  useEffect(() => {
    if (isOpen) {
      const defaultValues = selectedRepayment
          ? {
            repaymentId: selectedRepayment.id,
            amountPaid: selectedRepayment.pendingAmount,
            paymentMode: 'UPI' as const,
            transactionReference: '',
            attachment: '',
            notes: '',
            cardUPIOrChequeNumber: '',
            cardHolderName: '',
            bankName: '',
          }
          : {
            repaymentId: '',
            amountPaid: 0,
            paymentMode: 'UPI' as const,
            transactionReference: '',
            attachment: '',
            notes: '',
            cardUPIOrChequeNumber: '',
            cardHolderName: '',
            bankName: '',
          };
      form.reset(defaultValues);
      setAttachmentFile(null); // Reset attachment file
    }
  }, [isOpen, selectedRepayment, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF, JPG, or PNG file.',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'File size cannot exceed 5MB.',
        });
        return;
      }
      setAttachmentFile(file);
      form.clearErrors("attachment");
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    const fileInput = document.getElementById('attachment-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    // try {
      if (attachmentFile) {
        const currentRepayment = repayableList.find(r => r.id === data.repaymentId) || selectedRepayment;

        if (!currentRepayment?.borrowerName) {
          toast({ variant: 'destructive', title: 'Error', description: 'Borrower name not found. Cannot upload file.' });
          setIsSubmitting(false);
          return;
        }
        const userName = currentRepayment.borrowerName;
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');

        try {
          toast({ title: 'Uploading attachment...', description: 'Please wait.' });
          const attachmentUrl = await uploadFileToS3(attachmentFile, 'repayment-attachments', sanitizedUserName);
          data.attachment = attachmentUrl;
        } catch (uploadError: any) {
          toast({ variant: 'destructive', title: 'Upload Failed', description: uploadError.message });
          setIsSubmitting(false);
          return;
        }
      }

      axiosInstance.put(config.baseURL+`repayment/admin-collect`,data)
      .then(
        (res:any) => {
          toast({
            title: "Success!",
            description: "Payment has been recorded successfully.",
          });
          onSuccess();
          setIsSubmitting(false);
        }
      )
      .catch(
        (err:any) => {
          toast({
            variant: "destructive",
            title: "API Error",
            description: err.response.data.message,
          });
          setIsSubmitting(false);
        }
      )

    //   const response = await fetch('https://dev-paisa108.tejsoft.com/repayment/admin-collect', {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'accept': 'application/json',
    //       // 'Authorization': `Bearer ${your_token}`
    //     },
    //     body: JSON.stringify(data),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    //     throw new Error(errorData.message || 'Failed to record payment.');
    //   }

    //   toast({
    //     title: "Success!",
    //     description: "Payment has been recorded successfully.",
    //   });
    //   onSuccess(); // Trigger refresh and close sheet
    // } catch (error: any) {
    //   toast({
    //     variant: "destructive",
    //     title: "API Error",
    //     description: error.message,
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const selectedRepaymentForForm = repayableList.find(r => r.id === form.watch('repaymentId')) || selectedRepayment;
  const paymentMode = form.watch('paymentMode');

  const getDynamicInputLabel = (mode: PaymentFormValues['paymentMode']) => {
    switch (mode) {
      case 'UPI': return 'UPI ID';
      case 'CARD': return 'Card Number';
      case 'NETBANKING': return 'Account Number';
      case 'CHEQUE': return 'Cheque Number';
      default: return 'Number / ID';
    }
  };

  return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg flex flex-col p-4">
          <SheetHeader>
            <SheetTitle>Record a Payment</SheetTitle>
            <SheetDescription>
              Fill in the details below to record a new payment. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Repayment Selector (only if no repayment is pre-selected) */}
                {!selectedRepayment && (
                    <FormField
                        control={form.control}
                        name="repaymentId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Repayment to Pay *</FormLabel>
                              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                    >
                                      {field.value
                                          ? repayableList?.find(r => r.id === field.value)?.borrowerName
                                          : "Select a repayment"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[420px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search by name, loan ID, email..."  />
                                     {/* Ensure all items are shown initially */}
                                    {/* <Command shouldFilter={false} /> */}
                                    {/* Custom filter to always show items when search is empty */}
                                    <Command filter={(value, search) => {
                                      if (!search) return 1; // Always show if search is empty
                                      const normalizedValue = value.toLowerCase();
                                      const normalizedSearch = search.toLowerCase();
                                      return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                                    }} >
                                    <CommandEmpty>No repayment found.</CommandEmpty>
                                    <CommandGroup>
                                      {repayableList?.map((repayment) => (
                                          <CommandItem
                                              value={`${repayment.borrowerName} ${repayment.loanDisplayId} ${repayment.borrowerEmail} ${repayment.borrowerMobile} ${repayment.borrowerDisplayId || ''}`}
                                              key={repayment.id}
                                              onSelect={() => {
                                                form.setValue("repaymentId", repayment.id);
                                                form.setValue("amountPaid", repayment.pendingAmount);
                                                setPopoverOpen(false);
                                              }}
                                          >
                                            <Check
                                                className={cn("mr-2 h-4 w-4", repayment.id === field.value ? "opacity-100" : "opacity-0")}
                                            />
                                            <div className="flex justify-between w-full">
                                              <span>{repayment.borrowerName} ({repayment.loanDisplayId})</span>
                                              <span className="text-muted-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(repayment.pendingAmount)}</span>
                                            </div>
                                          </CommandItem>
                                      ))}
                                    </CommandGroup>
                                    </Command>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {selectedRepaymentForForm && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between"><span>Borrower:</span> <span className="font-medium">{selectedRepaymentForForm.borrowerName}</span></div>
                        <div className="flex justify-between mt-1"><span>Loan ID:</span> <span className="font-medium">{selectedRepaymentForForm.loanDisplayId}</span></div>
                        <div className="flex justify-between mt-1"><span>Amount Due:</span> <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedRepaymentForForm.pendingAmount)}</span></div>
                      </CardContent>
                    </Card>
                )}

                <FormField control={form.control} name="amountPaid" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="paymentMode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode *</FormLabel>
                      <Select
                          onValueChange={(value: PaymentFormValues['paymentMode']) => {
                            field.onChange(value);
                            // Reset conditional fields
                            form.setValue('cardUPIOrChequeNumber', '');
                            form.setValue('cardHolderName', '');
                            form.setValue('bankName', '');
                            form.clearErrors(['cardUPIOrChequeNumber', 'cardHolderName', 'bankName']);
                          }}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a payment mode" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                          <SelectItem value="NETBANKING">Netbanking</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />

                {paymentMode === 'CARD' && (
                    <FormField control={form.control} name="cardHolderName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Holder Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                )}

                {paymentMode === 'NETBANKING' && (
                    <FormField control={form.control} name="bankName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., State Bank of India" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                )}

                {paymentMode !== 'CASH' && (
                    <FormField control={form.control} name="cardUPIOrChequeNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getDynamicInputLabel(paymentMode)} *</FormLabel>
                          <FormControl>
                            <Input placeholder={`Enter ${getDynamicInputLabel(paymentMode)}`} {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                )}

                <FormField control={form.control} name="transactionReference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Reference *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., UTR123456789" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField
                    control={form.control}
                    name="attachment"
                    render={() => (
                        <FormItem>
                          <FormLabel>Attachment</FormLabel>
                          {!attachmentFile ? (
                              <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                                  <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={handleFileSelect}
                                      className="hidden"
                                      id="attachment-upload"
                                      disabled={isSubmitting}
                                  />
                                  <label
                                      htmlFor="attachment-upload"
                                      className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                                  >
                                    <Upload className="h-6 w-6 text-gray-400" />
                                    <p className="text-xs text-gray-600">
                                      Click to upload a receipt (PDF, JPG, PNG)
                                    </p>
                                    <p className="text-xs text-gray-500">Max 5MB</p>
                                  </label>
                                </div>
                              </FormControl>
                          ) : (
                              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 truncate" title={attachmentFile.name}>
                                            {attachmentFile.name}
                                        </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeAttachment}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    disabled={isSubmitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                          )}
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes / Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Payment for June EMI" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
              </div>

              <SheetFooter className="p-4 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Save Payment'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
  );
};


// A simple debounce hook to prevent API calls on every keystroke
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
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


const Repayments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- State Management ---
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pageNo, setPageNo] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const PAGE_SIZE = 10;

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState<Repayment | null>(null);


  // --- Data Fetching ---
  const fetchRepayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    // try {
      const requestBody: RepaymentFilterRequest = {
        pageNo,
        size: PAGE_SIZE,
      };

      if (debouncedSearchTerm) {
        requestBody.searchRequest = debouncedSearchTerm;
      }
      if (statusFilter !== 'all') {
        requestBody.status = statusFilter as RepaymentFilterRequest['status'];
      }

      axiosInstance.put(config.baseURL+'repayment/filter', requestBody)
      .then(
        (res:any) => {
          setRepayments(res.data.data.data || []);
          setTotalCount(res.data.data.count || 0);
          setLoading(false);
        }
      )
      .catch(
        (err:any) => {
          setError(err.resposne.data.message);
          toast({
            variant: "destructive",
            title: "API Error",
            description: err.response.data.message || "Could not fetch repayments data.",
          });
          setLoading(false);
        }
      )

    //   const response = await fetch('https://dev-paisa108.tejsoft.com/repayment/filter', {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'accept': 'application/json',
    //       // 'Authorization': `Bearer ${your_token}`
    //     },
    //     body: JSON.stringify(requestBody),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json().catch(() => null);
    //     throw new Error(errorData?.message || 'Failed to fetch repayments');
    //   }

    //   const result = await response.json();
    //   setRepayments(result.data.data || []);
    //   setTotalCount(result.data.count || 0);

    // } catch (err: any) {
    //   setError(err.message);
    //   toast({
    //     variant: "destructive",
    //     title: "API Error",
    //     description: err.message || "Could not fetch repayments data.",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  }, [pageNo, debouncedSearchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  // Reset to first page when filters change
  useEffect(() => {
    setPageNo(0);
  }, [debouncedSearchTerm, statusFilter]);


  // --- Helper & Handler Functions ---
  const handleRecordPaymentClick = useCallback((repayment: Repayment | null) => {
    setSelectedForPayment(repayment);
    setIsSheetOpen(true);
  }, []);

  // Effect to open sheet from URL parameter
  useEffect(() => {
    if (searchParams.get('action') === 'recordPayment') {
      handleRecordPaymentClick(null); // Open sheet without a pre-selected repayment
      // Clean up the URL parameter so it doesn't re-trigger on refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('action');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, handleRecordPaymentClick]);

  const handlePaymentSuccess = () => {
    setIsSheetOpen(false);
    fetchRepayments(); // Refresh data
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusIcon = (status: Repayment['status']) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
      case 'PARTIAL':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Repayment['status']) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: Repayment['status']) => {
    if (status === 'PAID') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    const due = new Date(dueDate);
    return due < today;
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest repayments.",
    });
    fetchRepayments();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
      <div className={`${styles.mainContainer}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-800">Repayments</h1>
            <p className={`${styles.description} text-gray-600 mt-1`}>Track loan repayments and collections</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleRecordPaymentClick(null)}>
            Record Payment
          </Button>
        </div>

        {/* Filters */}
        <Card className='mt-4'>
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                      placeholder="Search by name, email, mobile or loan ID..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} aria-label="Refresh data">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Repayments Table */}
        <div className={`${styles.borrowerContainer} bg-white shadow-sm rounded mt-4`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Loan ID</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Borrower</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Due Date</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Amount</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Status</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Last Payment Date</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Last Payment Method</th>
                <th className="sticky top-0 z-10 bg-gray-50 text-gray-600 text-sm font-medium text-left p-3">Actions</th>
              </tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">Loading...</td>
                  </tr>
              ) : error ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-red-500">{error}</td>
                  </tr>
              ) : repayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">No repayments found.</td>
                  </tr>
              ) : (
                  repayments.map((repayment) => (
                      <tr key={repayment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-3">
                          <span className="font-medium text-sm text-blue-600">{repayment.loanDisplayId}</span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {repayment.borrowerName.split(' ').map(n => n[0]).join('')}
                          </span>
                            </div>
                            <span className="font-medium text-xs">{repayment.borrowerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                      <span className={`${isOverdue(repayment.dueDate, repayment.status) ? 'text-red-600 font-medium' : 'text-gray-600'} text-xs`}>
                        {new Date(repayment.dueDate).toLocaleDateString()}
                      </span>
                        </td>
                        <td className="py-4 px-3 font-medium text-xs">{formatCurrency(repayment.pendingAmount)}</td>
                        <td className="py-4 px-3">
                          <div className="flex items-center space-x-2 text-xs">
                            {getStatusIcon(repayment.status)}
                            <Badge className={`${getStatusColor(repayment.status)} capitalize`}>
                              {repayment.status.toLowerCase()}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 text-xs">
                          {repayment.lastPaidAt
                              ? new Date(repayment.lastPaidAt).toLocaleDateString()
                              : '-'}
                        </td>
                        <td className="py-4 px-3 text-xs">
                          {repayment.lastPaymentMode ? (
                              <Badge variant="outline">{repayment.lastPaymentMode}</Badge>
                          ) : (
                              <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center space-x-2">
                            {(repayment.status === 'PENDING' || repayment.status === 'PARTIAL' || repayment.status === 'OVERDUE') && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRecordPaymentClick(repayment)}>
                                  <IndianRupee className="w-4 h-4" />
                                </Button>
                            )}
                            {repayment.status === 'OVERDUE' && (
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                  <BellRing className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/dashboard/repayments/${repayment.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {!loading && totalCount > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Page {pageNo + 1} of {totalPages}
            </span>
                <div className="flex items-center space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNo(prev => prev - 1)}
                      disabled={pageNo === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNo(prev => prev + 1)}
                      disabled={pageNo + 1 >= totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
          )}
        </div>

        {/* Record Payment Sheet */}
        <RecordPaymentSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onSuccess={handlePaymentSuccess}
            selectedRepayment={selectedForPayment}
        />
      </div>
  );
};

export default Repayments;