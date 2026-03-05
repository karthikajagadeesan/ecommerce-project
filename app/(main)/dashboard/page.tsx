import { Suspense } from 'react';
import SuperadminDashboard from './superadmin';
import UserDashboard from './user';
import { RoleGateway } from '@/helper/role-gateway';
import { LoadingState } from '@/components/loading-state';

export default async function DashboardPage() {
  return (
    <main className="main-page">
      <Suspense fallback={<LoadingState />}>
        <RoleGateway
          superadmin={<SuperadminDashboard />}
          user={<UserDashboard />}
        />
      </Suspense>
    </main>
  );
}
