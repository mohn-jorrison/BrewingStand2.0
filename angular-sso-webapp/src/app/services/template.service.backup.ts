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
  
  // Mock templates for demonstration
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
                    <span class="tab-icon">�</span>
                    <span>main.dashboard</span>
                    <span class="tab-close">×</span>
                  </div>
                  <div class="tab">
                    <span class="tab-icon">�</span>
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
                    <span class="cmd-prompt">nova@{{ tenantConfig?.name?.toLowerCase() || 'tech' }}:~$</span>
                    <span class="cmd-text">welcome --user="{{ currentUser?.name || currentUser?.email }}"</span>
                  </div>
                  <div class="cmd-output">
                    <div class="output-line">� {{ tenantConfig?.dashboard?.welcomeMessage || 'Developer Environment Initialized' }}</div>
                    <div class="output-line">📁 Loading available tools...</div>
                    <div class="output-line">✅ {{ getAccessibleProductsCount() }} tools ready for deployment</div>
                    <div class="output-line">⚠️  {{ getRestrictedProductsCount() }} tools require elevated permissions</div>
                    <div class="output-line success">🎯 All systems operational. Happy coding!</div>
                  </div>
                </div>

                <!-- Tools as Code Blocks -->
                <div class="code-blocks">
                  <h3 class="section-title">
                    <span class="line-number">001</span>
                    <span class="code-comment">// Available Development Tools</span>
                  </h3>
                  
                  <div class="tool-blocks">
                    <div 
                      *ngFor="let product of getAccessibleProducts(); let i = index"
                      class="code-block executable"
                      (click)="onProductClick(product)">
                      <div class="code-header">
                        <div class="line-numbers">
                          <span>{{ String(i + 2).padStart(3, '0') }}</span>
                          <span>{{ String(i + 3).padStart(3, '0') }}</span>
                          <span>{{ String(i + 4).padStart(3, '0') }}</span>
                        </div>
                        <div class="code-content">
                          <div class="code-line">
                            <span class="keyword">function</span> 
                            <span class="function-name">{{ product.name.replace(/\s+/g, '') }}()</span> 
                            <span class="bracket">{</span>
                          </div>
                          <div class="code-line indented">
                            <span class="comment">// {{ product.description }}</span>
                          </div>
                          <div class="code-line">
                            <span class="bracket">}</span>
                            <span class="status-indicator available">● Available</span>
                          </div>
                        </div>
                      </div>
                      <div class="execution-btn">
                        <span class="run-icon">▶️</span>
                        <span>Execute Tool</span>
                      </div>
                    </div>
                  </div>

                  <!-- Restricted Tools -->
                  <div *ngIf="getRestrictedProducts().length > 0" class="restricted-section">
                    <h3 class="section-title">
                      <span class="line-number">{{ String(getAccessibleProducts().length + 5).padStart(3, '0') }}</span>
                      <span class="code-comment">// Restricted Access Tools</span>
                    </h3>
                    
                    <div class="tool-blocks">
                      <div 
                        *ngFor="let product of getRestrictedProducts(); let i = index"
                        class="code-block restricted">
                        <div class="code-header">
                          <div class="line-numbers">
                            <span>{{ String(getAccessibleProducts().length + i + 6).padStart(3, '0') }}</span>
                            <span>{{ String(getAccessibleProducts().length + i + 7).padStart(3, '0') }}</span>
                            <span>{{ String(getAccessibleProducts().length + i + 8).padStart(3, '0') }}</span>
                          </div>
                          <div class="code-content">
                            <div class="code-line">
                              <span class="keyword-restricted">private</span> 
                              <span class="function-name-restricted">{{ product.name.replace(/\s+/g, '') }}()</span> 
                              <span class="bracket-restricted">{</span>
                            </div>
                            <div class="code-line indented">
                              <span class="comment-restricted">// {{ product.description }}</span>
                            </div>
                            <div class="code-line">
                              <span class="bracket-restricted">}</span>
                              <span class="status-indicator restricted">🔒 Locked</span>
                            </div>
                          </div>
                        </div>
                        <div class="execution-btn disabled">
                          <span class="lock-icon">🔒</span>
                          <span>Access Denied</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Terminal Footer -->
                <div class="terminal-footer">
                  <div class="footer-status">
                    <span class="status-text">Ready</span>
                    <span class="separator">|</span>
                    <span class="user-info">{{ getCurrentUserRole() }}</span>
                    <span class="separator">|</span>
                    <span class="time">{{ new Date().toLocaleTimeString() }}</span>
                  </div>
                  <div class="footer-actions">
                    <span class="action-hint">Press F1 for shortcuts</span>
                  </div>
                </div>
              </div>
            </main>
          </div>

          <!-- IDE-Style Modal -->
          <div *ngIf="showLogoutModal" class="ide-modal-overlay" (click)="hideLogoutConfirm()">
            <div class="ide-modal" (click)="$event.stopPropagation()">
              <div class="modal-titlebar">
                <div class="modal-title">
                  <span class="modal-icon">⚠️</span>
                  <span>Confirm Session Termination</span>
                </div>
                <div class="modal-controls">
                  <button class="control-btn" (click)="hideLogoutConfirm()">×</button>
                </div>
              </div>
              <div class="modal-content-ide">
                <div class="confirmation-text">
                  <div class="cmd-style">
                    <span class="prompt">nova@terminal:~$</span>
                    <span class="command">logout --confirm</span>
                  </div>
                  <div class="warning-text">
                    ⚠️ This will terminate your current development session.
                  </div>
                  <div class="info-text">
                    💾 All progress has been auto-saved.
                  </div>
                </div>
                <div class="modal-actions-ide">
                  <button class="btn-cancel" (click)="hideLogoutConfirm()">
                    <span class="btn-icon">↩️</span>
                    <span>Cancel (Esc)</span>
                  </button>
                  <button class="btn-confirm" (click)="confirmSignOut()">
                    <span class="btn-icon">🚪</span>
                    <span>Exit Session (Enter)</span>
                  </button>
                </div>
              </div>
            </div>
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

        .code-block {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .code-block.executable {
          cursor: pointer;
        }

        .code-block.executable:hover {
          border-color: #58a6ff;
          box-shadow: 0 0 0 1px #58a6ff22;
        }

        .code-block.restricted {
          opacity: 0.6;
          border-color: #f85149;
        }

        .code-header {
          display: flex;
          padding: 1rem;
        }

        .line-numbers {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-right: 1rem;
          color: #7d8590;
          font-size: 0.875rem;
          min-width: 3rem;
        }

        .code-content {
          flex: 1;
        }

        .code-line {
          margin: 0.25rem 0;
          line-height: 1.4;
        }

        .code-line.indented {
          margin-left: 2rem;
        }

        .keyword {
          color: #ff7b72;
          font-weight: 600;
        }

        .function-name {
          color: #d2a8ff;
          font-weight: 600;
        }

        .bracket {
          color: #79c0ff;
        }

        .comment {
          color: #7d8590;
          font-style: italic;
        }

        .keyword-restricted {
          color: #f85149;
          font-weight: 600;
        }

        .function-name-restricted {
          color: #f85149;
          font-weight: 600;
        }

        .bracket-restricted {
          color: #f85149;
        }

        .comment-restricted {
          color: #7d8590;
          font-style: italic;
        }

        .status-indicator {
          float: right;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .status-indicator.available {
          background: #238636;
          color: white;
        }

        .status-indicator.restricted {
          background: #da3633;
          color: white;
        }

        .execution-btn {
          background: #21262d;
          border-top: 1px solid #30363d;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .code-block.executable:hover .execution-btn {
          background: #238636;
          color: white;
        }

        .execution-btn.disabled {
          background: #21262d;
          color: #7d8590;
          cursor: not-allowed;
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

        /* IDE-Style Modal */
        .ide-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .ide-modal {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          width: 500px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-titlebar {
          background: #21262d;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #30363d;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f0f6fc;
          font-weight: 600;
        }

        .control-btn {
          background: #da3633;
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content-ide {
          padding: 2rem;
        }

        .cmd-style {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .prompt {
          color: #3fb950;
          font-weight: 600;
        }

        .command {
          color: #58a6ff;
          margin-left: 0.5rem;
        }

        .warning-text {
          color: #d29922;
          margin: 1rem 0;
        }

        .info-text {
          color: #7d8590;
          margin: 1rem 0;
        }

        .modal-actions-ide {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-cancel {
          background: #21262d;
          border: 1px solid #30363d;
          color: #c9d1d9;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #30363d;
          border-color: #58a6ff;
        }

        .btn-confirm {
          background: #da3633;
          border: 1px solid #da3633;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-confirm:hover {
          background: #f85149;
          border-color: #f85149;
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
          
          .ide-modal {
            width: 90%;
            margin: 1rem;
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

    // Check for Angular-specific syntax
    if (!htmlTemplate.includes('*ngFor') && !htmlTemplate.includes('{{ ')) {
      errors.push('Template appears to be missing Angular directives');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}