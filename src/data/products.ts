import { images, type ResponsiveImage } from '@/assets/images/manifest';

/**
 * One physical product within a category.
 *
 * TODO(copy): no item has been named or photographed yet. Until `title` and
 * `image` are filled in, the category page renders the entry as an empty slot.
 * Adding or removing entries here changes the grid — there is no count stored
 * anywhere else.
 */
export interface ProductItem {
  id: string;
  /** Undefined until the item has been named. */
  title?: string;
  /** Undefined until the item has been photographed. */
  image?: ResponsiveImage;
  imageAlt?: string;
}

export interface ProductCategory {
  id: string;
  /** URL segment under /produkter. Keep ASCII — no å/ä/ö. */
  slug: string;
  title: string;
  /** Singular form, for labelling an item that has no name of its own yet. */
  itemNoun: string;
  description: string;
  /**
   * The enquiry block's paragraph on the category page. Left out, the category
   * gets the made-to-order default — so only a category that works differently
   * needs a line here.
   */
  ctaText?: string;
  /** Undefined until the category has been photographed. */
  image?: ResponsiveImage;
  imageAlt?: string;
  items: ProductItem[];
}

export const productCategories: ProductCategory[] = [
  {
    id: 'angels',
    slug: 'anglar',
    title: 'Änglar',
    itemNoun: 'Ängel',
    description: 'Handgjutna änglar i brons, i olika storlekar och utföranden.',
    image: images['products/anglar'],
    imageAlt: 'Två bronsänglar som ljusstakar med tända ljus.',
    // Only one kind of ängel.
    items: [{ id: 'angel-1' }],
  },
  {
    id: 'candlesticks',
    slug: 'malmljusstakar',
    title: 'Malmljusstakar',
    itemNoun: 'Malmljusstake',
    description: 'Klassiska malmljusstakar, svarvade och polerade för hand.',
    // Not made to order: they are turned and polished by one person in his own
    // time, so the page asks what is in stock rather than quoting a delivery.
    ctaText:
      'Malmljusstakarna svarvas och poleras för hand och tar lång tid att göra. ' +
      'De tillverkas inte på beställning, utan i mån av tid. Hör av dig så ' +
      'berättar vi vad som finns hemma.',
    image: images['products/ljusstakar'],
    imageAlt: 'Nypolerade malmljusstakar uppradade på arbetsbänken i verkstaden.',
    // Seeded with three so the grid is visible; the real count is not settled,
    // so add or remove entries here rather than changing any component.
    items: [
      { id: 'candlestick-1' },
      { id: 'candlestick-2' },
      { id: 'candlestick-3' },
    ],
  },
  {
    id: 'gnomes',
    slug: 'tomtar',
    title: 'Tomtar',
    itemNoun: 'Tomte',
    description: 'Traditionella svenska tomtar gjutna i brons.',
    image: images['products/tomtar'],
    imageAlt: 'Två bronstomtar med spetsiga luvor uppställda på en mörk trähylla.',
    // Five kinds of tomte.
    items: [
      { id: 'gnome-1' },
      { id: 'gnome-2' },
      { id: 'gnome-3' },
      { id: 'gnome-4' },
      { id: 'gnome-5' },
    ],
  },
];

export function getCategoryBySlug(slug: string | undefined): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}
