import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
export function FlashFeedback() {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash]);
    return null;
}
