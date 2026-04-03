import { useState } from 'react';
import { Box, VStack, Button, Text, Heading, Alert } from '@chakra-ui/react';

const LoginPage = ({ onLogin, error }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await onLogin();
      // Redirect happens automatically via Supabase OAuth
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
    }
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
        {/* Brand */}
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
            Sign in with your Fruition Google account
          </Text>
        </VStack>

        {/* Card */}
        <Box
          bg="var(--color-surface)"
          border="1px solid"
          borderColor="var(--color-border)"
          borderRadius="xl"
          p={8}
          shadow="sm"
        >
          <VStack gap={5}>
            {error && (
              <Alert.Root status="error" borderRadius="lg">
                <Alert.Indicator />
                <Alert.Description fontSize="sm">{error}</Alert.Description>
              </Alert.Root>
            )}

            {/* Google sign-in button */}
            <Button
              w="full"
              size="md"
              variant="outline"
              borderColor="var(--color-border)"
              color="var(--color-text)"
              _hover={{ bg: 'bg.subtle', borderColor: 'var(--color-primary)' }}
              onClick={handleGoogleLogin}
              loading={loading}
              loadingText="Redirecting to Google..."
              gap={3}
            >
              {/* Google G logo SVG */}
              <Box as="span" flexShrink={0}>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </g>
                </svg>
              </Box>
              Continue with Google
            </Button>
          </VStack>
        </Box>

        <Text textAlign="center" color="var(--color-text-muted)" fontSize="xs" mt={6}>
          Access restricted to @fruitionservices.io Google accounts
        </Text>
      </Box>
    </Box>
  );
};

export default LoginPage;
