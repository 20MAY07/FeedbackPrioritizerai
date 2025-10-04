import React, { useState } from "react";
import { Feedback } from "@/entities/Feedback";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, FileUp, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ClassifiedResults from "../components/bulk-upload/ClassifiedResults";

export default function BulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split(".").pop().toLowerCase();
      if (!["pdf", "csv"].includes(fileType)) {
        setError("Please upload a PDF or CSV file. Excel files are not supported - please convert to CSV first.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResults(null);
      setSaved(false);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Upload file first
      const { file_url } = await UploadFile({ file });

      // Extract data from file - the schema root must be array for CSV/PDF extraction
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              customer_name: { type: "string" },
              customer_email: { type: "string" },
              feedback_text: { type: "string" },
              source: { type: "string" }
            },
            required: ["feedback_text"]
          }
        }
      });

      if (extractionResult.status === "error") {
        setError(extractionResult.details || "Failed to extract data from file. Please ensure your file has the correct format.");
        setIsProcessing(false);
        return;
      }

      const feedbackEntries = extractionResult.output || [];

      if (feedbackEntries.length === 0) {
        setError("No feedback entries found in the file. Please check your file format.");
        setIsProcessing(false);
        return;
      }

      // Classify each feedback with AI
      const classifiedFeedback = await Promise.all(
        feedbackEntries.map(async (entry) => {
          try {
            const analysisPrompt = `Analyze this customer feedback and classify it:
            
Feedback: "${entry.feedback_text}"

Provide classification for:
1. Urgency (high/medium/low) - How quickly does this need attention?
2. Impact (high/medium/low) - How many customers does this affect?
3. Category (bug/feature_request/ux_issue/pricing/other)
4. Sentiment (positive/neutral/negative)`;

            const analysis = await InvokeLLM({
              prompt: analysisPrompt,
              response_json_schema: {
                type: "object",
                properties: {
                  urgency: { type: "string", enum: ["high", "medium", "low"] },
                  impact: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string", enum: ["bug", "feature_request", "ux_issue", "pricing", "other"] },
                  sentiment: { type: "string", enum: ["positive", "neutral", "negative"] }
                }
              }
            });

            return {
              customer_name: entry.customer_name || "",
              customer_email: entry.customer_email || "",
              feedback_text: entry.feedback_text,
              source: entry.source || "other",
              urgency: analysis.urgency,
              impact: analysis.impact,
              category: analysis.category,
              sentiment: analysis.sentiment
            };
          } catch (error) {
            console.error("Error classifying feedback:", error);
            return {
              customer_name: entry.customer_name || "",
              customer_email: entry.customer_email || "",
              feedback_text: entry.feedback_text,
              source: entry.source || "other",
              urgency: "medium",
              impact: "medium",
              category: "other",
              sentiment: "neutral"
            };
          }
        })
      );

      // Group by urgency
      const grouped = {
        high: classifiedFeedback.filter(f => f.urgency === "high"),
        medium: classifiedFeedback.filter(f => f.urgency === "medium"),
        low: classifiedFeedback.filter(f => f.urgency === "low")
      };

      setResults({
        total: classifiedFeedback.length,
        grouped: grouped,
        all: classifiedFeedback
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setError("An error occurred while processing the file. Please ensure your file is properly formatted.");
    }

    setIsProcessing(false);
  };

  const saveToDatabase = async () => {
    if (!results) return;

    setIsSaving(true);

    try {
      await Feedback.bulkCreate(results.all);
      setSaved(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (error) {
      console.error("Error saving feedback:", error);
      setError("Failed to save feedback to database");
    }

    setIsSaving(false);
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <FileUp className="w-10 h-10 text-blue-600" />
            Bulk Feedback Upload
          </h1>
          <p className="text-slate-600">
            Upload PDF or CSV files with multiple feedback entries for automatic AI classification
          </p>
        </div>

        {saved ? (
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {results.total} Feedback Entries Saved!
              </h2>
              <p className="text-slate-600">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Upload File
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Supported formats: PDF, CSV (Excel files: please convert to CSV first)
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" className="mb-2" asChild>
                        <span>Choose File</span>
                      </Button>
                      <p className="text-sm text-slate-500">
                        {file ? file.name : "PDF or CSV up to 10MB"}
                      </p>
                    </label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={processFile}
                    disabled={!file || isProcessing}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing & Classifying with AI...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Process File
                      </>
                    )}
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">File Format Guidelines:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>CSV format:</strong> Include columns: customer_name, customer_email, feedback_text, source</li>
                      <li>• <strong>PDF format:</strong> Text should be structured with clear feedback entries</li>
                      <li>• Each row/entry should represent one feedback item</li>
                      <li>• AI will automatically classify urgency, impact, category, and sentiment</li>
                      <li>• <strong>Excel users:</strong> Save your file as CSV before uploading</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      How to Convert Excel to CSV
                    </h4>
                    <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                      <li>Open your Excel file</li>
                      <li>Click "File" → "Save As"</li>
                      <li>Choose "CSV (Comma delimited)" as the file type</li>
                      <li>Save and upload the CSV file here</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {results && (
              <>
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                          Classification Results
                        </CardTitle>
                        <p className="text-slate-600">
                          {results.total} feedback entries classified
                        </p>
                      </div>
                      <Button
                        onClick={saveToDatabase}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 gap-2 shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Save All to Database
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-700 font-medium mb-1">High Urgency</p>
                        <p className="text-3xl font-bold text-red-900">{results.grouped.high.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-700 font-medium mb-1">Medium Urgency</p>
                        <p className="text-3xl font-bold text-amber-900">{results.grouped.medium.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-700 font-medium mb-1">Low Urgency</p>
                        <p className="text-3xl font-bold text-blue-900">{results.grouped.low.length}</p>
                      </div>
                    </div>

                    <ClassifiedResults results={results.grouped} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}