import { Link, useForm } from '@inertiajs/react';
import {
    Loader2,
    UserRound,
    Building2,
    AlignLeft,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, show, store, update } from '@/routes/clients';
import type { Client, ClientStatus } from '@/types/client';
type ClientData = {
    name: string;
    email: string;
    phone: string;
    company: string;
    status: ClientStatus;
    notes: string;
};
export default function ClientForm({ client }: { client?: Client }) {
    const form = useForm<ClientData>({
        name: client?.name ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        company: client?.company ?? '',
        status: client?.status ?? 'lead',
        notes: client?.notes ?? '',
    });
    const cancel = client ? show(client.id) : index();
    function field(
        key: 'name' | 'email' | 'phone' | 'company',
        label: string,
        placeholder: string,
        type = 'text',
        required = false,
    ) {
        return (
            <div className="space-y-2">
                <Label htmlFor={key}>
                    {label}
                    {required && <span className="text-indigo-500"> *</span>}
                </Label>
                <Input
                    id={key}
                    type={type}
                    required={required}
                    maxLength={key === 'phone' ? 50 : 255}
                    autoComplete={
                        key === 'name'
                            ? 'name'
                            : key === 'email'
                              ? 'email'
                              : key === 'phone'
                                ? 'tel'
                                : 'organization'
                    }
                    placeholder={placeholder}
                    value={form.data[key]}
                    onChange={(event) => form.setData(key, event.target.value)}
                    aria-invalid={!!form.errors[key]}
                    aria-describedby={
                        form.errors[key] ? `${key}-error` : undefined
                    }
                />
                {form.errors[key] && (
                    <p id={`${key}-error`} className="text-sm text-destructive">
                        {form.errors[key]}
                    </p>
                )}
            </div>
        );
    }
    return (
        <div className="portal-page">
            <Link
                href={cancel}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Back to {client ? 'client profile' : 'clients'}
            </Link>
            <div>
                <p className="portal-eyebrow">CLIENT DIRECTORY</p>
                <h1 className="portal-title">
                    {client ? 'Edit client' : 'A new relationship starts here.'}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {client
                        ? 'Keep your client’s details accurate and up to date.'
                        : 'Add the details. Keep the connection.'}
                </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
                <form
                    className="portal-card overflow-hidden"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (client) form.put(update(client.id).url);
                        else form.post(store().url);
                    }}
                >
                    <section className="space-y-5 border-b p-6 sm:p-8">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <UserRound className="size-4 text-indigo-500" />
                            Personal information
                        </h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {field(
                                'name',
                                'Full name',
                                'e.g. Alex Morgan',
                                'text',
                                true,
                            )}
                            {field(
                                'email',
                                'Email address',
                                'alex@company.com',
                                'email',
                                true,
                            )}
                            {field(
                                'phone',
                                'Phone number',
                                '+1 555 010 2000',
                                'tel',
                            )}
                        </div>
                    </section>
                    <section className="space-y-5 border-b p-6 sm:p-8">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <Building2 className="size-4 text-indigo-500" />
                            Business information
                        </h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {field(
                                'company',
                                'Company',
                                'Company or organization',
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Relationship status{' '}
                                    <span className="text-indigo-500">*</span>
                                </Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'status',
                                            value as ClientStatus,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="status"
                                        className="w-full"
                                        aria-invalid={!!form.errors.status}
                                        aria-describedby={
                                            form.errors.status
                                                ? 'status-error'
                                                : undefined
                                        }
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">
                                            Lead
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.status && (
                                    <p
                                        id="status-error"
                                        className="text-sm text-destructive"
                                    >
                                        {form.errors.status}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                    <section className="space-y-5 p-6 sm:p-8">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <AlignLeft className="size-4 text-indigo-500" />
                            Additional information
                        </h2>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                maxLength={10000}
                                className="portal-textarea"
                                rows={5}
                                placeholder="A little context goes a long way. Add preferences, background, or anything helpful…"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                                aria-invalid={!!form.errors.notes}
                                aria-describedby={
                                    form.errors.notes
                                        ? 'notes-error'
                                        : 'notes-help'
                                }
                            />
                            <p
                                id="notes-help"
                                className="text-xs text-muted-foreground"
                            >
                                Internal notes for your agency workspace.
                            </p>
                            {form.errors.notes && (
                                <p
                                    id="notes-error"
                                    className="text-sm text-destructive"
                                >
                                    {form.errors.notes}
                                </p>
                            )}
                        </div>
                    </section>
                    <div className="flex justify-end gap-3 border-t bg-muted/30 px-6 py-5">
                        <Button variant="outline" asChild>
                            <Link href={cancel}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {form.processing
                                ? 'Saving…'
                                : client
                                  ? 'Save changes'
                                  : 'Create client'}
                        </Button>
                    </div>
                </form>
                <aside className="space-y-5">
                    <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-6">
                        <p className="font-semibold">
                            Built around relationships
                        </p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            One place for the people behind your work. Start
                            with contact details, then add context as the
                            relationship grows.
                        </p>
                    </div>
                    <p className="px-2 text-xs leading-5 text-muted-foreground">
                        Fields marked * are required. You can update all details
                        at any time.
                    </p>
                </aside>
            </div>
        </div>
    );
}
