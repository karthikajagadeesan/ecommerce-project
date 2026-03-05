import { Suspense } from "react"
import { RoleGateway } from "@/helper/role-gateway"
import { LoadingState } from "@/components/loading-state"
import UserLogin from "./user"
import SuperAdminLogin from "./superadmin"

export default async function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<LoadingState />}>
        <RoleGateway 
          user={<UserLogin />}
          superadmin={<SuperAdminLogin />}
        />
      </Suspense>
    </div>
  )
}
