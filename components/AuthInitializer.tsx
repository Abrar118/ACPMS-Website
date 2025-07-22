// This component is no longer needed as we're using server actions
// and server-side authentication instead of client-side state management
export function AuthInitializer({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
