import { Head } from '@inertiajs/react';
import ClientForm from '@/components/clients/client-form';
import { index } from '@/routes/clients';
import type { Client } from '@/types/client';
export default function ClientCreate({ client }: { client?: Client }) {
    return (
        <>
            <Head title="Create client" />
            <ClientForm client={client} />
        </>
    );
}
ClientCreate.layout = {
    breadcrumbs: [
        { title: 'Clients', href: index() },
        { title: 'Create client', href: '#' },
    ],
};
