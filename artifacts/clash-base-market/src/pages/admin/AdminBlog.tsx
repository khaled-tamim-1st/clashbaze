import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
  type BlogPostInput,
  type BlogPostUpdate,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  game: string;
};

const emptyForm: FormData = { title: "", slug: "", content: "", coverImage: "", seoTitle: "", seoDescription: "", game: "" };

function toSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").substring(0, 60);
}

function postToForm(p: BlogPost): FormData {
  return {
    title: p.title, slug: p.slug, content: p.content,
    coverImage: p.coverImage ?? "", seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "", game: p.game ?? "",
  };
}

function formToInput(f: FormData): BlogPostInput {
  return {
    title: f.title, slug: f.slug, content: f.content,
    coverImage: f.coverImage || null, seoTitle: f.seoTitle || null,
    seoDescription: f.seoDescription || null, game: f.game || null,
  };
}

function formToUpdate(f: FormData): BlogPostUpdate {
  return formToInput(f) as BlogPostUpdate;
}

export default function AdminBlog() {
  const { data: posts, isLoading, refetch } = useListBlogPosts();
  const { toast } = useToast();

  const createMut = useMutation({ mutationFn: (data: BlogPostInput) => createBlogPost(data) });
  const updateMut = useMutation({ mutationFn: ({ slug, data }: { slug: string; data: BlogPostUpdate }) => updateBlogPost(slug, data) });
  const deleteMut = useMutation({ mutationFn: (slug: string) => deleteBlogPost(slug) });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: BlogPost) => { setEditTarget(p); setForm(postToForm(p)); setDialogOpen(true); };
  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ slug: editTarget.slug, data: formToUpdate(form) });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await createMut.mutateAsync(formToInput(form));
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setDialogOpen(false);
      refetch();
    } catch {
      toast({ title: "حدث خطأ، يرجى المحاولة مجدداً", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.slug);
      toast({ title: "تم الحذف بنجاح" });
      setDeleteTarget(null);
      refetch();
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">إدارة المدونة</h1>
          <Button onClick={openCreate}>+ إضافة مقال</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : !posts?.length ? (
          <div className="text-center py-20 text-muted-foreground">لا توجد مقالات بعد</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 font-medium">العنوان</th>
                  <th className="text-right p-3 font-medium hidden sm:table-cell">اللعبة</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">التاريخ</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {p.game === "clash-of-clans" ? "CoC" : p.game === "clash-royale" ? "CR" : "عام"}
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>تعديل</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(p)}>حذف</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editTarget ? "تعديل المقال" : "إضافة مقال جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>عنوان المقال *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => { set("title", e.target.value); if (!editTarget) set("slug", toSlug(e.target.value)); }}
                    required placeholder="دليل كلاش أوف كلانس..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required dir="ltr" placeholder="clash-guide-..." />
                </div>
                <div className="space-y-2">
                  <Label>اللعبة</Label>
                  <Select value={form.game || "all"} onValueChange={(v) => set("game", v === "all" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="اختر اللعبة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">عام</SelectItem>
                      <SelectItem value="clash-of-clans">كلاش أوف كلانس</SelectItem>
                      <SelectItem value="clash-royale">كلاش رويال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>المحتوى *</Label>
                <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} required rows={8} placeholder="اكتب محتوى المقال هنا..." />
              </div>
              <div className="space-y-2">
                <Label>رابط صورة الغلاف</Label>
                <Input value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} dir="ltr" placeholder="https://res.cloudinary.com/..." />
              </div>
              <div className="space-y-2">
                <Label>عنوان SEO</Label>
                <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="العنوان الذي يظهر في محركات البحث" />
              </div>
              <div className="space-y-2">
                <Label>وصف SEO</Label>
                <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} placeholder="وصف مختصر لمحركات البحث (150-160 حرف)" />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {editTarget ? "حفظ التعديلات" : "نشر المقال"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>حذف المقال</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف "{deleteTarget?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}
