'use client';

import { useEffect, useState } from 'react';

interface BrowserExtensionHandlerProps {
  children: React.ReactNode;
}

export function BrowserExtensionHandler({ children }: BrowserExtensionHandlerProps) {
  const [isClient, setIsClient] = useState(false);
  const [extensionsDetected, setExtensionsDetected] = useState<string[]>([]);
  const [hydrationSafe, setHydrationSafe] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Detect common browser extensions that might interfere
    const detectExtensions = () => {
      const extensions: string[] = [];
      
      // Check for wallet extensions
      if (typeof window !== 'undefined') {
        // MetaMask
        if (window.ethereum) extensions.push('MetaMask');
        // @ts-ignore
        if (window.solana) extensions.push('Phantom');
        // @ts-ignore
        if (window.xfi) extensions.push('XDEFI');
        // @ts-ignore
        if (window.keplr) extensions.push('Keplr');
        // @ts-ignore
        if (window.xverse) extensions.push('Xverse');
        // @ts-ignore
        if (window.unisat) extensions.push('UniSat');
      }
      
      // Check for extension scripts in the DOM
      const extensionScripts = document.querySelectorAll('script[src*="chrome-extension://"], script[src*="moz-extension://"]');
      const walletProviders = document.querySelectorAll('script[id*="wallet"], script[id*="provider"]');
      
      if (extensionScripts.length > 0) {
        extensions.push('Browser Extension');
      }
      
      if (walletProviders.length > 0) {
        extensions.push('Wallet Provider');
      }
      
      setExtensionsDetected(extensions);
      
      if (extensions.length > 0) {
        // Add attribute to prevent hydration warnings for extension-injected content
        document.documentElement.setAttribute('data-extensions-detected', extensions.join(','));
        
        // Mark all extension content as hydration safe
        extensionScripts.forEach(script => {
          script.setAttribute('data-hydration-safe', 'true');
          script.setAttribute('data-extension-type', 'script');
        });
        
        walletProviders.forEach(provider => {
          provider.setAttribute('data-hydration-safe', 'true');
          provider.setAttribute('data-extension-type', 'wallet-provider');
        });
      }
      
      // Mark hydration as safe after processing
      setTimeout(() => setHydrationSafe(true), 200);
    };
    
    // Run detection after a short delay to allow extensions to load
    const timer = setTimeout(detectExtensions, 100);
    
    // Enhanced mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let hasExtensionChanges = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as Element;
              
              // Handle extension scripts
              if (
                element.getAttribute('src')?.includes('chrome-extension://') ||
                element.getAttribute('src')?.includes('moz-extension://') ||
                element.getAttribute('id')?.includes('wallet') ||
                element.getAttribute('id')?.includes('provider') ||
                element.getAttribute('id')?.includes('xverse') ||
                element.getAttribute('class')?.includes('extension')
              ) {
                hasExtensionChanges = true;
                element.setAttribute('data-extension-injected', 'true');
                element.setAttribute('data-hydration-safe', 'true');
                
                // Specific handling for known wallet providers
                const walletIds = ['xverse-wallet-provider', 'metamask', 'coinbase-wallet', 'phantom'];
                const elementId = element.getAttribute('id') || '';
                
                if (walletIds.some(id => elementId.toLowerCase().includes(id))) {
                  element.setAttribute('data-wallet-provider', elementId);
                }
              }
            }
          });
        }
      });
      
      if (hasExtensionChanges) {
        detectExtensions();
      }
    });
    
    // Observe both head and body
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Enhanced rendering with comprehensive hydration prevention
  if (!isClient || !hydrationSafe) {
    return (
      <div 
        suppressHydrationWarning
        data-luxplay-hydration="pending"
        style={{ colorScheme: 'dark' }}
      >
        {children}
      </div>
    );
  }

  return (
    <div 
      suppressHydrationWarning={extensionsDetected.length > 0}
      data-extensions={extensionsDetected.join(',')}
      data-luxplay-hydration="complete"
    >
      {children}
    </div>
  );
}