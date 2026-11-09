import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MoreHorizontal, FolderKanban } from 'lucide-react';
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
import { show, edit, destroy } from '@/routes/projects';
import type {
    Project,
    ProjectMetrics,
    ProjectPagination,
} from '@/types/project';
export const label = (value: string) =>
    value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const projectDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('en', {
              dateStyle: 'medium',
              timeZone: 'UTC',
          }).format(new Date(value))
        : 'Not set';
export function ProjectBadge({ value }: { value: string }) {
    const color =
        value === 'completed'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : ['urgent', 'high', 'cancelled'].includes(value)
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
              : value === 'on_hold'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
        >
            {label(value)}
        </span>
    );
}
export function Progress({ value }: { value: number }) {
    return (
        <div className="min-w-24">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{value}%</span>
            </div>
            <div
                role="progressbar"
                aria-label="Project progress"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 overflow-hidden rounded-full bg-muted"
            >
                <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
export function ProjectMetricCards({ metrics }: { metrics: ProjectMetrics }) {
    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {(['total', 'active', 'completed', 'overdue'] as const).map(
                (key) => (
                    <div key={key} className="portal-card p-5">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{label(key)} Projects</span>
                            <FolderKanban className="size-5 text-indigo-500" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold">
                            {metrics[key].toLocaleString()}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {key === 'active'
                                ? 'Currently in progress'
                                : key === 'overdue'
                                  ? 'Past deadline, still open'
                                  : 'Across your workspace'}
                        </p>
                    </div>
                ),
            )}
        </div>
    );
}
export function ProjectActions({ project }: { project: Project }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${project.name}`}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={show(project.id)}>View project</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={edit(project.id)}>Edit project</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpen(true)}
                        className="text-destructive"
                    >
                        Delete project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog
                open={open}
                onOpenChange={(v) => {
                    if (!busy) setOpen(v);
                }}
            >
                <DialogContent
                    onInteractOutside={(e) => {
                        if (busy) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                        if (busy) e.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Delete {project.name}?</DialogTitle>
                        <DialogDescription>
                            This permanently removes the project. This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={busy}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={busy}
                            onClick={() => {
                                setBusy(true);
                                router.delete(destroy(project.id), {
                                    onSuccess: () => setOpen(false),
                                    onFinish: () => setBusy(false),
                                });
                            }}
                        >
                            {busy ? 'Deleting…' : 'Delete project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
export function ProjectList({ projects }: { projects: Project[] }) {
    return (
        <div className="divide-y">
            {projects.length ? (
                projects.map((project) => (
                    <div
                        key={project.id}
                        className="flex flex-wrap items-center gap-4 p-5"
                    >
                        <Link
                            className="min-w-40 flex-1 font-medium hover:text-primary"
                            href={show(project.id)}
                        >
                            {project.name}
                            <p className="mt-1 text-xs text-muted-foreground">
                                {project.client?.name || project.project_code}
                            </p>
                        </Link>
                        <ProjectBadge value={project.status} />
                        <span className="text-xs text-muted-foreground">
                            {projectDate(project.due_date)}
                        </span>
                        <Progress value={project.progress} />
                    </div>
                ))
            ) : (
                <p className="p-10 text-center text-sm text-muted-foreground">
                    No projects yet. Create a project to get started.
                </p>
            )}
        </div>
    );
}
export function ProjectPaginationControls({
    projects,
}: {
    projects: ProjectPagination;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm text-muted-foreground">
            <span>
                {projects.total} projects · Page {projects.current_page} of{' '}
                {projects.last_page}
            </span>
            <div className="flex gap-2">
                {[
                    ['Previous', projects.prev_page_url],
                    ['Next', projects.next_page_url],
                ].map(([text, url]) =>
                    url ? (
                        <Button key={text} variant="outline" asChild>
                            <Link href={url}>{text}</Link>
                        </Button>
                    ) : (
                        <Button key={text} variant="outline" disabled>
                            {text}
                        </Button>
                    ),
                )}
            </div>
        </div>
    );
}
