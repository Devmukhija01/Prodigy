import { 
    Github, 
    Twitter, 
    Linkedin, 
    Facebook, 
    MessageCircle,
    Heart,
    ShieldCheck,
    Globe
  } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  
  export function Footer() {
    return (
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 mb-12"> */}
            {/* Brand Column - Spans 2 cols on large screens */}
            {/* <div className="col-span-2 lg:col-span-2 space-y-6 pr-8"> */}
              {/* <div className="flex items-center space-x-3" style={{height: "6vh"}}> */}
                {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <MessageCircle className="text-white" size={20} />
                </div> */}
                {/* <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Prodigy
                </span> */}
              {/* </div> */}
              {/* <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                The all-in-one platform for agile teams. Manage sprints, collaborate in real-time, and ship better software faster.
              </p> */}
              {/* <div className="flex items-center gap-2">
                <SocialButton icon={Twitter} label="Twitter" />
                <SocialButton icon={Github} label="Github" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
                <SocialButton icon={Facebook} label="Facebook" />
              </div> */}
            {/* </div> */}
  
            {/* Links Columns */}
            {/* <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase">Product</h3>
              <ul className="space-y-3">
                <FooterLink href="#">Features</FooterLink>
                <FooterLink href="#">Integrations</FooterLink>
                <FooterLink href="#">Enterprise</FooterLink>
                <FooterLink href="#">Changelog</FooterLink>
                <FooterLink href="#">Docs</FooterLink>
              </ul>
            </div> */}
  
            {/* <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase">Company</h3>
              <ul className="space-y-3">
                <FooterLink href="#">About Us</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
                <FooterLink href="#">Contact</FooterLink>
                <FooterLink href="#">Partners</FooterLink>
              </ul>
            </div> */}
  
            {/* <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase">Legal</h3>
              <ul className="space-y-3">
                <FooterLink href="#">Privacy</FooterLink>
                <FooterLink href="#">Terms</FooterLink>
                <FooterLink href="#">Security</FooterLink>
                <FooterLink href="#">Cookies</FooterLink>
              </ul>
            </div> */}
  
             {/* <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase">Security</h3>
               <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      <span>SOC2 Compliant</span>
                  </li>
                   <li className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      <span>GDPR Ready</span>
                  </li>
                   <li className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      <span>ISO 27001</span>
                  </li>
              </ul>
            </div> */}
          {/* </div> */}
  
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className='font-bold'>© {new Date().getFullYear()} Prodigy Inc. All rights reserved</span>
              {/* <span className="hidden md:inline text-gray-300 dark:text-gray-700">•</span> */}
              {/* <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="font-medium text-green-600 dark:text-green-400">Systems Normal</span>
              </div> */}
            </div>
  
            {/* <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer group">
                <Globe size={14} className="group-hover:text-blue-500 transition-colors" />
                <span>English (US)</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Made with</span>
                <Heart size={12} className="text-red-500 fill-current" />
                <span>for developers</span>
              </div>
            </div> */}
            <div className="flex items-center gap-2">
                <SocialButton icon={Twitter} label="Twitter" />
                <SocialButton icon={Github} label="Github" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
                <SocialButton icon={Facebook} label="Facebook" />
              </div>
          </div>
        </div>
      </footer>
    );
  }
  
  function SocialButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-200"
        aria-label={label}
      >
        <Icon size={18} />
      </Button>
    );
  }
  
  function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
      <li>
        <a 
          href={href} 
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 w-fit"
        >
          {children}
        </a>
      </li>
    );
  }
  