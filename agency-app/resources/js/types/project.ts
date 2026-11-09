export type ProjectStatus =
    | 'planning'
    | 'in_progress'
    | 'on_hold'
    | 'completed'
    | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type Project = {
    id: number;
    client_id: number;
    client?: { id: number; name: string };
    name: string;
    project_code: string;
    description: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    budget: string | null;
    currency: string | null;
    progress: number;
    created_at: string;
    updated_at: string;
};
export type ProjectMetrics = Record<
    'total' | 'active' | 'completed' | 'overdue',
    number
>;
export type ProjectPagination = {
    data: Project[];
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type ProjectOptions = {
    clients: { id: number; name: string }[];
    statuses: ProjectStatus[];
    priorities: ProjectPriority[];
    currencies: string[];
};
