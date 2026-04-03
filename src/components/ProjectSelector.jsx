import { useState, useEffect, useRef } from 'react';
import { Box, Input, VStack, Text, Spinner } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { CLOCKIFY_API_KEY, CLOCKIFY_WORKSPACE_ID, CLOCKIFY_BASE_URL } from '../config';

const fetchAllProjects = async () => {
  const projects = [];
  let page = 1;
  const pageSize = 50;

  while (true) {
    const res = await fetch(
      `${CLOCKIFY_BASE_URL}/workspaces/${CLOCKIFY_WORKSPACE_ID}/projects?page-size=${pageSize}&page=${page}`,
      { headers: { 'X-Api-Key': CLOCKIFY_API_KEY } }
    );
    if (!res.ok) throw new Error(`Clockify API error: ${res.status}`);
    const data = await res.json();
    if (!data.length) break;
    projects.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  return projects;
};

const ProjectSelector = ({ region, onSelect, selectedProjects }) => {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAllProjects()
      .then(projects => {
        setAllProjects(projects);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch Clockify projects:', err);
        setError('Failed to load projects from Clockify');
        setLoading(false);
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = allProjects.filter(p => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.clientName?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (project) => {
    if (!selectedProjects.find(p => p.id === project.id)) {
      onSelect({ id: project.id, name: project.name, companyName: project.clientName || '' });
    }
    setSearchQuery('');
    setOpen(false);
  };

  const placeholder = loading
    ? 'Loading Clockify projects...'
    : error
    ? 'Failed to load projects'
    : 'Type to search projects...';

  return (
    <Box position="relative" w="100%" ref={containerRef}>
      <Box position="relative" w="100%">
        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="fg.muted" zIndex={2}>
          {loading ? <Spinner size="xs" /> : <Search size={18} />}
        </Box>
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => searchQuery && setOpen(true)}
          pl="10"
          w="100%"
          bg="bg.subtle"
          borderColor="border.muted"
          _hover={{ borderColor: 'border.emphasized' }}
          _focus={{ borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px var(--color-primary)' }}
          transition="all 0.2s ease"
          disabled={loading || !!error}
        />
      </Box>

      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>
      )}

      {!loading && !error && allProjects.length > 0 && (
        <Text color="fg.muted" fontSize="xs" mt={1}>
          {allProjects.length} projects loaded from Clockify
        </Text>
      )}

      {open && searchQuery && !loading && (
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
            <Box p={4}>
              <Text color="fg.muted" fontSize="sm">No projects match "{searchQuery}"</Text>
            </Box>
          ) : (
            <VStack gap={0} align="stretch">
              {filtered.map(project => {
                const alreadySelected = selectedProjects.find(p => p.id === project.id);
                return (
                  <Box
                    key={project.id}
                    p={3}
                    cursor={alreadySelected ? 'not-allowed' : 'pointer'}
                    opacity={alreadySelected ? 0.5 : 1}
                    _hover={{ bg: alreadySelected ? undefined : 'bg.subtle' }}
                    transition="all 0.2s ease"
                    onClick={() => !alreadySelected && handleSelect(project)}
                    borderBottom="1px solid"
                    borderColor="border.subtle"
                  >
                    <Text fontSize="sm" fontWeight="500" color="fg">{project.name}</Text>
                    {project.clientName && (
                      <Text fontSize="xs" color="fg.muted" mt={0.5}>{project.clientName}</Text>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectSelector;
