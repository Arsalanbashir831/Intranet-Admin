"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Shield, Clock, BarChart3 } from "lucide-react";
import type { Poll, PollOption, BranchDetail, DepartmentDetail, BranchDepartmentDetail, EmployeeDetail } from "@/types/polls";

type Voter = {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
  voted_at: string;
  branch_department: {
    id: number;
    branch: {
      id: number;
      name: string;
      location: string;
    };
    department: {
      id: number;
      name: string;
    };
  };
};

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
      <Card className="shadow-none border-[#D0D0D0]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">{poll.title}</CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B7280]">Total Votes</div>
                  <div className="mt-1 text-2xl font-bold text-secondary">{poll.total_votes}</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B7280]">Created</div>
                  <div className="mt-1 text-sm font-medium text-secondary">{format(new Date(poll.created_at), "MMM dd, yyyy")}</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B7280]">Expires</div>
                  <div className="mt-1 text-sm font-medium text-secondary">{format(expiresAt, "MMM dd, yyyy")}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B7280]">Type</div>
                  <div className="mt-1 text-sm font-medium text-secondary capitalize">{poll.poll_type}</div>
                </div>
              </div>
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
      <Card className="shadow-none border-[#D0D0D0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Results
          </CardTitle>
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
                    <Bar dataKey="votes" fill="#d64575" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Results with Voters */}
              <div className="space-y-4">
                <h3 className="font-semibold">Detailed Results</h3>
                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage = poll.total_votes > 0 ? (option.vote_count / poll.total_votes) * 100 : 0;
                    
                    return (
                      <div key={option.id} className="rounded-lg border border-[#E4E4E4] bg-white px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{option.option_text}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {option.vote_count} votes
                            </span>
                            <span className="text-sm font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <Progress value={percentage} className="h-2 mb-3" />
                        
                        {/* Voters List */}
                        {option.voters && option.voters.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#E4E4E4]">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Voters ({option.voters.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {option.voters.map((voter: Voter, voterIndex: number) => (
                                <div key={voterIndex} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={voter.profile_picture || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {voter.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs truncate">{voter.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{voter.email}</p>
                                    {voter.branch_department && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {voter.branch_department.branch.name} - {voter.branch_department.department.name}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(voter.voted_at), "MMM dd")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
      <Card className="shadow-none border-[#D0D0D0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {poll.permitted_branches_details && poll.permitted_branches_details.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Branches</h4>
                <div className="flex flex-wrap gap-2">
                  {poll.permitted_branches_details.map((branch: BranchDetail) => (
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
                  {poll.permitted_departments_details.map((dept: DepartmentDetail) => (
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
                  {poll.permitted_branch_departments_details.map((bd: BranchDepartmentDetail) => (
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
                  {poll.permitted_employees_details.map((emp: EmployeeDetail) => (
                    <Badge key={emp.id} variant="outline">
                      {emp.full_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no specific permissions are set */}
            {(!poll.permitted_branches_details || poll.permitted_branches_details.length === 0) &&
             (!poll.permitted_departments_details || poll.permitted_departments_details.length === 0) &&
             (!poll.permitted_branch_departments_details || poll.permitted_branch_departments_details.length === 0) &&
             (!poll.permitted_employees_details || poll.permitted_employees_details.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">This poll has public access (no specific permissions set)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Poll Summary */}
      <Card className="shadow-none border-[#D0D0D0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Poll Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Status</span>
                {getStatusBadge()}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Type</span>
                {getTypeBadge()}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Total Options</span>
                <span className="font-semibold">{poll.options.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{format(new Date(poll.created_at), "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Expires</span>
                <span className="text-sm">{format(expiresAt, "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">Participation Rate</span>
                <span className="font-semibold text-primary">
                  {poll.total_votes > 0 ? ((poll.total_votes / poll.options.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Information */}
      {poll.has_voted && poll.user_vote && (
        <Card className="shadow-none border-[#D0D0D0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">You voted for:</p>
            <p className="font-semibold">
              {poll.options.find(opt => opt.id === poll.user_vote)?.option_text}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
