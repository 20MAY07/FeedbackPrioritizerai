import React, { useState } from "react";
import { Feedback } from "@/entities/Feedback";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SubmitFeedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    feedback_text: "",
    source: "other"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const analysisPrompt = `Analyze this customer feedback and classify it:
      
Feedback: "${formData.feedback_text}"

Provide classification for:
1. Urgency (high/medium/low) - How quickly does this need attention?
2. Impact (high/medium/low) - How many customers does this affect?
3. Category (bug/feature_request/ux_issue/pricing/other)
4. Sentiment (positive/neutral/negative)

Be thorough in your analysis.`;

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

      await Feedback.create({
        ...formData,
        urgency: analysis.urgency,
        impact: analysis.impact,
        category: analysis.category,
        sentiment: analysis.sentiment
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }

    setIsProcessing(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Feedback Submitted!</h2>
            <p className="text-slate-600">
              AI analysis complete. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Submit Customer Feedback
            </CardTitle>
            <p className="text-slate-600 mt-2">
              AI will automatically analyze and classify this feedback
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-slate-700 font-medium">
                    Customer Name
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="John Doe"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email" className="text-slate-700 font-medium">
                    Customer Email
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-slate-700 font-medium">
                  Feedback Source
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({...formData, source: value})}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="support_ticket">Support Ticket</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="chat">Live Chat</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback_text" className="text-slate-700 font-medium">
                  Feedback <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="feedback_text"
                  value={formData.feedback_text}
                  onChange={(e) => setFormData({...formData, feedback_text: e.target.value})}
                  placeholder="Enter the customer's feedback here..."
                  className="min-h-[200px] resize-none"
                  required
                />
                <p className="text-sm text-slate-500">
                  AI will analyze urgency, impact, category, and sentiment
                </p>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !formData.feedback_text}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base font-semibold shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit & Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}