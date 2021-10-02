export type Maybe<T> = T | null | undefined;

export type Nullable<T> = T extends null | undefined ? T : never;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Arrayed<T> = T extends any[] ? T : never;
