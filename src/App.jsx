import './App.css'
import Hero from './components/Hero'
import NFTGallery from './components/NFTGallery'
import SteamStats from './components/GameStats/SteamStats'
import FFXIVStats from './components/GameStats/FFXIVStats'
import WoWStats from './components/GameStats/WoWStats'
import POE2Stats from './components/GameStats/POE2Stats'
import NikkeStats from './components/GameStats/NikkeStats'
import ArcRaidersStats from './components/GameStats/ArcRaidersStats'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary name="Application">
      <div className="app">
        <main>
          <Hero />

          <section id="nfts" className="section">
            <div className="section__container">
              <ErrorBoundary name="NFT Gallery">
                <NFTGallery />
              </ErrorBoundary>
            </div>
          </section>

          <section id="games" className="section section--alt">
            <div className="section__container">

              <div className="games-grid">
                <ErrorBoundary name="Steam Stats">
                  <SteamStats />
                </ErrorBoundary>
                <ErrorBoundary name="FFXIV Stats">
                  <FFXIVStats />
                </ErrorBoundary>
                <ErrorBoundary name="WoW Stats">
                  <WoWStats />
                </ErrorBoundary>
                <ErrorBoundary name="POE2 Stats">
                  <POE2Stats />
                </ErrorBoundary>
                <ErrorBoundary name="Nikke Stats">
                  <NikkeStats />
                </ErrorBoundary>
                <ErrorBoundary name="Arc Raiders Stats">
                  <ArcRaidersStats />
                </ErrorBoundary>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <MusicPlayer />
      </div>
    </ErrorBoundary>
  )
}

export default App
