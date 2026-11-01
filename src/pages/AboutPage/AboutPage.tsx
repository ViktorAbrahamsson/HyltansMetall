import { Helmet } from 'react-helmet-async';
import Figure from '@/components/common/Figure/Figure';
import { images } from '@/assets/images/manifest';
import styles from './AboutPage.module.scss';

/** Sections here sit inside .container-sm, which caps out at 900px. */
const ABOUT_SIZES = '(min-width: 900px) 900px, 100vw';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Om oss. Hyltans Metall</title>
      </Helmet>

      {/* Intro block */}
      <section className={`block about-page-block ${styles['about-page__intro']}`}>
        <div className="container">
          <div className={`page-intro ${styles['about-page__intro-inner']}`}>
            <h1 className={styles['about-page__h1']}>Om oss</h1>
            <p className="page-intro__lead">
              Hyltans Metall tillverkar sandgjutna produkter i brons och mässing.
              Tillverkningen sker med samma metoder som vid företagets start 1926.
              Ett äkta hantverk som har ärvts från far till son i fyra generationer.
            </p>
          </div>
          <span
            className={`ghost-numeral ${styles['about-page__ghost']}`}
            aria-hidden="true"
          >
            1926
          </span>
        </div>
      </section>

      {/* Content block */}
      <section className={`block block--paper ${styles['about-page__content-block']}`}>
        <div className="container container-sm">

          <div className={styles['about-page__section']}>
            <h2 className={styles['about-page__section-h2']}>Från timmerstuga till fabrik</h2>
            <p className={styles['about-page__section-p']}>
              Det steniga och magra jordbruket i Småland gav inte tillräckligt till
              försörjningen i Gnosjö för hundra år sedan. Min farfar tog anställning
              och lärde sig till gjutare.
            </p>
            <p className={styles['about-page__section-p']}>
              Några år senare startade han eget gjuteri i en äldre timmerstuga. Ganska
              snart krävdes större lokaler och en helt ny fabrik byggdes hemma på
              gården. En utbyggnad var klar 1930.
            </p>
            <Figure
              image={images['workshop/generationer']}
              alt="Tre man vid ugnen i gjuteriet, den yngsta generationen ser på."
              ratio="landscape"
              sizes={ABOUT_SIZES}
              className={styles['about-page__section-media']}
            />
          </div>

          <div className={styles['about-page__section']}>
            <h2 className={styles['about-page__section-h2']}>Krigsår och värmepannor</h2>
            <p className={styles['about-page__section-p']}>
              Under andra världskriget var det mycket svårt att köpa metall och andra
              produkter. Någon gång fick de metall levererad som bestod av bland annat
              skrotade krigsflygplan.
            </p>
            <p className={styles['about-page__section-p']}>
              På 1950-talet och framåt, när husen utrustades med vattenburna
              värmesystem, tillverkades mängder med kopplingar och andra detaljer till
              värmepannor.
            </p>
          </div>

          <div className={styles['about-page__section']}>
            <h2 className={styles['about-page__section-h2']}>Hantverket framför pressgjutningen</h2>
            <p className={styles['about-page__section-p']}>
              Under 60-talet, när pressgjutningstekniken tog fart, fick många mindre
              sandgjuterier svårt att klara konkurrensen. Min far och farbror fortsatte
              med det genuina hantverket och investerade i svarvar och annan utrustning
              för tillverkning av malmljusstakar och andra presentföremål.
            </p>
            <Figure
              image={images['workshop/polerat']}
              alt="Färdigpolerade malmljusstakar uppradade på arbetsbänken."
              ratio="landscape"
              sizes={ABOUT_SIZES}
              className={styles['about-page__section-media']}
            />
          </div>

          <div className={styles['about-page__section']}>
            <h2 className={styles['about-page__section-h2']}>Det sista sandgjuteriet i Gnosjö</h2>
            <p className={styles['about-page__section-p']}>
              Efter att ha varit ett av ca 50 små gjuterier i Gnosjö under 1900-talet är
              Hyltans Metall AB idag det enda kvarvarande privatägda sandgjuteriet som
              fortfarande lever kvar.
            </p>
            <p className={styles['about-page__section-p']}>
              Målsättningen är att låta det gamla hantverket leva kvar och att fortsätta
              att vårda den gamla fabriksbyggnaden, som är klassad som ”högt
              kulturhistoriskt värde”.
            </p>
            <p className={styles['about-page__signature']}>
              Håkan Abrahamsson
              <span className={styles['about-page__signature-meta']}>
                Hyltans Metall AB, Gnosjö
              </span>
            </p>
            <Figure
              image={images['place/fasad']}
              alt="Gjuteriets röda träfasad målas om en sommardag."
              ratio="landscape"
              sizes={ABOUT_SIZES}
              className={styles['about-page__section-media']}
            />
          </div>

        </div>
      </section>
    </>
  );
}
