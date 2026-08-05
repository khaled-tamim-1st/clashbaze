import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const [, setLocation] = useLocation();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      setLocation(isAdmin ? "/admin" : "/");
    }
  }, [user, loading, isAdmin, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch {
      setLoginError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (regPassword !== regConfirm) {
      setRegError("كلمة المرور غير متطابقة");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setRegLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      setRegSuccess("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setRegError("هذا البريد الإلكتروني مستخدم بالفعل");
      } else if (err.code === "auth/invalid-email") {
        setRegError("البريد الإلكتروني غير صحيح");
      } else {
        setRegError("حدث خطأ، يرجى المحاولة مجدداً");
      }
    } finally {
      setRegLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-1">كلاش ماركت</h1>
          <p className="text-muted-foreground text-sm">سوق حسابات الكلاش الموثوق</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <Tabs defaultValue="login" dir="rtl">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/30 p-3 rounded-lg text-sm text-center">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    className="bg-input"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={loginLoading}>
                  {loginLoading ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/30 p-3 rounded-lg text-sm text-center">
                    {regError}
                  </div>
                )}
                {regSuccess && (
                  <div className="bg-green-500/10 text-green-500 border border-green-500/30 p-3 rounded-lg text-sm text-center">
                    {regSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">كلمة المرور</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="6 أحرف على الأقل"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    className="bg-input"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={regLoading}>
                  {regLoading ? "جاري الإنشاء..." : "إنشاء حساب"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
