import { fetchFilteredLocs } from '@/app/lib/data';
import LocsTable from '@/app/ui/locs/table';
import { CreateUser } from '@/app/ui/users/buttons';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { Suspense } from 'react';
import { CreateLoc } from '@/app/ui/locs/buttons';
// import { UserTableSkeleton } from '@/app/ui/skeletons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const locs = await fetchFilteredLocs(query, currentPage);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}> Manage LOC</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search LOCs..." />
        <CreateLoc />
      </div>
      <Suspense>
        <LocsTable locs={locs} />
      </Suspense>
    </div>
  );
}
