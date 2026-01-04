const Hero = () => {
  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/yurikoeth', icon: 'X' },
    { name: 'Discord', href: 'https://discord.com/users/yurikoeth', icon: 'D' },
    { name: 'OpenSea', href: 'https://opensea.io/yurikoeth', icon: 'OS' },
  ];

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">

          <h1 className="hero__title">
            <span className="hero__title-line">Yuriko</span>
          </h1>

          <p className="hero__quote">
            "Our goal must be the infinite and not the finite. The Infinity is our homeland. We are always expected in Heaven."
          </p>

          <div className="hero__social">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
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
