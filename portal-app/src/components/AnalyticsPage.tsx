'use client';

import { motion } from 'framer-motion';
import { useApp, STATUSES, STATUS_LABEL, STATUS_COLOR, PRIORITIES, PRI_LABEL, PRI_COLOR, CATS } from '@/lib/store';
import styles from './AnalyticsPage.module.css';

export default function AnalyticsPage() {
  const { state } = useApp();
  const { clients, requirements } = state;

  const totBudget = requirements.reduce((s, r) => s + r.budget, 0);
  const clientBudget = clients.reduce((s, c) => s + (c.budget || 0), 0);
  const done = requirements.filter(r => r.status === 'done').length;
  const critCount = requirements.filter(r => r.priority === 'critical').length;

  const stats = [
    { label: 'Total Req. Budget', value: `₹${Math.round(totBudget / 1000)}k`, sub: 'Across all requirements', color: '#3b82f6' },
    { label: 'Completion Rate', value: `${requirements.length ? Math.round(done / requirements.length * 100) : 0}%`, sub: `${done} of ${requirements.length} done`, color: '#22c55e' },
    { label: 'Client Budgets', value: `₹${Math.round(clientBudget / 1000)}k`, sub: 'Total allocated', color: '#f59e0b' },
    { label: 'Critical Items', value: critCount, sub: 'Need immediate attention', color: '#ef4444' },
  ];

  // Category chart
  const catCounts = CATS.map(c => ({ c, n: requirements.filter(r => r.category === c).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...catCounts.map(x => x.n));
  const catColors = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#ef4444','#0ea5e9','#8b5cf6','#ec4899','#14b8a6','#f97316'];

  // Priority chart
  const priCounts = PRIORITIES.map(p => ({ p, n: requirements.filter(r => r.priority === p).length }));
  const maxPri = Math.max(1, ...priCounts.map(x => x.n));

  // Status chart
  const stCounts = STATUSES.map(s => ({ s, n: requirements.filter(r => r.status === s).length }));
  const maxSt = Math.max(1, ...stCounts.map(x => x.n));

  // Budget per client
  const cBudgets = clients.map(c => ({
    name: c.name,
    req: requirements.filter(r => r.clientId === c.id).reduce((s, r) => s + r.budget, 0),
    total: c.budget || 0,
  })).sort((a, b) => b.req - a.req).slice(0, 8);
  const maxB = Math.max(1, ...cBudgets.map(x => Math.max(x.req, x.total)));

  // Completion by client
  const compData = clients.map(c => {
    const reqs = requirements.filter(r => r.clientId === c.id);
    const d = reqs.filter(r => r.status === 'done').length;
    return { name: c.name, total: reqs.length, done: d, pct: reqs.length ? Math.round(d / reqs.length * 100) : 0 };
  }).filter(x => x.total > 0).sort((a, b) => b.pct - a.pct);
  const compColor = (pct: number) => pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const empty = <div className={styles.empty}>No data yet</div>;

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <motion.div key={s.label} className={styles.statCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statVal} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statSub}>{s.sub}</div>
            <div className={styles.statAccent} style={{ background: s.color }} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className={styles.twoCol}>
        <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className={styles.cardTitle}>By Category</div>
          {catCounts.length ? catCounts.map(({ c, n }, i) => (
            <ChartBar key={c} label={c} count={n} max={maxCat} color={catColors[i % catColors.length]} delay={0.4 + i * 0.04} />
          )) : empty}
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <div className={styles.cardTitle}>By Priority</div>
          {priCounts.map(({ p, n }) => (
            <ChartBar key={p} label={PRI_LABEL[p]} count={n} max={maxPri} color={PRI_COLOR[p]} delay={0.4} />
          ))}
        </motion.div>
      </div>

      <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
        <div className={styles.cardTitle}>Status Breakdown</div>
        <div className={styles.statusGrid}>
          {stCounts.map(({ s, n }) => (
            <ChartBar key={s} label={STATUS_LABEL[s]} count={n} max={maxSt} color={STATUS_COLOR[s]} delay={0.45} />
          ))}
        </div>
      </motion.div>

      <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
        <div className={styles.cardTitle}>Budget per Client (Requirements vs Client Budget)</div>
        {cBudgets.length ? cBudgets.map((c, i) => (
          <div key={c.name} className={styles.budgetRow}>
            <div className={styles.budgetLabel}>{c.name}</div>
            <div className={styles.budgetBars}>
              <div className={styles.miniTrack}>
                <motion.div className={styles.miniFill} style={{ background: '#3b82f6' }} initial={{ width: 0 }} animate={{ width: `${Math.round(c.req / maxB * 100)}%` }} transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }} />
              </div>
              <div className={styles.miniTrack}>
                <motion.div className={styles.miniFill} style={{ background: 'rgba(255,255,255,0.15)' }} initial={{ width: 0 }} animate={{ width: `${Math.round(c.total / maxB * 100)}%` }} transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }} />
              </div>
            </div>
            <div className={styles.budgetAmt}>₹{Math.round(c.req / 1000)}k / ₹{Math.round(c.total / 1000)}k</div>
          </div>
        )) : empty}
        {cBudgets.length > 0 && (
          <div className={styles.legend}>
            <span className={styles.legendDot} style={{ background: '#3b82f6' }} /> Req. budget
            <span className={styles.legendDot} style={{ background: 'rgba(255,255,255,0.15)', marginLeft: 12 }} /> Client budget
          </div>
        )}
      </motion.div>

      <motion.div className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}>
        <div className={styles.cardTitle}>Completion by Client</div>
        {compData.length ? compData.map(c => (
          <ChartBar key={c.name} label={c.name} count={c.pct} max={100} color={compColor(c.pct)} delay={0.55} suffix="%" />
        )) : empty}
      </motion.div>
    </div>
  );
}

function ChartBar({ label, count, max, color, delay = 0, suffix = '' }: {
  label: string; count: number; max: number; color: string; delay?: number; suffix?: string;
}) {
  return (
    <div className={styles.chartRow}>
      <div className={styles.chartLabel}>{label}</div>
      <div className={styles.chartTrack}>
        <motion.div
          className={styles.chartFill}
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(count / max * 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay }}
        />
      </div>
      <div className={styles.chartVal}>{count}{suffix}</div>
    </div>
  );
}
