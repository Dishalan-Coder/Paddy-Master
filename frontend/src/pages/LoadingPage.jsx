import StatusPage from '../components/common/StatusPage';

export default function LoadingPage({
  actions = true,
  message = 'Preparing your Paddy Master workspace and fetching the latest farm data.',
}) {
  return (
    <StatusPage
      actions={actions}
      description={message}
      eyebrow="Loading"
      primaryHref="/dashboard"
      primaryLabel="Open dashboard"
      secondaryHref="/"
      showSpinner
      title="Getting everything ready"
    >
      <ol className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
        {['Checking session', 'Loading records', 'Preparing views'].map(
          (step, index) => (
            <li
              key={step}
              className="flex items-center gap-3 text-sm font-black text-emerald-950"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ),
        )}
      </ol>
    </StatusPage>
  );
}
