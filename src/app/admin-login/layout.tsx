import { ReactNode } from 'react'

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
    return (
        <div className="admin-login-layout">
            {children}
        </div>
    )
}
