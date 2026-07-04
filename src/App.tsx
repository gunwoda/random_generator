import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  Card, CardContent, Chip, Tabs, Tab
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupIcon from '@mui/icons-material/Group';
import { useTeamGenerator } from './useTeamGenerator';

const TIER_COLORS = [
  '#d32f2f', 
  '#1976d2', 
  '#388e3c', 
  '#fbc02d', 
  '#7b1fa2', 
  '#f57c00', 
  '#0097a7', 
];

function App() {
  const {
    tierCount, tiers, teamCount, teams, totalParticipants,
    handleTierCountChange, handleTierInputChange, setTeamCount,
    generateTeams, copyToClipboard, getCleanNames
  } = useTeamGenerator();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1a73e8' }}>
          랜덤 팀 뽑기
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
        <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>1. 매칭 설정</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="총 티어 개수 (K)" type="number" value={tierCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 10) handleTierCountChange(val);
                }}
                size="small" sx={{ width: 150 }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="생성할 팀 개수" type="number" value={teamCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamCount(Math.max(1, Number(e.target.value)))} size="small"
              />
            </Box>
          </Paper>
          <Paper elevation={0} sx={{ p: 0, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">2. 참여자 명단</Typography>
              <Chip icon={<GroupIcon />} label={`총 ${totalParticipants}명`} color="primary" variant="outlined" />
            </Box>
            <Tabs value={activeTab >= tierCount ? 0 : activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
              {tiers.map((tier) => {
                const count = getCleanNames(tier.input).length;
                return (
                  <Tab key={tier.id} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{tier.name}<Chip size="small" label={count} sx={{ height: 20, fontSize: '0.75rem' }} /></Box>} />
                );
              })}
            </Tabs>
            <Box sx={{ p: 2 }}>
              {tiers.map((tier, idx) => (
                <Box key={tier.id} role="tabpanel" hidden={activeTab !== idx}>
                  {activeTab === idx && (
                    <TextField fullWidth multiline rows={8} placeholder="참여자 이름을 입력하세요. (줄바꿈 또는 쉼표로 구분)" value={tier.input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTierInputChange(tier.id, e.target.value)} variant="outlined" />
                  )}
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button variant="contained" color="primary" size="large" fullWidth onClick={generateTeams} sx={{ py: 1.5, fontSize: '1.1rem' }}>팀 생성하기</Button>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>매칭 결과</Typography>
            {teams.length > 0 && (
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyToClipboard}>결과 텍스트 복사</Button>
            )}
          </Box>
          {teams.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, border: '1px dashed #ccc', borderRadius: 2 }}>
              <Typography color="text.secondary">조건을 설정하고 팀 생성하기 버튼을 눌러주세요.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
              {teams.map((team) => (
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }} key={team.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                        <Typography variant="h6" color="primary">{team.name}</Typography>
                        <Chip size="small" label={`${team.members.length}명`} />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {team.members.map((member, mIdx) => (
                          <Box key={mIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip size="small" label={`T${member.tierIndex + 1}`} sx={{ bgcolor: TIER_COLORS[member.tierIndex % TIER_COLORS.length], color: 'white', fontWeight: 'bold', minWidth: 40 }} />
                            <Typography variant="body1">{member.name}</Typography>
                          </Box>
                        ))}
                        {team.members.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>배정된 인원이 없습니다.</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
