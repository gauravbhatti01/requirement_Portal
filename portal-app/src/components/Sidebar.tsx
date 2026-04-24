'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, Columns3, BarChart2, UserPlus, FilePlus, Zap } from 'lucide-react';
import { useApp } from '@/lib/store';
import styles from './Sidebar.module.css';

type Page = 'dashboard' | 'clients' | 'requirements' | 'kanban' | 'analytics';

interface SidebarProps {
  page: Page;
  onNav: (p: Page) => void;
  onAddClient: () => void;
  onAddReq: () => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients' as Page, label: 'Clients', icon: Users },
  { id: 'requirements' as Page, label: 'Requirements', icon: FileText },
  { id: 'kanban' as Page, label: 'Kanban Board', icon: Columns3 },
  { id: 'analytics' as Page, label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar({ page, onNav, onAddClient, onAddReq }: SidebarProps) {
  const { state, isOverdue } = useApp();
  const overdueCount = state.requirements.filter(r => isOverdue(r.dueDate) && r.status !== 'done').length;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={16} />
        </div>
        <div>
          <div className={styles.logoTitle}>ClientBase</div>
          <div className={styles.logoSub}>Requirements Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={() => onNav(item.id)}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className={styles.activeIndicator}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon size={15} className={styles.navIcon} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className={styles.navSection} style={{ marginTop: 8 }}>Quick Add</div>
        <button className={styles.navItem} onClick={onAddClient}>
          <UserPlus size={15} className={styles.navIcon} />
          <span>Add Client</span>
        </button>
        <button className={styles.navItem} onClick={onAddReq}>
          <FilePlus size={15} className={styles.navIcon} />
          <span>Add Requirement</span>
        </button>
      </nav>

      {/* Bottom Stats */}
      <div className={styles.bottom}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Clients</span>
          <span className={styles.statVal}>{state.clients.length}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Requirements</span>
          <span className={styles.statVal}>{state.requirements.length}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Overdue</span>
          <span className={styles.statVal} style={{ color: overdueCount ? '#ef4444' : '#585858' }}>{overdueCount}</span>
        </div>
      </div>
    </aside>
  );
}
