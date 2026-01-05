'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useDataStore } from '@/data/repos/local/store';
import { Button } from '@/components/ui/button';

const nav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'CRM', children: [
    { label: 'Leads', href: '/crm/leads' },
    { label: 'Deals', href: '/crm/deals' },
    { label: 'Clients', href: '/crm/clients' },
    { label: 'Tasks', href: '/crm/tasks' },
    { label: 'Activities', href: '/crm/activities' },
  ]},
  { label: 'ERP', children: [
    { label: 'Services', href: '/erp/services' },
    { label: 'Proposals', href: '/erp/proposals' },
    { label: 'Projects', href: '/erp/projects' },
    { label: 'Invoices', href: '/erp/invoices' },
    { label: 'Payments', href: '/erp/payments' },
    { label: 'Expenses', href: '/erp/expenses' },
    { label: 'Tickets', href: '/erp/tickets' },
    { label: 'Retainers', href: '/erp/retainers' },
  ]},
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
];

const quickActions = [
  { label: 'New Lead', href: '/crm/leads' },
  { label: 'New Deal', href: '/crm/deals' },
  { label: 'New Invoice', href: '/erp/invoices' },
  { label: 'Add Payment', href: '/erp/payments' },
];

export default function ShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reset } = useDataStore();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-4 space-y-6 hidden md:block">
        <div className="flex items-center gap-2">
          <Image src="/svg/logo.svg" alt="IMAGICITY" width={120} height={32} />
        </div>
        <nav className="space-y-4 text-sm">
          {nav.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link href={item.href} className={`block px-3 py-2 rounded-md font-semibold ${pathname === item.href ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                  {item.label}
                </Link>
              ) : (
                <div>
                  <div className="px-3 py-2 text-xs uppercase text-slate-500">{item.label}</div>
                  <div className="space-y-1">
                    {item.children?.map((child) => (
                      <Link key={child.href} href={child.href} className={`block px-3 py-2 rounded-md ${pathname === child.href ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="dev-banner">
          <div>Dev Mode · No Auth Mode active</div>
          <Button variant="secondary" onClick={reset}>Reset Demo Data</Button>
        </div>
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 flex-1">
            <input placeholder="Search clients, deals, invoices" className="w-1/2 rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <select className="border border-slate-200 rounded-md px-2 py-2 text-sm">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((qa) => (
              <Link key={qa.label} href={qa.href} className="text-sm text-brand-700 hover:underline">
                {qa.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
