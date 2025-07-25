import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment';
import { User, Mail, Phone, DollarSign } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

interface NewBorrowerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (borrowerData?: { name: string; email: string; mobile: string }) => void;
}

interface BorrowerFormData {
  name: string;
  email: string;
  mobile: string;
  // monthlyIncome: string;
}

const NewBorrowerSheet: React.FC<NewBorrowerSheetProps> = ({ open, onOpenChange, onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BorrowerFormData>({
    name: '',
    email: '',
    mobile: '',
    // monthlyIncome: '',
  });

  const [errors, setErrors] = useState<Partial<BorrowerFormData>>({});

  const handleInputChange = (field: keyof BorrowerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BorrowerFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit phone number';
    }

    // Monthly Income validation
    // if (!formData.monthlyIncome.trim()) {
    //   newErrors.monthlyIncome = 'Monthly income is required';
    // } else if (isNaN(Number(formData.monthlyIncome)) || Number(formData.monthlyIncome) <= 0) {
    //   newErrors.monthlyIncome = 'Please enter a valid positive number';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    axiosInstance.post(`${config.baseURL}api/auth/create-user`,formData)
    .then(
      (res:any) => {
        console.log(res.data.data)
        if (res.data.data.details) {
          toast({
            variant: "success",
            title: "Number Already Registered",
            description: res.data.data.details,
          });
          setIsSubmitting(false);
        }
        else {
          toast({
            variant: "success",
            title: "Success",
            description: "Borrower created successfully!",
          });

          // Pass the borrower data to parent and close sheet
          const borrowerData = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile
          };
          
          setFormData({
            name: '',
            email: '',
            mobile: '',
            // monthlyIncome: '',
          });
          setErrors({});
          onSubmit(borrowerData);
          setIsSubmitting(false);
        }
        setIsSubmitting(false);
      }
    )
    .catch(
      (err:any) =>{
        console.log(err)
        toast({
            variant: "destructive",
            title: "Error",
            description: err.response.data.message || "Failed to fetching. Please try again.",
          });
          setIsSubmitting(false);
      }
    )

    // try {
    //   // Simulate API call for now
    //   // await new Promise(resolve => setTimeout(resolve, 1000));

    //   // TODO: Replace with actual API call
    //   const response = await fetch(`${config.baseURL}api/auth/create-user`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   const results = await response.json();
    //   if (results != null) {
    //     if (results.details) {
    //       toast({
    //         variant: "success",
    //         title: "Number Already Registered",
    //         description: results.details,
    //       });
    //       setIsSubmitting(false);
    //     }
    //     else {
    //       toast({
    //         variant: "success",
    //         title: "Success",
    //         description: "Borrower created successfully!",
    //       });

    //       // Pass the borrower data to parent and close sheet
    //       const borrowerData = {
    //         name: formData.name,
    //         email: formData.email,
    //         mobile: formData.mobile
    //       };
          
    //       setFormData({
    //         name: '',
    //         email: '',
    //         mobile: '',
    //         // monthlyIncome: '',
    //       });
    //       setErrors({});
    //       onSubmit(borrowerData);
    //       setIsSubmitting(false);
    //     }

    //   }

    // } catch (error: any) {
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: error.message || "Failed to create borrower. Please try again.",
    //   });
    //   setIsSubmitting(false);
    // }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      // monthlyIncome: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New Borrower
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Borrower Name <sup>*</sup>
            </Label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter borrower's full name"
                className={`pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.name ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <sup>*</sup>
            </Label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={`pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="mobile" className="text-sm font-medium">
              Phone Number <sup>*</sup>
            </Label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="Enter 10-digit phone number"
                className={`pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.mobile ? 'border-red-500' : ''}`}
                maxLength={10}
                type='number'
              />
            </div>
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          {/* <div>
            <Label htmlFor="monthlyIncome" className="text-sm font-medium">
              Monthly Income *
            </Label>
            <div className="mt-1 relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                placeholder="Enter monthly take-home salary"
                className={`pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.monthlyIncome ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.monthlyIncome && <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome}</p>}
          </div> */}
        </div>

        <SheetFooter className="p-6 border-t">
          <div className="flex space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 hover:bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 hover:bg-red"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Submit'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NewBorrowerSheet;