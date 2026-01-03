const Hero = () => {
  const socialLinks = [
    { name: 'Twitter', href: '#', icon: 'X' },
    { name: 'Discord', href: '#', icon: 'D' },
    { name: 'OpenSea', href: '#', icon: 'OS' },
  ];

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">

          <h1 className="hero__title">
            <span className="hero__title-line">Yuriko</span>
          </h1>

          <div className="hero__cta-group">
            <a href="#nfts" className="hero__cta hero__cta--primary">
              View Collection
            </a>
            <a href="#about" className="hero__cta hero__cta--secondary">
              Learn More
            </a>
          </div>

          <div className="hero__social">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hero__social-link"
                aria-label={link.name}
              >
                <span className="hero__social-icon">{link.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-shape"></div>
          <div className="hero__visual-glow"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
