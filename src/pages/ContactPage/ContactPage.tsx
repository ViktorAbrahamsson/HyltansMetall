import { useState, type FormEvent } from 'react';
import Seo from '@/components/layout/Seo';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import { company } from '@/data/company';
import styles from './ContactPage.module.scss';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  /**
   * There is no backend, so the form hands the message to the visitor's own
   * email client with everything already filled in and addressed to us.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = name
      ? `Meddelande från ${name}`
      : 'Meddelande från hyltansmetall.se';

    const body = [
      `Namn: ${name}`,
      `E-post: ${email}`,
      '',
      message,
    ].join('\r\n');

    window.location.href =
      `mailto:${company.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <>
      <Seo
        title="Kontakta oss. Hyltans Metall"
        description="Kontakta Hyltans Metall i Gnosjö via e-post, info@hyltansmetall.se, eller telefon 070-910 44 38. Förfrågningar, beställningar och övriga frågor."
      />

      <section className="block contact-block">
        <div className="container">
          <div className={`page-intro ${styles['contact-page__intro']}`}>
            <h1 className={styles['contact-page__h1']}>Kontakta oss</h1>
            <p className="page-intro__lead">
              Du är varmt välkommen att kontakta oss, helst via e-post.
              Förfrågningar, beställningar och övriga frågor.
            </p>
          </div>

          <div className={styles['contact-page__layout']}>

            {/* Info column */}
            <div className={styles['contact-page__info']}>
              <address className={styles['contact-page__address']}>
                <div className={styles['contact-page__address-item']}>
                  <span className={styles['contact-page__address-label']}>E-post</span>
                  <a
                    href={`mailto:${company.email}`}
                    className={`${styles['contact-page__address-value']} ${styles['contact-page__address-link']}`}
                  >
                    {company.email}
                  </a>
                </div>
                <div className={styles['contact-page__address-item']}>
                  <span className={styles['contact-page__address-label']}>Telefon</span>
                  <a
                    href={`tel:${company.phoneHref}`}
                    className={`${styles['contact-page__address-value']} ${styles['contact-page__address-link']}`}
                  >
                    {company.phone}
                  </a>
                  <span className={styles['contact-page__address-value']}>
                    Främst kvällar och helger
                  </span>
                </div>
              </address>

              <div className={styles['contact-page__map']}>
                <iframe
                  className={styles['contact-page__map-frame']}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(company.mapQuery)}&z=11&output=embed`}
                  title={`Karta över ${company.name} i ${company.city}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Form column */}
            <div className={styles['contact-page__form-card']}>
              <form className={styles['contact-page__form']} onSubmit={handleSubmit}>
                <h2 className={styles['contact-page__form-heading']}>Skicka ett meddelande</h2>

                <div className={styles['contact-page__form-group']}>
                  <label htmlFor="contact-name" className={styles['contact-page__form-label']}>
                    Namn
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    className={styles['contact-page__form-input']}
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={styles['contact-page__form-group']}>
                  <label htmlFor="contact-email" className={styles['contact-page__form-label']}>
                    E-postadress
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    className={styles['contact-page__form-input']}
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles['contact-page__form-group']}>
                  <label htmlFor="contact-message" className={styles['contact-page__form-label']}>
                    Meddelande
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    className={styles['contact-page__form-textarea']}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn ${styles['contact-page__form-submit']}`}
                >
                  Skicka meddelande
                </button>

                <p className={styles['contact-page__form-note']}>
                  Knappen öppnar ditt e-postprogram med meddelandet ifyllt och
                  adresserat till {company.email}.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      <InstagramFeed />
    </>
  );
}
