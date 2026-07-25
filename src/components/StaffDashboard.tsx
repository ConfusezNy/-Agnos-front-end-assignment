'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PatientSession, PatientFormData, PatientStatus, ServerMessage } from '@/lib/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import Navbar from './Navbar';
import PatientCard from './PatientCard';

type FilterOption = 'all' | PatientStatus;

const filterOptions: { value: FilterOption; label: string; color: string; activeColor: string }[] = [
  { value: 'all', label: 'All', color: 'text-[#63707c]', activeColor: 'bg-[#001a33] text-white' },
  { value: 'filling', label: 'Active', color: 'text-emerald-700', activeColor: 'bg-emerald-600 text-white' },
  { value: 'inactive', label: 'Inactive', color: 'text-amber-700', activeColor: 'bg-amber-500 text-white' },
  { value: 'submitted', label: 'Submitted', color: 'text-sky-700', activeColor: 'bg-sky-600 text-white' },
];

export default function StaffDashboard() {
  const [patients, setPatients] = useState<Map<string, PatientSession>>(new Map());
  const [recentlyChanged, setRecentlyChanged] = useState<Map<string, Set<string>>>(new Map());
  const [filter, setFilter] = useState<FilterOption>('all');

  // Stable callback: uses only setState (no external deps)
  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'patients:sync': {
        const map = new Map<string, PatientSession>();
        message.patients.forEach((p) => map.set(p.id, p));
        setPatients(map);
        break;
      }
      case 'patient:updated': {
        setPatients((prev) => {
          const next = new Map(prev);
          const existing = prev.get(message.patient.id);

          // Compute which fields changed (for flash animation)
          if (existing) {
            const changed = new Set<string>();
            for (const key of Object.keys(message.patient.data) as (keyof PatientFormData)[]) {
              if (message.patient.data[key] !== existing.data[key]) {
                changed.add(key);
              }
            }
            if (changed.size > 0) {
              setRecentlyChanged((prev) => new Map(prev).set(message.patient.id, changed));
              // Auto-clear after animation completes
              setTimeout(() => {
                setRecentlyChanged((prev) => {
                  const next = new Map(prev);
                  next.delete(message.patient.id);
                  return next;
                });
              }, 500);
            }
          }

          next.set(message.patient.id, message.patient);
          return next;
        });
        break;
      }
      case 'patient:status-changed': {
        setPatients((prev) => {
          const next = new Map(prev);
          const patient = next.get(message.sessionId);
          if (patient) {
            next.set(message.sessionId, { ...patient, status: message.status });
          }
          return next;
        });
        break;
      }
      case 'patient:disconnected': {
        setPatients((prev) => {
          const next = new Map(prev);
          next.delete(message.sessionId);
          return next;
        });
        setRecentlyChanged((prev) => {
          const next = new Map(prev);
          next.delete(message.sessionId);
          return next;
        });
        break;
      }
    }
  }, []);

  const { connectionState } = useWebSocket({
    role: 'staff',
    onMessage: handleMessage,
  });

  // Single-pass stats computation
  const { patientList, activeCount, inactiveCount, submittedCount } = useMemo(() => {
    const list = Array.from(patients.values());
    let active = 0, inactive = 0, submitted = 0;
    for (const p of list) {
      if (p.status === 'filling') active++;
      else if (p.status === 'inactive') inactive++;
      else if (p.status === 'submitted') submitted++;
    }
    return { patientList: list, activeCount: active, inactiveCount: inactive, submittedCount: submitted };
  }, [patients]);

  // Filtered list based on current filter
  const filteredList = useMemo(() => {
    if (filter === 'all') return patientList;
    return patientList.filter((p) => p.status === filter);
  }, [patientList, filter]);

  // Count per filter for badge display
  const filterCounts: Record<FilterOption, number> = {
    all: patientList.length,
    filling: activeCount,
    inactive: inactiveCount,
    submitted: submittedCount,
  };

  const stats = [
    { label: 'Total', value: patientList.length, color: 'text-[#001a33]' },
    { label: 'Active', value: activeCount, color: 'text-emerald-600' },
    { label: 'Inactive', value: inactiveCount, color: 'text-amber-600' },
    { label: 'Submitted', value: submittedCount, color: 'text-sky-600' },
  ];

  return (
    <>
      <Navbar connectionState={connectionState} />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#001a33]">
                Staff Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#63707c]">
                Monitoring patient form submissions
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-semibold tabular-nums ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#b0b8c1]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium
                  transition-all duration-200 min-h-[36px]
                  ${filter === opt.value
                    ? opt.activeColor
                    : `bg-gray-100 ${opt.color} hover:bg-gray-200`
                  }
                `}
              >
                {opt.label}
                <span className={`
                  tabular-nums rounded-full px-1.5 py-0.5 text-[11px] font-semibold
                  ${filter === opt.value ? 'bg-white/20' : 'bg-white'}
                `}>
                  {filterCounts[opt.value]}
                </span>
              </button>
            ))}
          </div>

          {/* Patient Cards */}
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-gray-200 py-20">
              <p className="text-sm font-medium text-[#63707c]">
                {patientList.length === 0
                  ? 'No patients connected'
                  : `No ${filter === 'filling' ? 'active' : filter} patients`}
              </p>
              <p className="mt-1 text-xs text-[#b0b8c1]">
                {patientList.length === 0
                  ? 'Patient data will appear here when patients begin filling their forms.'
                  : 'Try selecting a different filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  changedFields={recentlyChanged.get(patient.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
