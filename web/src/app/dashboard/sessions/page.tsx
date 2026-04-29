import Link from 'next/link';

export default function DashboardSessionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Sessions</h1>
        <p className="mt-1 text-sm text-slate-400">
          Start or join live discussions from the dashboard home.
        </p>
      </div>
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 text-sm text-slate-400">
        <p className="font-medium text-slate-300">Nothing to list here yet</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Use <span className="text-slate-400">Start Session</span> on the dashboard to create or join a room. Active
          sessions show in the banner there; this page is a shortcut back when you need it.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-900/30 hover:bg-violet-500"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
