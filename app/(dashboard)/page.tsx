import Treasure from '@/components/widget/treasure';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Template',
  description: 'Template',
});

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <Treasure />
    </div>
  );
}
