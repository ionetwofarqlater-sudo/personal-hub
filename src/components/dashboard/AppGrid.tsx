'use client';

import Link from 'next/link';
import { BookMarked, Settings, Plus, UserCircle2 } from 'lucide-react';

const apps = [
  {
    id: 'saved',
    name: 'Saved',
    description: 'Нотатки, посилання, файли',
    href: '/dashboard/saved',
    icon: BookMarked,
    gradient: 'from-violet-500 to-blue-500',
    glow: 'shadow-violet-500/20',
  },
  {
    id: 'settings',
    name: 'Налаштування',
    description: 'Параметри акаунту',
    href: '/dashboard/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-gray-400',
    glow: 'shadow-gray-500/20',
  },
  {
    id: 'profile',
    name: 'Профіль',
    description: 'Профіль та безпека',
    href: '/dashboard/profile',
    icon: UserCircle2,
    gradient: 'from-violet-500 to-fuchsia-400',
    glow: 'shadow-violet-500/20',
  },
];

export default function AppGrid() {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Додатки</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {apps.map(app => {
          const Icon = app.icon;
          return (
            <Link key={app.id} href={app.href}
              className="group bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${app.gradient} rounded-2xl flex items-center justify-center shadow-lg ${app.glow} group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{app.name}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-tight">{app.description}</p>
              </div>
            </Link>
          );
        })}

        <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl p-5 flex flex-col items-center text-center gap-3 opacity-50 hover:opacity-70 transition-opacity cursor-default">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-gray-500 font-semibold text-sm">Скоро</p>
            <p className="text-gray-600 text-xs mt-0.5">Новий модуль</p>
          </div>
        </div>
      </div>
    </div>
  );
}
