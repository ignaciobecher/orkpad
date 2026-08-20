export interface SubscribePushDto {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}

export interface VapidPublicKeyResponse {
  publicKey: string
}
