import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
  type AccountInput,
  type AccountUpdate,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  title: string;
  slug: string;
  game: string;
  price: string;
  oldPrice: string;
  description: string;
  status: string;
  townHall: string;
  arena: string;
  level: string;
  whatsappMessage: string;
  featured: boolean;
  images: string;
};

const emptyForm: FormData = {
  title: "", slug: "", game: "clash-of-clans", price: "", oldPrice: "",
  description: "", status: "available", townHall: "", arena: "", level: "",
  whatsappMessage: "", featured: false, images: "",
};

function toSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").substring(0, 60);
}

function accountToForm(a: Account): FormData {
  return {
    title: a.title, slug: a.slug, game: a.game,
    price: String(a.price), oldPrice: a.oldPrice != null ? String(a.oldPrice) : "",
    description: a.description ?? "", status: a.status,
    townHall: a.townHall != null ? String(a.townHall) : "",
    arena: a.arena ?? "",
    level: a.league ?? "",
    whatsappMessage: a.whatsappMessage ?? "", featured: a.featured ?? false,
    images: (a.images ?? []).join("\n"),
  };
}

function formToInput(f: FormData): AccountInput {
  return {
    title: f.title, slug: f.slug,
    game: f.game as AccountInput["game"],
    price: parseFloat(f.price),
    oldPrice: f.oldPrice ? parseFloat(f.oldPrice) : null,
    description: f.description || null,
    status: f.status as AccountInput["status"],
    townHall: f.game === "clash-of-clans" && f.townHall ? parseInt(f.townHall) : null,
    arena: f.game === "clash-royale" && f.arena ? f.arena : null,
    league: f.level || null,
    whatsappMessage: f.whatsappMessage || null, featured: f.featured,
    images: f.images ? f.images.split("\n").map((s) => s.trim()).filter(Boolean) : [],
  };
}

function formToUpdate(f: FormData): AccountUpdate {
  return formToInput(f) as AccountUpdate;
}

const statusLabel: Record<string, string> = { available: "متاح", reserved: "محجوز", sold: "مباع" };
const statusColor: Record<string, string> = { available: "bg-green-500", reserved: "bg-yellow-500", sold: "bg-red-500" };

export default function AdminAccounts() {
  const { data: accounts, isLoading, refetch } = useListAccounts();
  const { toast } = useToast();

  const createMut = useMutation({ mutationFn: (data: AccountInput) => createAccount(data) });
  const updateMut = useMutation({ mutationFn: ({ slug, data }: { slug: string; data: AccountUpdate }) => updateAccount(slug, data) });
  const deleteMut = useMutation({ mutationFn: (slug: string) => deleteAccount(slug) });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: Account) => { setEditTarget(a); setForm(accountToForm(a)); setDialogOpen(true); };
  const set = (key: keyof FormData, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

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
          <h1 className="text-2xl font-bold">إدارة الحسابات</h1>
          <Button onClick={openCreate}>+ إضافة حساب</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : !accounts?.length ? (
          <div className="text-center py-20 text-muted-foreground">لا توجد حسابات بعد</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 font-medium">الحساب</th>
                  <th className="text-right p-3 font-medium hidden sm:table-cell">اللعبة</th>
                  <th className="text-right p-3 font-medium">السعر</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">الحالة</th>
                  <th className="text-right p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium line-clamp-1">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.slug}</div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {a.game === "clash-of-clans" ? "CoC" : "CR"}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-primary">{a.price.toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge className={`${statusColor[a.status]} text-white text-xs`}>{statusLabel[a.status]}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(a)}>تعديل</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(a)}>حذف</Button>
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
              <DialogTitle>{editTarget ? "تعديل الحساب" : "إضافة حساب جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان الحساب *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => { set("title", e.target.value); if (!editTarget) set("slug", toSlug(e.target.value)); }}
                    required placeholder="حساب كلاش أوف كلانز TH16..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required dir="ltr" placeholder="coc-th16-..." />
                </div>
                <div className="space-y-2">
                  <Label>اللعبة *</Label>
                  <Select value={form.game} onValueChange={(v) => set("game", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clash-of-clans">كلاش أوف كلانز</SelectItem>
                      <SelectItem value="clash-royale">كلاش رويال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحالة *</Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">متاح</SelectItem>
                      <SelectItem value="reserved">محجوز</SelectItem>
                      <SelectItem value="sold">مباع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر (ر.س) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} required min="0" step="0.01" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>السعر القديم (ر.س)</Label>
                  <Input type="number" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} min="0" step="0.01" dir="ltr" />
                </div>

                <div className="space-y-2">
                  <Label>مستوى الحساب</Label>
                  <Input value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="مثال: مستوى 15" />
                </div>

                {form.game === "clash-of-clans" && (
                  <div className="space-y-2"><Label>Town Hall</Label><Input type="number" value={form.townHall} onChange={(e) => set("townHall", e.target.value)} min="1" max="18" dir="ltr" /></div>
                )}

                {form.game === "clash-royale" && (
                  <div className="space-y-2"><Label>الساحة</Label><Input value={form.arena} onChange={(e) => set("arena", e.target.value)} placeholder="مثال: ساحة 15" /></div>
                )}
              </div>

              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="اكتب وصف الحساب بالتفصيل هنا..." />
              </div>
              <div className="space-y-2">
                <Label>روابط الصور (رابط واحد في كل سطر)</Label>
                <Textarea value={form.images} onChange={(e) => set("images", e.target.value)} rows={3} dir="ltr" placeholder="https://res.cloudinary.com/..." />
              </div>
              <div className="space-y-2">
                <Label>رسالة واتساب</Label>
                <Input value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} placeholder="اكتب رسالة مخصصة..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="featured" className="cursor-pointer">حساب مميز (يظهر في الصفحة الرئيسية)</Label>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {editTarget ? "حفظ التعديلات" : "إضافة الحساب"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>حذف الحساب</AlertDialogTitle>
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