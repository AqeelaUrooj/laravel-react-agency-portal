import { ProjectMetricCards, ProjectList } from '@/components/projects/shared';
import { index as projectsIndex } from '@/routes/projects';
import type { Project, ProjectMetrics } from '@/types/project';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ArrowRight,
    Users,
    Files,
    CreditCard,
} from 'lucide-react';
import {
    AddClient,
    MetricCards,
    ClientAvatar,
    StatusBadge,
    ClientEmpty,
    date,
} from '@/components/clients/shared';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/clients';
import type { Client, Metrics } from '@/types/client';
export default function Dashboard({
    metrics,
    recentClients,
    projectMetrics,
    recentProjects,
}: {
    projectMetrics: ProjectMetrics;
    recentProjects: Project[];
    metrics: Metrics;
    recentClients: Client[];
}) {
    const { auth } = usePage().props;
    return (
        <>
            <Head title="Overview" />
            <div className="portal-page">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="portal-eyebrow">
                            YOUR AGENCY AT A GLANCE
                        </p>
                        <h1 className="portal-title">
                            Welcome back, {auth.user.name.split(' ')[0]}.
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            A little clarity for the work ahead. Here’s where
                            things stand.
                        </p>
                    </div>
                    <AddClient />
                </div>
                <MetricCards metrics={metrics} />
                <ProjectMetricCards metrics={projectMetrics} />
                <section className="portal-card overflow-hidden">
                    <div className="flex justify-between border-b p-6">
                        <h2 className="font-semibold">Recent projects</h2>
                        <Link
                            href={projectsIndex()}
                            className="text-sm text-primary"
                        >
                            View all projects
                        </Link>
                    </div>
                    <ProjectList projects={recentProjects} />
                </section>
                <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
                    <section className="portal-card overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b p-6">
                            <div>
                                <h2 className="font-semibold">
                                    Recent clients
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    The newest connections in your workspace
                                </p>
                            </div>
                            <Link
                                href={index()}
                                className="flex items-center gap-1 text-xs font-medium text-primary"
                            >
                                View all
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </div>
                        {recentClients.length ? (
                            <div className="divide-y">
                                {recentClients.map((client) => (
                                    <Link
                                        key={client.id}
                                        href={show(client.id)}
                                        className="flex items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/40"
                                    >
                                        <ClientAvatar name={client.name} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {client.name}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {client.company || client.email}
                                            </p>
                                        </div>
                                        <span className="hidden text-xs text-muted-foreground sm:inline">
                                            {date(client.created_at)}
                                        </span>
                                        <StatusBadge status={client.status} />
                                        <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <ClientEmpty />
                        )}
                    </section>
                    <aside className="space-y-5">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-7 text-white">
                            <div
                                aria-hidden="true"
                                className="absolute -top-12 -right-12 size-48 rounded-full border-[24px] border-indigo-400/10"
                            />
                            <span className="relative inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-indigo-200">
                                YOUR WORKSPACE
                            </span>
                            <h2 className="relative mt-6 text-2xl font-semibold tracking-tight">
                                Good work starts with great relationships.
                            </h2>
                            <p className="relative mt-3 text-sm leading-6 text-slate-400">
                                Give every client a home. Keep the details close
                                and your next conversation effortless.
                            </p>
                            <Link
                                href={index()}
                                className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-200"
                            >
                                Explore your clients
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="portal-card p-6">
                            <Users className="mb-4 size-5 text-indigo-500" />
                            <h3 className="text-sm font-semibold">
                                A focused start
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Your client directory is ready. More tools for
                                your agency are on the horizon.
                            </p>
                        </div>
                    </aside>
                </div>
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <h2 className="text-sm font-semibold">Room to grow</h2>
                        <span className="text-xs text-muted-foreground">
                            Coming soon
                        </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: Files,
                                title: 'Documents',
                                text: 'Keep proposals and important files connected.',
                            },
                            {
                                icon: CreditCard,
                                title: 'Billing',
                                text: 'Bring clarity to invoices and client billing.',
                            },
                        ].map((module) => (
                            <div
                                key={module.title}
                                className="portal-card flex items-start gap-4 p-5"
                            >
                                <module.icon className="mt-1 size-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <h3 className="text-sm font-medium">
                                        {module.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                        {module.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
Dashboard.layout = { breadcrumbs: [{ title: 'Overview', href: dashboard() }] };
