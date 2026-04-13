const Footer = () => {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="text-black font-bold text-sm">JB</span>
              </div>
              <span className="font-display font-semibold text-xl">
                <span className="text-white">JB </span>
                <span className="text-gold">Crownstone</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Premier luxury real estate and private investment platform serving discerning clients worldwide. Excellence in every transaction.
            </p>
            <div className="flex gap-4 mt-6">
              {['LinkedIn', 'Instagram', 'Twitter'].map(social => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-gray-500 hover:text-gold transition-colors border border-dark-border hover:border-gold/30 px-3 py-1.5 rounded"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-wide uppercase">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Our Portfolio', 'Press', 'Careers', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-gold text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-wide uppercase">Services</h4>
            <ul className="space-y-3">
              {['Residential', 'Commercial', 'Investment', 'Property Management', 'Consulting'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-gold text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2024 JB Crownstone. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
