'use client';

import { useState } from 'react';
import { Image, TreePine, GitBranch, BarChart3 } from 'lucide-react';
import { ItemManagement } from './ItemManagement';
import { SpeciesManagement } from './SpeciesManagement';
import { GroupManagement } from './GroupManagement';
import { QuizStats } from './QuizStats';

type SubTab = 'items' | 'species' | 'groups' | 'stats';

const subTabs = [
  { id: 'items' as SubTab, label: '문항 관리', icon: Image },
  { id: 'species' as SubTab, label: '수종 관리', icon: TreePine },
  { id: 'groups' as SubTab, label: '혼동그룹', icon: GitBranch },
  { id: 'stats' as SubTab, label: '통계', icon: BarChart3 },
];

export function QuizManagement() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('items');

  return (
    <div>
      {/* 서브 탭 (pill style) */}
      <div className="flex gap-2 mb-6">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 서브 탭 콘텐츠 */}
      {activeSubTab === 'items' && <ItemManagement />}
      {activeSubTab === 'species' && <SpeciesManagement />}
      {activeSubTab === 'groups' && <GroupManagement />}
      {activeSubTab === 'stats' && <QuizStats />}
    </div>
  );
}
