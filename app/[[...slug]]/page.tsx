import { ClientOnly } from './client';
import './index.css'

export function generateStaticParams() {
    return [{ slug: [''] }, { slug: ['page1'] }, { slug: ['page2'] }];
}

export default function Page() {
  return <ClientOnly />
}

