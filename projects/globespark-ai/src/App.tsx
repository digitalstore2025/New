import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@appdeploy/client';
import {
  Building2,
  Database,
  Globe2,
  Languages,
  Leaf,
  Landmark,
  MapPin,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import GlobeCanvas from './components/GlobeCanvas';
import { countryList, flagFromCode } from './countries';
import { copy } from './i18n';
import type {
  CategoryKey,
  CountryMetadata,
  FactsResponse,
  GroundedBriefResponse,
  HeritageResponse,
  Locale,
  SelectedCountry,
} from './types';

const categoryIcons: Record<CategoryKey, typeof Sparkles> = {
  culture: Sparkles,
  food: UtensilsCrossed,
  history: Landmark,
  language: Languages,
  nature: Leaf,
};

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const params = new URLSearchParams(window.location.search);
  const param = params.get('lang');
  if (param === 'en' || param === 'ar' || param === 'tr') return param;
  const stored = window.localStorage.getItem('globespark-locale');
  if (stored === 'en' || stored === 'ar' || stored === 'tr') return stored;
  const browser = navigator.language.slice(0, 2);
  return browser === 'ar' || browser === 'tr' ? browser : 'en';
}

function cacheKey(kind: 'metadata' | 'heritage' | 'facts' | 'grounded', countryKey: string, language: Locale) {
  return `globespark:last-good:${kind}:${countryKey.toUpperCase()}:${language}`;
}

function readLastGood<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLastGood(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes; live data still works.
  }
}

function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [selected, setSelected] = useState<SelectedCountry | null>(null);
  const [facts, setFacts] = useState<FactsResponse | null>(null);
  const [metadata, setMetadata] = useState<CountryMetadata | null>(null);
  const [heritage, setHeritage] = useState<HeritageResponse | null>(null);
  const [grounded, setGrounded] = useState<GroundedBriefResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [heritageLoading, setHeritageLoading] = useState(false);
  const [heritageError, setHeritageError] = useState(false);
  const [groundedLoading, setGroundedLoading] = useState(false);
  const [groundedError, setGroundedError] = useState(false);
  const [metadataDegraded, setMetadataDegraded] = useState(false);
  const [heritageDegraded, setHeritageDegraded] = useState(false);
  const [factsDegraded, setFactsDegraded] = useState(false);
  const [groundedDegraded, setGroundedDegraded] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const deepLinkHandled = useRef(false);
  const t = copy[locale];

  const countries = useMemo(() => countryList(locale), [locale]);
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (needle.length < 2) return [];
    return countries
      .filter(country =>
        country.name.toLocaleLowerCase(locale).includes(needle)
      )
      .slice(0, 8);
  }, [countries, locale, query]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('globespark-locale', locale);
  }, [locale]);

  useEffect(() => {
    if (deepLinkHandled.current || countries.length === 0) return;
    deepLinkHandled.current = true;
    const code = new URLSearchParams(window.location.search)
      .get('country')
      ?.toUpperCase();
    if (!code) return;
    const country = countries.find(item => item.code === code);
    if (country) chooseCountry(country);
  }, [countries]);

  async function fetchMetadata(country: SelectedCountry, language: Locale) {
    if (!country.code) {
      setMetadata(null);
      return;
    }
    setMetadataLoading(true);
    setMetadataDegraded(false);
    const key = cacheKey('metadata', country.code, language);
    try {
      const response = await api.get(`/api/country/${country.code}`, { lang: language });
      const data = response.data as CountryMetadata;
      setMetadata(data);
      writeLastGood(key, data);
    } catch {
      const fallback = readLastGood<CountryMetadata>(key);
      setMetadata(fallback);
      setMetadataDegraded(Boolean(fallback));
    } finally {
      setMetadataLoading(false);
    }
  }

  async function fetchHeritage(country: SelectedCountry, language: Locale) {
    if (!country.code) {
      setHeritage(null);
      return;
    }
    setHeritageLoading(true);
    setHeritageError(false);
    setHeritageDegraded(false);
    const key = cacheKey('heritage', country.code, language);
    try {
      const response = await api.get(`/api/heritage/${country.code}`, { lang: language });
      const data = response.data as HeritageResponse;
      setHeritage(data);
      writeLastGood(key, data);
    } catch {
      const fallback = readLastGood<HeritageResponse>(key);
      setHeritage(fallback);
      setHeritageDegraded(Boolean(fallback));
      setHeritageError(!fallback);
    } finally {
      setHeritageLoading(false);
    }
  }

  async function fetchGrounded(country: SelectedCountry, language: Locale, refresh = false) {
    if (!country.code) {
      setGrounded(null);
      return;
    }
    setGroundedLoading(true);
    setGroundedError(false);
    setGroundedDegraded(false);
    const key = cacheKey('grounded', country.code, language);
    try {
      const response = await api.post('/api/grounded-brief', {
        code: country.code,
        locale: language,
        refresh,
      });
      const data = response.data as GroundedBriefResponse;
      setGrounded(data);
      writeLastGood(key, data);
    } catch {
      const fallback = readLastGood<GroundedBriefResponse>(key);
      setGrounded(fallback);
      setGroundedDegraded(Boolean(fallback));
      setGroundedError(!fallback);
    } finally {
      setGroundedLoading(false);
    }
  }

  async function generateFacts(
    country: SelectedCountry,
    language: Locale,
    refresh = false
  ) {
    setLoading(true);
    setError('');
    setFacts(null);
    setFactsDegraded(false);
    const key = cacheKey('facts', country.code || country.name, language);
    try {
      const response = await api.post('/api/facts', {
        country: country.name,
        code: country.code,
        locale: language,
        refresh,
      });
      const data = response.data as FactsResponse;
      setFacts(data);
      writeLastGood(key, data);
    } catch {
      const fallback = readLastGood<FactsResponse>(key);
      if (fallback) {
        setFacts(fallback);
        setFactsDegraded(true);
      } else {
        setError('request_failed');
      }
    } finally {
      setLoading(false);
    }
  }

  function syncUrl(country: SelectedCountry | null, language: Locale) {
    const url = new URL(window.location.href);
    if (country?.code) url.searchParams.set('country', country.code);
    else url.searchParams.delete('country');
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  }

  function chooseCountry(country: SelectedCountry) {
    const localized = country.code
      ? countries.find(item => item.code === country.code) ?? country
      : country;
    setSelected(localized);
    setQuery('');
    setMetadata(null);
    setHeritage(null);
    setGrounded(null);
    setHeritageError(false);
    setGroundedError(false);
    setMetadataDegraded(false);
    setHeritageDegraded(false);
    setFactsDegraded(false);
    setGroundedDegraded(false);
    syncUrl(localized, locale);
    void generateFacts(localized, locale);
    void fetchMetadata(localized, locale);
    void fetchHeritage(localized, locale);
    void fetchGrounded(localized, locale);
  }

  function changeLocale(next: Locale) {
    setLocale(next);
    const localizedName = selected?.code
      ? new Intl.DisplayNames([next], { type: 'region' }).of(selected.code) ||
        selected.name
      : selected?.name;
    const nextSelected =
      selected && localizedName ? { ...selected, name: localizedName } : selected;
    if (nextSelected) {
      setSelected(nextSelected);
      void generateFacts(nextSelected, next);
      void fetchMetadata(nextSelected, next);
      void fetchHeritage(nextSelected, next);
      void fetchGrounded(nextSelected, next);
    }
    syncUrl(nextSelected, next);
  }

  async function shareCurrent() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `GlobeSpark AI${selected ? ` — ${selected.name}` : ''}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const focus =
    metadata?.longitude != null && metadata?.latitude != null
      ? { longitude: metadata.longitude, latitude: metadata.latitude }
      : null;

  const metadataState = metadataLoading
    ? 'loading'
    : metadata
      ? metadataDegraded
        ? 'fallback'
        : 'live'
      : 'unavailable';
  const heritageState = heritageLoading
    ? 'loading'
    : heritage
      ? heritageDegraded
        ? 'fallback'
        : 'live'
      : heritageError
        ? 'unavailable'
        : 'pending';
  const factsState = loading
    ? 'loading'
    : facts
      ? factsDegraded
        ? 'fallback'
        : facts.cached
          ? 'cache'
          : 'live'
      : error
        ? 'unavailable'
        : 'pending';
  const groundedState = groundedLoading
    ? 'loading'
    : grounded
      ? groundedDegraded
        ? 'fallback'
        : grounded.cached
          ? 'cache'
          : 'live'
      : groundedError
        ? 'unavailable'
        : 'pending';

  return (
    <main className="app-shell">
      <div className="stars stars-a" aria-hidden="true" />
      <div className="stars stars-b" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Globe2 size={21} />
          </span>
          <span>
            GlobeSpark <b>AI</b>
          </span>
        </div>
        <div className="tagline">{t.tagline}</div>
        <div className="top-actions">
          <div className="locale-switch" aria-label="Language">
            {(['en', 'ar', 'tr'] as Locale[]).map(item => (
              <button
                key={item}
                type="button"
                className={locale === item ? 'active' : ''}
                onClick={() => changeLocale(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="share-btn"
            type="button"
            onClick={() => void shareCurrent()}
          >
            <Share2 size={16} />
            <span>{copied ? t.copied : t.share}</span>
          </button>
        </div>
      </header>

      <section className="layout">
        <div className="globe-zone">
          <div className="search-wrap">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label={t.search}
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t.search}
              autoComplete="off"
            />
            {matches.length > 0 && (
              <div
                className="search-results"
                role="listbox"
                aria-label={t.matches}
              >
                {matches.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => chooseCountry(country)}
                  >
                    <span>{flagFromCode(country.code)}</span>
                    <span>{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <GlobeCanvas
            selectedCode={selected?.code}
            focus={focus}
            onSelect={chooseCountry}
            labels={{
              globeLabel: t.globeLabel,
              globeHint: t.globeHint,
              mapUnavailable: t.mapUnavailable,
              controls: t.controls,
              rotateLeft: t.rotateLeft,
              rotateRight: t.rotateRight,
              rotateUp: t.rotateUp,
              rotateDown: t.rotateDown,
              zoomIn: t.zoomIn,
              zoomOut: t.zoomOut,
              resetGlobe: t.resetGlobe,
            }}
          />
        </div>

        <aside className="facts-panel" aria-live="polite">
          {!selected && !loading && (
            <div className="empty-state">
              <span className="orbit-icon">
                <Globe2 size={38} />
              </span>
              <p className="eyebrow">{t.ready}</p>
              <h1>{t.title}</h1>
              <p>{t.intro}</p>
              <div className="theme-pills">{t.themes}</div>
            </div>
          )}

          {selected && (
            <>
              <div className="country-head">
                <div>
                  <p className="eyebrow">{t.aiBrief}</p>
                  <h2>
                    <span>{flagFromCode(selected.code)}</span> {selected.name}
                  </h2>
                </div>
                <button
                  className="regenerate-btn"
                  type="button"
                  onClick={() =>
                    void generateFacts(selected, locale, true)
                  }
                  disabled={loading}
                  aria-label={`${t.regenerate}: ${selected.name}`}
                >
                  <RefreshCw
                    size={17}
                    className={loading ? 'spin' : ''}
                  />
                  <span>{t.regenerate}</span>
                </button>
              </div>

              {(metadataDegraded || heritageDegraded || factsDegraded || groundedDegraded) && (
                <div className="degraded-banner" role="status">
                  <Database size={15} />
                  <span>{t.degradedFallback}</span>
                </div>
              )}

              <section className="evidence-status" aria-label={t.evidenceTitle}>
                <div className="evidence-head">
                  <div>
                    <strong>{t.evidenceTitle}</strong>
                    <span>{t.evidenceBody}</span>
                  </div>
                  <a href="./data-methodology.html">{t.methodologyLink}</a>
                </div>
                <div className="evidence-grid">
                  <article
                    className={`evidence-item is-${metadataState}`}
                    data-evidence-class="verified-source"
                    data-source="World Bank"
                    data-state={metadataState}
                  >
                    <div><Database size={15} /><strong>{t.sourceWorldBank}</strong></div>
                    <span className="evidence-state">{t.statusLabels[metadataState]}</span>
                    {metadata?.retrievedAt && (
                      <time dateTime={metadata.retrievedAt}>
                        {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(metadata.retrievedAt))}
                      </time>
                    )}
                  </article>
                  <article
                    className={`evidence-item is-${heritageState}`}
                    data-evidence-class="verified-source"
                    data-source="UNESCO DataHub"
                    data-state={heritageState}
                  >
                    <div><Landmark size={15} /><strong>{t.sourceUnesco}</strong></div>
                    <span className="evidence-state">{t.statusLabels[heritageState]}</span>
                    {heritage?.retrievedAt && (
                      <time dateTime={heritage.retrievedAt}>
                        {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(heritage.retrievedAt))}
                      </time>
                    )}
                  </article>
                  <article
                    className={`evidence-item is-${groundedState}`}
                    data-evidence-class="grounded-generation"
                    data-source="GlobeSpark Grounded RAG"
                    data-state={groundedState}
                  >
                    <div><Database size={15} /><strong>{t.groundedSourceLabel}</strong></div>
                    <span className="evidence-state">{t.statusLabels[groundedState]}</span>
                    {grounded?.generatedAt && (
                      <time dateTime={grounded.generatedAt}>
                        {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(grounded.generatedAt))}
                      </time>
                    )}
                  </article>
                  <article
                    className={`evidence-item is-${factsState}`}
                    data-evidence-class="generated-explanation"
                    data-source="GlobeSpark AI"
                    data-state={factsState}
                  >
                    <div><Sparkles size={15} /><strong>{t.aiSourceLabel}</strong></div>
                    <span className="evidence-state">{t.statusLabels[factsState]}</span>
                    {facts?.generatedAt && (
                      <time dateTime={facts.generatedAt}>
                        {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(facts.generatedAt))}
                      </time>
                    )}
                  </article>
                </div>
              </section>

              <section
                className="metadata-section"
                aria-label={t.verifiedData}
              >
                <div className="section-heading">
                  <span>{t.verifiedData}</span>
                  <a
                    href="https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Database size={14} /> {t.sourceWorldBank}
                  </a>
                </div>
                <div className="metadata-grid">
                  <div>
                    <Building2 size={17} />
                    <span>{t.capital}</span>
                    <strong>
                      {metadataLoading
                        ? '…'
                        : metadata?.capital || t.unavailable}
                    </strong>
                  </div>
                  <div>
                    <MapPin size={17} />
                    <span>{t.region}</span>
                    <strong>
                      {metadataLoading
                        ? '…'
                        : metadata?.region || t.unavailable}
                    </strong>
                  </div>
                  <div>
                    <Users size={17} />
                    <span>{t.population}</span>
                    <strong>
                      {metadataLoading
                        ? '…'
                        : metadata?.population != null
                          ? `${new Intl.NumberFormat(locale).format(metadata.population)}${metadata.populationYear ? ` · ${metadata.populationYear}` : ''}`
                          : t.unavailable}
                    </strong>
                  </div>
                  <div>
                    <Globe2 size={17} />
                    <span>{t.coordinates}</span>
                    <strong>
                      {metadataLoading
                        ? '…'
                        : metadata?.latitude != null &&
                            metadata?.longitude != null
                          ? `${metadata.latitude.toFixed(2)}, ${metadata.longitude.toFixed(2)}`
                          : t.unavailable}
                    </strong>
                  </div>
                </div>
              </section>

              <section
                className="heritage-section"
                aria-label={t.heritageTitle}
              >
                <div className="section-heading">
                  <span>{t.heritageTitle}</span>
                  <a
                    href="https://datacatalog.unesco.org/explore/dataset/whc001/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Landmark size={14} /> {t.sourceUnesco}
                  </a>
                </div>
                {heritageLoading && (
                  <div className="heritage-status">…</div>
                )}
                {!heritageLoading && heritageError && (
                  <div className="heritage-status heritage-warning">
                    {t.heritageUnavailable}
                  </div>
                )}
                {!heritageLoading && !heritageError && heritage && (
                  <>
                    <div className="heritage-summary">
                      <strong>{heritage.totalCount}</strong>{' '}
                      <span>{t.heritageProperties}</span>
                      <small>
                        {t.retrieved}:{' '}
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: 'medium',
                        }).format(new Date(heritage.retrievedAt))}
                      </small>
                    </div>
                    {heritage.sites.length === 0 ? (
                      <p className="heritage-empty">{t.noHeritage}</p>
                    ) : (
                      <div className="heritage-list">
                        {heritage.sites.slice(0, 6).map((site, index) => (
                          <a
                            key={`${site.id ?? 'site'}-${index}`}
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{site.name}</span>
                            <small>
                              {site.category
                                ? t.heritageCategories[site.category] ||
                                  site.category
                                : t.unavailable}
                              {site.inscriptionYear
                                ? ` · ${site.inscriptionYear}`
                                : ''}
                              {site.inDanger ? ` · ${t.inDanger}` : ''}
                            </small>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="grounded-section" aria-label={t.groundedTitle}>
                <div className="section-heading">
                  <span>{t.groundedTitle}</span>
                  <span className="grounded-badge">{t.groundedBadge}</span>
                </div>
                <p className="grounded-intro">{t.groundedBody}</p>
                {groundedLoading && <div className="heritage-status">{t.groundedLoading}</div>}
                {!groundedLoading && groundedError && (
                  <div className="heritage-status heritage-warning">{t.groundedUnavailable}</div>
                )}
                {!groundedLoading && grounded && (
                  <>
                    <article className={`grounded-summary is-${grounded.summary.status}`}>
                      <strong>{grounded.summary.status === 'supported' ? t.groundedSupported : t.groundedAbstained}</strong>
                      <p>{grounded.summary.text}</p>
                      {grounded.summary.sourceIds.length > 0 && (
                        <div className="citation-chips">
                          {grounded.summary.sourceIds.map(id => {
                            const source = grounded.sources.find(item => item.id === id);
                            return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.provider}</a> : null;
                          })}
                        </div>
                      )}
                    </article>
                    <div className="grounded-claims">
                      {grounded.claims.map(claim => (
                        <article key={claim.theme} className={`grounded-claim is-${claim.status}`}>
                          <div className="grounded-claim-head">
                            <strong>{t.categories[claim.theme]}</strong>
                            <span>{claim.status === 'supported' ? t.groundedSupported : t.groundedAbstained}</span>
                          </div>
                          <p>{claim.text}</p>
                          {claim.sourceIds.length > 0 && (
                            <div className="citation-chips">
                              {claim.sourceIds.map(id => {
                                const source = grounded.sources.find(item => item.id === id);
                                return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : null;
                              })}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                    <p className="grounded-footnote">{grounded.cached ? t.groundedCached : t.groundedFresh}</p>
                  </>
                )}
              </section>
            </>
          )}

          {loading && (
            <div className="loading-card">
              <Sparkles size={24} />
              <strong>{t.gathering}</strong>
              <span>{t.balance}</span>
              <div className="skeletons">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          )}

          {error && selected && (
            <div className="error-card" role="alert">
              <strong>{t.failed}</strong>
              <span>{t.failureBody}</span>
              <button
                type="button"
                onClick={() => void generateFacts(selected, locale)}
              >
                {t.retry}
              </button>
            </div>
          )}

          {facts && selected && (
            <div className="facts-content">
              <p className="summary">{facts.summary}</p>
              <div className="fact-grid">
                {(Object.keys(categoryIcons) as CategoryKey[]).map(key => {
                  const Icon = categoryIcons[key];
                  return (
                    <article className="fact-card" key={key}>
                      <div className="fact-title">
                        <span>
                          <Icon size={17} />
                        </span>
                        {t.categories[key]}
                      </div>
                      <p>{facts[key]}</p>
                    </article>
                  );
                })}
              </div>
              <div className="generation-meta">
                <span>
                  <Sparkles size={13} />{' '}
                  {facts.cached ? 'AI cache' : 'AI live'} ·{' '}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                  }).format(new Date(facts.generatedAt))}
                </span>
              </div>
              <p className="ai-note">
                <Sparkles size={13} /> {t.aiDisclosure}
              </p>
            </div>
          )}

          <details className="methodology">
            <summary>{t.sourcesTitle}</summary>
            <p>{t.sourceBody}</p>
            <p>{t.mapDisclosure}</p>
            <div className="method-links">
              <a
                href="https://www.naturalearthdata.com/about/terms-of-use/"
                target="_blank"
                rel="noreferrer"
              >
                Natural Earth
              </a>
              <a
                href="https://datahelpdesk.worldbank.org/knowledgebase/articles/889392"
                target="_blank"
                rel="noreferrer"
              >
                World Bank API
              </a>
              <a
                href="https://datacatalog.unesco.org/explore/dataset/whc001/"
                target="_blank"
                rel="noreferrer"
              >
                UNESCO DataHub
              </a>
            </div>
          </details>
        </aside>
      </section>
    </main>
  );
}

export default App;
