import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TenantTemplate {
  tenantId: string;
  templateType: 'dashboard' | 'auth' | 'profile';
  template: string; // Base64 encoded
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly API_BASE = '/api/templates';
  
  // Mock templates for demonstration - simplified for vanilla HTML/JS approach
  private mockTemplates: Map<string, TenantTemplate> = new Map([
    ['tech-startup-dashboard', {
      tenantId: 'tech-startup',
      templateType: 'dashboard',
      template: this.encodeTemplate(`
        <div class="revolutionary-dashboard">
          <!-- Completely Different Layout: Mobile-App Style Navigation -->
          <nav class="mobile-nav">
            <div class="nav-content">
              <div class="brand-section">
                <div class="brand-icon">🚀</div>
                <div class="brand-text" data-tenant-name>NovaTech</div>
              </div>
              <div class="user-section">
                <div class="user-profile" data-action="logout">
                  <div class="profile-pic" data-user-initials>NT</div>
                  <div class="profile-details">
                    <div class="user-greeting">Hey <span data-user-name>Dev</span>! 👋</div>
                    <div class="user-status">Developer • Online</div>
                  </div>
                  <div class="logout-btn">⚡</div>
                </div>
              </div>
            </div>
          </nav>

          <!-- Sidebar Layout Instead of Header -->
          <div class="app-layout">
            <aside class="command-center">
              <div class="center-header">
                <h2>⚡ Command Center</h2>
                <p>Mission Control for Devs</p>
              </div>
              
              <!-- Real-time Metrics -->
              <div class="live-metrics">
                <div class="metric-item">
                  <div class="metric-label">🔥 Active Tools</div>
                  <div class="metric-value" data-accessible-count>0</div>
                  <div class="metric-trend">Live updates enabled</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">⏱️ Avg Deploy Time</div>
                  <div class="metric-value">2.3min</div>
                  <div class="metric-trend">-15% faster</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">🎯 Success Rate</div>
                  <div class="metric-value">98.2%</div>
                  <div class="metric-trend">All systems go!</div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <h3>⚡ Quick Deploy</h3>
                <div class="action-buttons">
                  <button class="action-btn">
                    🔒 Security Scan
                  </button>
                  <button class="action-btn">
                    📊 Generate Report
                  </button>
                  <button class="action-btn">
                    👥 Team Sync
                  </button>
                </div>
              </div>

              <!-- System Status -->
              <div class="system-status">
                <h3>🖥️ System Health</h3>
                <div class="status-grid">
                  <div class="status-item healthy">
                    <span class="status-dot"></span>
                    <span>API Gateway</span>
                    <span class="status-value">99.9%</span>
                  </div>
                  <div class="status-item healthy">
                    <span class="status-dot"></span>
                    <span>Database</span>
                    <span class="status-value">100%</span>
                  </div>
                  <div class="status-item warning">
                    <span class="status-dot"></span>
                    <span>CDN</span>
                    <span class="status-value">97.1%</span>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Main Content: Terminal/IDE Style -->
            <main class="terminal-main">
              <div class="terminal-header">
                <div class="terminal-tabs">
                  <div class="tab active">
                    <span class="tab-icon">📄</span>
                    <span>main.dashboard</span>
                    <span class="tab-close">×</span>
                  </div>
                  <div class="tab">
                    <span class="tab-icon">⚙️</span>
                    <span>tools.config</span>
                  </div>
                  <div class="tab-add">+</div>
                </div>
                <div class="terminal-controls">
                  <div class="control minimize">–</div>
                  <div class="control maximize">□</div>
                  <div class="control close">×</div>
                </div>
              </div>

              <div class="terminal-content">
                <!-- Command Prompt Style Welcome -->
                <div class="cmd-welcome">
                  <div class="cmd-line">
                    <span class="cmd-prompt">nova@<span data-tenant-name>tech</span>:~$</span>
                    <span class="cmd-text">welcome --user="<span data-user-email>developer@novatech.com</span>"</span>
                  </div>
                  <div class="cmd-output">
                    <div class="output-line">🚀 Developer Environment Initialized</div>
                    <div class="output-line">📁 Loading available tools...</div>
                    <div class="output-line">✅ <span data-accessible-count>0</span> tools ready for deployment</div>
                    <div class="output-line">⚠️ <span data-restricted-count>0</span> tools require elevated permissions</div>
                    <div class="output-line success">🎯 All systems operational. Happy coding!</div>
                  </div>
                </div>

                <!-- Tools as Code Blocks -->
                <div class="code-blocks">
                  <h3 class="section-title">
                    <span class="line-number">001</span>
                    <span class="code-comment">// Available Development Tools</span>
                  </h3>
                  
                  <div class="tool-blocks" data-accessible-products>
                    <!-- Dynamic accessible products will be inserted here -->
                  </div>

                  <!-- Restricted Tools -->
                  <div class="restricted-section">
                    <h3 class="section-title">
                      <span class="line-number">010</span>
                      <span class="code-comment">// Restricted Access Tools</span>
                    </h3>
                    
                    <div class="tool-blocks" data-restricted-products>
                      <!-- Dynamic restricted products will be inserted here -->
                    </div>
                  </div>
                </div>

                <!-- Terminal Footer -->
                <div class="terminal-footer">
                  <div class="footer-status">
                    <span class="status-text">Ready</span>
                    <span class="separator">|</span>
                    <span class="user-info">Developer</span>
                    <span class="separator">|</span>
                    <span class="time">Live Time</span>
                  </div>
                  <div class="footer-actions">
                    <span class="action-hint">Press F1 for shortcuts</span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      `),
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }]
  ]);

  constructor(private http: HttpClient) {}

  /**
   * Fetch template from storage for a specific tenant
   */
  getTenantTemplate(tenantId: string, templateType: string): Observable<string | null> {
    const key = `${tenantId}-${templateType}`;
    const mockTemplate = this.mockTemplates.get(key);
    
    if (mockTemplate) {
      return of(this.decodeTemplate(mockTemplate.template));
    }

    // In a real app, this would be an HTTP call
    return this.http.get<TenantTemplate>(`${this.API_BASE}/${tenantId}/${templateType}`)
      .pipe(
        map(response => this.decodeTemplate(response.template)),
        catchError(error => {
          console.warn(`Template not found for ${tenantId}/${templateType}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Save template to storage (for admin interface)
   */
  saveTenantTemplate(tenantId: string, templateType: string, htmlTemplate: string): Observable<boolean> {
    const encodedTemplate = this.encodeTemplate(htmlTemplate);
    const payload = {
      tenantId,
      templateType,
      template: encodedTemplate,
      version: new Date().toISOString()
    };

    return this.http.post<any>(`${this.API_BASE}`, payload)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Get custom styles for a tenant template
   */
  getTenantStyles(tenantId: string): string {
    if (tenantId === 'tech-startup') {
      return `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap');

        .revolutionary-dashboard {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0d1117;
          color: #c9d1d9;
          min-height: 100vh;
          overflow: hidden;
        }

        /* Mobile-App Style Navigation */
        .mobile-nav {
          background: #161b22;
          border-bottom: 1px solid #21262d;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 100%;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          font-size: 1.5rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #58a6ff, #79c0ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: #21262d;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-profile:hover {
          background: #30363d;
          transform: translateY(-1px);
        }

        .profile-pic {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f78166, #fa7970);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .user-greeting {
          font-size: 0.875rem;
          font-weight: 500;
          color: #f0f6fc;
        }

        .user-status {
          font-size: 0.75rem;
          color: #7d8590;
        }

        .logout-btn {
          font-size: 1rem;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .user-profile:hover .logout-btn {
          opacity: 1;
        }

        /* Sidebar + Main Layout */
        .app-layout {
          display: flex;
          height: calc(100vh - 80px);
        }

        /* Command Center Sidebar */
        .command-center {
          width: 350px;
          background: #0d1117;
          border-right: 1px solid #21262d;
          padding: 2rem 1.5rem;
          overflow-y: auto;
        }

        .center-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #f0f6fc;
        }

        .center-header p {
          margin: 0 0 2rem 0;
          color: #7d8590;
          font-size: 0.875rem;
        }

        .live-metrics {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
        }

        .metric-item:last-child {
          margin-bottom: 0;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #7d8590;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #58a6ff;
          font-family: 'JetBrains Mono', monospace;
        }

        .metric-trend {
          font-size: 0.75rem;
          color: #3fb950;
        }

        .quick-actions {
          margin-bottom: 2rem;
        }

        .quick-actions h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #f0f6fc;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          background: #21262d;
          border: 1px solid #30363d;
          color: #c9d1d9;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          text-align: left;
        }

        .action-btn:hover {
          background: #30363d;
          border-color: #58a6ff;
        }

        .system-status h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #f0f6fc;
        }

        .status-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: #161b22;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .status-item.healthy .status-dot {
          background: #3fb950;
        }

        .status-item.warning .status-dot {
          background: #d29922;
        }

        .status-value {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        /* Terminal-Style Main Content */
        .terminal-main {
          flex: 1;
          background: #0d1117;
          display: flex;
          flex-direction: column;
        }

        .terminal-header {
          background: #161b22;
          border-bottom: 1px solid #21262d;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
        }

        .terminal-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab {
          background: #21262d;
          border: 1px solid #30363d;
          border-bottom: none;
          padding: 0.5rem 1rem;
          border-radius: 6px 6px 0 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .tab.active {
          background: #0d1117;
          border-color: #58a6ff;
          color: #58a6ff;
        }

        .tab-close {
          opacity: 0.7;
          cursor: pointer;
        }

        .tab-close:hover {
          opacity: 1;
        }

        .tab-add {
          background: #21262d;
          border: 1px solid #30363d;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
        }

        .terminal-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
        }

        .control.minimize { background: #d29922; }
        .control.maximize { background: #3fb950; }
        .control.close { background: #f85149; }

        .terminal-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Command Prompt Style */
        .cmd-welcome {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .cmd-line {
          margin-bottom: 1rem;
        }

        .cmd-prompt {
          color: #3fb950;
          font-weight: 600;
        }

        .cmd-text {
          color: #58a6ff;
          margin-left: 0.5rem;
        }

        .cmd-output {
          margin-left: 2rem;
        }

        .output-line {
          margin: 0.5rem 0;
          color: #c9d1d9;
        }

        .output-line.success {
          color: #3fb950;
        }

        /* Code Blocks for Tools */
        .section-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0 1.5rem 0;
          font-size: 1.125rem;
        }

        .line-number {
          color: #7d8590;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
        }

        .code-comment {
          color: #7d8590;
          font-style: italic;
        }

        .tool-blocks {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-item {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
        }

        .product-item.accessible {
          cursor: pointer;
        }

        .product-item.accessible:hover {
          border-color: #58a6ff;
          box-shadow: 0 0 0 1px #58a6ff22;
        }

        .product-item.restricted {
          opacity: 0.6;
          border-color: #f85149;
        }

        .product-icon {
          width: 48px;
          height: 48px;
          background: #21262d;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .product-info {
          flex: 1;
        }

        .product-info h4 {
          margin: 0 0 0.5rem 0;
          color: #f0f6fc;
          font-weight: 600;
        }

        .product-info p {
          margin: 0 0 0.25rem 0;
          color: #7d8590;
          font-size: 0.875rem;
        }

        .category {
          display: inline-block;
          background: #21262d;
          color: #7d8590;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .product-status {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .terminal-footer {
          background: #161b22;
          border-top: 1px solid #21262d;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #7d8590;
        }

        .status-text {
          color: #3fb950;
          font-weight: 600;
        }

        .separator {
          color: #30363d;
        }

        .footer-actions {
          color: #7d8590;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .command-center {
            width: 300px;
          }
        }

        @media (max-width: 768px) {
          .app-layout {
            flex-direction: column;
          }
          
          .command-center {
            width: 100%;
            height: auto;
            max-height: 40vh;
          }
          
          .nav-content {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `;
    }
    
    return '';
  }

  /**
   * Encode HTML template to base64
   */
  private encodeTemplate(htmlTemplate: string): string {
    return btoa(unescape(encodeURIComponent(htmlTemplate)));
  }

  /**
   * Decode base64 template to HTML
   */
  private decodeTemplate(base64Template: string): string {
    return decodeURIComponent(escape(atob(base64Template)));
  }

  /**
   * Validate template syntax (basic validation)
   */
  validateTemplate(htmlTemplate: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for balanced tags
    const openTags = htmlTemplate.match(/<[^/][^>]*>/g) || [];
    const closeTags = htmlTemplate.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push('Unbalanced HTML tags detected');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}