import { Suspense } from 'react';
import { LoadingState } from '@/components/loading-state';
import RoleGateway from '@/helper/role-gateway';
import SignoutSuperadmin from './superadmin';
import SignoutUser from './user';

export default async function SignoutPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SignoutUser />
        </Suspense>
    );
}
