/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={logo}>{siteName}</Heading>
        <Hr style={hr} />
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#0f9b8e', margin: '0 0 8px', textAlign: 'center' as const }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1f2e', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 25px' }
const link = { color: '#0f9b8e', textDecoration: 'underline' }
const button = { backgroundColor: '#0f9b8e', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '30px 0 0' }
