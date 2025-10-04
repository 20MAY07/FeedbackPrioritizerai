import React, { useState, useEffect } from "react";
import { Report } from "@/entities/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export default function ReportsHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await Report.list("-created_date");
    setReports(data);
    setIsLoading(false);
  };

  const downloadReport = (report) => {
    const blob = new Blob([report.report_markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${format(new Date(report.created_date), "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Reports History
          </h1>
          <p className="text-slate-600">
            View and download previously generated reports
          </p>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))
          ) : reports.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No Reports Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Generate your first report to see it here
                </p>
                <Button
                  onClick={() => navigate(createPageUrl("GenerateReport"))}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="border-0 shadow-xl bg-white/90 backdrop-blur hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            Weekly Report
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {report.week_start_date && report.week_end_date ? (
                              <span>
                                {format(new Date(report.week_start_date), "MMM d")} - {format(new Date(report.week_end_date), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span>
                                Generated on {format(new Date(report.created_date), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Total Feedback</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {report.total_feedback_count || 0}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs text-red-600 mb-1">High Urgency</p>
                          <p className="text-2xl font-bold text-red-700">
                            {report.high_urgency_count || 0}
                          </p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <p className="text-xs text-emerald-600 mb-1">Positive</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {report.sentiment_summary?.positive || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                        className="gap-2 flex-1 md:flex-none"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadReport(report)}
                        className="gap-2 flex-1 md:flex-none"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Weekly Report</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{selectedReport.report_markdown}</ReactMarkdown>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}