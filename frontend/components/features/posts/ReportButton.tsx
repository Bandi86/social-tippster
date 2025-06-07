'use client';

import { Flag } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';

interface ReportButtonProps {
  postId: string;
  onReported?: () => void;
  className?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam vagy hirdetés' },
  { value: 'harassment', label: 'Zaklatás vagy támadás' },
  { value: 'hate_speech', label: 'Gyűlöletbeszéd' },
  { value: 'violence', label: 'Erőszak vagy fenyegetés' },
  { value: 'nudity', label: 'Meztelenség vagy szexuális tartalom' },
  { value: 'false_information', label: 'Hamis információ' },
  { value: 'copyright', label: 'Szerzői jogi sértés' },
  { value: 'impersonation', label: 'Személyiségi jogok megsértése' },
  { value: 'self_harm', label: 'Önkárosítás vagy öngyilkosság' },
  { value: 'other', label: 'Egyéb' },
] as const;

export default function ReportButton({ postId, onReported, className }: ReportButtonProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const { isAuthenticated } = useAuth();
  const { reportPost } = usePosts();

  const handleReport = async () => {
    if (!selectedReason) {
      toast({
        title: 'Hiányzó információ',
        description: 'Kérjük válasszon egy okot a jelentéshez',
        variant: 'destructive',
      });
      return;
    }

    setIsReporting(true);

    try {
      await reportPost(postId, selectedReason, additionalDetails || undefined);

      toast({
        title: 'Jelentés elküldve',
        description: 'Köszönjük a jelentését. Hamarosan megvizsgáljuk.',
      });

      setIsDialogOpen(false);
      setSelectedReason('');
      setAdditionalDetails('');
      onReported?.();
    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: 'Hiba',
        description: error instanceof Error ? error.message : 'A jelentés sikertelen volt',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Bejelentkezés szükséges',
        description: 'A jelentéshez be kell jelentkezni',
        variant: 'destructive',
      });
      return;
    }
    setIsDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant='ghost'
        size='sm'
        onClick={handleOpenDialog}
        className={`h-8 px-2 text-gray-500 ${className}`}
        disabled
      >
        <Flag className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={`h-8 px-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-colors ${className}`}
        >
          <Flag className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-gray-900 border-gray-700 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-white'>Poszt jelentése</DialogTitle>
          <DialogDescription className='text-gray-400'>
            Miért szeretné jelenteni ezt a posztot? A jelentése segít fenntartani a közösségi
            irányelveket.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label className='text-sm font-medium text-gray-300 mb-3 block'>Válasszon okot:</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                <SelectValue placeholder='Válasszon egy okot...' />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-600'>
                {REPORT_REASONS.map(reason => (
                  <SelectItem
                    key={reason.value}
                    value={reason.value}
                    className='text-gray-300 focus:bg-gray-700 focus:text-white'
                  >
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason && (
            <div>
              <Label htmlFor='details' className='text-sm font-medium text-gray-300 mb-2 block'>
                További részletek (opcionális):
              </Label>
              <Textarea
                id='details'
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
                placeholder='Adjon meg további információkat...'
                className='bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 min-h-[80px]'
                maxLength={1000}
              />
              <div className='text-xs text-gray-500 mt-1'>
                {additionalDetails.length}/1000 karakter
              </div>
            </div>
          )}

          <div className='flex gap-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => setIsDialogOpen(false)}
              className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-800'
              disabled={isReporting}
            >
              Mégse
            </Button>
            <Button
              onClick={handleReport}
              disabled={!selectedReason || isReporting}
              className='flex-1 bg-red-600 hover:bg-red-700 text-white'
            >
              {isReporting ? 'Jelentés...' : 'Jelentés'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
