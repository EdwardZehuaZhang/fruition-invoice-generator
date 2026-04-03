import { useState } from 'react';
import { Box, Input, VStack, Text } from '@chakra-ui/react';
import { Search } from 'lucide-react';

// Static project list — replaces monday.com BoardSDK
const STATIC_PROJECTS = [
  { id: '1', name: 'GrooveSheet Platform', companyName: 'Fruition Services', region: 'APAC' },
  { id: '2', name: 'CarbonSync Digital Transformation', companyName: 'Carbon Sync Ventures', region: 'APAC' },
  { id: '3', name: 'VIZA Indonesia eVisa', companyName: 'Fruition Services', region: 'APAC' },
  { id: '4', name: 'Client Portal Migration', companyName: 'Fruition Services', region: 'NA' },
  { id: '5', name: 'Data Analytics Dashboard', companyName: 'Fruition Services', region: 'NA' },
  { id: '6', name: 'ERP Integration', companyName: 'Fruition Services', region: 'UK' },
  { id: '7', name: 'Workflow Automation', companyName: 'Fruition Services', region: 'UK' },
  { id: '8', name: 'Mobile App Development', companyName: 'Fruition Services', region: 'APAC' },
  { id: '9', name: 'Cloud Infrastructure Setup', companyName: 'Fruition Services', region: 'NA' },
  { id: '10', name: 'Custom Reporting Suite', companyName: 'Fruition Services', region: 'UK' },
];

const ProjectSelector = ({ region, onSelect, selectedProjects }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const regionMap = { NA: 'NA', APAC: 'APAC', UK: 'UK' };

  const filtered = STATIC_PROJECTS.filter(p => {
    const matchesRegion = !region || p.region === regionMap[region];
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query ||
      p.name.toLowerCase().includes(query) ||
      p.companyName.toLowerCase().includes(query);
    return matchesRegion && matchesQuery;
  });

  const handleSelect = (project) => {
    if (!selectedProjects.find(p => p.id === project.id)) {
      onSelect(project);
      setSearchQuery('');
    }
  };

  return (
    <Box position="relative" w="100%">
      <Box position="relative" w="100%">
        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="fg.muted" zIndex={2}>
          <Search size={18} />
        </Box>
        <Input
          placeholder={region ? 'Type to search projects...' : 'Select a region first'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          pl="10"
          w="100%"
          bg="bg.subtle"
          borderColor="border.muted"
          _hover={{ borderColor: 'border.emphasized' }}
          _focus={{ borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px var(--color-primary)' }}
          transition="all 0.2s ease"
          disabled={!region}
        />
      </Box>
      {!region && <Text color="fg.muted" textStyle="sm" mt={1}>Please select a region first</Text>}
      {searchQuery && region && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="white"
          border="1px solid"
          borderColor="border.muted"
          borderRadius="lg"
          shadow="xl"
          maxH="300px"
          overflowY="auto"
          zIndex={1000}
        >
          {filtered.length === 0 ? (
            <Box p={4}><Text color="fg.muted" textStyle="sm">No projects found</Text></Box>
          ) : (
            <VStack gap={0} align="stretch">
              {filtered.map(project => (
                <Box
                  key={project.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'bg.subtle' }}
                  transition="all 0.2s ease"
                  onClick={() => handleSelect(project)}
                  borderBottom="1px solid"
                  borderColor="border.subtle"
                >
                  <Text textStyle="sm" fontWeight="500" color="fg">{project.name}</Text>
                  {project.companyName && (
                    <Text textStyle="xs" color="fg.muted" mt={1}>{project.companyName}</Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectSelector;
