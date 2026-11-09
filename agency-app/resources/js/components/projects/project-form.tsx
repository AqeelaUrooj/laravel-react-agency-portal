import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/projects';
import { Progress, label } from './shared';
import type {
    Project,
    ProjectOptions,
    ProjectStatus,
    ProjectPriority,
} from '@/types/project';
export default function ProjectForm({
    project,
    selectedClient,
    clients,
    statuses,
    priorities,
    currencies,
}: ProjectOptions & { project?: Project; selectedClient?: number | null }) {
    const form = useForm({
        name: project?.name ?? '',
        project_code: project?.project_code ?? '',
        client_id: String(project?.client_id ?? selectedClient ?? ''),
        description: project?.description ?? '',
        status: project?.status ?? ('planning' as ProjectStatus),
        priority: project?.priority ?? ('medium' as ProjectPriority),
        start_date: project?.start_date ?? '',
        due_date: project?.due_date ?? '',
        budget: project?.budget ?? '',
        currency: project?.currency ?? 'USD',
        progress: project?.progress ?? 0,
    });
    const inputClass =
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
    const sections = [
        {
            title: 'Project information',
            fields: [
                'name',
                'project_code',
                'client_id',
                'description',
                'status',
                'priority',
            ],
        },
        { title: 'Scheduling', fields: ['start_date', 'due_date'] },
        { title: 'Financial information', fields: ['budget', 'currency'] },
        { title: 'Progress', fields: ['progress'] },
    ];
    type Key = keyof typeof form.data;
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (project) form.put(update(project.id).url);
                else form.post(store().url);
            }}
            className="space-y-6"
        >
            {!clients.length && (
                <p role="status" className="portal-card p-5 text-sm">
                    Create a client before adding a project.
                </p>
            )}
            {sections.map((section) => (
                <section key={section.title} className="portal-card p-6 sm:p-8">
                    <h2 className="mb-6 font-semibold">{section.title}</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {section.fields.map((field) => {
                            const key = field as Key;
                            const choices =
                                key === 'client_id'
                                    ? clients.map((c) => ({
                                          value: String(c.id),
                                          title: c.name,
                                      }))
                                    : (key === 'status'
                                          ? statuses
                                          : key === 'priority'
                                            ? priorities
                                            : key === 'currency'
                                              ? currencies
                                              : null
                                      )?.map((v) => ({
                                          value: v,
                                          title:
                                              key === 'currency' ? v : label(v),
                                      }));
                            return (
                                <div
                                    key={key}
                                    className={
                                        key === 'description'
                                            ? 'sm:col-span-2'
                                            : ''
                                    }
                                >
                                    <Label htmlFor={key}>
                                        {key === 'client_id'
                                            ? 'Client'
                                            : key === 'project_code'
                                              ? 'Project code (optional)'
                                              : label(key)}
                                        {[
                                            'name',
                                            'client_id',
                                            'status',
                                            'priority',
                                            'progress',
                                        ].includes(key)
                                            ? ' *'
                                            : ''}
                                    </Label>
                                    <div className="mt-2">
                                        {choices ? (
                                            <select
                                                aria-invalid={
                                                    !!form.errors[key]
                                                }
                                                aria-describedby={
                                                    form.errors[key]
                                                        ? `${key}-error`
                                                        : undefined
                                                }
                                                id={key}
                                                className={inputClass}
                                                value={form.data[key]}
                                                onChange={(e) =>
                                                    form.setData(
                                                        key,
                                                        e.target.value as never,
                                                    )
                                                }
                                                required={key !== 'currency'}
                                            >
                                                <option value="">
                                                    Select {label(key)}
                                                </option>
                                                {choices.map((c) => (
                                                    <option
                                                        key={c.value}
                                                        value={c.value}
                                                    >
                                                        {c.title}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : key === 'description' ? (
                                            <textarea
                                                aria-invalid={
                                                    !!form.errors[key]
                                                }
                                                aria-describedby={
                                                    form.errors[key]
                                                        ? `${key}-error`
                                                        : undefined
                                                }
                                                id={key}
                                                rows={4}
                                                maxLength={10000}
                                                className={inputClass}
                                                value={form.data.description}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <Input
                                                id={key}
                                                type={
                                                    key.includes('date')
                                                        ? 'date'
                                                        : [
                                                                'budget',
                                                                'progress',
                                                            ].includes(key)
                                                          ? 'number'
                                                          : 'text'
                                                }
                                                min={
                                                    [
                                                        'budget',
                                                        'progress',
                                                    ].includes(key)
                                                        ? 0
                                                        : key === 'due_date'
                                                          ? form.data
                                                                .start_date ||
                                                            undefined
                                                          : undefined
                                                }
                                                max={
                                                    key === 'progress'
                                                        ? 100
                                                        : key === 'budget'
                                                          ? 9999999999.99
                                                          : undefined
                                                }
                                                step={
                                                    key === 'budget'
                                                        ? '0.01'
                                                        : key === 'progress'
                                                          ? '1'
                                                          : undefined
                                                }
                                                maxLength={
                                                    key === 'project_code'
                                                        ? 40
                                                        : 255
                                                }
                                                required={[
                                                    'name',
                                                    'progress',
                                                ].includes(key)}
                                                value={form.data[key]}
                                                aria-invalid={
                                                    !!form.errors[key]
                                                }
                                                aria-describedby={
                                                    form.errors[key]
                                                        ? `${key}-error`
                                                        : undefined
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        key,
                                                        (key === 'progress'
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : key ===
                                                                'project_code'
                                                              ? e.target.value.toUpperCase()
                                                              : e.target
                                                                    .value) as never,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                    {form.errors[key] && (
                                        <p
                                            id={`${key}-error`}
                                            role="alert"
                                            className="mt-2 text-sm text-destructive"
                                        >
                                            {form.errors[key]}
                                        </p>
                                    )}
                                    {key === 'project_code' && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Uppercase letters, numbers, dashes
                                            and underscores. Leave blank to
                                            generate a unique code.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {section.title === 'Progress' && (
                        <div className="mt-5">
                            <Progress value={form.data.progress} />
                        </div>
                    )}
                </section>
            ))}
            <div className="flex justify-end gap-3">
                <Button variant="outline" asChild>
                    <Link href={index()}>Cancel</Link>
                </Button>
                <Button
                    disabled={form.processing || !clients.length}
                    type="submit"
                >
                    {form.processing
                        ? 'Saving…'
                        : project
                          ? 'Save changes'
                          : 'Create project'}
                </Button>
            </div>
        </form>
    );
}
