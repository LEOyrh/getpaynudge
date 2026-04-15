import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "PayNudge"

interface ContactFormNotificationProps {
  name?: string
  email?: string
  message?: string
}

const ContactFormNotificationEmail = ({ name, email, message }: ContactFormNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact form submission from {name || 'a visitor'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Form Submission</Heading>
        <Text style={label}>Name</Text>
        <Text style={value}>{name || '—'}</Text>
        <Text style={label}>Email</Text>
        <Text style={value}>{email || '—'}</Text>
        <Hr style={hr} />
        <Text style={label}>Message</Text>
        <Text style={value}>{message || '—'}</Text>
        <Hr style={hr} />
        <Text style={footer}>Sent via {SITE_NAME} contact form</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactFormNotificationEmail,
  subject: (data: Record<string, any>) => `Contact form: ${data.name || 'New message'}`,
  displayName: 'Contact form notification',
  to: Deno.env.get('CONTACT_FORM_EMAIL') || 'support@getpaynudge.com',
  previewData: { name: 'Jane Doe', email: 'jane@example.com', message: 'I have a question about pricing.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const label = { fontSize: '12px', fontWeight: '600' as const, color: '#888888', margin: '16px 0 4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const value = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0 0 8px' }
const hr = { borderColor: '#eeeeee', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
