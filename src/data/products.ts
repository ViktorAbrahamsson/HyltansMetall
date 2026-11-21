import { images, type ResponsiveImage } from '@/assets/images/manifest';
import type { WorkPiece } from '@/components/common/WorkGallery/WorkGallery';

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
  /** One line of facts, e.g. "Art.nr 541 · Höjd 7 cm · Vikt 0,3 kg". */
  specs?: string;
  /** A short note beside the photo, e.g. a gift box it also comes in. */
  note?: string;
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
  /**
   * Frame for the item photos. Portrait where the pieces are standing figures
   * that fill the height — a landscape crop takes their tops off.
   */
  itemRatio?: 'portrait' | 'landscape';
  /**
   * Photos of several pieces together. Not products in their own right: they
   * close the page off under the item grid, in the same frame as the items.
   */
  gallery?: { image: ResponsiveImage; alt: string }[];
  /**
   * More photos as the zig-zag block (see WorkGallery), in row order. For a
   * category with mixed portrait and landscape shots; `gallery` suits a pair
   * of the same shape.
   */
  showcase?: WorkPiece[];
  /**
   * Kept in the data but off the site: no nav entry, no card, and its URL
   * redirects to /produkter like an unknown slug. For a category that is not
   * ready yet — remove the flag to publish it.
   */
  hidden?: boolean;
}

const allCategories: ProductCategory[] = [
  {
    id: 'angels',
    slug: 'anglar',
    title: 'Änglar',
    itemNoun: 'Ängel',
    description: 'Handgjutna änglar i brons.',
    image: images['products/anglar-kort'],
    imageAlt: 'Två bronsänglar med vita ljus mellan sig, på locket av en gammal tunna.',
    // Only one kind of ängel.
    // Only one kind, so the page features it (see ProductCategoryPage).
    // Measurements and the gift-box line are the owner's, from the old site.
    items: [
      {
        id: 'angel-1',
        title: 'Ängel',
        image: images['products/angel'],
        imageAlt: 'Två bronsänglar med vita ljus mellan sig, på locket av en gammal tunna.',
        specs: 'Art.nr 541 · Höjd 7 cm · Vikt 0,3 kg',
        note:
          'Finns även som presentförpackning med 2 st änglar och handstöpta ' +
          'ljus. Äkthetsintyg ingår. Art.nr 541-2.',
      },
    ],
    showcase: [
      {
        image: images['products/angel-sida'],
        alt: 'Två änglar med vita ljus på en trätunna, sedda lite från sidan.',
        tile: 'portrait',
      },
      {
        image: images['products/anglar-trio'],
        alt: 'Tre bronsänglar uppställda tillsammans på en trätunna.',
        tile: 'landscape',
      },

      {
        image: images['products/anglar-verkstad'],
        alt: 'Rader av nygjutna änglar med ljushållare på arbetsbänken i verkstaden.',
        tile: 'landscape',
      },
      {
        image: images['products/angel-snett'],
        alt: 'Två änglar med tända ljushållare på en trätunna, snett framifrån.',
        tile: 'portrait',
      },
    ],
  },
  {
    id: 'candlesticks',
    slug: 'malmljusstakar',
    // Hidden until release: no product names or photos yet. To publish, remove
    // this flag AND the temporary /produkter/malmljusstakar redirect in
    // vercel.json (Vercel applies redirects before serving the page file), and
    // add the URL to public/sitemap.xml.
    hidden: true,
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
    image: images['products/tomtar-kort'],
    imageAlt: 'Tomtefar, Tomtemor och Tomtenisse tillsammans på en mossbevuxen sten.',
    // Three kinds, all photographed outdoors on the moss. The facts come from
    // the old site's table, which names them differently; matched by prop and
    // size (Tomtefar = "Tomte med lykta", Tomtemor = "Tomtegumma") — not yet
    // confirmed by the owner. Prices left out on purpose.
    itemRatio: 'portrait',
    items: [
      {
        id: 'gnome-tomtefar',
        title: 'Tomtefar',
        image: images['products/tomtefar'],
        imageAlt: 'Tomtefar i brons med spetsig luva, stående på mossa i skogen.',
        specs: 'Art.nr 531 · Höjd 10 cm · Vikt 0,45 kg',
      },
      {
        id: 'gnome-tomtemor',
        title: 'Tomtemor',
        image: images['products/tomtemor'],
        imageAlt: 'Tomtemor i brons med korsade armar, stående på en mosskudde.',
        specs: 'Art.nr 532 · Höjd 9 cm · Vikt 0,45 kg',
      },
      {
        id: 'gnome-tomtenisse',
        title: 'Tomtenisse',
        image: images['products/tomtenisse'],
        imageAlt: 'Tomtenisse i brons med rundad luva, stående i mossan.',
        specs: 'Art.nr 533 · Höjd 7 cm · Vikt 0,3 kg',
      },
    ],
    gallery: [
      {
        image: images['products/tomtar-familj'],
        alt: 'Tomtefar, Tomtemor och Tomtenisse tillsammans på en mossbevuxen sten.',
      },
      {
        image: images['products/tomtar-paret'],
        alt: 'Tomtefar och Tomtemor sida vid sida med skogen bakom sig.',
      },
    ],
    // Round 4 photos. Which tomte stands on the windowsill, and what the
    // reclining one is called, is not confirmed yet, so the alt text names
    // neither.
    showcase: [
      {
        image: images['products/tomtar-fonster-nara'],
        alt: 'Två stående tomtar i brons på en fönsterbänk, med fler tomtar suddigt bakom.',
        tile: 'portrait',
      },
      {
        image: images['products/tomtar-fonster'],
        alt: 'Sju stående tomtar i brons på rad på en fönsterbänk.',
        tile: 'landscape',
      },
      {
        image: images['products/liggande-tomte'],
        alt: 'En liggande tomte i brons som vilar huvudet mot handen, på en läderyta.',
        tile: 'half',
      },
      {
        image: images['products/liggande-tomtar'],
        alt: 'Fyra liggande tomtar i brons på en läderyta.',
        tile: 'half',
      },
    ],
  },
];

/** The published categories. Everything on the site reads this, not the full list. */
export const productCategories = allCategories.filter((category) => !category.hidden);

export function getCategoryBySlug(slug: string | undefined): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}
