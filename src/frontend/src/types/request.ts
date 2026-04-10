import type { User } from './user'

export const ConditionPreference = {
  AnyCondition: 0,
  OEM: 1,
  Aftermarket: 2,
  Second_Hand: 3,
  Open_To_All: 4,
} as const
export type ConditionPreference = (typeof ConditionPreference)[keyof typeof ConditionPreference]

export const Urgency = {
  Standard: 0,
  Express: 1,
  Urgent: 2,
} as const
export type Urgency = (typeof Urgency)[keyof typeof Urgency]

export interface PartImage {
  id: number
  partReequestId: number // server-side typo preserved
  imageUrl: string
}

export interface AddPartImageDTO {
  imageUrl: string
}

export interface AddPartRequestDTO {
  vehicleMake: string
  model: string
  year: string
  engineType: string
  chassisNumber: string
  partName: string
  partNumber: string
  conditionPreference: ConditionPreference
  urgency: Urgency
  description: string
  country: string
  phone: string
  email: string
  dateCreated: string
  userId: number
  partImages: AddPartImageDTO[]
}

export interface PartRequest {
  id: number
  vehicleMake: string
  model: string
  year: string
  engineType: string
  chassisNumber: string
  partName: string
  partNumber: string
  conditionPreference: ConditionPreference
  urgency: Urgency
  description: string
  country: string
  phone: string
  email: string
  dateCreated: string
  partImages: PartImage[]
  isSorted: boolean
  userId: number
  user: User
  orders: string[]
}
