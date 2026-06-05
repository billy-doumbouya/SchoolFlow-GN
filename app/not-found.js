import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold">
            {" "}
            <Image
              src="/schoolflow-logo.png"
              alt="SchoolFlow"
              width={28}
              height={28}
              className="nav-logo-img"
            />
          </div>
          <span className="font-semibold text-lg">SchoolFlow-GN</span>
        </div>
        <h1 className="text-7xl font-extrabold text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-2">Page not found</p>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          ← Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
