import { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import {
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Users,
  Eye,
  ShoppingBag,
  Share2,
  Calendar,
  Search,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface OverviewData {
  totalClicks: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  uniqueClicks: number;
  humanClicks: number;
  botClicks: number;
  suspiciousClicks: number;
  topProduct: { id: number; title: string; clicks: number } | null;
  topSource: { source: string; clicks: number } | null;
  topCta: { ctaId: string; clicks: number } | null;
}

interface TimeseriesPoint {
  bucket: string;
  displayLabel: string;
  clicks: number;
  uniqueVisitors: number;
  uniqueSessions: number;
}

interface CtaStat {
  ctaId: string;
  label: string;
  clicks: number;
  uniqueSessions: number;
  uniqueVisitors: number;
  share: number;
}

interface ProductStat {
  accountId: number;
  title: string;
  game: string;
  townHall: number | null;
  price: string;
  clicks: number;
  uniqueClickers: number;
}

interface PageStat {
  sourcePage: string;
  clicks: number;
  uniqueClickers: number;
}

interface SourceStat {
  source: string;
  medium: string;
  campaign: string;
  clicks: number;
  uniqueVisitors: number;
}

interface DeviceStat {
  devices: {
    mobile: { clicks: number; percentage: number };
    tablet: { clicks: number; percentage: number };
    desktop: { clicks: number; percentage: number };
  };
  browsers: Array<{ browser: string; clicks: number }>;
  operatingSystems: Array<{ os: string; clicks: number }>;
  total: number;
}

interface HourlyStat {
  hourly: Array<{ hour: string; clicks: number }>;
  weekdayClicks: number;
  weekendClicks: number;
}

interface EventRow {
  id: number;
  createdAt: string;
  ctaId: string;
  accountId: number | null;
  accountTitle: string | null;
  accountGame: string | null;
  sourcePage: string | null;
  sourcePath: string | null;
  utmSource: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  country: string | null;
  trafficType: string;
  sessionId: string;
  isUniqueClick: boolean;
}

interface EventsResponse {
  events: EventRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function WhatsAppAnalytics() {
  const { toast } = useToast();
  const [range, setRange] = useState<string>("7d");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [chartMetric, setChartMetric] = useState<"clicks" | "uniqueVisitors" | "uniqueSessions">("clicks");
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  // Configurable sorting for product attribution table
  const [productSortBy, setProductSortBy] = useState<"clicks" | "uniqueClickers" | "price" | "townHall">("clicks");
  const [productSortOrder, setProductSortOrder] = useState<"asc" | "desc">("desc");

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [ctas, setCtas] = useState<CtaStat[]>([]);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [sources, setSources] = useState<SourceStat[]>([]);
  const [devices, setDevices] = useState<DeviceStat | null>(null);
  const [hourly, setHourly] = useState<HourlyStat | null>(null);

  // Events Table state
  const [eventsData, setEventsData] = useState<EventsResponse | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>("");
  const [filterCta, setFilterCta] = useState<string>("all");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterTraffic, setFilterTraffic] = useState<string>("all");

  const buildDateQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("range", range);
    if (range === "custom") {
      if (customStartDate) params.set("startDate", customStartDate);
      if (customEndDate) params.set("endDate", customEndDate);
    }
    return params.toString();
  }, [range, customStartDate, customEndDate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildDateQueryString();
      const [
        overviewRes,
        timeseriesRes,
        ctasRes,
        productsRes,
        pagesRes,
        sourcesRes,
        devicesRes,
        hourlyRes,
      ] = await Promise.all([
        customFetch<OverviewData>(`/api/admin/whatsapp/overview?${q}`),
        customFetch<{ points: TimeseriesPoint[] }>(`/api/admin/whatsapp/timeseries?${q}`),
        customFetch<{ ctas: CtaStat[] }>(`/api/admin/whatsapp/ctas?${q}`),
        customFetch<{ products: ProductStat[] }>(`/api/admin/whatsapp/products?${q}`),
        customFetch<{ pages: PageStat[] }>(`/api/admin/whatsapp/pages?${q}`),
        customFetch<{ sources: SourceStat[] }>(`/api/admin/whatsapp/sources?${q}`),
        customFetch<DeviceStat>(`/api/admin/whatsapp/devices?${q}`),
        customFetch<HourlyStat>(`/api/admin/whatsapp/hourly?${q}`),
      ]);

      setOverview(overviewRes);
      setTimeseries(timeseriesRes.points || []);
      setCtas(ctasRes.ctas || []);
      setProducts(productsRes.products || []);
      setPages(pagesRes.pages || []);
      setSources(sourcesRes.sources || []);
      setDevices(devicesRes);
      setHourly(hourlyRes);
    } catch (err: any) {
      toast({
        title: "خطأ في تحميل التحليلات",
        description: err?.message || "تعذر جلب بيانات التحليلات من الخادم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [buildDateQueryString, toast]);

  const loadEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (range === "custom") {
        if (customStartDate) params.set("startDate", customStartDate);
        if (customEndDate) params.set("endDate", customEndDate);
      }
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (filterCta !== "all") params.set("ctaId", filterCta);
      if (filterDevice !== "all") params.set("deviceType", filterDevice);
      if (filterTraffic !== "all") params.set("trafficType", filterTraffic);

      const res = await customFetch<EventsResponse>(`/api/admin/whatsapp/events?${params.toString()}`);
      setEventsData(res);
    } catch (err: any) {
      console.error("Failed to load events", err);
    }
  }, [range, customStartDate, customEndDate, page, limit, search, filterCta, filterDevice, filterTraffic]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const q = buildDateQueryString();
      const blob = await customFetch<Blob>(`/api/admin/whatsapp/export?${q}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatsapp-clicks-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير التقرير",
        description: "تم تنزيل ملف CSV بنجاح.",
      });
    } catch (err: any) {
      toast({
        title: "فشل التصدير",
        description: err?.message || "تعذر تنزيل ملف CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const toggleProductSort = (column: "clicks" | "uniqueClickers" | "price" | "townHall") => {
    if (productSortBy === column) {
      setProductSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setProductSortBy(column);
      setProductSortOrder("desc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (productSortBy === "clicks") {
      valA = a.clicks;
      valB = b.clicks;
    } else if (productSortBy === "uniqueClickers") {
      valA = a.uniqueClickers;
      valB = b.uniqueClickers;
    } else if (productSortBy === "price") {
      valA = Number(a.price) || 0;
      valB = Number(b.price) || 0;
    } else if (productSortBy === "townHall") {
      valA = a.townHall || 0;
      valB = b.townHall || 0;
    }
    return productSortOrder === "asc" ? valA - valB : valB - valA;
  });


  const humanRate = overview && overview.totalClicks > 0
    ? Math.round((overview.humanClicks / overview.totalClicks) * 100)
    : 100;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6 pb-12">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <span>تحليلات الواتساب</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  Live Click Tracking
                </Badge>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                تتبع شامل لضغطات أزرار وروابط الواتساب، مصادر الزيارات، ونسب التحويل إلى محادثات
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Range Selector */}
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                <Select value={range} onValueChange={(val) => { setRange(val); setPage(1); }}>
                  <SelectTrigger className="w-[140px] h-8 border-none bg-transparent focus:ring-0">
                    <SelectValue placeholder="الفترة" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="yesterday">أمس</SelectItem>
                    <SelectItem value="7d">آخر 7 أيام</SelectItem>
                    <SelectItem value="30d">آخر 30 يوماً</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                    <SelectItem value="last_month">الشهر الماضي</SelectItem>
                    <SelectItem value="all">كل الأوقات</SelectItem>
                    <SelectItem value="custom">فترة مخصصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range Inputs */}
              {range === "custom" && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1">
                  <span className="text-xs text-muted-foreground">من:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-xs text-foreground focus:outline-none border-b border-border/50"
                  />
                  <span className="text-xs text-muted-foreground">إلى:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-transparent text-xs text-foreground focus:outline-none border-b border-border/50"
                  />
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { loadData(); loadEvents(); }}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>تحديث</span>
              </Button>

              {/* CSV Export Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleExportCsv}
                disabled={exporting}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? "جاري التصدير..." : "تصدير CSV"}</span>
              </Button>
            </div>
          </div>

          {/* 1. Top KPI Overview Cards (6 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي الضغطات</CardTitle>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-foreground">
                  {loading ? "..." : (overview?.totalClicks ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="font-semibold text-emerald-500">{(overview?.uniqueClicks ?? 0).toLocaleString()}</span>
                  <span>نقرة فريدة</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">الزوار الفريدون</CardTitle>
                <Users className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-foreground">
                  {loading ? "..." : (overview?.uniqueVisitors ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  زوار مختلفين
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">الجلسات الفريدة</CardTitle>
                <Eye className="w-4 h-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-foreground">
                  {loading ? "..." : (overview?.uniqueSessions ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  جلسة تصفح ضغطت
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">معدل التحويل للنقر</CardTitle>
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-foreground">
                  {loading
                    ? "..."
                    : overview && overview.totalClicks > 0
                    ? `${Math.round((overview.uniqueClicks / overview.totalClicks) * 100)}%`
                    : "100%"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  نقرات غير مكررة
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">المنتج الأكثر طلباً</CardTitle>
                <ShoppingBag className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-foreground truncate" title={overview?.topProduct?.title || "لا توجد نقرات"}>
                  {loading ? "..." : overview?.topProduct?.title || "—"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {overview?.topProduct ? `${overview.topProduct.clicks} ضغطة` : "لا توجد بيانات"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">أفضل مصدر زيارات</CardTitle>
                <Share2 className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-foreground truncate">
                  {loading ? "..." : overview?.topSource?.source || "Direct / مباشر"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{humanRate}% حقيقي</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Main Timeseries Chart */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
              <div>
                <CardTitle className="text-lg font-bold">الضغطات عبر الوقت</CardTitle>
                <CardDescription>معدل النقر اليومي والزوار الفريدون خلال الفترة المختارة</CardDescription>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start sm:self-auto">
                <Button
                  variant={chartMetric === "clicks" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setChartMetric("clicks")}
                >
                  إجمالي الضغطات
                </Button>
                <Button
                  variant={chartMetric === "uniqueVisitors" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setChartMetric("uniqueVisitors")}
                >
                  الزوار الفريدون
                </Button>
                <Button
                  variant={chartMetric === "uniqueSessions" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setChartMetric("uniqueSessions")}
                >
                  الجلسات
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground">
                  جاري تحميل الرسم البياني...
                </div>
              ) : timeseries.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات مسجلة في هذا النطاق الزمني
                </div>
              ) : (
                <div className="h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="displayLabel" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={chartMetric}
                        name={chartMetric === "clicks" ? "الضغطات" : chartMetric === "uniqueVisitors" ? "زوار فريدون" : "الجلسات"}
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#clickGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. CTA Performance & Device Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CTA Performance Table (2 cols) */}
            <Card className="lg:col-span-2 border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>أداء مواضع الأزرار (CTA Performance)</span>
                  <Badge variant="secondary" className="text-xs">
                    {ctas.length} مواضع نشطة
                  </Badge>
                </CardTitle>
                <CardDescription>أي مكان في الموقع يجلب أكبر عدد من محادثات الواتساب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="pb-2 text-right">الموضع (Placement)</th>
                        <th className="pb-2 text-center">الضغطات</th>
                        <th className="pb-2 text-center">جلسات فريدة</th>
                        <th className="pb-2 text-left">الحصة %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {ctas.map((c) => (
                        <tr key={c.ctaId} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 font-medium text-foreground">
                            <div>{c.label}</div>
                            <span className="text-[11px] text-muted-foreground font-mono">{c.ctaId}</span>
                          </td>
                          <td className="py-2.5 text-center font-bold text-emerald-500">{c.clicks}</td>
                          <td className="py-2.5 text-center text-muted-foreground">{c.uniqueSessions}</td>
                          <td className="py-2.5 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs font-semibold">{c.share}%</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.share}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {ctas.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-muted-foreground">
                            لا توجد بيانات نقرات مسجلة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown & Peak Hours (1 col) */}
            <Card className="border-border/80 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">توزيع الأجهزة</CardTitle>
                <CardDescription>أنواع أجهزة الزوار الذين ضغطوا على الواتساب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>الجوال (Mobile)</span>
                          </span>
                          <span className="font-bold">{devices.devices.mobile.percentage}% ({devices.devices.mobile.clicks})</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${devices.devices.mobile.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Monitor className="w-3.5 h-3.5 text-blue-500" />
                            <span>الكمبيوتر (Desktop)</span>
                          </span>
                          <span className="font-bold">{devices.devices.desktop.percentage}% ({devices.devices.desktop.clicks})</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${devices.devices.desktop.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Tablet className="w-3.5 h-3.5 text-purple-500" />
                            <span>الأجهزة اللوحية (Tablet)</span>
                          </span>
                          <span className="font-bold">{devices.devices.tablet.percentage}% ({devices.devices.tablet.clicks})</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${devices.devices.tablet.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80">
                      <span className="text-xs font-semibold text-muted-foreground block mb-2">أعلى المتصفحات:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {devices.browsers.slice(0, 5).map((b) => (
                          <Badge key={b.browser} variant="outline" className="text-xs">
                            {b.browser}: {b.clicks}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">جاري التحميل...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 4. Hourly Peak Insights & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Distribution Bar Chart */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>ساعات الذروة (24 ساعة)</span>
                  </span>
                  {hourly && (
                    <span className="text-xs text-muted-foreground">
                      وسط الأسبوع: {hourly.weekdayClicks} | عطلة الأسبوع: {hourly.weekendClicks}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>أكثر الساعات التي يضغط فيها العملاء على الواتساب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourly?.hourly || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="hour" stroke="#888888" fontSize={10} interval={2} />
                      <YAxis stroke="#888888" fontSize={10} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="clicks" name="الضغطات" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources & Campaigns */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">مصادر الزيارات والحملات (UTM)</CardTitle>
                <CardDescription>من أين يأتي الزوار الذين يقررون التواصل عبر الواتساب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="pb-2 text-right">المصدر (Source)</th>
                        <th className="pb-2 text-right">الحملة (Campaign)</th>
                        <th className="pb-2 text-center">الضغطات</th>
                        <th className="pb-2 text-center">زوار فريدون</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {sources.slice(0, 7).map((s, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="py-2 font-medium text-foreground">{s.source}</td>
                          <td className="py-2 text-xs text-muted-foreground font-mono">{s.campaign}</td>
                          <td className="py-2 text-center font-bold text-emerald-500">{s.clicks}</td>
                          <td className="py-2 text-center text-muted-foreground">{s.uniqueVisitors}</td>
                        </tr>
                      ))}
                      {sources.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-muted-foreground">
                            لا توجد مصادر مسجلة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5. Product Attribution Table (Configurable Sorting) */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>أكثر المنتجات توليداً للمحادثات (Product Attribution)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{products.length} حساب تم النقر عليه</span>
                  <Badge variant="outline" className="text-xs">
                    مرتب حسب: {productSortBy === "clicks" ? "الضغطات" : productSortBy === "uniqueClickers" ? "الزوار الفريدين" : productSortBy === "price" ? "السعر" : "التاون هول"} ({productSortOrder === "desc" ? "تنازلي" : "تصاعدي"})
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>ربط دقيق بين كل ضغطة واتساب والحساب المعني وسعره وتاون هول (اضغط على رأس العمود للترتيب)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs select-none">
                      <th className="pb-2 text-right">المنتج / الحساب</th>
                      <th className="pb-2 text-center">اللعبة</th>
                      <th
                        className="pb-2 text-center cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => toggleProductSort("townHall")}
                        title="ترتيب حسب التاون هول"
                      >
                        التاون / الساحة {productSortBy === "townHall" && (productSortOrder === "desc" ? "▼" : "▲")}
                      </th>
                      <th
                        className="pb-2 text-center cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => toggleProductSort("price")}
                        title="ترتيب حسب السعر"
                      >
                        السعر {productSortBy === "price" && (productSortOrder === "desc" ? "▼" : "▲")}
                      </th>
                      <th
                        className="pb-2 text-center cursor-pointer hover:text-foreground transition-colors text-emerald-500 font-bold"
                        onClick={() => toggleProductSort("clicks")}
                        title="ترتيب حسب عدد الضغطات"
                      >
                        الضغطات {productSortBy === "clicks" && (productSortOrder === "desc" ? "▼" : "▲")}
                      </th>
                      <th
                        className="pb-2 text-center cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => toggleProductSort("uniqueClickers")}
                        title="ترتيب حسب الزوار الفريدين"
                      >
                        زوار فريدون {productSortBy === "uniqueClickers" && (productSortOrder === "desc" ? "▼" : "▲")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {sortedProducts.map((p) => (
                      <tr key={p.accountId} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium text-foreground">
                          <div>{p.title}</div>
                          <span className="text-[11px] text-muted-foreground font-mono">ID: #{p.accountId}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge variant="outline" className="text-xs">
                            {p.game === "clash-of-clans" ? "كلاش أوف كلانس" : "كلاش رويال"}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-center text-muted-foreground">
                          {p.townHall ? `TH ${p.townHall}` : "—"}
                        </td>
                        <td className="py-2.5 text-center font-bold text-foreground">
                          {p.price ? `${Number(p.price).toLocaleString("ar-SA")} ر.س` : "—"}
                        </td>
                        <td className="py-2.5 text-center font-bold text-emerald-500">{p.clicks}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{p.uniqueClickers}</td>
                      </tr>
                    ))}
                    {sortedProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-muted-foreground">
                          لا توجد ضغطات على منتجات حتى الآن
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 6. Page Performance Table (Requirement 22) */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>أداء الصفحات المصدر (Page Performance)</span>
                <span className="text-xs text-muted-foreground">{pages.length} صفحة مسجلة</span>
              </CardTitle>
              <CardDescription>أي صفحات الموقع تولد أعلى اهتمام بالتواصل عبر الواتساب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="pb-2 text-right">الصفحة المصدر (Source Page)</th>
                      <th className="pb-2 text-center">الضغطات الإجمالية</th>
                      <th className="pb-2 text-center">الزوار الفريدون</th>
                      <th className="pb-2 text-left">معدل الاهتمام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pages.map((pg, idx) => {
                      const totalPageClicks = pages.reduce((acc, curr) => acc + curr.clicks, 0);
                      const share = totalPageClicks > 0 ? Math.round((pg.clicks / totalPageClicks) * 100) : 0;
                      return (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 font-mono text-xs text-foreground max-w-[300px] truncate" title={pg.sourcePage}>
                            {pg.sourcePage}
                          </td>
                          <td className="py-2.5 text-center font-bold text-emerald-500">{pg.clicks}</td>
                          <td className="py-2.5 text-center text-muted-foreground">{pg.uniqueClickers}</td>
                          <td className="py-2.5 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs font-semibold">{share}%</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${share}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pages.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-muted-foreground">
                          لا توجد صفحات مسجلة حتى الآن
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 6. Recent Realtime / Log Events with Server-Side Filter & Pagination */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span>سجل النقرات اللحظي (Recent Clicks Log)</span>
                <span className="text-xs font-normal text-muted-foreground">
                  إجمالي النتائج: {eventsData?.pagination.total ?? 0}
                </span>
              </CardTitle>
              <CardDescription>عرض تفصيلي لكل حدث ضغطة واتساب مع بيانات الجهاز والمصدر والصفحة</CardDescription>

              {/* Table Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5" />
                  <Input
                    placeholder="بحث بالحساب، الصفحة، أو المصدر..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pr-9 h-9 text-xs"
                  />
                </div>

                <Select value={filterCta} onValueChange={(v) => { setFilterCta(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="الموضع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المواضع</SelectItem>
                    <SelectItem value="product_card">بطاقة المنتج</SelectItem>
                    <SelectItem value="product_detail">صفحة المنتج</SelectItem>
                    <SelectItem value="product_detail_ssr">صفحة المنتج (SSR)</SelectItem>
                    <SelectItem value="footer_contact">الفوتر</SelectItem>
                    <SelectItem value="about_contact">من نحن</SelectItem>
                    <SelectItem value="how_it_works_contact">طريقة الشراء</SelectItem>
                    <SelectItem value="coc_hub_contact">قسم CoC</SelectItem>
                    <SelectItem value="cr_hub_contact">قسم CR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDevice} onValueChange={(v) => { setFilterDevice(v); setPage(1); }}>
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue placeholder="الجهاز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأجهزة</SelectItem>
                    <SelectItem value="mobile">الجوال</SelectItem>
                    <SelectItem value="desktop">الكمبيوتر</SelectItem>
                    <SelectItem value="tablet">التابلت</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterTraffic} onValueChange={(v) => { setFilterTraffic(v); setPage(1); }}>
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue placeholder="نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="human">بشري</SelectItem>
                    <SelectItem value="bot">بوت</SelectItem>
                    <SelectItem value="suspicious">مشبوه</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-[100px] h-9 text-xs">
                    <SelectValue placeholder="العدد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 / صفحة</SelectItem>
                    <SelectItem value="50">50 / صفحة</SelectItem>
                    <SelectItem value="100">100 / صفحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-2 text-right">التاريخ والوقت</th>
                      <th className="pb-2 text-right">المنتج المعني</th>
                      <th className="pb-2 text-right">الصفحة المصدر</th>
                      <th className="pb-2 text-center">الموضع (CTA)</th>
                      <th className="pb-2 text-center">الجهاز / النظام</th>
                      <th className="pb-2 text-center">المصدر</th>
                      <th className="pb-2 text-center">الدولة</th>
                      <th className="pb-2 text-center">نوع الزيارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {eventsData?.events.map((e) => {
                      const dateFormatted = new Date(e.createdAt).toLocaleString("ar-SA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={e.id} className="hover:bg-muted/20">
                          <td className="py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {dateFormatted}
                          </td>
                          <td className="py-2.5 font-medium text-foreground max-w-[180px] truncate">
                            {e.accountTitle || <span className="text-muted-foreground">تواصل عام</span>}
                          </td>
                          <td className="py-2.5 text-muted-foreground font-mono max-w-[150px] truncate" title={e.sourcePage || ""}>
                            {e.sourcePath || e.sourcePage || "—"}
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {e.ctaId}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-center text-muted-foreground">
                            {e.deviceType} • {e.browser || "Browser"}
                          </td>
                          <td className="py-2.5 text-center font-medium">
                            {e.utmSource || "Direct"}
                          </td>
                          <td className="py-2.5 text-center">
                            {e.country || "—"}
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge
                              className={
                                e.trafficType === "human"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : e.trafficType === "bot"
                                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }
                            >
                              {e.trafficType === "human" ? "بشري" : e.trafficType === "bot" ? "بوت" : "مشبوه"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {(!eventsData || eventsData.events.length === 0) && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          لا توجد أحداث مطابقة لشروط الفلترة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {eventsData && eventsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs text-muted-foreground">
                  <div>
                    صفحة {eventsData.pagination.page} من {eventsData.pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="h-8 px-3"
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(eventsData.pagination.totalPages, p + 1))}
                      disabled={page >= eventsData.pagination.totalPages}
                      className="h-8 px-3"
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
