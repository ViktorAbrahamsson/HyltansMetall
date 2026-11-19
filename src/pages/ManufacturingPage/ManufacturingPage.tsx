import { Helmet } from 'react-helmet-async';
import Figure from '@/components/common/Figure/Figure';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import { images } from '@/assets/images/manifest';
import styles from './ManufacturingPage.module.scss';

const steps = [
  {
    number: '01',
    title: 'Formen packas',
    description:
      'Engångsformar tillverkas genom att sand packas för hand runt en modell av det man vill ha tillverkat.',
    image: images['process/02-sandpackning'],
    imageAlt: 'Gjutsand packas för hand runt en bronskula i gjutformen.',
  },
  {
    number: '02',
    title: 'Modellen plockas ut',
    description:
      'Därefter delas formhalvorna och modellen plockas ut. Ingjutskanaler skärs ut ur sanden. Halvorna läggs ihop och är klara för gjutning.',
    image: images['process/01-modell'],
    imageAlt: 'En modell läggs på plats i gjutlådan inför formningen.',
  },
  {
    number: '03',
    title: 'Metallen smälts',
    description:
      'Metallen smälts i en kokseldad gjutugn. När metallen uppnår ca 1200 grader kan gjutningen påbörjas.',
    image: images['process/03-smaltning'],
    imageAlt: 'Glödande degel med smält metall omgiven av lågor i koksbädden.',
  },
  {
    number: '04',
    title: 'Formarna fylls',
    description:
      'Den smälta metallen hälls i formen genom ingjutskanalerna och fyller avtrycket som modellen lämnat efter sig.',
    image: images['process/04-gjutning'],
    imageAlt: 'Smält metall hälls ur skänken ner i sandformen.',
  },
  {
    number: '05',
    title: 'Formen slås sönder',
    description:
      'Efter att metallen har svalnat kan formarna slås sönder och den gjutna detaljen kan plockas ut.',
    image: images['process/05-rensning'],
    imageAlt: 'Nygjutna föremål med gjutkanaler kvar i de uppbrutna sandformarna.',
  },
  {
    number: '06',
    title: 'Efterbearbetning',
    description:
      'Efter kapning av gjutkanalerna återstår efterbearbetning genom slipning, svarvning, polering med mera.',
    image: images['workshop/polerat'],
    imageAlt: 'Färdigpolerade malmljusstakar uppradade på arbetsbänken.',
  },
];

export default function ManufacturingPage() {
  return (
    <>
      <Helmet>
        <title>Gjutprocessen. Hyltans Metall</title>
      </Helmet>

      {/* Intro block */}
      <section className={`block manufacturing-block ${styles['mfg-intro']}`}>
        <div className="container container-sm page-intro">
          <h1 className={styles['mfg-intro__h1']}>Gjutprocessen</h1>
          <p className="page-intro__lead">
            Varje form används bara en gång. Sanden packas för hand runt modellen,
            metallen smälts i en kokseldad gjutugn och formen slås sönder när godset
            svalnat. Allt med samma metoder som vid företagets start 1926.
          </p>
        </div>
      </section>

      {/* Steps section */}
      <section className={`block block--paper steps-block ${styles['mfg-steps']}`}>
        <div className="container">
          <ol className={styles['mfg-steps__list']}>
            {steps.map((step, i) => (
              <li key={step.number} className={styles['mfg-step']}>
                <span
                  className={styles['mfg-step__numeral']}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <div className={styles['mfg-step__body']}>
                  <h2 className={styles['mfg-step__title']}>{step.title}</h2>
                  <p className={styles['mfg-step__desc']}>{step.description}</p>
                </div>
                <Figure
                  image={step.image}
                  alt={step.imageAlt}
                  ratio="landscape"
                  sizes="(min-width: 1200px) 530px, (min-width: 1024px) 44vw, (min-width: 768px) 60vw, 100vw"
                  priority={i === 0}
                  className={styles['mfg-step__media']}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <InstagramFeed />
    </>
  );
}
