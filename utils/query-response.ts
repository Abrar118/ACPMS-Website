export type QueryResponseType<T> = {
    success: boolean;
    data: T | null;
    error: string | null;
}

export class QueryResponse {
    static success<T>(data: T): QueryResponseType<T> {
        return { success: true, data, error: null };
    }

    static error(error: string): QueryResponseType<null> {
        return { success: false, data: null, error };
    }
}