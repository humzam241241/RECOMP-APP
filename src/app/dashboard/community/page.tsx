"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageIcon, PlusIcon, UserIcon } from "@/components/ui/icons";
import { useJourneyToday } from "@/hooks/useTodayQueries";

interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  type: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

export default function CommunityPage() {
  const { data: journey } = useJourneyToday();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "following" | "trending">("feed");

  // Mock data
  const posts: Post[] = [
    {
      id: "1",
      userId: "user1",
      userName: "Sarah M.",
      userImage: null,
      type: "progress_update",
      content: "Just completed Day 30 of my journey! 🎉 Already down 5kg and feeling stronger than ever. The Foundation phase really set me up for success.",
      imageUrl: null,
      likesCount: 42,
      commentsCount: 8,
      isLiked: true,
      createdAt: "2026-01-12T10:30:00",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Mike T.",
      userImage: null,
      type: "workout_share",
      content: "New PR on deadlifts today! 180kg x 3 💪 Progressive overload is no joke. Keep pushing everyone!",
      imageUrl: null,
      likesCount: 67,
      commentsCount: 15,
      isLiked: false,
      createdAt: "2026-01-12T08:15:00",
    },
    {
      id: "3",
      userId: "user3",
      userName: "Emma R.",
      userImage: null,
      type: "achievement",
      content: "🏆 Just unlocked the 7-Day Streak badge! Small wins add up. Who else is on a streak?",
      imageUrl: null,
      likesCount: 89,
      commentsCount: 23,
      isLiked: false,
      createdAt: "2026-01-11T19:45:00",
    },
    {
      id: "4",
      userId: "user4",
      userName: "David K.",
      userImage: null,
      type: "post",
      content: "The mindset lessons are game-changing. Today's lesson about dopamine really opened my eyes to why I crave certain things. Knowledge is power! 🧠",
      imageUrl: null,
      likesCount: 34,
      commentsCount: 6,
      isLiked: true,
      createdAt: "2026-01-11T14:20:00",
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Alex P.", score: 2450, streak: 45 },
    { rank: 2, name: "Sarah M.", score: 2180, streak: 38 },
    { rank: 3, name: "Mike T.", score: 1920, streak: 32 },
    { rank: 4, name: "You", score: 1450, streak: 12, isCurrentUser: true },
    { rank: 5, name: "Emma R.", score: 1380, streak: 28 },
  ];

  return (
    <div className="animate-fadeIn">
      <Header
        title="Community"
        subtitle="Connect with fellow transformers"
        dayNumber={journey?.currentDay}
        phase={journey?.phase}
      />

      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          {(["feed", "following", "trending"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                background: activeTab === tab ? "var(--accent-blue)" : "var(--background-tertiary)",
                border: "none",
                borderRadius: "var(--radius-full)",
                color: activeTab === tab ? "white" : "var(--foreground-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowCreatePost(true)}>
          <PlusIcon size={18} /> New Post
        </Button>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "var(--spacing-xl)",
        }}
      >
        {/* Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          {/* Leaderboard */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">🏆 Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                {leaderboard.map((user) => (
                  <LeaderboardRow key={user.rank} {...user} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card variant="gradient" gradient="var(--gradient-purple)" padding="lg">
            <CardHeader>
              <CardTitle size="md" style={{ color: "white" }}>🎯 Weekly Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: "var(--spacing-md)" }}>
                <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  7-Day Perfect Streak
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Log at least 3 good habits every day for 7 days straight
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  opacity: 0.7,
                }}
              >
                <span>234 participants</span>
                <span>4 days left</span>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Users */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle size="md">People to Follow</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <SuggestedUser name="Jessica L." day={45} mutualCount={3} />
                <SuggestedUser name="Tom W." day={67} mutualCount={5} />
                <SuggestedUser name="Rachel G." day={22} mutualCount={2} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const timeAgo = getTimeAgo(post.createdAt);

  const typeLabels: Record<string, { label: string; color: string }> = {
    progress_update: { label: "Progress Update", color: "var(--accent-green)" },
    workout_share: { label: "Workout", color: "var(--accent-blue)" },
    achievement: { label: "Achievement", color: "var(--accent-yellow)" },
    post: { label: "", color: "" },
  };

  return (
    <Card variant="default" padding="lg">
      <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
        {/* Avatar */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-full)",
            background: "var(--background-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <UserIcon size={22} color="var(--foreground-tertiary)" />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{post.userName}</span>
            {typeLabels[post.type].label && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: `${typeLabels[post.type].color}20`,
                  color: typeLabels[post.type].color,
                }}
              >
                {typeLabels[post.type].label}
              </span>
            )}
            <span style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>
              · {timeAgo}
            </span>
          </div>

          <p
            style={{
              fontSize: "15px",
              color: "var(--foreground-secondary)",
              lineHeight: 1.5,
              marginBottom: "var(--spacing-md)",
            }}
          >
            {post.content}
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: "var(--spacing-lg)" }}>
            <button
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: liked ? "var(--accent-red)" : "var(--foreground-tertiary)",
                fontSize: "14px",
              }}
            >
              <HeartIcon size={18} color={liked ? "var(--accent-red)" : "currentColor"} />
              {likesCount}
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--foreground-tertiary)",
                fontSize: "14px",
              }}
            >
              <MessageIcon size={18} />
              {post.commentsCount}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardRow({
  rank,
  name,
  score,
  streak,
  isCurrentUser,
}: {
  rank: number;
  name: string;
  score: number;
  streak: number;
  isCurrentUser?: boolean;
}) {
  const rankColors = {
    1: "var(--accent-yellow)",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-sm) var(--spacing-md)",
        background: isCurrentUser ? "rgba(10, 132, 255, 0.15)" : "transparent",
        borderRadius: "var(--radius-md)",
      }}
    >
      <span
        style={{
          width: "24px",
          fontSize: "14px",
          fontWeight: 700,
          color: rankColors[rank as keyof typeof rankColors] || "var(--foreground-tertiary)",
        }}
      >
        #{rank}
      </span>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "var(--radius-full)",
          background: "var(--background-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UserIcon size={16} color="var(--foreground-tertiary)" />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: isCurrentUser ? 600 : 500,
            color: isCurrentUser ? "var(--accent-blue)" : "var(--foreground)",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
          🔥 {streak} day streak
        </div>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
        {score.toLocaleString()}
      </div>
    </div>
  );
}

function SuggestedUser({
  name,
  day,
  mutualCount,
}: {
  name: string;
  day: number;
  mutualCount: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-full)",
            background: "var(--background-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserIcon size={20} color="var(--foreground-tertiary)" />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>
            {name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
            Day {day} · {mutualCount} mutual
          </div>
        </div>
      </div>
      <Button variant="secondary" size="sm">
        Follow
      </Button>
    </div>
  );
}

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("post");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card
        variant="elevated"
        padding="lg"
        style={{ width: "540px" }}
        onClick={(e) => e?.stopPropagation()}
      >
        <CardHeader>
          <CardTitle size="lg">Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "post", label: "Post" },
                { id: "progress_update", label: "Progress Update" },
                { id: "achievement", label: "Achievement" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id)}
                  style={{
                    padding: "8px 16px",
                    background: postType === type.id ? "var(--accent-blue)" : "var(--background-tertiary)",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    color: postType === type.id ? "white" : "var(--foreground-secondary)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, wins, or thoughts..."
              rows={4}
              style={{
                width: "100%",
                padding: "16px",
                background: "var(--background-tertiary)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-md)",
                color: "var(--foreground)",
                fontSize: "15px",
                resize: "none",
                lineHeight: 1.5,
              }}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button fullWidth disabled={!content.trim()}>
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}
