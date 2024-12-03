import { createClient } from 'contentful';

const PAGE_CONTENT_TYPE_ID = 'page';
const IS_DEV = process.env.NODE_ENV === 'development';

async function getEntries(content_type, queryParams) {
  const client = createClient({
    accessToken: IS_DEV ? process.env.CONTENTFUL_PREVIEW_TOKEN : process.env.CONTENTFUL_DELIVERY_TOKEN,
    space: process.env.CONTENTFUL_SPACE_ID,
    host: IS_DEV ? 'preview.contentful.com' : 'cdn.contentful.com',
  });

  const entries = await client.getEntries({ content_type, ...queryParams, include: 10 });
  return entries;
}

const NAVBAR_CONTENT_TYPE_ID = 'websiteNavbar';

export async function getNavbarData() {
  try {
    const { items } = await getEntries(NAVBAR_CONTENT_TYPE_ID);

    if (!items || items.length === 0) {
      console.error('No navbar content found.');
      throw new Error('Navbar content not found');
    }

    const navbar = items[0];
    const mappedNavbar = mapEntry(navbar);

    // Normalize menuItems to ensure they are structured as { label, href }
    if (mappedNavbar.menuItems && Array.isArray(mappedNavbar.menuItems)) {
      mappedNavbar.menuItems = mappedNavbar.menuItems.map((item) =>
        typeof item === 'string'
          ? { label: item, href: `/${item.toLowerCase().replace(/\s+/g, '-')}` }
          : item
      );
    }

    console.log('Mapped navbar data:', mappedNavbar); // Debugging
    return mappedNavbar;
  } catch (error) {
    console.error('Error fetching navbar data:', error.message);
    throw error;
  }
}

export async function getPagePaths() {
  const { items } = await getEntries(PAGE_CONTENT_TYPE_ID);
  return items.map((page) => {
    const slug = page.fields.slug;
    return slug.startsWith('/') ? slug : `/${slug}`;
  });
}

export async function getPageFromSlug(slug) {
  const { items } = await getEntries(PAGE_CONTENT_TYPE_ID, { 'fields.slug': slug });
  let page = (items ?? [])[0];
  if (!page && slug !== '/' && slug.startsWith('/')) {
    const { items } = await getEntries(PAGE_CONTENT_TYPE_ID, { 'fields.slug': slug.slice(1) });
    page = (items ?? [])[0];
  }
  if (!page) throw new Error(`Page not found for slug: ${slug}`);
  return mapEntry(page);
}

function mapEntry(entry) {
  if (!entry || typeof entry !== 'object' || !entry.fields) {
    // Only log if it isn't a primitive value
    if (typeof entry !== 'string' && typeof entry !== 'number') {
      console.warn('Malformed entry:', entry);
    }
    return entry; // Return the value as-is (likely a string or number)
  }

  const id = entry.sys?.id;
  const type = entry.sys?.contentType?.sys?.id || entry.sys?.type;

  if (entry.sys?.type === 'Asset') {
    if (!entry.fields?.file?.url) {
      console.warn('Malformed Asset:', entry); // Debugging: Log invalid asset
      return null;
    }
    return {
      id,
      type,
      src: `https:${entry.fields.file.url}`,
      alt: entry.fields.title || '',
    };
  }

  return {
    id,
    type,
    ...Object.fromEntries(
      Object.entries(entry.fields).map(([key, value]) => [key, parseField(value)])
    ),
  };
}

function parseField(value) {
  if (!value) return null;
  if (typeof value === 'object' && value.sys) return mapEntry(value);
  if (Array.isArray(value)) return value.map(mapEntry).filter(Boolean); // Filter null values
  return value;
}
