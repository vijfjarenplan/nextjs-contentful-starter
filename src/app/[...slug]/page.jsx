import { notFound } from "next/navigation";
import { Hero } from "../../components/Hero.jsx";
import { Stats } from "../../components/Stats.jsx";
import { getPageFromSlug } from "../../utils/content.js";

const componentMap = {
  hero: Hero,
  stats: Stats,
};

export default async function ComposablePage({ params }) {
  const slug = await params?.slug;
  const pageSlug = Array.isArray(slug) ? slug.join("/") : slug;

  try {
    const page = await getPageFromSlug(`/${pageSlug}`);

    if (!page) {
      // If the page is not found, call `notFound` to display a 404 page
      console.warn(`Page not found for slug: ${pageSlug}`);
      return notFound();
    }

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
    console.error(`Error fetching page: ${error.message}`);
    return notFound();
  }
}