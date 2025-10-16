"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Poll } from "@/types/polls";

export type PollDetailViewProps = {
  poll: Poll;
};

export function PollDetailView({ poll }: PollDetailViewProps) {
  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    return poll.options.map((option) => ({
      name: option.option_text,
      votes: option.vote_count,
      percentage: poll.total_votes > 0 ? (option.vote_count / poll.total_votes) * 100 : 0,
    }));
  }, [poll.options, poll.total_votes]);

  const isExpired = poll.is_expired;
  const isActive = poll.is_active;
  const expiresAt = new Date(poll.expires_at);

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isActive) {
      return <Badge variant="default">Published</Badge>;
    } else {
      return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const getTypeBadge = () => {
    const typeColors = {
      public: "bg-blue-100 text-blue-800",
      private: "bg-orange-100 text-orange-800",
      anonymous: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={cn("capitalize", typeColors[poll.poll_type])}>
        {poll.poll_type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Poll Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.subtitle && (
                <p className="text-muted-foreground">{poll.subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {getTypeBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Question</h3>
            <p className="text-lg">{poll.question}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Total Votes</h4>
              <p className="text-2xl font-bold">{poll.total_votes}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
              <p className="text-sm">{format(new Date(poll.created_at), "PPP")}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Expires</h4>
              <p className="text-sm">{format(expiresAt, "PPP")}</p>
            </div>
          </div>

          {poll.created_by_details && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created By</h4>
              <p className="text-sm">{poll.created_by_details}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {poll.total_votes > 0 ? (
            <div className="space-y-6">
              {/* Bar Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} votes (${chartData.find(d => d.votes === value)?.percentage.toFixed(1)}%)`,
                        name
                      ]}
                    />
                    <Bar dataKey="votes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Results Table */}
              <div className="space-y-3">
                <h3 className="font-semibold">Detailed Results</h3>
                {poll.options.map((option, index) => {
                  const percentage = poll.total_votes > 0 ? (option.vote_count / poll.total_votes) * 100 : 0;
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.option_text}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {option.vote_count} votes
                          </span>
                          <span className="text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No votes yet</p>
              <p className="text-sm">Results will appear here once people start voting</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Information */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Inherits parent permissions:</span>
            <Badge variant={poll.inherits_parent_permissions ? "default" : "secondary"}>
              {poll.inherits_parent_permissions ? "Yes" : "No"}
            </Badge>
          </div>

          {!poll.inherits_parent_permissions && (
            <div className="space-y-3">
              {poll.permitted_branches_details && poll.permitted_branches_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Branches</h4>
                  <div className="flex flex-wrap gap-2">
                    {poll.permitted_branches_details.map((branch: any) => (
                      <Badge key={branch.id} variant="outline">
                        {branch.branch_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {poll.permitted_departments_details && poll.permitted_departments_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {poll.permitted_departments_details.map((dept: any) => (
                      <Badge key={dept.id} variant="outline">
                        {dept.dept_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {poll.permitted_branch_departments_details && poll.permitted_branch_departments_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Branch Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {poll.permitted_branch_departments_details.map((bd: any) => (
                      <Badge key={bd.id} variant="outline">
                        {bd.branch.branch_name} - {bd.department.dept_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {poll.permitted_employees_details && poll.permitted_employees_details.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Employees</h4>
                  <div className="flex flex-wrap gap-2">
                    {poll.permitted_employees_details.map((emp: any) => (
                      <Badge key={emp.id} variant="outline">
                        {emp.full_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voting Information */}
      {poll.has_voted && poll.user_vote && (
        <Card>
          <CardHeader>
            <CardTitle>Your Vote</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You voted for: <span className="font-medium">
                {poll.options.find(opt => opt.id === poll.user_vote)?.option_text}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
