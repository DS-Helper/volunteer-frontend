export type VolunteerId = string | number

export type IsoDateString = string

export type IsoDateTimeString = string

export interface VolunteerOption<TValue extends string = string> {
  value: TValue
  label: string
}

export interface VolunteerPageQuery {
  [key: string]:
    | string
    | number
    | boolean
    | readonly (string | number | boolean)[]
    | null
    | undefined
  page?: number
  size?: number
  sort?: string | readonly string[]
}
