export type JwtPayload = {
  id: string
  name: string
  email: string
  exp: number
}

export type PhoneType = {
  country: string,
  countryCode: string,
  formatted: string,
  valid: boolean,
  nationalNumber: string,
  countryCallingCode: string,
  number: string,
}
