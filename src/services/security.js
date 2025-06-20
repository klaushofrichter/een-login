/**
 * Security Service for EEN Capture Application
 * Handles domain validation, request validation, and security checks
 */

class SecurityService {
  constructor() {
    // Centralized allowed domains configuration
    this.allowedDomainConfigs = [
      {
        domain: '127.0.0.1',
        protocols: ['http'],
        ports: [3333]
      },
      {
        domain: 'klaushofrichter.github.io',
        protocols: ['https'],
        ports: [443] // Default HTTPS port
      }
    ];
  }

  /**
   * Get allowed domains (hostnames only)
   */
  get allowedDomains() {
    return this.allowedDomainConfigs.map(config => config.domain);
  }

  /**
   * Get allowed origins (full URLs with protocol and port)
   */
  get allowedOrigins() {
    const origins = [];
    
    this.allowedDomainConfigs.forEach(config => {
      config.protocols.forEach(protocol => {
        config.ports.forEach(port => {
          // Only include port in URL if it's not the default for the protocol
          const isDefaultPort = (protocol === 'https' && port === 443) || 
                               (protocol === 'http' && port === 80);
          
          const origin = isDefaultPort 
            ? `${protocol}://${config.domain}`
            : `${protocol}://${config.domain}:${port}`;
            
          origins.push(origin);
        });
      });
    });
    
    return origins;
  }

  /**
   * Add a new allowed domain configuration
   * @param {string} domain - The domain/hostname
   * @param {string[]} protocols - Allowed protocols ['http', 'https']
   * @param {number[]} ports - Allowed ports [80, 443, 3333, etc.]
   */
  addAllowedDomain(domain, protocols = ['https'], ports = [443]) {
    this.allowedDomainConfigs.push({
      domain,
      protocols,
      ports
    });
  }

  /**
   * Remove an allowed domain configuration
   * @param {string} domain - The domain to remove
   */
  removeAllowedDomain(domain) {
    this.allowedDomainConfigs = this.allowedDomainConfigs.filter(
      config => config.domain !== domain
    );
  }

  /**
   * Check if a specific origin is allowed
   * @param {string} origin - Full origin to check (e.g., 'https://example.com:443')
   * @returns {boolean}
   */
  isOriginAllowed(origin) {
    try {
      const url = new URL(origin);
      const domain = url.hostname;
      const protocol = url.protocol.slice(0, -1); // Remove trailing ':'
      const port = parseInt(url.port) || (protocol === 'https' ? 443 : 80);

      return this.allowedDomainConfigs.some(config =>
        config.domain === domain &&
        config.protocols.includes(protocol) &&
        config.ports.includes(port)
      );
    } catch (error) {
      console.warn('🚫 Security: Invalid origin format:', origin);
      return false;
    }
  }

  /**
   * Validate current domain against allowed domains
   */
  validateCurrentDomain() {
    const currentDomain = window.location.hostname;
    const isAuthorized = this.allowedDomains.includes(currentDomain);
    
    if (!isAuthorized) {
      console.error(`🚫 Security: Unauthorized domain ${currentDomain}`);
      return false;
    }
    
    console.log(`✅ Security: Domain ${currentDomain} authorized`);
    return true;
  }

  /**
   * Validate origin for API requests
   */
  validateOrigin(origin = window.location.origin) {
    const isAuthorized = this.isOriginAllowed(origin);
    
    if (!isAuthorized) {
      console.error(`🚫 Security: Unauthorized origin ${origin}`);
      console.log('Allowed origins:', this.allowedOrigins);
      return false;
    }
    
    return true;
  }

  /**
   * Add security headers to fetch requests
   */
  addSecurityHeaders(headers = {}) {
    return {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Domain-Validation': window.location.hostname,
      'Origin': window.location.origin,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Validate URL scheme to prevent dangerous protocols
   */
  validateUrlScheme(url) {
    if (typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      const allowedSchemes = ['http:', 'https:'];
      
      if (!allowedSchemes.includes(urlObj.protocol)) {
        console.warn(`🚫 Security: Blocked dangerous URL scheme: ${urlObj.protocol}`);
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid URL format
      console.warn(`🚫 Security: Invalid URL format: ${url}`);
      return false;
    }
  }

  /**
   * Sanitize user input to prevent injection attacks
   * Uses global flag and iterative approach to handle overlapping patterns
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    let sanitized = input;
    let previousLength;
    
    // Keep sanitizing until no more changes occur (handles overlapping patterns)
    do {
      previousLength = sanitized.length;
      
      sanitized = sanitized
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols (global)
        .replace(/data:/gi, '') // Remove data: protocols (global)
        .replace(/vbscript:/gi, '') // Remove vbscript: protocols (global)
        .replace(/file:/gi, '') // Remove file: protocols (global)
        .replace(/about:/gi, '') // Remove about: protocols (global)
        .replace(/on\s*\w*\s*=/gi, '') // Remove event handlers with optional spaces (global)
        // More precise event handler detection - only remove 'on' when followed by common event names
        .replace(/\bon(click|load|error|focus|blur|change|submit|reset|mouseover|mouseout|keydown|keyup|keypress)(?=\W|$)/gi, '') 
        .replace(/\s+on\s+/gi, ' ') // Remove standalone 'on' with spaces
        .replace(/\bon\s(?=\w)/gi, ' ') // Remove 'on' followed by space and word (but not at end)
        .replace(/\s+on$/gi, ' ') // Remove 'on' at end of string with spaces
        .replace(/^on\s/gi, '') // Remove 'on' at start of string followed by space
        // Only remove exact 'on' word, not 'on' within other words
        .replace(/\bon\b(?=\s|$)/gi, '') // Remove standalone 'on' word only when followed by space or end
        .replace(/^on$/gi, '') // Remove if string is exactly 'on'
        .replace(/&[#\w]+;/g, '') // Remove HTML entities that could be used for encoding
        .replace(/[\p{Cc}]/gu, '') // Remove control characters using Unicode property
        .trim();
        
    } while (sanitized.length !== previousLength && sanitized.length > 0);
    
    return sanitized;
  }

  /**
   * Validate and sanitize input for specific contexts
   */
  validateInput(input, type = 'general') {
    if (typeof input !== 'string') return { isValid: false, sanitized: '', error: 'Input must be a string' };
    
    // First apply general sanitization
    const sanitized = this.sanitizeInput(input);
    
    // Apply context-specific validation
    switch (type) {
      case 'email': {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return {
          isValid: emailRegex.test(sanitized),
          sanitized,
          error: emailRegex.test(sanitized) ? null : 'Invalid email format'
        };
      }
        
      case 'url': {
        try {
          new URL(sanitized);
          const isValid = this.validateUrlScheme(sanitized);
          return {
            isValid,
            sanitized,
            error: isValid ? null : 'Invalid or unsafe URL'
          };
        } catch {
          return { isValid: false, sanitized, error: 'Invalid URL format' };
        }
      }
        
      case 'alphanumeric': {
        const alphanumericRegex = /^[a-zA-Z0-9\s-_]+$/;
        return {
          isValid: alphanumericRegex.test(sanitized),
          sanitized,
          error: alphanumericRegex.test(sanitized) ? null : 'Only alphanumeric characters, spaces, hyphens, and underscores allowed'
        };
      }
        
      case 'general':
      default:
        return {
          isValid: sanitized.length > 0,
          sanitized,
          error: sanitized.length > 0 ? null : 'Input cannot be empty after sanitization'
        };
    }
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  constantTimeEquals(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Generate cryptographically secure random values
   */
  generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate session integrity
   */
  validateSession() {
    const authStore = window.authStore || { isAuthenticated: false };
    
    // Check if session has been tampered with
    const sessionStart = localStorage.getItem('sessionStart');
    const sessionExpiry = localStorage.getItem('token_expiration');
    
    if (!sessionStart || !sessionExpiry || !authStore.isAuthenticated) {
      return false;
    }
    
    const now = Date.now();
    if (now > parseInt(sessionExpiry)) {
      this.logSecurityEvent('session_expired', { sessionStart, sessionExpiry, now });
      return false;
    }
    
    return true;
  }

  /**
   * Clean sensitive data from memory
   */
  cleanSensitiveData() {
    // Clear any sensitive data from memory
    if (window.temp_credentials) {
      window.temp_credentials = null;
    }
    
    // Clear clipboard if it contains sensitive data
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('');
    }
  }

  /**
   * Log security events
   */
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      domain: window.location.hostname,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      sessionId: this.generateSecureRandom(16),
      ...details
    };
    
    console.log('🔒 Security Event:', logEntry);
    
    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(logEntry);
  }
}

export default new SecurityService(); 
