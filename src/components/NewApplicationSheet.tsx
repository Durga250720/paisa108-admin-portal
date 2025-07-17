import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment';
import { User, Building, CreditCard, FileText, Calendar, Phone, Mail, DollarSign, UserPlus, Users } from 'lucide-react';
import NewBorrowerSheet from './NewBorrowerSheet';

interface NewApplicationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob?: string;
  gender?: string;
  fathersName?: string;
}

interface ApplicationFormData {
  // Borrower Selection
  borrowerId: string;
  borrowerSelectionType: 'new' | 'existing' | '';
  
  // Personal Information
  name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  fathersName: string;
  
  // Employment Details
  employmentType: string;
  companyName: string;
  designation: string;
  takeHomeSalary: string;
  totalExperienceInMonths: string;
  
  // Loan Details
  loanAmount: string;
  loanPurpose: string;
  applicationType: string;
  
  // Address Details
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  
  // Bank Details
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

const NewApplicationSheet: React.FC<NewApplicationSheetProps> = ({ open, onOpenChange, onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loadingBorrowers, setLoadingBorrowers] = useState(false);
  const [showNewBorrowerSheet, setShowNewBorrowerSheet] = useState(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    // Borrower Selection
    borrowerId: '',
    borrowerSelectionType: '',
    
    // Personal Information
    name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
    fathersName: '',
    
    // Employment Details
    employmentType: '',
    companyName: '',
    designation: '',
    takeHomeSalary: '',
    totalExperienceInMonths: '',
    
    // Loan Details
    loanAmount: '',
    loanPurpose: '',
    applicationType: 'PERSONAL',
    
    // Address Details
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    
    // Bank Details
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    if (field === 'mobile') {
      value = value.replace(/\D/g, ''); // Allow only digits, maxLength will handle the rest
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Borrower Selection
        if (formData.borrowerSelectionType === 'existing') {
          return !!(formData.borrowerSelectionType && formData.borrowerId);
        }
        return !!(formData.borrowerSelectionType);
      case 2: // Personal Information
        return !!(formData.name && formData.email && formData.mobile && formData.dob && formData.gender);
      case 3: // Employment Details
        return !!(formData.employmentType && formData.companyName && formData.designation && formData.takeHomeSalary);
      case 4: // Loan Details
        return !!(formData.loanAmount && formData.loanPurpose);
      case 5: // Address & Bank Details
        return !!(formData.addressLine1 && formData.city && formData.state && formData.pincode && 
                 formData.accountHolderName && formData.accountNumber && formData.ifscCode);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Special handling for borrower selection step
      if (currentStep === 1 && formData.borrowerSelectionType === 'new') {
        setShowNewBorrowerSheet(true);
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the payload according to your API structure
      const payload = {
        borrower: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          dob: formData.dob,
          gender: formData.gender,
          fathersName: formData.fathersName,
        },
        employmentDetails: {
          employmentType: formData.employmentType,
          companyName: formData.companyName,
          designation: formData.designation,
          takeHomeSalary: parseInt(formData.takeHomeSalary),
          totalExperienceInMonths: parseInt(formData.totalExperienceInMonths),
        },
        loanAmount: parseInt(formData.loanAmount),
        loanPurpose: formData.loanPurpose,
        applicationType: formData.applicationType,
        addressDetail: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        bankDetail: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
        }
      };

      // const response = await fetch(`${config.baseURL}loan-application/create`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      // }

      // toast({
      //   variant: "success",
      //   title: "Success",
      //   description: "Loan application created successfully!",
      // });

      // Reset form and close sheet
      setFormData({
        borrowerId: '', borrowerSelectionType: '',
        name: '', email: '', mobile: '', dob: '', gender: '', fathersName: '',
        employmentType: '', companyName: '', designation: '', takeHomeSalary: '', totalExperienceInMonths: '',
        loanAmount: '', loanPurpose: '', applicationType: 'PERSONAL',
        addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
        accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '',
      });
      setCurrentStep(1);
      onSubmit();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create loan application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch borrowers when component opens
  useEffect(() => {
    if (open) {
      fetchBorrowers();
    }
  }, [open]);

  const fetchBorrowers = async () => {
    setLoadingBorrowers(true);
    try {
      const response = await fetch(`${config.baseURL}api/borrowers`);
      if (response.ok) {
        const data = await response.json();
        setBorrowers(data.borrowers || []);
      }
    } catch (error) {
      console.error('Failed to fetch borrowers:', error);
    } finally {
      setLoadingBorrowers(false);
    }
  };

  const handleBorrowerSelect = (borrowerId: string) => {
    const selectedBorrower = borrowers.find(b => b.id === borrowerId);
    if (selectedBorrower) {
      setFormData(prev => ({
        ...prev,
        borrowerId,
        borrowerSelectionType: 'existing',
        name: selectedBorrower.name,
        email: selectedBorrower.email,
        mobile: selectedBorrower.mobile,
        dob: selectedBorrower.dob || '',
        gender: selectedBorrower.gender || '',
        fathersName: selectedBorrower.fathersName || '',
      }));
    }
  };

  const handleNewBorrowerCreated = () => {
    setShowNewBorrowerSheet(false);
    // Refresh borrowers list
    fetchBorrowers();
    // Move to next step
    setCurrentStep(2);
    toast({
      title: "Success",
      description: "Borrower created successfully. Please continue with the application.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Borrower Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={formData.borrowerSelectionType === 'existing' ? 'default' : 'outline'}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleInputChange('borrowerSelectionType', 'existing')}
                >
                  <Users className="w-6 h-6" />
                  <span>Select Existing Borrower</span>
                </Button>
                <Button
                  variant={formData.borrowerSelectionType === 'new' ? 'default' : 'outline'}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleInputChange('borrowerSelectionType', 'new')}
                >
                  <UserPlus className="w-6 h-6" />
                  <span>Create New Borrower</span>
                </Button>
              </div>

              {formData.borrowerSelectionType === 'existing' && (
                <div className="space-y-4">
                  <Label>Select Borrower <sup>*</sup></Label>
                  {loadingBorrowers ? (
                    <div className="text-center py-4">Loading borrowers...</div>
                  ) : borrowers.length > 0 ? (
                    <Select value={formData.borrowerId} onValueChange={handleBorrowerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a borrower" />
                      </SelectTrigger>
                      <SelectContent>
                        {borrowers.map(borrower => (
                          <SelectItem key={borrower.id} value={borrower.id}>
                            <div className="flex flex-col">
                              <span>{borrower.name}</span>
                              <span className="text-sm text-muted-foreground">{borrower.email} • {borrower.mobile}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No borrowers found. Please create a new borrower.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name <sup>*</sup></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address <sup>*</sup></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number <sup>*</sup></Label>
                  <Input
                    type='text'
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth <sup>*</sup></Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender <sup>*</sup></Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fathersName">Father's Name</Label>
                  <Input
                    id="fathersName"
                    value={formData.fathersName}
                    onChange={(e) => handleInputChange('fathersName', e.target.value)}
                    placeholder="Enter father's name"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType">Employment Type <sup>*</sup></Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALARIED">Salaried</SelectItem>
                      <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name <sup>*</sup></Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation <sup>*</sup></Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="Enter designation"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="takeHomeSalary">Take Home Salary <sup>*</sup></Label>
                  <Input
                    id="takeHomeSalary"
                    type="number"
                    value={formData.takeHomeSalary}
                    onChange={(e) => handleInputChange('takeHomeSalary', e.target.value)}
                    placeholder="Enter monthly salary"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="totalExperienceInMonths">Total Experience (Months)</Label>
                  <Input
                    id="totalExperienceInMonths"
                    type="number"
                    value={formData.totalExperienceInMonths}
                    onChange={(e) => handleInputChange('totalExperienceInMonths', e.target.value)}
                    placeholder="Enter experience in months"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanAmount">Loan Amount <sup>*</sup></Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="Enter loan amount"
                    className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <div>
                  <Label htmlFor="applicationType">Application Type</Label>
                  <Select value={formData.applicationType} onValueChange={(value) => handleInputChange('applicationType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                      <SelectItem value="BUSINESS">Business Loan</SelectItem>
                      <SelectItem value="HOME">Home Loan</SelectItem>
                      <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="loanPurpose">Loan Purpose <sup>*</sup></Label>
                <Textarea
                  id="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                  placeholder="Enter the purpose of loan"
                  className='focus-visible:ring-0 focus-visible:ring-offset-0'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine1">Address Line 1 <sup>*</sup></Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="Enter address line 1"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Enter address line 2"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City <sup>*</sup></Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State <sup>*</sup></Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode <sup>*</sup></Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name <sup>*</sup></Label>
                    <Input
                      id="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      placeholder="Enter account holder name"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number <sup>*</sup></Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code <sup>*</sup></Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      placeholder="Enter IFSC code"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="Enter bank name"
                      className='focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-2xl font-semibold text-primary">
            Create New Loan Application
          </SheetTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto my-6 -mr-6 pr-6">
          {renderStepContent()}
        </div>
        <div className="flex justify-between pt-6 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6"
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Creating...' : 'Create Application'}
            </Button>
          )}
        </div>
      </SheetContent>

      {/* New Borrower Sheet */}
      <NewBorrowerSheet
        open={showNewBorrowerSheet}
        onOpenChange={setShowNewBorrowerSheet}
        onSubmit={handleNewBorrowerCreated}
      />
    </Sheet>
  );
};

export default NewApplicationSheet;