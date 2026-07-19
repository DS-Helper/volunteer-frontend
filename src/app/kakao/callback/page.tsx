import { OAuthCallbackPage } from '@/app/oauth/[provider]/callback/page'

export default function KakaoCallbackPage() {
  return <OAuthCallbackPage providerOverride="kakao" />
}
