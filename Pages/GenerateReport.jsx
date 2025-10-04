import React, { useState, useEffect } from "react";
import { Feedback, Report } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Loader2, Download, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export default function GenerateReport() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date()), "yyyy-MM-dd"),
    end: format(endOfWeek(new Date()), "yyyy-MM-dd")
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);

    try {
      const allFeedback = await Feedback.list("-created_date");
      
      const feedbackInRange = allFeedback.filter(f => {
        const feedbackDate = new Date(f.created_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return feedbackDate >= startDate && feedbackDate <= endDate;
      });

      if (feedbackInRange.length === 0) {
        setGeneratedReport({
          markdown: "# No Feedback Available\n\nNo feedback entries found for the selected date range.",
          stats: { total: 0, highUrgency: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } }
        });
        setIsGenerating(false);
        return;
      }

      const feedbackSummary = feedbackInRange.map(f => ({
        text: f.feedback_text,
        customer: f.customer_name || "Anonymous",
        urgency: f.urgency || "unknown",
        impact: f.impact || "unknown",
        category: f.category || "unknown",
        sentiment: f.sentiment || "unknown",
        date: format(new Date(f.created_date), "MMM d, yyyy")
      }));

      const prompt = `You are an expert product manager. Generate a comprehensive weekly customer feedback report based on the following ${feedbackInRange.length} feedback entries:

${JSON.stringify(feedbackSummary, null, 2)}

Create a professional weekly report with these sections:

# Weekly Customer Feedback Report
**Week of ${format(new Date(dateRange.start), "MMM d")} - ${format(new Date(dateRange.end), "MMM d, yyyy")}**

## 📌 Overview
Provide a 2-3 sentence summary of overall sentiment trends and key themes.

## 🚨 Top Urgent Issues
List the top 3-5 most urgent issues (High urgency + High impact). Include:
- Issue title
- Customer quote (actual feedback text)
- Impact assessment

## 💡 Feature Requests
Summarize the most requested features (sorted by frequency/impact).

## 🐛 Bug Reports
List critical bugs that need immediate attention.

## 📊 Sentiment Analysis
Provide breakdown of positive, neutral, and negative feedback with percentages.

## 🛠 Recommended Actions
Create a prioritized action list for the product team. Be specific and actionable.

Format the entire output in clean, professional Markdown that can be copied to Notion, Slack, or email.`;

      const reportMarkdown = await InvokeLLM({
        prompt: prompt
      });

      const stats = {
        total: feedbackInRange.length,
        highUrgency: feedbackInRange.filter(f => f.urgency === "high").length,
        sentiment: {
          positive: feedbackInRange.filter(f => f.sentiment === "positive").length,
          neutral: feedbackInRange.filter(f => f.sentiment === "neutral").length,
          negative: feedbackInRange.filter(f => f.sentiment === "negative").length
        }
      };

      await Report.create({
        week_start_date: dateRange.start,
        week_end_date: dateRange.end,
        report_markdown: reportMarkdown,
        total_feedback_count: stats.total,
        high_urgency_count: stats.highUrgency,
        sentiment_summary: stats.sentiment
      });

      setGeneratedReport({
        markdown: reportMarkdown,
        stats
      });
    } catch (error) {
      console.error("Error generating report:", error);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([generatedReport.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-report-${format(new Date(), "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Generate AI Report
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Select a date range and let AI create a comprehensive weekly report
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-slate-700 font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-slate-700 font-medium">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="h-12"
                  />
                </div>
              </div>

              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Report with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedReport && (
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    Report Generated
                  </CardTitle>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Markdown
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadMarkdown}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{generatedReport.markdown}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}