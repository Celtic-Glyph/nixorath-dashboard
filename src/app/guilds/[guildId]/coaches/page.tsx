import { botApi, isBotUnreachable } from "@/lib/botApi";
import RatingStars from "@/components/RatingStars";
import BotOfflineState from "@/components/BotOfflineState";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function CoachesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  let coaches, reviews, total, students;
  try {
    [coaches, { reviews, total }] = await Promise.all([
      botApi.listCoaches(guildId),
      botApi.listReviews(guildId, 25),
    ]);
    const studentIds = [...new Set(reviews.map((r) => String(r.student_id)))];
    students = await botApi.resolveMembers(guildId, studentIds);
  } catch (err) {
    if (!isBotUnreachable(err)) throw err;
    return <BotOfflineState />;
  }

  const studentById = new Map(students.map((s) => [s.id, s]));
  const coachById = new Map(coaches.map((c) => [c.id, c]));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Coaching staff</h2>
        {coaches.length === 0 ? (
          <p className="text-sm text-muted">No coaches configured yet — add some in Settings.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coach.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{coach.display_name}</p>
                  <RatingStars rating={coach.avg_rating} reviewCount={coach.review_count} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Recent reviews <span className="font-normal text-muted">({total} total)</span>
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews submitted yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Coach</th>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">Rating</th>
                  <th className="px-4 py-2.5 font-medium">Feedback</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviews.map((review, i) => (
                  <tr key={i} className="bg-surface/40">
                    <td className="px-4 py-2.5 text-foreground">
                      {coachById.get(String(review.coach_id))?.display_name ?? review.coach_id}
                    </td>
                    <td className="px-4 py-2.5 text-foreground">
                      {studentById.get(String(review.student_id))?.display_name ?? review.student_id}
                    </td>
                    <td className="px-4 py-2.5 text-gold">{"★".repeat(review.rating)}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-muted" title={review.feedback}>
                      {review.feedback}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">
                      {formatDate(review.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
