import { Poll } from "@/types/polls";

// Calculate percentage for a poll option
export const calculatePercentage = (voteCount: number, totalVotes: number): number => {
  if (totalVotes === 0) return 0;
  return (voteCount / totalVotes) * 100;
};

// Transform poll options for chart display
export const transformPollOptionsForChart = (poll: Poll) => {
  if (!poll?.options) return [];
  
  return poll.options.map((option) => ({
    name: option.option_text,
    votes: option.vote_count,
    percentage: calculatePercentage(option.vote_count, poll.total_votes),
  }));
};

// Format poll percentages for display
export const formatPercentage = (percentage: number): string => {
  return percentage.toFixed(1);
};
