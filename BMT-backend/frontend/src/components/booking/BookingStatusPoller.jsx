import Spinner from '../ui/Spinner';

const PROCESSING_STATUSES = ['PENDING', 'SEATS_HELD', 'PAYMENT_PENDING', 'CONFIRMING'];

export default function BookingStatusPoller({ status }) {
  if (!PROCESSING_STATUSES.includes(status)) return null;

  const messages = {
    PENDING: 'Creating your booking...',
    SEATS_HELD: 'Seats reserved, awaiting payment...',
    PAYMENT_PENDING: 'Waiting for payment confirmation...',
    CONFIRMING: 'Payment received, confirming your booking...',
  };

  return (
    <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-lg p-4 flex items-center gap-3">
      <Spinner size="sm" />
      <div>
        <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">{messages[status] || 'Processing...'}</p>
        <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">This page will update automatically</p>
      </div>
    </div>
  );
}
