import { useState } from 'react';
import { Box, VStack, Input, Button, Text, Heading, Field, Alert } from '@chakra-ui/react';

const LoginPage = ({ onLogin, error: externalError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 150));
    const result = onLogin(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <Box minH="100vh" bg="var(--color-bg)" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box w="full" maxW="400px">
        <VStack gap={2} mb={8} textAlign="center">
          <Box w={12} h={12} bg="var(--color-primary)" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" mb={2}>
            <Text color="white" fontWeight="700" fontSize="xl">F</Text>
          </Box>
          <Heading size="lg" color="var(--color-text)" fontWeight="700">Fruition Invoice Generator</Heading>
          <Text color="var(--color-text-muted)" fontSize="sm">Sign in with your Fruition account</Text>
        </VStack>

        <Box bg="var(--color-surface)" border="1px solid" borderColor="var(--color-border)" borderRadius="xl" p={8} shadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              {(error || externalError) && (
                <Alert.Root status="error" borderRadius="lg">
                  <Alert.Indicator />
                  <Alert.Description fontSize="sm">{error || externalError}</Alert.Description>
                </Alert.Root>
              )}
              <Field.Root w="full">
                <Field.Label fontWeight="500">Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@fruitionservices.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field.Root>
              <Field.Root w="full">
                <Field.Label fontWeight="500">Password</Field.Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field.Root>
              <Button
                type="submit"
                w="full"
                bg="var(--color-primary)"
                color="white"
                _hover={{ bg: 'var(--color-primary-hover)' }}
                loading={loading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Box>

        <Text textAlign="center" color="var(--color-text-muted)" fontSize="xs" mt={6}>
          Access restricted to @fruitionservices.io accounts
        </Text>
      </Box>
    </Box>
  );
};

export default LoginPage;
