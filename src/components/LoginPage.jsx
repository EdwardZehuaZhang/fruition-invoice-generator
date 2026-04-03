import { useState } from 'react';
import {
  Box, VStack, HStack, Input, Button, Text, Heading,
  Field, Alert
} from '@chakra-ui/react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay for UX
    await new Promise(r => setTimeout(r, 200));

    const result = onLogin(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Box
      minH="100vh"
      bg="var(--color-bg)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box w="full" maxW="400px">
        {/* Logo / Brand */}
        <VStack gap={2} mb={8} textAlign="center">
          <Box
            w={12}
            h={12}
            bg="var(--color-primary)"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Text color="white" fontWeight="700" fontSize="xl">F</Text>
          </Box>
          <Heading size="lg" color="var(--color-text)" fontWeight="700">
            Fruition Invoice Generator
          </Heading>
          <Text color="var(--color-text-muted)" fontSize="sm">
            Sign in with your Fruition account
          </Text>
        </VStack>

        {/* Login Card */}
        <Box
          bg="var(--color-surface)"
          border="1px solid"
          borderColor="var(--color-border)"
          borderRadius="xl"
          p={8}
          shadow="sm"
        >
          <form onSubmit={handleSubmit}>
            <VStack gap={5}>
              {error && (
                <Alert.Root status="error" borderRadius="lg">
                  <Alert.Indicator />
                  <Alert.Description fontSize="sm">{error}</Alert.Description>
                </Alert.Root>
              )}

              <Field.Root w="full">
                <Field.Label fontWeight="500" color="var(--color-text)">
                  Email
                </Field.Label>
                <Input
                  type="email"
                  placeholder="you@fruitionservices.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  borderColor="var(--color-border)"
                  _focus={{
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 0 1px var(--color-primary)'
                  }}
                />
              </Field.Root>

              <Field.Root w="full">
                <HStack justify="space-between" w="full">
                  <Field.Label fontWeight="500" color="var(--color-text)">
                    Password
                  </Field.Label>
                </HStack>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  borderColor="var(--color-border)"
                  _focus={{
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 0 1px var(--color-primary)'
                  }}
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
                size="md"
                fontWeight="600"
              >
                Sign in
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
