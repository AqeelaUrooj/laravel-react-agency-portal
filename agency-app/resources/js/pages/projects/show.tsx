import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index, edit } from '@/routes/projects';
import { show as clientShow } from '@/routes/clients';
import {
    ProjectActions,
    ProjectBadge,
    Progress,
    projectDate,
} from '@/components/projects/shared';
import type { Project } from '@/types/project';
export default function ProjectShow({ project: p }: { project: Project }) {
    return (
        <>
            <Head title={p.name} />
            <div className="portal-page">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to projects
                </Link>
                <section className="portal-card overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-indigo-500/15 to-transparent" />
                    <div className="flex flex-wrap items-start justify-between gap-5 p-7">
                        <div>
                            <p className="portal-eyebrow">{p.project_code}</p>
                            <h1 className="portal-title">{p.name}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Link
                                    href={clientShow(p.client_id)}
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    {p.client?.name}
                                </Link>
                                <ProjectBadge value={p.status} />
                                <ProjectBadge value={p.priority} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={edit(p.id)}>
                                    <Pencil className="size-4" />
                                    Edit project
                                </Link>
                            </Button>
                            <ProjectActions project={p} />
                        </div>
                    </div>
                </section>
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section className="portal-card p-7">
                        <h2 className="font-semibold">Project overview</h2>
                        <p className="mt-5 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
                            {p.description || 'No description provided.'}
                        </p>
                        <dl className="mt-8 grid grid-cols-2 gap-6">
                            {[
                                ['Start date', projectDate(p.start_date)],
                                ['Deadline', projectDate(p.due_date)],
                                [
                                    'Budget',
                                    p.budget && p.currency
                                        ? new Intl.NumberFormat('en', {
                                              style: 'currency',
                                              currency: p.currency,
                                          }).format(Number(p.budget))
                                        : 'Not set',
                                ],
                                ['Completed', projectDate(p.completed_at)],
                                ['Created', projectDate(p.created_at)],
                                ['Last updated', projectDate(p.updated_at)],
                            ].map(([key, value]) => (
                                <div key={key}>
                                    <dt className="text-xs text-muted-foreground">
                                        {key}
                                    </dt>
                                    <dd className="mt-2 text-sm font-medium">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                    <aside className="portal-card p-7">
                        <h2 className="mb-6 font-semibold">
                            Delivery progress
                        </h2>
                        <p className="mb-6 text-5xl font-semibold tracking-tight text-indigo-500">
                            {p.progress}%
                        </p>
                        <Progress value={p.progress} />
                        <p className="mt-5 text-xs leading-5 text-muted-foreground">
                            Saved project progress. Update this value from the
                            project form as work advances.
                        </p>
                    </aside>
                </div>
                <section className="portal-card divide-y">
                    {[
                        'Tasks',
                        'Team Members',
                        'Documents',
                        'Comments',
                        'Activity',
                    ].map((title) => (
                        <details key={title} className="p-5">
                            <summary className="cursor-pointer text-sm font-medium">
                                {title}
                                <span className="ml-3 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                    Coming soon
                                </span>
                            </summary>
                            <p className="mt-4 text-sm text-muted-foreground">
                                This section is planned and is not available
                                yet.
                            </p>
                        </details>
                    ))}
                </section>
            </div>
        </>
    );
}
