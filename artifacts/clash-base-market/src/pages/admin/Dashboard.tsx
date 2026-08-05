import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAccountStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAccountStats();

  return (
    <AdminGuard>
      <AdminLayout>
        <h1 className="text-3xl font-bold mb-8">نظرة عامة</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الحسابات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalAccounts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">حسابات كلاش أوف كلانز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.cocAccounts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">حسابات كلاش رويال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.crAccounts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">الحسابات المتاحة للبيع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.availableAccounts}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </AdminLayout>
    </AdminGuard>
  );
}
