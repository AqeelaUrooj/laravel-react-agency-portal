export type ClientStatus = 'active' | 'inactive' | 'lead';
export type Client = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    status: ClientStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
};
export type Metrics = Record<'total' | ClientStatus, number>;
export type ClientPagination = {
    data: Client[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};
