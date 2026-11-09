import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    UserCheck,
    UserMinus,
    Sparkles,
    Plus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { create, show, edit, destroy } from '@/routes/clients';
import type { Client, ClientStatus, Metrics } from '@/types/client';
export const date = (value: string) =>
    new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
export function ClientAvatar({
    name,
    large = false,
}: {
    name: string;
    large?: boolean;
}) {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-300 ${large ? 'size-20 text-2xl' : 'size-10 text-sm'}`}
        >
            {name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
        </span>
    );
}
export function StatusBadge({ status }: { status: ClientStatus }) {
    const colors = {
        active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        lead: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${colors[status]}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {status === 'lead' ? 'Lead' : status}
        </span>
    );
}
export function AddClient() {
    return (
        <Button asChild className="shadow-sm shadow-indigo-500/20">
            <Link href={create()}>
                <Plus className="size-4" />
                Add client
            </Link>
        </Button>
    );
}
export function MetricCards({ metrics }: { metrics: Metrics }) {
    const cards = [
        {
            key: 'total',
            label: 'Total clients',
            icon: Users,
            color: 'text-indigo-500',
            caption: 'Your client network',
        },
        {
            key: 'active',
            label: 'Active clients',
            icon: UserCheck,
            color: 'text-emerald-500',
            caption: 'Relationships in motion',
        },
        {
            key: 'inactive',
            label: 'Inactive clients',
            icon: UserMinus,
            color: 'text-slate-400',
            caption: 'Ready to reconnect',
        },
        {
            key: 'lead',
            label: 'Leads',
            icon: Sparkles,
            color: 'text-amber-500',
            caption: 'New opportunities',
        },
    ] as const;
    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.key}
                    className="portal-card p-5 transition-shadow hover:shadow-md"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">
                            {card.label}
                        </span>
                        <card.icon className={`size-5 ${card.color}`} />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {metrics[card.key].toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {card.caption}
                    </p>
                </div>
            ))}
        </div>
    );
}
export function DeleteClientDialog({
    client,
    onClose,
}: {
    client: Client | null;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    return (
        <Dialog
            open={!!client}
            onOpenChange={(open) => {
                if (!open && !processing) onClose();
            }}
        >
            <DialogContent
                onEscapeKeyDown={(event) => {
                    if (processing) event.preventDefault();
                }}
                onInteractOutside={(event) => {
                    if (processing) event.preventDefault();
                }}
            >
                <DialogHeader>
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <Trash2 className="size-5" />
                    </div>
                    <DialogTitle>Delete {client?.name}?</DialogTitle>
                    <DialogDescription>
                        This permanently removes this client and their contact
                        information. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={() => {
                            if (!client) return;
                            setProcessing(true);
                            router.delete(destroy(client.id), {
                                onSuccess: onClose,
                                onError: (errors) =>
                                    toast.error(
                                        errors.client ||
                                            'Unable to delete the client. Please try again.',
                                    ),
                                onFinish: () => setProcessing(false),
                            });
                        }}
                    >
                        {processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        {processing ? 'Deleting…' : 'Delete client'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export function ClientActions({
    client,
    onDelete,
}: {
    client: Client;
    onDelete: (client: Client) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${client.name}`}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={show(client.id)}>
                        <Eye />
                        View client
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={edit(client.id)}>
                        <Pencil />
                        Edit client
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(client)}
                >
                    <Trash2 />
                    Delete client
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
export function ClientEmpty({ filtered = false }: { filtered?: boolean }) {
    return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Users className="size-7" />
            </div>
            <h3 className="text-lg font-semibold">
                {filtered
                    ? 'No matching clients'
                    : 'Great relationships start here'}
            </h3>
            <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
                {filtered
                    ? 'Try another search or change your status filter.'
                    : 'Add your first client and bring their details together in one thoughtfully organized space.'}
            </p>
            {!filtered && <AddClient />}
        </div>
    );
}
