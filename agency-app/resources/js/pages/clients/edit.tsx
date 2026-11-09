import { Head } from '@inertiajs/react';
import ClientForm from '@/components/clients/client-form';
import { index } from '@/routes/clients';
import type { Client } from '@/types/client';
export default function ClientEdit({ client }: { client?: Client }) {
    return (
        <>
            <Head title="Edit client" />
            <ClientForm client={client} />
        </>
    );
}
ClientEdit.layout = {
    breadcrumbs: [
        { title: 'Clients', href: index() },
        { title: 'Edit client', href: '#' },
    ],
};
