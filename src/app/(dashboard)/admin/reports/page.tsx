"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LucideFileText, LucideDownload, LucideUsers, LucideShoppingCart, LucideDollarSign, LucidePackage, LucideFileSpreadsheet, LucideFile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type ReportType = "sales" | "workers" | "payments" | "products" | "commission" | "inventory";
type ExportFormat = "csv" | "xlsx" | "pdf";

const reportTypes = [
  {
    type: "sales" as ReportType,
    title: "Sales Report",
    description: "Sales transactions with worker, customer, and product details",
    icon: LucideShoppingCart,
    fields: ["Sale ID", "Date", "Worker", "Customer", "Products", "Total Amount", "Commission", "Status"]
  },
  {
    type: "workers" as ReportType,
    title: "Workers Report",
    description: "Worker details including performance and commission",
    icon: LucideUsers,
    fields: ["Worker ID", "Name", "Email", "Department", "Total Sales", "Total Commission", "Status"]
  },
  {
    type: "payments" as ReportType,
    title: "Payments Report",
    description: "Payment history with amounts and payment methods",
    icon: LucideDollarSign,
    fields: ["Payment ID", "Date", "Worker", "Amount", "Method", "Reference", "Status"]
  },
  {
    type: "products" as ReportType,
    title: "Products Report",
    description: "Product inventory with stock levels and pricing",
    icon: LucidePackage,
    fields: ["SKU", "Name", "Category", "Cost Price", "Selling Price", "Stock", "Status"]
  },
  {
    type: "commission" as ReportType,
    title: "Commission Report",
    description: "Commission calculations and payment status",
    icon: LucideDollarSign,
    fields: ["Worker ID", "Worker Name", "Period", "Sales Amount", "Commission Rate", "Commission Amount", "Paid Status"]
  },
  {
    type: "inventory" as ReportType,
    title: "Inventory Report",
    description: "Stock movements and inventory valuation",
    icon: LucidePackage,
    fields: ["SKU", "Product", "Variant", "Current Stock", "Reorder Level", "Status"]
  }
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);

  const currentReport = reportTypes.find(r => r.type === selectedReport)!;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let endpoint = "";
      switch (selectedReport) {
        case "sales":
          endpoint = "/api/reports/sales";
          break;
        case "workers":
          endpoint = "/api/reports/workers";
          break;
        case "payments":
          endpoint = "/api/reports/payments";
          break;
        case "products":
          endpoint = "/api/reports/products";
          break;
        case "commission":
          endpoint = "/api/reports/commission";
          break;
        case "inventory":
          endpoint = "/api/reports/inventory";
          break;
      }

      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      params.append("format", exportFormat);

      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedReport}-report-${formatDate(new Date(), "date").replace(/\s/g, "-")}.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and export detailed reports for your business
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Type Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Select Report Type</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.type}
                      onClick={() => setSelectedReport(report.type)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedReport === report.type
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${selectedReport === report.type ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon size={20} className={selectedReport === report.type ? "text-primary" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Filters */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Export Options</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="flex gap-2">
                    {(["csv", "xlsx", "pdf"] as ExportFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                          exportFormat === format
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {format === "csv" && <LucideFileSpreadsheet size={20} />}
                        {format === "xlsx" && <LucideFileSpreadsheet size={20} />}
                        {format === "pdf" && <LucideFile size={20} />}
                        <span className="text-sm font-medium uppercase">{format}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Report Fields</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentReport.fields.map((field) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-muted rounded text-xs"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    "Exporting..."
                  ) : (
                    <>
                      <LucideDownload size={18} className="mr-2" />
                      Export Report
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Quick Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Report Format</span>
                  <span className="font-medium uppercase">{exportFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Range</span>
                  <span className="font-medium">
                    {dateFrom && dateTo ? `${formatDate(dateFrom, "date")} - ${formatDate(dateTo, "date")}` : "All Time"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Report Type</span>
                  <span className="font-medium">{currentReport.title}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}