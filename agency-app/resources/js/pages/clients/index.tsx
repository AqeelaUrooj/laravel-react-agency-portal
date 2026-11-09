import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AddClient,
    MetricCards,
    ClientAvatar,
    StatusBadge,
    ClientActions,
    DeleteClientDialog,
    ClientEmpty,
    date,
} from '@/components/clients/shared';
import { index, show } from '@/routes/clients';
import type { Client, ClientPagination, Metrics } from '@/types/client';
type Filters = { search: string; status: string };
export default function ClientsIndex({
    clients,
    metrics,
    filters,
}: {
    clients: ClientPagination;
    metrics: Metrics;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<Client | null>(null);
    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);
    useEffect(() => {
        if (search === filters.search) return;
        let cancel: (() => void) | undefined;
        const timer = setTimeout(
            () =>
                router.get(
                    index().url,
                    { search, status: filters.status },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onCancelToken: (token) => {
                            cancel = () => token.cancel();
                        },
                        onStart: () => setLoading(true),
                        onFinish: () => setLoading(false),
                    },
                ),
            350,
        );
        return () => {
            clearTimeout(timer);
            cancel?.();
        };
    }, [search, filters.search, filters.status]);
    function filter(status: string) {
        router.get(
            index().url,
            { search, status },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    }
    return (
        <>
            <Head title="Clients" />
            <div className="portal-page">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="portal-eyebrow">
                            YOUR RELATIONSHIPS, TOGETHER
                        </p>
                        <h1 className="portal-title">Clients</h1>
                        <p className="mt-2 text-muted-foreground">
                            The people behind your best work. Keep every
                            connection close.
                        </p>
                    </div>
                    <AddClient />
                </div>
                <MetricCards metrics={metrics} />
                <section
                    className="portal-card overflow-hidden"
                    aria-busy={loading}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
                        <div
                            className="flex flex-wrap gap-1"
                            aria-label="Filter by client status"
                        >
                            {[
                                ['', 'All clients'],
                                ['active', 'Active'],
                                ['inactive', 'Inactive'],
                                ['lead', 'Leads'],
                            ].map(([value, label]) => (
                                <Button
                                    key={value}
                                    variant={
                                        filters.status === value
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    aria-pressed={filters.status === value}
                                    onClick={() => filter(value)}
                                >
                                    {label}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        {value
                                            ? metrics[
                                                  value as
                                                      | 'active'
                                                      | 'inactive'
                                                      | 'lead'
                                              ]
                                            : metrics.total}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
                            <Input
                                aria-label="Search clients"
                                placeholder="Search name, company, contact…"
                                maxLength={255}
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div
                        role="status"
                        aria-live="polite"
                        className={
                            loading
                                ? 'flex items-center gap-2 border-b px-5 py-2 text-xs text-muted-foreground'
                                : 'sr-only'
                        }
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-3 animate-spin" />
                                Updating clients…
                            </>
                        ) : (
                            `${clients.total} clients found`
                        )}
                    </div>
                    {clients.data.length === 0 ? (
                        <>
                            <ClientEmpty
                                filtered={!!filters.search || !!filters.status}
                            />
                            {(filters.search || filters.status) && (
                                <div className="pb-6 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(index().url);
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/35 text-xs text-muted-foreground">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 font-medium"
                                            >
                                                Client
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-4 font-medium"
                                            >
                                                Contact
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-4 font-medium"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-4 font-medium"
                                            >
                                                Added
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-4"
                                            >
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.data.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="border-t transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-6 py-5">
                                                    <Link
                                                        href={show(client.id)}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <ClientAvatar
                                                            name={client.name}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="max-w-60 truncate font-medium hover:text-primary">
                                                                {client.name}
                                                            </p>
                                                            <p className="mt-1 max-w-60 truncate text-xs text-muted-foreground">
                                                                {client.company ||
                                                                    'Independent client'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <p className="max-w-56 truncate">
                                                        {client.email}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {client.phone ||
                                                            'No phone added'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <StatusBadge
                                                        status={client.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-5 text-xs whitespace-nowrap text-muted-foreground">
                                                    {date(client.created_at)}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <ClientActions
                                                        client={client}
                                                        onDelete={setDeleting}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y md:hidden">
                                {clients.data.map((client) => (
                                    <article
                                        key={client.id}
                                        className="space-y-4 p-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ClientAvatar name={client.name} />
                                            <Link
                                                href={show(client.id)}
                                                className="min-w-0 flex-1"
                                            >
                                                <p className="truncate font-semibold">
                                                    {client.name}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {client.company ||
                                                        'Independent client'}
                                                </p>
                                            </Link>
                                            <ClientActions
                                                client={client}
                                                onDelete={setDeleting}
                                            />
                                        </div>
                                        <p className="truncate text-sm">
                                            {client.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {client.phone || 'No phone added'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <StatusBadge
                                                status={client.status}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {date(client.created_at)}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
                        <p className="text-xs text-muted-foreground">
                            Showing {clients.from ?? 0}–{clients.to ?? 0} of{' '}
                            {clients.total} clients
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Previous page"
                                disabled={!clients.prev_page_url || loading}
                                onClick={() => {
                                    if (clients.prev_page_url)
                                        router.get(
                                            clients.prev_page_url,
                                            {},
                                            {
                                                preserveState: true,
                                                onStart: () => setLoading(true),
                                                onFinish: () =>
                                                    setLoading(false),
                                            },
                                        );
                                }}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Page {clients.current_page} of{' '}
                                {clients.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Next page"
                                disabled={!clients.next_page_url || loading}
                                onClick={() => {
                                    if (clients.next_page_url)
                                        router.get(
                                            clients.next_page_url,
                                            {},
                                            {
                                                preserveState: true,
                                                onStart: () => setLoading(true),
                                                onFinish: () =>
                                                    setLoading(false),
                                            },
                                        );
                                }}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </section>
                <p className="text-center text-xs text-muted-foreground">
                    Thoughtfully organized. Ready for your next great
                    collaboration.
                </p>
            </div>
            <DeleteClientDialog
                client={deleting}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}
ClientsIndex.layout = { breadcrumbs: [{ title: 'Clients', href: index() }] };
