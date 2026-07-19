import { OAuthCallbackPage } from '@/app/oauth/[provider]/callback/page'

export default function GoogleCallbackPage() {
  return <OAuthCallbackPage providerOverride="google" />
}
