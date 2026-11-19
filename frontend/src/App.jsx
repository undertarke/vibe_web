import { useHomeData } from './hooks/useHomeData.js';
import GlobalNav from './components/GlobalNav.jsx';
import Section from './components/Section.jsx';
import EntertainmentCarousel from './components/EntertainmentCarousel.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const { data, error, loading, reload } = useHomeData();

  return (
    <>
      <GlobalNav items={data?.nav ?? []} />
      <main className="main">
        {loading && <div className="page-status" aria-busy="true"><span className="spinner" /></div>}
        {error && (
          <div className="page-status">
            <p>Couldn’t load content: {error.message}</p>
            <button className="button button-primary" onClick={reload}>Try again</button>
          </div>
        )}
        {data && (
          <>
            {data.heroes.map((s, i) => <Section key={s.id} section={s} priority={i < 2} />)}
            <div className="promo-grid">
              {data.promos.map((s) => <Section key={s.id} section={s} />)}
            </div>
            <EntertainmentCarousel {...data.carousel} />
          </>
        )}
      </main>
      {data && <Footer {...data.footer} />}
    </>
  );
}
