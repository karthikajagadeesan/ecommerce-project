import React from 'react';
import { headers } from "next/headers";
import DomainFinder from './domin-finder';
import ErrorState from '@/components/error-state';

export default async function RoleGateway({
    superadmin,
    user,
    fallback = <ErrorState title="Unauthorized" description="You do not have permission to access this page" />
}: {
    superadmin?: React.ReactNode,
    user?: React.ReactNode,
    fallback?: React.ReactNode
}) {
    // Get hostname from headers for subdomain detection
    const hostname = (await headers()).get("host") || "";
    const subdomain = DomainFinder(hostname);

    if (subdomain === "superadmin" && superadmin) {
        return <>{superadmin}</>;
    }
    
    if (subdomain === "user" && user) {
        return <>{user}</>;
    }
    
    return <>{fallback}</>;
}
