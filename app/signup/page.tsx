'use client'

import { useState, type ComponentProps } from 'react';
import { Box, Button, Callout, Card, Checkbox, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import Layout from '../../components/layout';

function FormField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  required = true,
  disabled,
}: {
  id: string;
  label: string;
  type?: ComponentProps<typeof TextField.Root>['type'];
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
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
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="3"
      />
    </Box>
  );
}

type SubmitState = { status: 'idle' | 'submitting' } | { status: 'success'; message: string } | { status: 'error'; message: string };

export default function Signup() {
  const [blogUrl, setBlogUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [blogName, setBlogName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ status: 'submitting' });

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogUrl, feedUrl, blogName, name, email, agreed }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSubmitState({ status: 'error', message: data.error ?? 'Something went wrong. Please try again.' });
        return;
      }

      setSubmitState({ status: 'success', message: data.message });
      setBlogUrl('');
      setFeedUrl('');
      setBlogName('');
      setName('');
      setEmail('');
      setAgreed(false);
    } catch {
      setSubmitState({ status: 'error', message: "Couldn't reach the server. Please try again." });
    }
  };

  const submitting = submitState.status === 'submitting';

  return (
    <Layout>
      <Flex justify="center" px="4">
        <Container size="1" mt="6" mb="6">
          <Card size="4">
            <Heading as="h1" size="6" align="center">
              Add Your Blog / Web Site
            </Heading>

            <form onSubmit={handleSubmit}>
              <FormField id="url" label="Blog URL" autoComplete="url" value={blogUrl} onChange={setBlogUrl} disabled={submitting} />
              <FormField
                id="feed-url"
                label="Feed URL (optional — fill in if we can't find it ourselves)"
                autoComplete="url"
                value={feedUrl}
                onChange={setFeedUrl}
                required={false}
                disabled={submitting}
              />
              <FormField id="blog-name" label="Blog name" value={blogName} onChange={setBlogName} disabled={submitting} />
              <FormField id="name" label="Your name" autoComplete="name" value={name} onChange={setName} disabled={submitting} />
              <FormField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                disabled={submitting}
              />

              <Flex align="center" gap="2" mt="4">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  disabled={submitting}
                />
                <Text as="label" htmlFor="terms" size="2">
                  I agree with terms and conditions
                </Text>
              </Flex>

              {submitState.status === 'success' && (
                <Callout.Root color="green" mt="4" role="status">
                  <Callout.Text>{submitState.message}</Callout.Text>
                </Callout.Root>
              )}
              {submitState.status === 'error' && (
                <Callout.Root color="red" mt="4" role="alert">
                  <Callout.Text>{submitState.message}</Callout.Text>
                </Callout.Root>
              )}

              <Button type="submit" size="3" mt="5" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </form>
          </Card>
        </Container>
      </Flex>
    </Layout>
  );
}
