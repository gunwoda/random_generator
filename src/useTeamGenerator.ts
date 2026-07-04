import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type MatchingMode = 'teams' | 'maxPerTeam';

export interface TierData {
  id: string;
  name: string;
  input: string;
}

export interface TeamMember {
  name: string;
  tierName: string;
  tierIndex: number; // 0-based
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

// Fisher-Yates Shuffle
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STORAGE_KEY = 'tier_random_generator_state';

export function useTeamGenerator() {
  const [tierCount, setTierCount] = useState<number>(3);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [teamCount, setTeamCount] = useState<number>(4);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tierCount) setTierCount(parsed.tierCount);
        if (parsed.tiers) setTiers(parsed.tiers);
        if (parsed.teamCount) setTeamCount(parsed.teamCount);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    } else {
      // Initialize default tiers
      initializeTiers(3);
    }
  }, []);

  // Save to localStorage whenever important state changes
  useEffect(() => {
    if (tiers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tierCount,
        tiers,
        teamCount
      }));
    }
  }, [tierCount, tiers, teamCount]);

  const initializeTiers = (count: number) => {
    const newTiers: TierData[] = [];
    for (let i = 0; i < count; i++) {
      newTiers.push({
        id: uuidv4(),
        name: `${i + 1}티어`,
        input: ''
      });
    }
    setTiers(newTiers);
  };

  const handleTierCountChange = (newCount: number) => {
    if (newCount < 1) return;
    setTierCount(newCount);
    
    setTiers(prev => {
      const updated = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length; i < newCount; i++) {
          updated.push({
            id: uuidv4(),
            name: `${i + 1}티어`,
            input: ''
          });
        }
      } else if (newCount < prev.length) {
        updated.splice(newCount, prev.length - newCount);
      }
      return updated;
    });
  };

  const handleTierInputChange = (id: string, value: string) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, input: value } : t));
  };

  const getCleanNames = (input: string) => {
    return input.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
  };

  const totalParticipants = tiers.reduce((acc, tier) => acc + getCleanNames(tier.input).length, 0);

  const generateTeams = () => {
    if (totalParticipants === 0) {
      alert("참여자를 입력해주세요.");
      return;
    }

    let numTeams = teamCount;
    if (numTeams < 1) numTeams = 1;

    const initialTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      id: uuidv4(),
      name: `Team ${i + 1}`,
      members: []
    }));

    // For round-robin, we need to track which team gets the next person.
    // However, to prevent bias where Team 1 always gets the residuals of every tier,
    // we shuffle the target teams BEFORE distributing each tier.
    
    // Actually, instead of shuffling teams which messes up their internal order,
    // we can just maintain an array of team indices and shuffle THAT array for each tier.
    // Then we distribute the shuffled tier members into the teams following the shuffled indices.

    // Better yet: we want to distribute members as evenly as possible.
    // Let's keep track of current team sizes.
    // For each person, we place them in one of the teams with the CURRENT MINIMUM size.
    // If there are multiple teams with the minimum size, we pick one randomly.

    const resultTeams = [...initialTeams];

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const members = getCleanNames(tier.input);
      if (members.length === 0) continue;

      const shuffledMembers = shuffle(members);

      for (const memberName of shuffledMembers) {
        // Find the minimum size among all teams
        const minSize = Math.min(...resultTeams.map(t => t.members.length));
        
        // Find all teams that currently have this minimum size
        const candidateTeamIndices = resultTeams
          .map((t, idx) => ({ idx, size: t.members.length }))
          .filter(t => t.size === minSize)
          .map(t => t.idx);
        
        // Randomly pick one of the candidate teams
        const targetIdx = candidateTeamIndices[Math.floor(Math.random() * candidateTeamIndices.length)];
        
        resultTeams[targetIdx].members.push({
          name: memberName,
          tierName: tier.name,
          tierIndex: i
        });
      }
    }

    setTeams(resultTeams);
  };

  const copyToClipboard = () => {
    if (teams.length === 0) return;
    
    const text = teams.map(t => {
      const membersText = t.members.map(m => m.name).join(', ');
      return `[${t.name}]\n${membersText}`;
    }).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      alert("클립보드에 복사되었습니다!");
    }).catch(err => {
      console.error('Copy failed', err);
      alert("복사에 실패했습니다.");
    });
  };

  return {
    tierCount,
    tiers,
    teamCount,
    teams,
    totalParticipants,
    handleTierCountChange,
    handleTierInputChange,
    setTeamCount,
    generateTeams,
    copyToClipboard,
    getCleanNames
  };
}
