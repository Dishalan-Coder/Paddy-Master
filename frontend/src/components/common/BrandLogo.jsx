import clsx from 'clsx';

const sizeClasses = {
  xs: {
    mark: 'h-8 w-8',
    wordmark: 'h-6 w-28',
  },
  sm: {
    mark: 'h-10 w-10',
    wordmark: 'h-8 w-32',
  },
  md: {
    mark: 'h-12 w-12',
    wordmark: 'h-10 w-40',
  },
  lg: {
    mark: 'h-16 w-16',
    wordmark: 'h-12 w-52',
  },
};

export default function BrandLogo({ className = '', size = 'md', showWordmark = true }) {
  const classes = sizeClasses[size] || sizeClasses.md;

  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <img
        src="/paddy-brand-mark.png"
        alt=""
        className={clsx('shrink-0 object-contain', classes.mark)}
        aria-hidden="true"
      />
      {showWordmark ? (
        <img
          src="/paddy-brand-wordmark.png"
          alt="Paddy Master"
          className={clsx('shrink-0 rounded-md object-contain', classes.wordmark)}
        />
      ) : (
        <span className="sr-only">Paddy Master</span>
      )}
    </span>
  );
}
