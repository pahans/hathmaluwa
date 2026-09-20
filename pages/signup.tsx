import { useState, type ComponentProps } from 'react';
import Head from 'next/head';
import { Box, Button, Card, Checkbox, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import NavBar from '../components/nav';

function FormField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: ComponentProps<typeof TextField.Root>['type'];
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box mt="4">
      <Text as="label" htmlFor={id} size="2" weight="medium" mb="1" style={{ display: 'block' }}>
        {label}
      </Text>
      <TextField.Root
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="3"
      />
    </Box>
  );
}

export default function Signup() {
  const [blogUrl, setBlogUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [blogName, setBlogName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ blogUrl, feedUrl, blogName, name, email, agreed });
  };

  return (
    <div>
      <Head>
        <title>Sign up - Hathmaluwa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <Flex justify="center" px="4">
        <Container size="1" mt="6">
          <Card size="4">
            <Heading as="h1" size="6" align="center">
              Add Your Blog / Web Site
            </Heading>

            <form onSubmit={handleSubmit}>
              <FormField id="url" label="Blog URL" autoComplete="url" value={blogUrl} onChange={setBlogUrl} />
              <FormField id="feed-url" label="Feed URL" autoComplete="url" value={feedUrl} onChange={setFeedUrl} />
              <FormField id="blog-name" label="Blog name" value={blogName} onChange={setBlogName} />
              <FormField id="name" label="Your name" autoComplete="name" value={name} onChange={setName} />
              <FormField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />

              <Flex align="center" gap="2" mt="4">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <Text as="label" htmlFor="terms" size="2">
                  I agree with terms and conditions
                </Text>
              </Flex>

              <Button type="submit" size="3" mt="5" style={{ width: '100%' }}>
                Submit
              </Button>
            </form>
          </Card>
        </Container>
      </Flex>
    </div>
  );
}
