import {
    ProjectList,
    ProjectPaginationControls,
} from '@/components/projects/shared';
import { create as projectCreate } from '@/routes/projects';
import type { ProjectPagination } from '@/types/project';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Building2,
    Files,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    ClientAvatar,
    StatusBadge,
    DeleteClientDialog,
    date,
} from '@/components/clients/shared';
import { index, edit } from '@/routes/clients';
import type { Client } from '@/types/client';
export default function ClientShow({
    client,
    projects,
}: {
    client: Client;
    projects: ProjectPagination;
}) {
    const [deleting, setDeleting] = useState(false);
    return (
        <>
            <Head title={client.name} />
            <div className="portal-page">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="size-4" />
                    Back to clients
                </Link>
                <section className="portal-card overflow-hidden">
                    <div
                        aria-hidden="true"
                        className="h-24 bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent"
                    />
                    <div className="flex flex-wrap items-center gap-5 px-6 pb-7 sm:px-8">
                        <div className="-mt-8 rounded-2xl border-4 border-card bg-card">
                            <ClientAvatar name={client.name} large />
                        </div>
                        <div className="min-w-0 flex-1 pt-4">
                            <h1 className="portal-title break-words">
                                {client.name}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {client.company || 'Independent client'}
                                </p>
                                <StatusBadge status={client.status} />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" asChild>
                                <Link href={edit(client.id)}>
                                    <Pencil className="size-4" />
                                    Edit client
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Delete client"
                                onClick={() => setDeleting(true)}
                            >
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                </section>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: Mail,
                            title: 'Email address',
                            value: client.email,
                        },
                        {
                            icon: Phone,
                            title: 'Phone number',
                            value: client.phone,
                        },
                        {
                            icon: Building2,
                            title: 'Company',
                            value: client.company,
                        },
                    ].map((info) => (
                        <div key={info.title} className="portal-card p-6">
                            <info.icon className="mb-5 size-5 text-indigo-500" />
                            <p className="text-xs text-muted-foreground">
                                {info.title}
                            </p>
                            <p className="mt-2 text-sm font-medium break-words">
                                {info.value || 'Not provided'}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <section className="portal-card p-7">
                        <h2 className="font-semibold">Notes & context</h2>
                        <p className="mt-4 text-sm leading-7 break-words whitespace-pre-wrap text-muted-foreground">
                            {client.notes ||
                                'No notes yet. Edit this client to add background, preferences, or helpful context for your next conversation.'}
                        </p>
                    </section>
                    <section className="portal-card space-y-5 p-7">
                        <h2 className="text-sm font-semibold">
                            Client activity
                        </h2>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Added to your workspace
                            </p>
                            <p className="mt-1 text-sm">
                                {date(client.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Last updated
                            </p>
                            <p className="mt-1 text-sm">
                                {date(client.updated_at)}
                            </p>
                        </div>
                    </section>
                </div>
                <section className="portal-card overflow-hidden">
                    <div className="flex items-center justify-between border-b p-6">
                        <h2 className="font-semibold">Projects</h2>
                        <Button asChild>
                            <Link
                                href={projectCreate({
                                    query: { client_id: client.id },
                                })}
                            >
                                Add Project
                            </Link>
                        </Button>
                    </div>
                    <ProjectList projects={projects.data} />
                    <ProjectPaginationControls projects={projects} />
                </section>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { icon: Files, title: 'Documents' },
                        { icon: CreditCard, title: 'Billing' },
                    ].map((module) => (
                        <section key={module.title} className="portal-card p-6">
                            <div className="flex items-center justify-between">
                                <module.icon className="size-5 text-muted-foreground" />
                                <span className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                                    Coming soon
                                </span>
                            </div>
                            <h2 className="mt-5 text-sm font-semibold">
                                {module.title}
                            </h2>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                This module is planned and is not available yet.
                            </p>
                        </section>
                    ))}
                </div>
            </div>
            <DeleteClientDialog
                client={deleting ? client : null}
                onClose={() => setDeleting(false)}
            />
        </>
    );
}
ClientShow.layout = {
    breadcrumbs: [
        { title: 'Clients', href: index() },
        { title: 'Client profile', href: '#' },
    ],
};
