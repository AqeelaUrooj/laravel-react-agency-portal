import { Head } from '@inertiajs/react';
import ProjectForm from '@/components/projects/project-form';
import type { Project, ProjectOptions } from '@/types/project';
export default function Page(
    props: ProjectOptions & {
        project?: Project;
        selectedClient?: number | null;
    },
) {
    return (
        <>
            <Head title="Edit project" />
            <div className="portal-page mx-auto max-w-4xl">
                <div>
                    <p className="portal-eyebrow">PROJECT WORKSPACE</p>
                    <h1 className="portal-title">Edit project</h1>
                    <p className="mt-2 text-muted-foreground">
                        Bring the scope, schedule and next milestone together.
                    </p>
                </div>
                <ProjectForm {...props} />
            </div>
        </>
    );
}
