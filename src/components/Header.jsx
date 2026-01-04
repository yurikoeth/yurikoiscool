import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Collection', href: '#nfts' },
    { name: 'Games', href: '#games' },
    { name: 'Projects', href: '#projects' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <nav className="header__nav">
          <ul className="header__nav-list">
            {navLinks.map((link) => (
              <li key={link.name} className="header__nav-item">
                <a href={link.href} className="header__nav-link">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button className="header__cta">
          Connect
        </button>
      </div>
    </header>
  );
};

export default Header;
