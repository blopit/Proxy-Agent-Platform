import { cn } from "@/lib/utils";

interface SpecializedSectionsProps {
  activeTab: string;
}

export default function SpecializedSections({
  activeTab,
}: SpecializedSectionsProps) {
  // Only render sections for specific tabs
  if (!["learning", "wellness", "entertainment"].includes(activeTab)) {
    return null;
  }

  return (
    <div className="space-y-6" data-oid="dd10a:f">
      {/* Learning Tab Specialized Sections */}
      {activeTab === "learning" && (
        <>
          <section className="space-y-3 overflow-hidden" data-oid="cc.y63u">
            <h3 className="text-lg font-semibold" data-oid="umh-qky">
              Recommended Courses
            </h3>
            <div className="grid grid-cols-2 gap-3 h-full" data-oid="xerot-b">
              {/* Course cards */}
              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full",
                  "flex flex-col"
                )}
                data-oid="emjdbge"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid="m1t:4gg"
                >
                  <span className="text-blue-500 text-xl" data-oid="k7_rlcm">
                    📚
                  </span>
                  <h4 className="font-medium" data-oid="l6vtqdy">
                    Python Basics
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="9950b3o"
                >
                  Learn Python fundamentals with interactive exercises
                </p>
                <div
                  className="mt-auto text-xs text-indigo-600 dark:text-indigo-400"
                  data-oid="z1fac-f"
                >
                  4.8 ★ • 12 modules
                </div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full",
                  "flex flex-col"
                )}
                data-oid="w0rnf4r"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid=":-.9rwd"
                >
                  <span className="text-green-500 text-xl" data-oid="n6d520x">
                    🧠
                  </span>
                  <h4 className="font-medium" data-oid="mwh-k22">
                    Focus Techniques
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="5.2a1bo"
                >
                  Master concentration with proven ADHD-friendly methods
                </p>
                <div
                  className="mt-auto text-xs text-indigo-600 dark:text-indigo-400"
                  data-oid="a_s9xvq"
                >
                  4.9 ★ • 8 modules
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 overflow-hidden" data-oid="hzovvkq">
            <h3 className="text-lg font-semibold" data-oid="z4wg8_y">
              Learning Achievements
            </h3>
            <div
              className={cn(
                "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                "shadow-none overflow-hidden"
              )}
              data-oid="kfyhe1b"
            >
              <div
                className="flex justify-between items-center mb-3"
                data-oid="hwpr:07"
              >
                <h4 className="font-medium" data-oid="z5gtnfs">
                  Your Learning Streak
                </h4>
                <span
                  className="text-indigo-600 dark:text-indigo-400 font-bold"
                  data-oid="7_zqa:s"
                >
                  7 days
                </span>
              </div>

              <div className="flex gap-2 mb-3" data-oid="w.y5ykv">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                      "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
                    )}
                    data-oid="h6vmkrn"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div
                className="text-sm text-gray-600 dark:text-gray-300"
                data-oid="czfoepz"
              >
                You're on a roll! Keep learning daily to earn the "Knowledge
                Seeker" badge.
              </div>
            </div>
          </section>
        </>
      )}

      {/* Wellness Tab Specialized Sections */}
      {activeTab === "wellness" && (
        <>
          <section className="space-y-3 overflow-hidden" data-oid="gjlpd7.">
            <h3 className="text-lg font-semibold" data-oid="q70w90i">
              Mood Tracker
            </h3>
            <div
              className={cn(
                "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                "shadow-none overflow-hidden"
              )}
              data-oid="63m-9j6"
            >
              <div
                className="flex justify-between items-center mb-3"
                data-oid="_.xn6ac"
              >
                <h4 className="font-medium" data-oid="m.z.kal">
                  Today's Mood
                </h4>
                <button
                  type="button"
                  className="text-sm text-indigo-600 dark:text-indigo-400"
                  data-oid="yur0blb"
                >
                  Update
                </button>
              </div>

              <div
                className="flex justify-between gap-2 mb-3"
                data-oid="xt3yewu"
              >
                {[
                  { emoji: "😴", mood: "tired" },
                  { emoji: "😔", mood: "sad" },
                  { emoji: "😐", mood: "neutral" },
                  { emoji: "🙂", mood: "good" },
                  { emoji: "😄", mood: "great" },
                ].map((item) => (
                  <div
                    key={item.mood}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                      item.mood === "good"
                        ? "bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500"
                        : "bg-white/40 dark:bg-slate-700/40",
                    )}
                    data-oid="_q_l8qt"
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>

              <div
                className="text-sm text-gray-600 dark:text-gray-300"
                data-oid="jqz09t4"
              >
                Your mood has been positive for 3 days in a row!
              </div>
            </div>
          </section>

          <section className="space-y-3 overflow-hidden" data-oid="w61boip">
            <h3 className="text-lg font-semibold" data-oid="2y8qr4r">
              Quick Wellness Activities
            </h3>
            <div className="grid grid-cols-2 gap-3 h-full" data-oid="hs67.:l">
              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full",
                  "flex flex-col"
                )}
                data-oid="3j6qxka"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid="-fpg:l7"
                >
                  <span className="text-blue-500 text-xl" data-oid="imtku6x">
                    🧘
                  </span>
                  <h4 className="font-medium" data-oid="-7qn8-r">
                    5-Min Meditation
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="xqwvb3j"
                >
                  Quick guided meditation to reset your focus
                </p>
              </div>

              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full",
                  "flex flex-col"
                )}
                data-oid="huxousa"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid="l7-okwo"
                >
                  <span className="text-green-500 text-xl" data-oid="-9bm1c0">
                    🚶
                  </span>
                  <h4 className="font-medium" data-oid="dx3.psh">
                    Movement Break
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="pjhlrtq"
                >
                  Simple stretches to energize your body
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Entertainment Tab Specialized Sections */}
      {activeTab === "entertainment" && (
        <>
          <section className="space-y-3 overflow-hidden" data-oid="th1p-y5">
            <h3 className="text-lg font-semibold" data-oid="z8xs3y6">
              Quick Games
            </h3>
            <div className="grid grid-cols-2 gap-3" data-oid="q.fl9gn">
              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full"
                )}
                data-oid="6.g5i3t"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid="nk:aw04"
                >
                  <span className="text-purple-500 text-xl" data-oid="8s24-p-">
                    🎮
                  </span>
                  <h4 className="font-medium" data-oid="qx3y:8v">
                    Word Puzzle
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="fzi6ul8"
                >
                  Brain-boosting word game (2 min)
                </p>
              </div>

              <div
                className={cn(
                  "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                  "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                  "shadow-none overflow-hidden h-full"
                )}
                data-oid="n4c663f"
              >
                <div
                  className="flex items-center gap-2 mb-2"
                  data-oid="e4p6a5l"
                >
                  <span className="text-yellow-500 text-xl" data-oid="1-d_79h">
                    🎯
                  </span>
                  <h4 className="font-medium" data-oid="d8qvnv9">
                    Focus Challenge
                  </h4>
                </div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-oid="c.zlwig"
                >
                  Test your attention with this quick game
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 overflow-hidden" data-oid="0_d4_:4">
            <h3 className="text-lg font-semibold" data-oid="r47tq-w">
              Community Events
            </h3>
            <div
              className={cn(
                "p-4 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-slate-800/60",
                "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer",
                "shadow-none overflow-hidden"
              )}
              data-oid="ekfh1w2"
            >
              <div className="flex items-center gap-2 mb-2" data-oid=".z7:jbb">
                <span className="text-red-500 text-xl" data-oid="3otq_xq">
                  🎬
                </span>
                <div data-oid="0qcps6g">
                  <h4 className="font-medium" data-oid="h58u7.8">
                    Virtual Movie Night
                  </h4>
                  <p className="text-xs text-gray-500" data-oid="bv:rr_d">
                    Today, 8:00 PM
                  </p>
                </div>
              </div>
              <p
                className="text-sm text-gray-600 dark:text-gray-300"
                data-oid="4tdcvp2"
              >
                Join 12 others for a synchronized movie watching experience
              </p>
              <div className="mt-2 flex items-center gap-2" data-oid="qv2qq4y">
                <div className="flex -space-x-2" data-oid="jpzd30_">
                  {[
                    { id: "user1", avatar: "1" },
                    { id: "user2", avatar: "2" },
                    { id: "user3", avatar: "3" },
                  ].map((user) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-slate-800"
                      data-oid="c7r4:r7"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500" data-oid="od5e:zo">
                  +9 more
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
