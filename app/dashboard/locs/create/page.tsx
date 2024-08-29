import Form from '@/app/ui/locs/create-form';
import Breadcrumbs from '@/app/ui/locs/breadcrumbs';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Manage LOCs', href: '/dashboard/locs' },
          {
            label: 'Create LOC',
            href: '/dashboard/locs/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
