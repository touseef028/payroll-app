import Form from '@/app/ui/locs/edit-form';
import Breadcrumbs from '@/app/ui/locs/breadcrumbs';
import { fetchLocById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const loc = await fetchLocById(id);

  if (!loc) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Users', href: '/dashboard/locs' },
          {
            label: 'Edit LOC',
            href: `/dashboard/locs/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form loc={loc} />
    </main>
  );
}
