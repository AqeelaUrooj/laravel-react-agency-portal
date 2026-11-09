import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { create, index, show } from '@/routes/projects';
import {
    ProjectMetricCards,
    ProjectBadge,
    Progress,
    ProjectActions,
    ProjectPaginationControls,
    projectDate,
    label,
} from '@/components/projects/shared';
import type {
    ProjectPagination,
    ProjectOptions,
    ProjectMetrics,
} from '@/types/project';
type Filters = {
    search?: string;
    status?: string;
    priority?: string;
    client_id?: string;
    sort?: string;
    direction?: string;
    view?: string;
};
export default function Projects({
    projects,
    metrics,
    filters,
    clients,
    statuses,
    priorities,
}: ProjectOptions & {
    projects: ProjectPagination;
    metrics: ProjectMetrics;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);
    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(
            () =>
                router.get(
                    index().url,
                    { ...filters, search, page: 1 },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                ),
            350,
        );
        return () => clearTimeout(timer);
    }, [search, filters]);
    const change = (key: string, value: string) =>
        router.get(
            index().url,
            { ...filters, search, [key]: value, page: 1 },
            { preserveState: true, preserveScroll: true },
        );
    const selects = [
        {
            key: 'client_id',
            title: 'Client',
            options: clients.map((c) => ({
                value: String(c.id),
                title: c.name,
            })),
        },
        {
            key: 'status',
            title: 'Status',
            options: statuses.map((v) => ({ value: v, title: label(v) })),
        },
        {
            key: 'priority',
            title: 'Priority',
            options: priorities.map((v) => ({ value: v, title: label(v) })),
        },
        {
            key: 'sort',
            title: 'Sort by',
            options: ['created_at', 'due_date', 'name'].map((v) => ({
                value: v,
                title: label(v),
            })),
        },
        {
            key: 'direction',
            title: 'Order',
            options: [
                { value: 'asc', title: 'Ascending' },
                { value: 'desc', title: 'Descending' },
            ],
        },
    ];
    return (
        <>
            <Head title="Projects" />
            <div className="portal-page">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="portal-eyebrow">
                            YOUR DELIVERY WORKSPACE
                        </p>
                        <h1 className="portal-title">Projects</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your agency's client projects
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Create Project
                        </Link>
                    </Button>
                </div>
                <ProjectMetricCards metrics={metrics} />
                <section className="portal-card overflow-hidden">
                    <div className="flex flex-wrap gap-3 border-b p-5">
                        <Input
                            aria-label="Search projects"
                            placeholder="Search name or project code…"
                            className="min-w-48 flex-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {selects.map((s) => (
                            <select
                                key={s.key}
                                aria-label={s.title}
                                className="max-w-full rounded-md border bg-background px-3 py-2 text-sm"
                                value={
                                    filters[s.key as keyof Filters] ??
                                    (s.key === 'sort'
                                        ? 'created_at'
                                        : s.key === 'direction'
                                          ? 'desc'
                                          : '')
                                }
                                onChange={(e) => change(s.key, e.target.value)}
                            >
                                {!['sort', 'direction'].includes(s.key) && (
                                    <option value="">
                                        All {s.title.toLowerCase()}s
                                    </option>
                                )}
                                {s.options.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.title}
                                    </option>
                                ))}
                            </select>
                        ))}
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearch('');
                                router.get(index().url);
                            }}
                        >
                            Reset
                        </Button>
                        <div className="flex gap-1">
                            {[
                                ['table', List],
                                ['grid', LayoutGrid],
                            ].map(([v, Icon]) => {
                                const ViewIcon = Icon as typeof List;
                                return (
                                    <Button
                                        key={String(v)}
                                        variant={
                                            (filters.view ?? 'table') === v
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        size="icon"
                                        aria-label={`${String(v)} view`}
                                        aria-pressed={
                                            (filters.view ?? 'table') === v
                                        }
                                        onClick={() =>
                                            change('view', String(v))
                                        }
                                    >
                                        <ViewIcon className="size-4" />
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                    {!projects.data.length ? (
                        <div className="p-16 text-center">
                            <h2 className="text-lg font-semibold">
                                No projects found
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Create your first project or adjust the filters.
                            </p>
                        </div>
                    ) : filters.view === 'grid' ? (
                        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                            {projects.data.map((p) => (
                                <article
                                    key={p.id}
                                    className="rounded-xl border p-5 transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <Link
                                                href={show(p.id)}
                                                className="font-semibold hover:text-primary"
                                            >
                                                {p.name}
                                            </Link>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {p.client?.name} ·{' '}
                                                {p.project_code}
                                            </p>
                                        </div>
                                        <ProjectActions project={p} />
                                    </div>
                                    <div className="my-5 flex gap-2">
                                        <ProjectBadge value={p.status} />
                                        <ProjectBadge value={p.priority} />
                                    </div>
                                    <p className="mb-5 text-xs text-muted-foreground">
                                        Deadline · {projectDate(p.due_date)}
                                    </p>
                                    <Progress value={p.progress} />
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/40 text-xs text-muted-foreground">
                                    <tr>
                                        {[
                                            'Project',
                                            'Client',
                                            'Status',
                                            'Priority',
                                            'Start date',
                                            'Due date',
                                            'Progress',
                                            'Actions',
                                        ].map((t) => (
                                            <th
                                                key={t}
                                                scope="col"
                                                className="px-5 py-4 font-medium"
                                            >
                                                {t}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {projects.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="min-w-52 px-5 py-5">
                                                <Link
                                                    href={show(p.id)}
                                                    className="font-semibold hover:text-primary"
                                                >
                                                    {p.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {p.project_code}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5">
                                                {p.client?.name}
                                            </td>
                                            <td className="px-5 py-5">
                                                <ProjectBadge
                                                    value={p.status}
                                                />
                                            </td>
                                            <td className="px-5 py-5">
                                                <ProjectBadge
                                                    value={p.priority}
                                                />
                                            </td>
                                            <td className="px-5 py-5 whitespace-nowrap">
                                                {projectDate(p.start_date)}
                                            </td>
                                            <td className="px-5 py-5 whitespace-nowrap">
                                                {projectDate(p.due_date)}
                                            </td>
                                            <td className="px-5 py-5">
                                                <Progress value={p.progress} />
                                            </td>
                                            <td className="px-5 py-5">
                                                <ProjectActions project={p} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <ProjectPaginationControls projects={projects} />
                </section>
            </div>
        </>
    );
}
