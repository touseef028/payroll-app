import { CheckIcon, ClockIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': status === 'pending' || status === 'rejected',
          'bg-green-500 text-white': status === 'approved',
        },
      )}
    >
      {status === 'pending' ? (
        <>
          Pending Approval
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'approved' ? (
        <>
          Approved
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === 'rejected' ? (
        <>
          Rejected
          <HandThumbDownIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
    </span>
  );
}
