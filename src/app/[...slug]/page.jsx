import { notFound } from 'next/navigation';
import { Hero } from '../../components/Hero.jsx';
import { Stats } from '../../components/Stats.jsx';
import { getPageFromSlug } from '../../utils/content.js';

const componentMap = {
  hero: Hero,
  stats: Stats,
};

export default async function ComposablePage({ params }) {
  // Destructure and join the slug
  const { slug } = params;
  const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    // Fetch the page data
    const page = await getPageFromSlug(`/${pageSlug}`);

    if (!page) {
      return notFound();
    }

    // Render the page sections dynamically
    return (
      <div data-sb-object-id={page.id}>
        {(page.sections || []).map((section, idx) => {
          const Component = componentMap[section.type];
          if (!Component) {
            console.warn(`No component found for type "${section.type}"`);
            return null;
          }
          return <Component key={idx} {...section} />;
        })}
      </div>
    );
  } catch (error) {
    console.error('Error fetching page:', error.message);
    return notFound();
  }
}