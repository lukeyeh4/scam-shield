import type { SearchContent, SearchResult } from '../types'
import { Field } from './Field'
import { SafariBar } from './SafariBar'
import { TabletFrame } from './TabletFrame'
import './search.css'

const TABS = ['All', 'Images', 'Videos', 'Shopping', 'News']

// Google search results in Safari on an iPad, with a sponsored ad at the top.
// Nothing here is a real link.
export function SearchMockup({ content }: { content: SearchContent }) {
  return (
    <TabletFrame dark>
      <div className="safari">
        <SafariBar url="google.com" />

        <div className="search-page">
          <header className="search-header">
            <GoogleLogo />
            <div className="search-box">
              <Field name="query" text={content.query} className="search-query" />
              <span className="search-box-icons" aria-hidden="true">
                <CloseIcon />
                <SearchIcon />
              </span>
            </div>
            <span className="search-you" aria-hidden="true" />
          </header>

          <nav className="search-tabs" aria-hidden="true">
            {TABS.map((tab, i) => (
              <span key={tab} className={i === 0 ? 'search-tab is-active' : 'search-tab'}>
                {tab}
              </span>
            ))}
          </nav>

          <div className="search-results">
            <div className="search-result">
              <Field name="adLabel" text="Sponsored" className="search-sponsored" />
              <ResultSource result={content.ad} prefix="ad" />
              <Field name="adTitle" text={content.ad.title} className="search-title" />
              <Field name="adText" text={content.ad.text} className="search-text" />
            </div>

            {content.results.map((result, i) => (
              <div key={result.url} className="search-result">
                <ResultSource result={result} />
                <Field name={`result${i + 1}`} text={result.title} className="search-title" />
                <p className="search-text">{result.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabletFrame>
  )
}

// The site's little icon, name and address above each result's title
function ResultSource({ result, prefix }: { result: SearchResult; prefix?: string }) {
  return (
    <div className="search-source">
      <span className={result.iconFill ? 'search-favicon search-favicon-fill' : 'search-favicon'} aria-hidden="true">
        {result.icon ? <img src={result.icon} alt="" /> : result.site.charAt(0)}
      </span>
      <span className="search-source-text">
        {prefix ? <Field name={`${prefix}Site`} text={result.site} className="search-site" /> : <span className="search-site">{result.site}</span>}
        {prefix ? <Field name={`${prefix}Url`} text={result.url} className="search-url" /> : <span className="search-url">{result.url}</span>}
      </span>
    </div>
  )
}

function GoogleLogo() {
  return (
    <span className="search-logo" aria-label="Google">
      <span style={{ color: '#4285f4' }}>G</span>
      <span style={{ color: '#ea4335' }}>o</span>
      <span style={{ color: '#fbbc05' }}>o</span>
      <span style={{ color: '#4285f4' }}>g</span>
      <span style={{ color: '#34a853' }}>l</span>
      <span style={{ color: '#ea4335' }}>e</span>
    </span>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#4285f4" strokeWidth="2.2" />
      <path d="m15.5 15.5 5 5" fill="none" stroke="#4285f4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
