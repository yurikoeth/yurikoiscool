const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/yurikoeth', icon: 'X' },
    { name: 'Discord', href: 'https://discord.com/users/yurikoeth', icon: 'D' },
    { name: 'OpenSea', href: 'https://opensea.io/yurikoeth', icon: 'OS' },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__copyright">
          &copy; {currentYear} Yuriko. All rights reserved.
        </p>

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
    </footer>
  );
};

export default Footer;
