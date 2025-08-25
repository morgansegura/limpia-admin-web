"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  FileText,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FormItem } from "../ui/form";

interface FeedbackResponse {
  id: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  serviceType: string;
  overallRating: number;
  qualityRating: number;
  timelinessRating: number;
  communicationRating: number;
  valueRating: number;
  wouldRecommend: boolean;
  comments: string;
  improvementSuggestions?: string;
  responseDate: Date;
  followUpRequired: boolean;
  respondedBy?: string;
  responseNotes?: string;
}

interface FeedbackSurvey {
  id: string;
  name: string;
  questions: FeedbackQuestion[];
  isActive: boolean;
  responseCount: number;
  averageRating: number;
  createdAt: Date;
}

interface FeedbackQuestion {
  id: string;
  type: "rating" | "text" | "yesno" | "multiple_choice";
  question: string;
  required: boolean;
  options?: string[];
}

interface FeedbackSystemProps {
  customerId?: string;
}

// Mock feedback data
const mockFeedbackResponses: FeedbackResponse[] = [
  {
    id: "feedback-001",
    customerId: "1",
    customerName: "Sofia Martinez",
    bookingId: "booking-123",
    serviceType: "Deep Clean Blue",
    overallRating: 5,
    qualityRating: 5,
    timelinessRating: 4,
    communicationRating: 5,
    valueRating: 4,
    wouldRecommend: true,
    comments:
      "Excellent service! The team was professional and thorough. My home has never looked better.",
    improvementSuggestions: "Maybe arrive a bit earlier next time.",
    responseDate: new Date("2024-08-15T16:30:00"),
    followUpRequired: false,
  },
  {
    id: "feedback-002",
    customerId: "2",
    customerName: "Robert Kim",
    bookingId: "booking-124",
    serviceType: "Regular Cleaning",
    overallRating: 4,
    qualityRating: 4,
    timelinessRating: 3,
    communicationRating: 4,
    valueRating: 4,
    wouldRecommend: true,
    comments:
      "Good service overall. Team was late but did a thorough job once they arrived.",
    improvementSuggestions: "Better time management needed.",
    responseDate: new Date("2024-08-14T18:45:00"),
    followUpRequired: true,
    respondedBy: "Manager Sarah",
    responseNotes:
      "Contacted customer to apologize for delay and offer 10% discount on next service.",
  },
  {
    id: "feedback-003",
    customerId: "3",
    customerName: "Maria Rodriguez",
    bookingId: "booking-125",
    serviceType: "Move Out Cleaning",
    overallRating: 3,
    qualityRating: 3,
    timelinessRating: 4,
    communicationRating: 2,
    valueRating: 3,
    wouldRecommend: false,
    comments:
      "Service was okay but communication could be better. Had to call multiple times for updates.",
    improvementSuggestions: "Improve customer communication and follow-up.",
    responseDate: new Date("2024-08-13T14:20:00"),
    followUpRequired: true,
  },
];

const surveyTemplate: FeedbackSurvey = {
  id: "survey-default",
  name: "Post-Service Feedback Survey",
  questions: [
    {
      id: "overall",
      type: "rating",
      question: "How would you rate your overall experience?",
      required: true,
    },
    {
      id: "quality",
      type: "rating",
      question: "How would you rate the quality of service?",
      required: true,
    },
    {
      id: "timeliness",
      type: "rating",
      question: "How satisfied were you with our timeliness?",
      required: true,
    },
    {
      id: "communication",
      type: "rating",
      question: "How was our communication throughout the process?",
      required: true,
    },
    {
      id: "value",
      type: "rating",
      question: "How would you rate the value for money?",
      required: true,
    },
    {
      id: "recommend",
      type: "yesno",
      question: "Would you recommend our services to others?",
      required: true,
    },
    {
      id: "comments",
      type: "text",
      question: "Any additional comments about your experience?",
      required: false,
    },
    {
      id: "improvements",
      type: "text",
      question: "How can we improve our service?",
      required: false,
    },
  ],
  isActive: true,
  responseCount: 156,
  averageRating: 4.2,
  createdAt: new Date("2024-01-15"),
};

export function FeedbackSystem({ customerId }: FeedbackSystemProps) {
  const [selectedTab, setSelectedTab] = useState<
    "responses" | "analytics" | "surveys"
  >("responses");
  const [selectedResponse, setSelectedResponse] =
    useState<FeedbackResponse | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState("");

  const filteredResponses = customerId
    ? mockFeedbackResponses.filter((r) => r.customerId === customerId)
    : mockFeedbackResponses;

  const averageRating =
    filteredResponses.reduce((sum, r) => sum + r.overallRating, 0) /
    filteredResponses.length;
  const recommendationRate =
    (filteredResponses.filter((r) => r.wouldRecommend).length /
      filteredResponses.length) *
    100;
  const needsFollowUp = filteredResponses.filter(
    (r) => r.followUpRequired && !r.respondedBy,
  ).length;

  const handleFollowUp = async (feedbackId: string) => {
    console.log("Following up on feedback:", feedbackId, followUpNotes);
    // Here you would call your API to record the follow-up
    setIsResponseDialogOpen(false);
    setFollowUpNotes("");
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 3.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col justify-between">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Customer Feedback System</h3>
          <p className="text-sm text-muted-foreground">
            Collect, analyze, and respond to customer feedback
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={selectedTab === "responses" ? "default" : "outline"}
            onClick={() => setSelectedTab("responses")}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            Responses
          </Button>
          <Button
            variant={selectedTab === "analytics" ? "default" : "outline"}
            onClick={() => setSelectedTab("analytics")}
          >
            <BarChart3 className="mr-1 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={selectedTab === "surveys" ? "default" : "outline"}
            onClick={() => setSelectedTab("surveys")}
          >
            <FileText className="mr-1 h-4 w-4" />
            Surveys
          </Button>
        </div>
      </div>

      {/* Feedback Analytics Summary */}
      {selectedTab === "analytics" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getRatingColor(
                  averageRating,
                )}`}
              >
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recommendation Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recommendationRate.toFixed(0)}%
              </div>
              <Progress value={recommendationRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Responses
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredResponses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Feedback collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Needs Follow-up
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {needsFollowUp}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Responses */}
      {selectedTab === "responses" && (
        <div className="space-y-4">
          {filteredResponses.map((feedback) => (
            <Card
              key={feedback.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${getRatingBadgeColor(
                          feedback.overallRating,
                        )} text-white`}
                      >
                        <Star className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {feedback.customerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {feedback.serviceType} • {feedback.bookingId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div
                          className={`font-bold ${getRatingColor(
                            feedback.overallRating,
                          )}`}
                        >
                          {feedback.overallRating}/5
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(feedback.responseDate, {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      {feedback.followUpRequired && !feedback.respondedBy && (
                        <Badge variant="destructive" className="text-xs">
                          Needs Follow-up
                        </Badge>
                      )}
                      {feedback.respondedBy && (
                        <Badge variant="secondary" className="text-xs">
                          Responded
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Quality</div>
                      <div className={getRatingColor(feedback.qualityRating)}>
                        {feedback.qualityRating}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Timeliness</div>
                      <div
                        className={getRatingColor(feedback.timelinessRating)}
                      >
                        {feedback.timelinessRating}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Communication</div>
                      <div
                        className={getRatingColor(feedback.communicationRating)}
                      >
                        {feedback.communicationRating}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Value</div>
                      <div className={getRatingColor(feedback.valueRating)}>
                        {feedback.valueRating}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Recommend</div>
                      <div
                        className={
                          feedback.wouldRecommend
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {feedback.wouldRecommend ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments */}
                  {feedback.comments && (
                    <div>
                      <div className="font-medium text-sm mb-1">
                        Customer Comments:
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        &quot;{feedback.comments}&quot;
                      </div>
                    </div>
                  )}

                  {feedback.improvementSuggestions && (
                    <div>
                      <div className="font-medium text-sm mb-1">
                        Improvement Suggestions:
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {feedback.improvementSuggestions}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Section */}
                  {feedback.followUpRequired && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      {feedback.respondedBy ? (
                        <div>
                          <div className="flex items-center text-green-700 font-medium text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Follow-up Completed by {feedback.respondedBy}
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            {feedback.responseNotes}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center text-orange-700 font-medium text-sm mb-2">
                            <Clock className="h-4 w-4 mr-1" />
                            Follow-up Required
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedResponse(feedback);
                              setIsResponseDialogOpen(true);
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Respond
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Survey Management */}
      {selectedTab === "surveys" && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Survey Template</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your post-service feedback survey questions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{surveyTemplate.name}</div>
                <div className="text-sm text-muted-foreground">
                  {surveyTemplate.responseCount} responses •{" "}
                  {surveyTemplate.averageRating.toFixed(1)} avg rating
                </div>
              </div>
              <Badge
                variant={surveyTemplate.isActive ? "default" : "secondary"}
              >
                {surveyTemplate.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="font-medium text-sm">Survey Questions:</div>
              {surveyTemplate.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">
                      {index + 1}. {question.question}
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {question.type.replace("_", " ")}
                      </Badge>
                      {question.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  {question.options && (
                    <div className="text-xs text-muted-foreground">
                      Options: {question.options.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Follow-up Response</DialogTitle>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium">
                  {selectedResponse.customerName}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedResponse.serviceType} • {selectedResponse.bookingId}
                </div>
                <div className="text-sm">
                  <strong>Rating:</strong> {selectedResponse.overallRating}/5
                </div>
                <div className="text-sm">
                  <strong>Comments:</strong> {selectedResponse.comments}
                </div>
                {selectedResponse.improvementSuggestions && (
                  <div className="text-sm">
                    <strong>Suggestions:</strong>{" "}
                    {selectedResponse.improvementSuggestions}
                  </div>
                )}
              </div>

              <FormItem>
                <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                <Textarea
                  id="followUpNotes"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Describe the actions taken to address this feedback..."
                  rows={4}
                />
              </FormItem>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsResponseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedResponse && handleFollowUp(selectedResponse.id)
                  }
                >
                  Record Follow-up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {selectedTab === "responses" && filteredResponses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No feedback yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customer feedback will appear here after services are completed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
