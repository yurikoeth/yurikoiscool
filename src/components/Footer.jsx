const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/yurikoeth', icon: 'X' },
    { name: 'Discord', href: 'https://discord.com/users/yurikoeth', icon: 'D' },
    { name: 'OpenSea', href: 'https://opensea.io/yurikoeth', icon: 'OS' },
  ];

  const footerLinks = [];

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              <span className="footer__logo-text">YK</span>
            </a>
            <p className="footer__description">
              Digital creator exploring the frontiers of gaming and NFT art.
            </p>
          </div>

          <div className="footer__social">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={link.name}
              >
                <span className="footer__social-icon">{link.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="footer__divider"></div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} Yuriko Nakamura. All rights reserved.
          </p>

          <nav className="footer__nav">
            {footerLinks.map((link) => (
              <a key={link.name} href={link.href} className="footer__nav-link">
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
