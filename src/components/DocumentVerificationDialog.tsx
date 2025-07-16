import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { toTitleCase } from '../lib/utils';

interface DocumentVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentNumber: string | null;
  documentUrls: any;
  onSubmit: (status: 'VERIFIED' | 'REJECTED', remark: string) => void; // Callback to parent
  isLoading: boolean; // Loading state controlled by parent
}

const DocumentVerificationDialog: React.FC<DocumentVerificationDialogProps> = ({
  isOpen,
  onClose,
  documentType,
  documentNumber,
  documentUrls,
  onSubmit,
  isLoading,
}) => {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'REJECTED' | ''>('VERIFIED');
  const [remark, setRemark] = useState('');

  // Reset state when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setVerificationStatus('VERIFIED');
      setRemark('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!verificationStatus) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a verification status (Verify or Reject).',
      });
      return;
    }
    onSubmit(verificationStatus, remark);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] lg:max-w-[600px]">
        <DialogHeader className='mb-2'>
          <DialogTitle className='text-lg'>Verify {toTitleCase(documentType.replace(/_/g, ' ').split('_').join(' '))}</DialogTitle>
          <DialogDescription className='text-xs font-normal text-gray-500'>
            Review the document and select a verification status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-normal">Document Type: <span className="font-normal text-orange-500">{documentType.replace(/_/g, ' ')}</span></p>
            {documentNumber && (
              <p className="text-sm font-normal">Document Number: <span className="font-normal text-orange-500">{documentNumber}</span></p>
            )}
          </div>

          {documentUrls && documentUrls?.urls.length > 0 && (
            <div className="space-y-2">
              <Label>Document Preview</Label>
              <div className="border rounded-md p-2 max-h-[30vh] overflow-y-auto space-y-4 bg-gray-50">
                {documentUrls?.urls.map((doc, index) => {
                  const isPdf = doc.url.toLowerCase().endsWith('.pdf');
                  return (
                    <div key={index}>
                      <p className="text-xs text-gray-500 mb-1">Document {index + 1}</p>
                      {isPdf ? (
                        <iframe
                          src={doc.url}
                          className="w-full h-96 border-none"
                          title={`Document Preview ${index + 1}`}
                        />
                      ) : (
                        <img
                          src={doc.url}
                          alt={`Document Preview ${index + 1}`}
                          className="w-full h-auto object-contain rounded"
                        />
                      )}
                      {/* <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 block text-center"
                      >
                        Open in new tab
                      </a> */}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <RadioGroup
            value={verificationStatus}
            onValueChange={(value: 'VERIFIED' | 'REJECTED') => setVerificationStatus(value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VERIFIED" id="verify-option" />
              <Label htmlFor="verify-option">Verify</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="REJECTED" id="reject-option" />
              <Label htmlFor="reject-option">Reject</Label>
            </div>
          </RadioGroup>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="remark">Remark (Optional)</Label>
            <Textarea
              id="remark"
              placeholder="Add any relevant remarks here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!verificationStatus || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationDialog;