import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Terminal } from 'lucide-react'
import Logo from './Logo'
import { missingFirebaseVars } from '../firebase'

export default function FirebaseSetupNotice() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" aria-hidden="true" />
      <div className="relative w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Logo to="/" />
        </div>

        <div className="glass-panel-strong overflow-hidden p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-warning">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Connect Firebase to open the dashboard</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                The public site and demo work without credentials. The protected dashboard needs a
                Firebase web app so Guardian Eye can read your emergency events.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              <Terminal className="h-4 w-4 text-accent" aria-hidden="true" />
              Create website/.env.local
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-300">
              {`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id`}
            </pre>
          </div>

          {missingFirebaseVars.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-surface/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Missing right now
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {missingFirebaseVars.map((name) => (
                  <li
                    key={name}
                    className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1 font-mono text-[11px] text-danger"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-gray-400">
            Enable Email/Password sign-in in Firebase Authentication, create a Firestore database, and
            deploy the rules in <span className="font-mono text-gray-300">website/firestore.rules</span>.
            Full steps are in the website README.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/demo"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primaryDark"
            >
              Open the demo instead
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Back to the site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
