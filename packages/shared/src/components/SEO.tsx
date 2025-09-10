import { Metadata } from 'next';

export interface SimpleSEOProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export function generateSimpleMetadata(props: SimpleSEOProps): Metadata {
  const {
    title = 'Konnektaro',
    description = 'Join collaborative events and connect with others through Konnektaro\'s innovative platform.',
    noIndex = false,
  } = props;

  return {
    title,
    description,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}
