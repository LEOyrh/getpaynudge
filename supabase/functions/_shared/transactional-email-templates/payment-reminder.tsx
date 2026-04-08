import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "PayNudge"

interface PaymentReminderProps {
  clientName?: string
  invoiceNumber?: string
  amount?: string
  dueDate?: string
  businessName?: string
  payLink?: string
  tone?: 'friendly' | 'professional' | 'firm'
}

const toneConfig = {
  friendly: {
    greeting: (name: string) => `Hi ${name},`,
    body: "Just a friendly reminder that the following invoice is coming up (or past due). We'd appreciate it if you could take a moment to review it.",
    cta: "View & Pay Invoice",
    closing: "Thanks so much!",
  },
  professional: {
    greeting: (name: string) => `Dear ${name},`,
    body: "This is a reminder regarding the outstanding invoice below. Please arrange payment at your earliest convenience.",
    cta: "Pay Now",
    closing: "Thank you for your prompt attention.",
  },
  firm: {
    greeting: (name: string) => `Dear ${name},`,
    body: "This is a final reminder for the overdue invoice below. Immediate payment is required to avoid further action.",
    cta: "Pay Immediately",
    closing: "Please treat this as urgent.",
  },
}

const PaymentReminderEmail = ({
  clientName = 'there',
  invoiceNumber = 'INV-001',
  amount = '$0.00',
  dueDate = 'N/A',
  businessName = SITE_NAME,
  payLink,
  tone = 'friendly',
}: PaymentReminderProps) => {
  const t = toneConfig[tone] || toneConfig.friendly

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Payment reminder for invoice ${invoiceNumber}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>{SITE_NAME}</Heading>
          <Hr style={hr} />
          <Heading style={h1}>{t.greeting(clientName)}</Heading>
          <Text style={text}>{t.body}</Text>
          <Section style={invoiceBox}>
            <Text style={invoiceDetail}><strong>Invoice:</strong> {invoiceNumber}</Text>
            <Text style={invoiceDetail}><strong>Amount:</strong> {amount}</Text>
            <Text style={invoiceDetail}><strong>Due Date:</strong> {dueDate}</Text>
            <Text style={invoiceDetail}><strong>From:</strong> {businessName}</Text>
          </Section>
          {payLink && (
            <Section style={ctaSection}>
              <Button style={button} href={payLink}>{t.cta}</Button>
            </Section>
          )}
          <Text style={text}>{t.closing}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Sent via {SITE_NAME} on behalf of {businessName}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PaymentReminderEmail,
  subject: (data: Record<string, any>) =>
    `Payment reminder: Invoice ${data.invoiceNumber || 'due'}`,
  displayName: 'Payment reminder',
  previewData: {
    clientName: 'Jane Doe',
    invoiceNumber: 'INV-2024-042',
    amount: '$1,500.00',
    dueDate: 'January 15, 2025',
    businessName: 'Acme Design Co.',
    payLink: 'https://example.com/pay/inv-042',
    tone: 'friendly',
  },
} satisfies TemplateEntry

// Styles — teal accent matching PayNudge brand
const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#0f9b8e', margin: '0 0 8px', textAlign: 'center' as const }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const h1 = { fontSize: '20px', fontWeight: '600' as const, color: '#1e293b', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const invoiceBox = { backgroundColor: '#f0fdfa', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const invoiceDetail = { fontSize: '14px', color: '#334155', lineHeight: '1.5', margin: '4px 0' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = {
  backgroundColor: '#0f9b8e',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '12px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '0' }
