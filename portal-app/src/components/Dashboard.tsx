'use client';

import { motion } from 'framer-motion';
import { useApp, STATUSES, STATUS_LABEL, STATUS_COLOR } from '@/lib/store';
import { Users, ListChecks, IndianRupee, AlertTriangle, Activity, Calendar } from 'lucide-react';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onEditReq: (id: number) => void;
}

export default function Dashboard({ onEditReq }: DashboardProps) {
  const { state, isOverdue, daysUntil, fmtDate, clientById } = useApp();
  const { clients, requirements, activity } = state;

  const totBudget = requirements.reduce((s, r) => s + r.budget, 0);
  const overdue = requirements.filter(r => isOverdue(r.dueDate) && r.status !== 'done').length;
  const done = requirements.filter(r => r.status === 'done').length;
  const inProg = requirements.filter(r => r.status === 'progress').length;

  const stats = [
    { label: 'Total Clients', value: clients.length, sub: 'Active accounts', icon: Users, color: '#3b82f6' },
    { label: 'Requirements', value: requirements.length, sub: `${done} done · ${inProg} in progress`, icon: ListChecks, color: '#22c55e' },
    { label: 'Total Budget', value: `₹${Math.round(totBudget / 1000)}k`, sub: 'Across all requirements', icon: IndianRupee, color: '#f59e0b' },
    { label: 'Overdue', value: overdue, sub: 'Pending past due date', icon: AlertTriangle, color: overdue > 0 ? '#ef4444' : '#585858' },
  ];

  const upcoming = requirements
    .filter(r => r.dueDate && !isOverdue(r.dueDate) && r.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6);

  // Status chart
  const statusCounts = STATUSES.map(s => ({ s, count: requirements.filter(r => r.status === s).length }));
  const maxStat = Math.max(1, ...statusCounts.map(x => x.count));

  // Top clients
  const topClients = clients
    .map(c => ({ name: c.name, count: requirements.filter(r => r.clientId === c.id).length }))
    .sort((a, b) => b.count - a.count).slice(0, 6);
  const maxClient = Math.max(1, ...topClients.map(x => x.count));

  return (
    <div className={styles.page}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
      <motion.div key={s.label} className={styles.statCard}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}>
              <div className={styles.statTop}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statIcon} style={{ color: s.color }}>
                  <Icon size={16} />
                </div>
              </div>
              <div className={styles.statVal} style={{ color: s.color === '#ef4444' && typeof s.value === 'number' && s.value > 0 ? s.color : undefined }}>
                {s.value}
              </div>
              <div className={styles.statSub}>{s.sub}</div>
              <div className={styles.statAccent} style={{ background: s.color }} />
            </motion.div>
          );
        })}
      </div>

      {/* Two column */}
      <div className={styles.twoCol}>
        {/* Activity */}
        <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div className={styles.cardHeader}>
            <Activity size={14} />
            <span>Recent Activity</span>
          </div>
          {activity.length ? (
            <div className={styles.activityList}>
              {activity.slice(0, 8).map((a) => (
                <div key={a.id} className={styles.actItem}>
                  <div className={styles.actDot} />
                  <div>
                    <div className={styles.actMsg}>{a.msg}</div>
                    <div className={styles.actTime}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No activity yet. Add a client to get started.</div>
          )}
        </motion.div>

        {/* Deadlines */}
        <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <div className={styles.cardHeader}>
            <Calendar size={14} />
            <span>Upcoming Deadlines</span>
          </div>
          {upcoming.length ? upcoming.map(r => {
            const d = daysUntil(r.dueDate);
            const cls = d! <= 2 ? 'urgent' : d! <= 7 ? 'soon' : 'ok';
            const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`;
            const color = cls === 'urgent' ? '#ef4444' : cls === 'soon' ? '#f59e0b' : '#22c55e';
            return (
              <div key={r.id} className={styles.deadlineItem}>
                <div>
                  <div className={styles.deadlineName}>{r.title}</div>
                  <div className={styles.deadlineClient}>{clientById(r.clientId)?.name}</div>
                </div>
                <div style={{ color, fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600 }}>{label}</div>
              </div>
            );
          }) : <div className={styles.empty}>No upcoming deadlines.</div>}
        </motion.div>
      </div>

      {/* Charts */}
      <div className={styles.twoCol}>
        <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className={styles.cardHeader}><span>Status Breakdown</span></div>
          {statusCounts.map(({ s, count }) => (
            <div key={s} className={styles.chartRow}>
              <div className={styles.chartLabel}>{STATUS_LABEL[s]}</div>
              <div className={styles.chartTrack}>
                <motion.div
                  className={styles.chartFill}
                  style={{ background: STATUS_COLOR[s] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(count / maxStat * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <div className={styles.chartVal}>{count}</div>
            </div>
          ))}
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}>
          <div className={styles.cardHeader}><span>Top Clients by Requirements</span></div>
          {topClients.length ? topClients.map((c, i) => (
            <div key={i} className={styles.chartRow}>
              <div className={styles.chartLabel}>{c.name}</div>
              <div className={styles.chartTrack}>
                <motion.div
                  className={styles.chartFill}
                  style={{ background: '#3b82f6' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(c.count / maxClient * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 + i * 0.06 }}
                />
              </div>
              <div className={styles.chartVal}>{c.count}</div>
            </div>
          )) : <div className={styles.empty}>No clients yet.</div>}
        </motion.div>
      </div>
    </div>
  );
}
