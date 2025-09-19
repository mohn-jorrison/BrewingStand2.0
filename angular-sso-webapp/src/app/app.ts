import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantConfigService } from './services/tenant-config.service';
import { TenantSelectorComponent } from './components/tenant-selector/tenant-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TenantSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = 'Multi-Tenant SSO Application';

  constructor(private tenantConfigService: TenantConfigService) {}

  ngOnInit(): void {
    // Initialize with default tenant configuration
    // In a real app, this would be determined by domain, subdomain, or user selection
    const tenantId = this.getTenantIdFromDomain();
    this.tenantConfigService.setTenant(tenantId).subscribe();
  }

  private getTenantIdFromDomain(): string {
    // Mock tenant detection logic
    // In reality, this could check:
    // - Subdomain (enterprise.yourapp.com -> 'enterprise')
    // - Domain mapping
    // - URL parameters
    // - User preferences
    
    const hostname = window.location.hostname;
    if (hostname.includes('enterprise')) {
      return 'enterprise';
    } else if (hostname.includes('startup')) {
      return 'startup';
    } else if (hostname.includes('creative')) {
      return 'creative';
    } else {
      return 'default';
    }
  }
}
