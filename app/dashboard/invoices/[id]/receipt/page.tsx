import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchInvoiceById, generatePresignedUrl } from '@/app/lib/data';

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const invoice = await fetchInvoiceById(params.id);

  let presignedUrl = '';
  if (invoice.receipt_url) {
    presignedUrl = await generatePresignedUrl(invoice.receipt_url);
  }

  if (!invoice || !presignedUrl) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Receipt </h1>
      <div className="relative w-full max-w-3xl max-h-full mx-auto">
        <Image
          src={presignedUrl}
          alt="Receipt"
          width={800}
          height={600}
          layout="responsive"
          objectFit="contain"
        />
      </div>
    </div>
  );
}