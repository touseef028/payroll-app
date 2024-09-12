'use client';

import {
  UserGroupIcon,
  HomeIcon,
  CalculatorIcon,
  DocumentDuplicateIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Define the links array
const links = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentDuplicateIcon },
  // { name: 'Employees', href: '/dashboard/employees', icon: UserGroupIcon },
  // { name: 'Settings', href: '/dashboard/settings', icon: CalculatorIcon },
  { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon },
  { name: 'LOC', href: '/dashboard/locs', icon: BuildingOfficeIcon },
  { name: 'Period Close', href: '/dashboard/period-close', icon: CalendarIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}