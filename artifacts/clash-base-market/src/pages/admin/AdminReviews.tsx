import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, Check, X, Trash2 } from "lucide-react";
import { useState } from "react";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  contactInfo: string | null;
  game: string | null;
  screenshotUrl: string | null;
  status: string;
  createdAt: string;
}

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['/api/admin/reviews'],
    queryFn: () => customFetch<Review[]>('/api/admin/reviews'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/reviews/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "تم الاعتماد", description: "تم اعتماد التقييم بنجاح." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء اعتماد التقييم.", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/reviews/${id}/reject`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "تم الرفض", description: "تم رفض التقييم بنجاح." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء رفض التقييم.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "تم الحذف", description: "تم حذف التقييم بنجاح." });
      setDeleteReviewId(null);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حذف التقييم.", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex justify-center items-center h-64">
            <span className="text-muted-foreground">جاري التحميل...</span>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex justify-center items-center h-64">
            <span className="text-destructive">حدث خطأ أثناء جلب التقييمات.</span>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  const allReviews = reviews || [];
  const pendingReviews = allReviews.filter(r => r.status === 'pending');
  const approvedReviews = allReviews.filter(r => r.status === 'approved');

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8 p-4 md:p-8" dir="rtl">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">إدارة التقييمات</h1>
            <p className="text-muted-foreground">
              لديك {pendingReviews.length} تقييمات بانتظار الاعتماد.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">تقييمات بانتظار الاعتماد</h2>
            {pendingReviews.length === 0 ? (
              <p className="text-muted-foreground">لا توجد تقييمات معلقة.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{review.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-foreground text-sm flex-grow whitespace-pre-wrap">{review.comment}</p>
                    {review.contactInfo && (
                      <p className="text-xs text-muted-foreground">للتواصل: {review.contactInfo}</p>
                    )}
                    
                    <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <Check className="ml-2 h-4 w-4" />
                        اعتماد
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <X className="ml-2 h-4 w-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">التقييمات المعتمدة</h2>
            {approvedReviews.length === 0 ? (
              <p className="text-muted-foreground">لا توجد تقييمات معتمدة.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedReviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{review.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-foreground text-sm flex-grow whitespace-pre-wrap">{review.comment}</p>
                    
                    <div className="flex justify-end mt-auto pt-4 border-t border-border">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteReviewId(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AlertDialog open={deleteReviewId !== null} onOpenChange={(open) => !open && setDeleteReviewId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                لا يمكن التراجع عن هذا الإجراء. سيتم حذف التقييم نهائياً.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex sm:justify-start gap-2">
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
              >
                حذف
              </AlertDialogAction>
              <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}
