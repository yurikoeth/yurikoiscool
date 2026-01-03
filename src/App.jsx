import './App.css'
import Header from './components/Header'
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

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />

        <section id="nfts" className="section">
          <div className="section__container">
            <NFTGallery />
          </div>
        </section>

        <section id="games" className="section section--alt">
          <div className="section__container">

            <div className="games-grid">
              <SteamStats />
              <FFXIVStats />
              <WoWStats />
              <POE2Stats />
              <NikkeStats />
              <ArcRaidersStats />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  )
}

export default App
