
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model meeting
 * 
 */
export type meeting = $Result.DefaultSelection<Prisma.$meetingPayload>
/**
 * Model mediaChunks
 * 
 */
export type mediaChunks = $Result.DefaultSelection<Prisma.$mediaChunksPayload>
/**
 * Model FinalRecording
 * 
 */
export type FinalRecording = $Result.DefaultSelection<Prisma.$FinalRecordingPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const quality: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export type quality = (typeof quality)[keyof typeof quality]


export const format: {
  MP3: 'MP3',
  WAV: 'WAV',
  OGG: 'OGG'
};

export type format = (typeof format)[keyof typeof format]

}

export type quality = $Enums.quality

export const quality: typeof $Enums.quality

export type format = $Enums.format

export const format: typeof $Enums.format

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.meeting`: Exposes CRUD operations for the **meeting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Meetings
    * const meetings = await prisma.meeting.findMany()
    * ```
    */
  get meeting(): Prisma.meetingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mediaChunks`: Exposes CRUD operations for the **mediaChunks** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MediaChunks
    * const mediaChunks = await prisma.mediaChunks.findMany()
    * ```
    */
  get mediaChunks(): Prisma.mediaChunksDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.finalRecording`: Exposes CRUD operations for the **FinalRecording** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FinalRecordings
    * const finalRecordings = await prisma.finalRecording.findMany()
    * ```
    */
  get finalRecording(): Prisma.FinalRecordingDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    meeting: 'meeting',
    mediaChunks: 'mediaChunks',
    FinalRecording: 'FinalRecording'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "meeting" | "mediaChunks" | "finalRecording"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      meeting: {
        payload: Prisma.$meetingPayload<ExtArgs>
        fields: Prisma.meetingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.meetingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.meetingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          findFirst: {
            args: Prisma.meetingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.meetingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          findMany: {
            args: Prisma.meetingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>[]
          }
          create: {
            args: Prisma.meetingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          createMany: {
            args: Prisma.meetingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.meetingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>[]
          }
          delete: {
            args: Prisma.meetingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          update: {
            args: Prisma.meetingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          deleteMany: {
            args: Prisma.meetingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.meetingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.meetingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>[]
          }
          upsert: {
            args: Prisma.meetingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$meetingPayload>
          }
          aggregate: {
            args: Prisma.MeetingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMeeting>
          }
          groupBy: {
            args: Prisma.meetingGroupByArgs<ExtArgs>
            result: $Utils.Optional<MeetingGroupByOutputType>[]
          }
          count: {
            args: Prisma.meetingCountArgs<ExtArgs>
            result: $Utils.Optional<MeetingCountAggregateOutputType> | number
          }
        }
      }
      mediaChunks: {
        payload: Prisma.$mediaChunksPayload<ExtArgs>
        fields: Prisma.mediaChunksFieldRefs
        operations: {
          findUnique: {
            args: Prisma.mediaChunksFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.mediaChunksFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          findFirst: {
            args: Prisma.mediaChunksFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.mediaChunksFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          findMany: {
            args: Prisma.mediaChunksFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>[]
          }
          create: {
            args: Prisma.mediaChunksCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          createMany: {
            args: Prisma.mediaChunksCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.mediaChunksCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>[]
          }
          delete: {
            args: Prisma.mediaChunksDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          update: {
            args: Prisma.mediaChunksUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          deleteMany: {
            args: Prisma.mediaChunksDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.mediaChunksUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.mediaChunksUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>[]
          }
          upsert: {
            args: Prisma.mediaChunksUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$mediaChunksPayload>
          }
          aggregate: {
            args: Prisma.MediaChunksAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMediaChunks>
          }
          groupBy: {
            args: Prisma.mediaChunksGroupByArgs<ExtArgs>
            result: $Utils.Optional<MediaChunksGroupByOutputType>[]
          }
          count: {
            args: Prisma.mediaChunksCountArgs<ExtArgs>
            result: $Utils.Optional<MediaChunksCountAggregateOutputType> | number
          }
        }
      }
      FinalRecording: {
        payload: Prisma.$FinalRecordingPayload<ExtArgs>
        fields: Prisma.FinalRecordingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FinalRecordingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FinalRecordingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          findFirst: {
            args: Prisma.FinalRecordingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FinalRecordingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          findMany: {
            args: Prisma.FinalRecordingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>[]
          }
          create: {
            args: Prisma.FinalRecordingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          createMany: {
            args: Prisma.FinalRecordingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FinalRecordingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>[]
          }
          delete: {
            args: Prisma.FinalRecordingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          update: {
            args: Prisma.FinalRecordingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          deleteMany: {
            args: Prisma.FinalRecordingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FinalRecordingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FinalRecordingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>[]
          }
          upsert: {
            args: Prisma.FinalRecordingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinalRecordingPayload>
          }
          aggregate: {
            args: Prisma.FinalRecordingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFinalRecording>
          }
          groupBy: {
            args: Prisma.FinalRecordingGroupByArgs<ExtArgs>
            result: $Utils.Optional<FinalRecordingGroupByOutputType>[]
          }
          count: {
            args: Prisma.FinalRecordingCountArgs<ExtArgs>
            result: $Utils.Optional<FinalRecordingCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    meeting?: meetingOmit
    mediaChunks?: mediaChunksOmit
    finalRecording?: FinalRecordingOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    meetings: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meetings?: boolean | UserCountOutputTypeCountMeetingsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMeetingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: meetingWhereInput
  }


  /**
   * Count Type MeetingCountOutputType
   */

  export type MeetingCountOutputType = {
    rawChunks: number
    finalRecording: number
  }

  export type MeetingCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rawChunks?: boolean | MeetingCountOutputTypeCountRawChunksArgs
    finalRecording?: boolean | MeetingCountOutputTypeCountFinalRecordingArgs
  }

  // Custom InputTypes
  /**
   * MeetingCountOutputType without action
   */
  export type MeetingCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeetingCountOutputType
     */
    select?: MeetingCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MeetingCountOutputType without action
   */
  export type MeetingCountOutputTypeCountRawChunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: mediaChunksWhereInput
  }

  /**
   * MeetingCountOutputType without action
   */
  export type MeetingCountOutputTypeCountFinalRecordingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FinalRecordingWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    meetings?: boolean | User$meetingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meetings?: boolean | User$meetingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      meetings: Prisma.$meetingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string | null
      password: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    meetings<T extends User$meetingsArgs<ExtArgs> = {}>(args?: Subset<T, User$meetingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.meetings
   */
  export type User$meetingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    where?: meetingWhereInput
    orderBy?: meetingOrderByWithRelationInput | meetingOrderByWithRelationInput[]
    cursor?: meetingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MeetingScalarFieldEnum | MeetingScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model meeting
   */

  export type AggregateMeeting = {
    _count: MeetingCountAggregateOutputType | null
    _min: MeetingMinAggregateOutputType | null
    _max: MeetingMaxAggregateOutputType | null
  }

  export type MeetingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    startTime: Date | null
    endTime: Date | null
  }

  export type MeetingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    startTime: Date | null
    endTime: Date | null
  }

  export type MeetingCountAggregateOutputType = {
    id: number
    userId: number
    title: number
    startTime: number
    endTime: number
    _all: number
  }


  export type MeetingMinAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    startTime?: true
    endTime?: true
  }

  export type MeetingMaxAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    startTime?: true
    endTime?: true
  }

  export type MeetingCountAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    startTime?: true
    endTime?: true
    _all?: true
  }

  export type MeetingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which meeting to aggregate.
     */
    where?: meetingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of meetings to fetch.
     */
    orderBy?: meetingOrderByWithRelationInput | meetingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: meetingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` meetings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` meetings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned meetings
    **/
    _count?: true | MeetingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MeetingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MeetingMaxAggregateInputType
  }

  export type GetMeetingAggregateType<T extends MeetingAggregateArgs> = {
        [P in keyof T & keyof AggregateMeeting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMeeting[P]>
      : GetScalarType<T[P], AggregateMeeting[P]>
  }




  export type meetingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: meetingWhereInput
    orderBy?: meetingOrderByWithAggregationInput | meetingOrderByWithAggregationInput[]
    by: MeetingScalarFieldEnum[] | MeetingScalarFieldEnum
    having?: meetingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MeetingCountAggregateInputType | true
    _min?: MeetingMinAggregateInputType
    _max?: MeetingMaxAggregateInputType
  }

  export type MeetingGroupByOutputType = {
    id: string
    userId: string
    title: string | null
    startTime: Date | null
    endTime: Date | null
    _count: MeetingCountAggregateOutputType | null
    _min: MeetingMinAggregateOutputType | null
    _max: MeetingMaxAggregateOutputType | null
  }

  type GetMeetingGroupByPayload<T extends meetingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MeetingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MeetingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MeetingGroupByOutputType[P]>
            : GetScalarType<T[P], MeetingGroupByOutputType[P]>
        }
      >
    >


  export type meetingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    rawChunks?: boolean | meeting$rawChunksArgs<ExtArgs>
    finalRecording?: boolean | meeting$finalRecordingArgs<ExtArgs>
    _count?: boolean | MeetingCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["meeting"]>

  export type meetingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["meeting"]>

  export type meetingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["meeting"]>

  export type meetingSelectScalar = {
    id?: boolean
    userId?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
  }

  export type meetingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "title" | "startTime" | "endTime", ExtArgs["result"]["meeting"]>
  export type meetingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    rawChunks?: boolean | meeting$rawChunksArgs<ExtArgs>
    finalRecording?: boolean | meeting$finalRecordingArgs<ExtArgs>
    _count?: boolean | MeetingCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type meetingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type meetingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $meetingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "meeting"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      rawChunks: Prisma.$mediaChunksPayload<ExtArgs>[]
      finalRecording: Prisma.$FinalRecordingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      title: string | null
      startTime: Date | null
      endTime: Date | null
    }, ExtArgs["result"]["meeting"]>
    composites: {}
  }

  type meetingGetPayload<S extends boolean | null | undefined | meetingDefaultArgs> = $Result.GetResult<Prisma.$meetingPayload, S>

  type meetingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<meetingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MeetingCountAggregateInputType | true
    }

  export interface meetingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['meeting'], meta: { name: 'meeting' } }
    /**
     * Find zero or one Meeting that matches the filter.
     * @param {meetingFindUniqueArgs} args - Arguments to find a Meeting
     * @example
     * // Get one Meeting
     * const meeting = await prisma.meeting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends meetingFindUniqueArgs>(args: SelectSubset<T, meetingFindUniqueArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Meeting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {meetingFindUniqueOrThrowArgs} args - Arguments to find a Meeting
     * @example
     * // Get one Meeting
     * const meeting = await prisma.meeting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends meetingFindUniqueOrThrowArgs>(args: SelectSubset<T, meetingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Meeting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingFindFirstArgs} args - Arguments to find a Meeting
     * @example
     * // Get one Meeting
     * const meeting = await prisma.meeting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends meetingFindFirstArgs>(args?: SelectSubset<T, meetingFindFirstArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Meeting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingFindFirstOrThrowArgs} args - Arguments to find a Meeting
     * @example
     * // Get one Meeting
     * const meeting = await prisma.meeting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends meetingFindFirstOrThrowArgs>(args?: SelectSubset<T, meetingFindFirstOrThrowArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Meetings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Meetings
     * const meetings = await prisma.meeting.findMany()
     * 
     * // Get first 10 Meetings
     * const meetings = await prisma.meeting.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const meetingWithIdOnly = await prisma.meeting.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends meetingFindManyArgs>(args?: SelectSubset<T, meetingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Meeting.
     * @param {meetingCreateArgs} args - Arguments to create a Meeting.
     * @example
     * // Create one Meeting
     * const Meeting = await prisma.meeting.create({
     *   data: {
     *     // ... data to create a Meeting
     *   }
     * })
     * 
     */
    create<T extends meetingCreateArgs>(args: SelectSubset<T, meetingCreateArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Meetings.
     * @param {meetingCreateManyArgs} args - Arguments to create many Meetings.
     * @example
     * // Create many Meetings
     * const meeting = await prisma.meeting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends meetingCreateManyArgs>(args?: SelectSubset<T, meetingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Meetings and returns the data saved in the database.
     * @param {meetingCreateManyAndReturnArgs} args - Arguments to create many Meetings.
     * @example
     * // Create many Meetings
     * const meeting = await prisma.meeting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Meetings and only return the `id`
     * const meetingWithIdOnly = await prisma.meeting.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends meetingCreateManyAndReturnArgs>(args?: SelectSubset<T, meetingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Meeting.
     * @param {meetingDeleteArgs} args - Arguments to delete one Meeting.
     * @example
     * // Delete one Meeting
     * const Meeting = await prisma.meeting.delete({
     *   where: {
     *     // ... filter to delete one Meeting
     *   }
     * })
     * 
     */
    delete<T extends meetingDeleteArgs>(args: SelectSubset<T, meetingDeleteArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Meeting.
     * @param {meetingUpdateArgs} args - Arguments to update one Meeting.
     * @example
     * // Update one Meeting
     * const meeting = await prisma.meeting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends meetingUpdateArgs>(args: SelectSubset<T, meetingUpdateArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Meetings.
     * @param {meetingDeleteManyArgs} args - Arguments to filter Meetings to delete.
     * @example
     * // Delete a few Meetings
     * const { count } = await prisma.meeting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends meetingDeleteManyArgs>(args?: SelectSubset<T, meetingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Meetings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Meetings
     * const meeting = await prisma.meeting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends meetingUpdateManyArgs>(args: SelectSubset<T, meetingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Meetings and returns the data updated in the database.
     * @param {meetingUpdateManyAndReturnArgs} args - Arguments to update many Meetings.
     * @example
     * // Update many Meetings
     * const meeting = await prisma.meeting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Meetings and only return the `id`
     * const meetingWithIdOnly = await prisma.meeting.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends meetingUpdateManyAndReturnArgs>(args: SelectSubset<T, meetingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Meeting.
     * @param {meetingUpsertArgs} args - Arguments to update or create a Meeting.
     * @example
     * // Update or create a Meeting
     * const meeting = await prisma.meeting.upsert({
     *   create: {
     *     // ... data to create a Meeting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Meeting we want to update
     *   }
     * })
     */
    upsert<T extends meetingUpsertArgs>(args: SelectSubset<T, meetingUpsertArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Meetings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingCountArgs} args - Arguments to filter Meetings to count.
     * @example
     * // Count the number of Meetings
     * const count = await prisma.meeting.count({
     *   where: {
     *     // ... the filter for the Meetings we want to count
     *   }
     * })
    **/
    count<T extends meetingCountArgs>(
      args?: Subset<T, meetingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MeetingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Meeting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeetingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MeetingAggregateArgs>(args: Subset<T, MeetingAggregateArgs>): Prisma.PrismaPromise<GetMeetingAggregateType<T>>

    /**
     * Group by Meeting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {meetingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends meetingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: meetingGroupByArgs['orderBy'] }
        : { orderBy?: meetingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, meetingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMeetingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the meeting model
   */
  readonly fields: meetingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for meeting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__meetingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    rawChunks<T extends meeting$rawChunksArgs<ExtArgs> = {}>(args?: Subset<T, meeting$rawChunksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    finalRecording<T extends meeting$finalRecordingArgs<ExtArgs> = {}>(args?: Subset<T, meeting$finalRecordingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the meeting model
   */
  interface meetingFieldRefs {
    readonly id: FieldRef<"meeting", 'String'>
    readonly userId: FieldRef<"meeting", 'String'>
    readonly title: FieldRef<"meeting", 'String'>
    readonly startTime: FieldRef<"meeting", 'DateTime'>
    readonly endTime: FieldRef<"meeting", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * meeting findUnique
   */
  export type meetingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter, which meeting to fetch.
     */
    where: meetingWhereUniqueInput
  }

  /**
   * meeting findUniqueOrThrow
   */
  export type meetingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter, which meeting to fetch.
     */
    where: meetingWhereUniqueInput
  }

  /**
   * meeting findFirst
   */
  export type meetingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter, which meeting to fetch.
     */
    where?: meetingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of meetings to fetch.
     */
    orderBy?: meetingOrderByWithRelationInput | meetingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for meetings.
     */
    cursor?: meetingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` meetings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` meetings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of meetings.
     */
    distinct?: MeetingScalarFieldEnum | MeetingScalarFieldEnum[]
  }

  /**
   * meeting findFirstOrThrow
   */
  export type meetingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter, which meeting to fetch.
     */
    where?: meetingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of meetings to fetch.
     */
    orderBy?: meetingOrderByWithRelationInput | meetingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for meetings.
     */
    cursor?: meetingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` meetings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` meetings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of meetings.
     */
    distinct?: MeetingScalarFieldEnum | MeetingScalarFieldEnum[]
  }

  /**
   * meeting findMany
   */
  export type meetingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter, which meetings to fetch.
     */
    where?: meetingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of meetings to fetch.
     */
    orderBy?: meetingOrderByWithRelationInput | meetingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing meetings.
     */
    cursor?: meetingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` meetings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` meetings.
     */
    skip?: number
    distinct?: MeetingScalarFieldEnum | MeetingScalarFieldEnum[]
  }

  /**
   * meeting create
   */
  export type meetingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * The data needed to create a meeting.
     */
    data: XOR<meetingCreateInput, meetingUncheckedCreateInput>
  }

  /**
   * meeting createMany
   */
  export type meetingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many meetings.
     */
    data: meetingCreateManyInput | meetingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * meeting createManyAndReturn
   */
  export type meetingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * The data used to create many meetings.
     */
    data: meetingCreateManyInput | meetingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * meeting update
   */
  export type meetingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * The data needed to update a meeting.
     */
    data: XOR<meetingUpdateInput, meetingUncheckedUpdateInput>
    /**
     * Choose, which meeting to update.
     */
    where: meetingWhereUniqueInput
  }

  /**
   * meeting updateMany
   */
  export type meetingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update meetings.
     */
    data: XOR<meetingUpdateManyMutationInput, meetingUncheckedUpdateManyInput>
    /**
     * Filter which meetings to update
     */
    where?: meetingWhereInput
    /**
     * Limit how many meetings to update.
     */
    limit?: number
  }

  /**
   * meeting updateManyAndReturn
   */
  export type meetingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * The data used to update meetings.
     */
    data: XOR<meetingUpdateManyMutationInput, meetingUncheckedUpdateManyInput>
    /**
     * Filter which meetings to update
     */
    where?: meetingWhereInput
    /**
     * Limit how many meetings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * meeting upsert
   */
  export type meetingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * The filter to search for the meeting to update in case it exists.
     */
    where: meetingWhereUniqueInput
    /**
     * In case the meeting found by the `where` argument doesn't exist, create a new meeting with this data.
     */
    create: XOR<meetingCreateInput, meetingUncheckedCreateInput>
    /**
     * In case the meeting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<meetingUpdateInput, meetingUncheckedUpdateInput>
  }

  /**
   * meeting delete
   */
  export type meetingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
    /**
     * Filter which meeting to delete.
     */
    where: meetingWhereUniqueInput
  }

  /**
   * meeting deleteMany
   */
  export type meetingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which meetings to delete
     */
    where?: meetingWhereInput
    /**
     * Limit how many meetings to delete.
     */
    limit?: number
  }

  /**
   * meeting.rawChunks
   */
  export type meeting$rawChunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    where?: mediaChunksWhereInput
    orderBy?: mediaChunksOrderByWithRelationInput | mediaChunksOrderByWithRelationInput[]
    cursor?: mediaChunksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MediaChunksScalarFieldEnum | MediaChunksScalarFieldEnum[]
  }

  /**
   * meeting.finalRecording
   */
  export type meeting$finalRecordingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    where?: FinalRecordingWhereInput
    orderBy?: FinalRecordingOrderByWithRelationInput | FinalRecordingOrderByWithRelationInput[]
    cursor?: FinalRecordingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FinalRecordingScalarFieldEnum | FinalRecordingScalarFieldEnum[]
  }

  /**
   * meeting without action
   */
  export type meetingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the meeting
     */
    select?: meetingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the meeting
     */
    omit?: meetingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: meetingInclude<ExtArgs> | null
  }


  /**
   * Model mediaChunks
   */

  export type AggregateMediaChunks = {
    _count: MediaChunksCountAggregateOutputType | null
    _min: MediaChunksMinAggregateOutputType | null
    _max: MediaChunksMaxAggregateOutputType | null
  }

  export type MediaChunksMinAggregateOutputType = {
    id: string | null
    meetingId: string | null
    bucketLink: string | null
  }

  export type MediaChunksMaxAggregateOutputType = {
    id: string | null
    meetingId: string | null
    bucketLink: string | null
  }

  export type MediaChunksCountAggregateOutputType = {
    id: number
    meetingId: number
    bucketLink: number
    _all: number
  }


  export type MediaChunksMinAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
  }

  export type MediaChunksMaxAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
  }

  export type MediaChunksCountAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
    _all?: true
  }

  export type MediaChunksAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which mediaChunks to aggregate.
     */
    where?: mediaChunksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of mediaChunks to fetch.
     */
    orderBy?: mediaChunksOrderByWithRelationInput | mediaChunksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: mediaChunksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` mediaChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` mediaChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned mediaChunks
    **/
    _count?: true | MediaChunksCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MediaChunksMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MediaChunksMaxAggregateInputType
  }

  export type GetMediaChunksAggregateType<T extends MediaChunksAggregateArgs> = {
        [P in keyof T & keyof AggregateMediaChunks]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMediaChunks[P]>
      : GetScalarType<T[P], AggregateMediaChunks[P]>
  }




  export type mediaChunksGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: mediaChunksWhereInput
    orderBy?: mediaChunksOrderByWithAggregationInput | mediaChunksOrderByWithAggregationInput[]
    by: MediaChunksScalarFieldEnum[] | MediaChunksScalarFieldEnum
    having?: mediaChunksScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MediaChunksCountAggregateInputType | true
    _min?: MediaChunksMinAggregateInputType
    _max?: MediaChunksMaxAggregateInputType
  }

  export type MediaChunksGroupByOutputType = {
    id: string
    meetingId: string
    bucketLink: string
    _count: MediaChunksCountAggregateOutputType | null
    _min: MediaChunksMinAggregateOutputType | null
    _max: MediaChunksMaxAggregateOutputType | null
  }

  type GetMediaChunksGroupByPayload<T extends mediaChunksGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MediaChunksGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MediaChunksGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MediaChunksGroupByOutputType[P]>
            : GetScalarType<T[P], MediaChunksGroupByOutputType[P]>
        }
      >
    >


  export type mediaChunksSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mediaChunks"]>

  export type mediaChunksSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mediaChunks"]>

  export type mediaChunksSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mediaChunks"]>

  export type mediaChunksSelectScalar = {
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
  }

  export type mediaChunksOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "meetingId" | "bucketLink", ExtArgs["result"]["mediaChunks"]>
  export type mediaChunksInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }
  export type mediaChunksIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }
  export type mediaChunksIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }

  export type $mediaChunksPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "mediaChunks"
    objects: {
      meeting: Prisma.$meetingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      meetingId: string
      bucketLink: string
    }, ExtArgs["result"]["mediaChunks"]>
    composites: {}
  }

  type mediaChunksGetPayload<S extends boolean | null | undefined | mediaChunksDefaultArgs> = $Result.GetResult<Prisma.$mediaChunksPayload, S>

  type mediaChunksCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<mediaChunksFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MediaChunksCountAggregateInputType | true
    }

  export interface mediaChunksDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['mediaChunks'], meta: { name: 'mediaChunks' } }
    /**
     * Find zero or one MediaChunks that matches the filter.
     * @param {mediaChunksFindUniqueArgs} args - Arguments to find a MediaChunks
     * @example
     * // Get one MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends mediaChunksFindUniqueArgs>(args: SelectSubset<T, mediaChunksFindUniqueArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MediaChunks that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {mediaChunksFindUniqueOrThrowArgs} args - Arguments to find a MediaChunks
     * @example
     * // Get one MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends mediaChunksFindUniqueOrThrowArgs>(args: SelectSubset<T, mediaChunksFindUniqueOrThrowArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MediaChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksFindFirstArgs} args - Arguments to find a MediaChunks
     * @example
     * // Get one MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends mediaChunksFindFirstArgs>(args?: SelectSubset<T, mediaChunksFindFirstArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MediaChunks that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksFindFirstOrThrowArgs} args - Arguments to find a MediaChunks
     * @example
     * // Get one MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends mediaChunksFindFirstOrThrowArgs>(args?: SelectSubset<T, mediaChunksFindFirstOrThrowArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MediaChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findMany()
     * 
     * // Get first 10 MediaChunks
     * const mediaChunks = await prisma.mediaChunks.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mediaChunksWithIdOnly = await prisma.mediaChunks.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends mediaChunksFindManyArgs>(args?: SelectSubset<T, mediaChunksFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MediaChunks.
     * @param {mediaChunksCreateArgs} args - Arguments to create a MediaChunks.
     * @example
     * // Create one MediaChunks
     * const MediaChunks = await prisma.mediaChunks.create({
     *   data: {
     *     // ... data to create a MediaChunks
     *   }
     * })
     * 
     */
    create<T extends mediaChunksCreateArgs>(args: SelectSubset<T, mediaChunksCreateArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MediaChunks.
     * @param {mediaChunksCreateManyArgs} args - Arguments to create many MediaChunks.
     * @example
     * // Create many MediaChunks
     * const mediaChunks = await prisma.mediaChunks.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends mediaChunksCreateManyArgs>(args?: SelectSubset<T, mediaChunksCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MediaChunks and returns the data saved in the database.
     * @param {mediaChunksCreateManyAndReturnArgs} args - Arguments to create many MediaChunks.
     * @example
     * // Create many MediaChunks
     * const mediaChunks = await prisma.mediaChunks.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MediaChunks and only return the `id`
     * const mediaChunksWithIdOnly = await prisma.mediaChunks.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends mediaChunksCreateManyAndReturnArgs>(args?: SelectSubset<T, mediaChunksCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MediaChunks.
     * @param {mediaChunksDeleteArgs} args - Arguments to delete one MediaChunks.
     * @example
     * // Delete one MediaChunks
     * const MediaChunks = await prisma.mediaChunks.delete({
     *   where: {
     *     // ... filter to delete one MediaChunks
     *   }
     * })
     * 
     */
    delete<T extends mediaChunksDeleteArgs>(args: SelectSubset<T, mediaChunksDeleteArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MediaChunks.
     * @param {mediaChunksUpdateArgs} args - Arguments to update one MediaChunks.
     * @example
     * // Update one MediaChunks
     * const mediaChunks = await prisma.mediaChunks.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends mediaChunksUpdateArgs>(args: SelectSubset<T, mediaChunksUpdateArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MediaChunks.
     * @param {mediaChunksDeleteManyArgs} args - Arguments to filter MediaChunks to delete.
     * @example
     * // Delete a few MediaChunks
     * const { count } = await prisma.mediaChunks.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends mediaChunksDeleteManyArgs>(args?: SelectSubset<T, mediaChunksDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MediaChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MediaChunks
     * const mediaChunks = await prisma.mediaChunks.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends mediaChunksUpdateManyArgs>(args: SelectSubset<T, mediaChunksUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MediaChunks and returns the data updated in the database.
     * @param {mediaChunksUpdateManyAndReturnArgs} args - Arguments to update many MediaChunks.
     * @example
     * // Update many MediaChunks
     * const mediaChunks = await prisma.mediaChunks.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MediaChunks and only return the `id`
     * const mediaChunksWithIdOnly = await prisma.mediaChunks.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends mediaChunksUpdateManyAndReturnArgs>(args: SelectSubset<T, mediaChunksUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MediaChunks.
     * @param {mediaChunksUpsertArgs} args - Arguments to update or create a MediaChunks.
     * @example
     * // Update or create a MediaChunks
     * const mediaChunks = await prisma.mediaChunks.upsert({
     *   create: {
     *     // ... data to create a MediaChunks
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MediaChunks we want to update
     *   }
     * })
     */
    upsert<T extends mediaChunksUpsertArgs>(args: SelectSubset<T, mediaChunksUpsertArgs<ExtArgs>>): Prisma__mediaChunksClient<$Result.GetResult<Prisma.$mediaChunksPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MediaChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksCountArgs} args - Arguments to filter MediaChunks to count.
     * @example
     * // Count the number of MediaChunks
     * const count = await prisma.mediaChunks.count({
     *   where: {
     *     // ... the filter for the MediaChunks we want to count
     *   }
     * })
    **/
    count<T extends mediaChunksCountArgs>(
      args?: Subset<T, mediaChunksCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MediaChunksCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MediaChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaChunksAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MediaChunksAggregateArgs>(args: Subset<T, MediaChunksAggregateArgs>): Prisma.PrismaPromise<GetMediaChunksAggregateType<T>>

    /**
     * Group by MediaChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {mediaChunksGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends mediaChunksGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: mediaChunksGroupByArgs['orderBy'] }
        : { orderBy?: mediaChunksGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, mediaChunksGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMediaChunksGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the mediaChunks model
   */
  readonly fields: mediaChunksFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for mediaChunks.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__mediaChunksClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    meeting<T extends meetingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, meetingDefaultArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the mediaChunks model
   */
  interface mediaChunksFieldRefs {
    readonly id: FieldRef<"mediaChunks", 'String'>
    readonly meetingId: FieldRef<"mediaChunks", 'String'>
    readonly bucketLink: FieldRef<"mediaChunks", 'String'>
  }
    

  // Custom InputTypes
  /**
   * mediaChunks findUnique
   */
  export type mediaChunksFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter, which mediaChunks to fetch.
     */
    where: mediaChunksWhereUniqueInput
  }

  /**
   * mediaChunks findUniqueOrThrow
   */
  export type mediaChunksFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter, which mediaChunks to fetch.
     */
    where: mediaChunksWhereUniqueInput
  }

  /**
   * mediaChunks findFirst
   */
  export type mediaChunksFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter, which mediaChunks to fetch.
     */
    where?: mediaChunksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of mediaChunks to fetch.
     */
    orderBy?: mediaChunksOrderByWithRelationInput | mediaChunksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for mediaChunks.
     */
    cursor?: mediaChunksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` mediaChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` mediaChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of mediaChunks.
     */
    distinct?: MediaChunksScalarFieldEnum | MediaChunksScalarFieldEnum[]
  }

  /**
   * mediaChunks findFirstOrThrow
   */
  export type mediaChunksFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter, which mediaChunks to fetch.
     */
    where?: mediaChunksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of mediaChunks to fetch.
     */
    orderBy?: mediaChunksOrderByWithRelationInput | mediaChunksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for mediaChunks.
     */
    cursor?: mediaChunksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` mediaChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` mediaChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of mediaChunks.
     */
    distinct?: MediaChunksScalarFieldEnum | MediaChunksScalarFieldEnum[]
  }

  /**
   * mediaChunks findMany
   */
  export type mediaChunksFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter, which mediaChunks to fetch.
     */
    where?: mediaChunksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of mediaChunks to fetch.
     */
    orderBy?: mediaChunksOrderByWithRelationInput | mediaChunksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing mediaChunks.
     */
    cursor?: mediaChunksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` mediaChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` mediaChunks.
     */
    skip?: number
    distinct?: MediaChunksScalarFieldEnum | MediaChunksScalarFieldEnum[]
  }

  /**
   * mediaChunks create
   */
  export type mediaChunksCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * The data needed to create a mediaChunks.
     */
    data: XOR<mediaChunksCreateInput, mediaChunksUncheckedCreateInput>
  }

  /**
   * mediaChunks createMany
   */
  export type mediaChunksCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many mediaChunks.
     */
    data: mediaChunksCreateManyInput | mediaChunksCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * mediaChunks createManyAndReturn
   */
  export type mediaChunksCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * The data used to create many mediaChunks.
     */
    data: mediaChunksCreateManyInput | mediaChunksCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * mediaChunks update
   */
  export type mediaChunksUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * The data needed to update a mediaChunks.
     */
    data: XOR<mediaChunksUpdateInput, mediaChunksUncheckedUpdateInput>
    /**
     * Choose, which mediaChunks to update.
     */
    where: mediaChunksWhereUniqueInput
  }

  /**
   * mediaChunks updateMany
   */
  export type mediaChunksUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update mediaChunks.
     */
    data: XOR<mediaChunksUpdateManyMutationInput, mediaChunksUncheckedUpdateManyInput>
    /**
     * Filter which mediaChunks to update
     */
    where?: mediaChunksWhereInput
    /**
     * Limit how many mediaChunks to update.
     */
    limit?: number
  }

  /**
   * mediaChunks updateManyAndReturn
   */
  export type mediaChunksUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * The data used to update mediaChunks.
     */
    data: XOR<mediaChunksUpdateManyMutationInput, mediaChunksUncheckedUpdateManyInput>
    /**
     * Filter which mediaChunks to update
     */
    where?: mediaChunksWhereInput
    /**
     * Limit how many mediaChunks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * mediaChunks upsert
   */
  export type mediaChunksUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * The filter to search for the mediaChunks to update in case it exists.
     */
    where: mediaChunksWhereUniqueInput
    /**
     * In case the mediaChunks found by the `where` argument doesn't exist, create a new mediaChunks with this data.
     */
    create: XOR<mediaChunksCreateInput, mediaChunksUncheckedCreateInput>
    /**
     * In case the mediaChunks was found with the provided `where` argument, update it with this data.
     */
    update: XOR<mediaChunksUpdateInput, mediaChunksUncheckedUpdateInput>
  }

  /**
   * mediaChunks delete
   */
  export type mediaChunksDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
    /**
     * Filter which mediaChunks to delete.
     */
    where: mediaChunksWhereUniqueInput
  }

  /**
   * mediaChunks deleteMany
   */
  export type mediaChunksDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which mediaChunks to delete
     */
    where?: mediaChunksWhereInput
    /**
     * Limit how many mediaChunks to delete.
     */
    limit?: number
  }

  /**
   * mediaChunks without action
   */
  export type mediaChunksDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the mediaChunks
     */
    select?: mediaChunksSelect<ExtArgs> | null
    /**
     * Omit specific fields from the mediaChunks
     */
    omit?: mediaChunksOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: mediaChunksInclude<ExtArgs> | null
  }


  /**
   * Model FinalRecording
   */

  export type AggregateFinalRecording = {
    _count: FinalRecordingCountAggregateOutputType | null
    _min: FinalRecordingMinAggregateOutputType | null
    _max: FinalRecordingMaxAggregateOutputType | null
  }

  export type FinalRecordingMinAggregateOutputType = {
    id: string | null
    meetingId: string | null
    bucketLink: string | null
    generatedAt: Date | null
    format: $Enums.format | null
    quality: $Enums.quality | null
  }

  export type FinalRecordingMaxAggregateOutputType = {
    id: string | null
    meetingId: string | null
    bucketLink: string | null
    generatedAt: Date | null
    format: $Enums.format | null
    quality: $Enums.quality | null
  }

  export type FinalRecordingCountAggregateOutputType = {
    id: number
    meetingId: number
    bucketLink: number
    generatedAt: number
    format: number
    quality: number
    _all: number
  }


  export type FinalRecordingMinAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
    generatedAt?: true
    format?: true
    quality?: true
  }

  export type FinalRecordingMaxAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
    generatedAt?: true
    format?: true
    quality?: true
  }

  export type FinalRecordingCountAggregateInputType = {
    id?: true
    meetingId?: true
    bucketLink?: true
    generatedAt?: true
    format?: true
    quality?: true
    _all?: true
  }

  export type FinalRecordingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinalRecording to aggregate.
     */
    where?: FinalRecordingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinalRecordings to fetch.
     */
    orderBy?: FinalRecordingOrderByWithRelationInput | FinalRecordingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FinalRecordingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinalRecordings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinalRecordings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FinalRecordings
    **/
    _count?: true | FinalRecordingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FinalRecordingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FinalRecordingMaxAggregateInputType
  }

  export type GetFinalRecordingAggregateType<T extends FinalRecordingAggregateArgs> = {
        [P in keyof T & keyof AggregateFinalRecording]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFinalRecording[P]>
      : GetScalarType<T[P], AggregateFinalRecording[P]>
  }




  export type FinalRecordingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FinalRecordingWhereInput
    orderBy?: FinalRecordingOrderByWithAggregationInput | FinalRecordingOrderByWithAggregationInput[]
    by: FinalRecordingScalarFieldEnum[] | FinalRecordingScalarFieldEnum
    having?: FinalRecordingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FinalRecordingCountAggregateInputType | true
    _min?: FinalRecordingMinAggregateInputType
    _max?: FinalRecordingMaxAggregateInputType
  }

  export type FinalRecordingGroupByOutputType = {
    id: string
    meetingId: string
    bucketLink: string
    generatedAt: Date
    format: $Enums.format
    quality: $Enums.quality
    _count: FinalRecordingCountAggregateOutputType | null
    _min: FinalRecordingMinAggregateOutputType | null
    _max: FinalRecordingMaxAggregateOutputType | null
  }

  type GetFinalRecordingGroupByPayload<T extends FinalRecordingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FinalRecordingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FinalRecordingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FinalRecordingGroupByOutputType[P]>
            : GetScalarType<T[P], FinalRecordingGroupByOutputType[P]>
        }
      >
    >


  export type FinalRecordingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    generatedAt?: boolean
    format?: boolean
    quality?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["finalRecording"]>

  export type FinalRecordingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    generatedAt?: boolean
    format?: boolean
    quality?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["finalRecording"]>

  export type FinalRecordingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    generatedAt?: boolean
    format?: boolean
    quality?: boolean
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["finalRecording"]>

  export type FinalRecordingSelectScalar = {
    id?: boolean
    meetingId?: boolean
    bucketLink?: boolean
    generatedAt?: boolean
    format?: boolean
    quality?: boolean
  }

  export type FinalRecordingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "meetingId" | "bucketLink" | "generatedAt" | "format" | "quality", ExtArgs["result"]["finalRecording"]>
  export type FinalRecordingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }
  export type FinalRecordingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }
  export type FinalRecordingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meeting?: boolean | meetingDefaultArgs<ExtArgs>
  }

  export type $FinalRecordingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FinalRecording"
    objects: {
      meeting: Prisma.$meetingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      meetingId: string
      bucketLink: string
      generatedAt: Date
      format: $Enums.format
      quality: $Enums.quality
    }, ExtArgs["result"]["finalRecording"]>
    composites: {}
  }

  type FinalRecordingGetPayload<S extends boolean | null | undefined | FinalRecordingDefaultArgs> = $Result.GetResult<Prisma.$FinalRecordingPayload, S>

  type FinalRecordingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FinalRecordingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FinalRecordingCountAggregateInputType | true
    }

  export interface FinalRecordingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FinalRecording'], meta: { name: 'FinalRecording' } }
    /**
     * Find zero or one FinalRecording that matches the filter.
     * @param {FinalRecordingFindUniqueArgs} args - Arguments to find a FinalRecording
     * @example
     * // Get one FinalRecording
     * const finalRecording = await prisma.finalRecording.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FinalRecordingFindUniqueArgs>(args: SelectSubset<T, FinalRecordingFindUniqueArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FinalRecording that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FinalRecordingFindUniqueOrThrowArgs} args - Arguments to find a FinalRecording
     * @example
     * // Get one FinalRecording
     * const finalRecording = await prisma.finalRecording.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FinalRecordingFindUniqueOrThrowArgs>(args: SelectSubset<T, FinalRecordingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinalRecording that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingFindFirstArgs} args - Arguments to find a FinalRecording
     * @example
     * // Get one FinalRecording
     * const finalRecording = await prisma.finalRecording.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FinalRecordingFindFirstArgs>(args?: SelectSubset<T, FinalRecordingFindFirstArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinalRecording that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingFindFirstOrThrowArgs} args - Arguments to find a FinalRecording
     * @example
     * // Get one FinalRecording
     * const finalRecording = await prisma.finalRecording.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FinalRecordingFindFirstOrThrowArgs>(args?: SelectSubset<T, FinalRecordingFindFirstOrThrowArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FinalRecordings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FinalRecordings
     * const finalRecordings = await prisma.finalRecording.findMany()
     * 
     * // Get first 10 FinalRecordings
     * const finalRecordings = await prisma.finalRecording.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const finalRecordingWithIdOnly = await prisma.finalRecording.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FinalRecordingFindManyArgs>(args?: SelectSubset<T, FinalRecordingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FinalRecording.
     * @param {FinalRecordingCreateArgs} args - Arguments to create a FinalRecording.
     * @example
     * // Create one FinalRecording
     * const FinalRecording = await prisma.finalRecording.create({
     *   data: {
     *     // ... data to create a FinalRecording
     *   }
     * })
     * 
     */
    create<T extends FinalRecordingCreateArgs>(args: SelectSubset<T, FinalRecordingCreateArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FinalRecordings.
     * @param {FinalRecordingCreateManyArgs} args - Arguments to create many FinalRecordings.
     * @example
     * // Create many FinalRecordings
     * const finalRecording = await prisma.finalRecording.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FinalRecordingCreateManyArgs>(args?: SelectSubset<T, FinalRecordingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FinalRecordings and returns the data saved in the database.
     * @param {FinalRecordingCreateManyAndReturnArgs} args - Arguments to create many FinalRecordings.
     * @example
     * // Create many FinalRecordings
     * const finalRecording = await prisma.finalRecording.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FinalRecordings and only return the `id`
     * const finalRecordingWithIdOnly = await prisma.finalRecording.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FinalRecordingCreateManyAndReturnArgs>(args?: SelectSubset<T, FinalRecordingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FinalRecording.
     * @param {FinalRecordingDeleteArgs} args - Arguments to delete one FinalRecording.
     * @example
     * // Delete one FinalRecording
     * const FinalRecording = await prisma.finalRecording.delete({
     *   where: {
     *     // ... filter to delete one FinalRecording
     *   }
     * })
     * 
     */
    delete<T extends FinalRecordingDeleteArgs>(args: SelectSubset<T, FinalRecordingDeleteArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FinalRecording.
     * @param {FinalRecordingUpdateArgs} args - Arguments to update one FinalRecording.
     * @example
     * // Update one FinalRecording
     * const finalRecording = await prisma.finalRecording.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FinalRecordingUpdateArgs>(args: SelectSubset<T, FinalRecordingUpdateArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FinalRecordings.
     * @param {FinalRecordingDeleteManyArgs} args - Arguments to filter FinalRecordings to delete.
     * @example
     * // Delete a few FinalRecordings
     * const { count } = await prisma.finalRecording.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FinalRecordingDeleteManyArgs>(args?: SelectSubset<T, FinalRecordingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinalRecordings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FinalRecordings
     * const finalRecording = await prisma.finalRecording.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FinalRecordingUpdateManyArgs>(args: SelectSubset<T, FinalRecordingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinalRecordings and returns the data updated in the database.
     * @param {FinalRecordingUpdateManyAndReturnArgs} args - Arguments to update many FinalRecordings.
     * @example
     * // Update many FinalRecordings
     * const finalRecording = await prisma.finalRecording.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FinalRecordings and only return the `id`
     * const finalRecordingWithIdOnly = await prisma.finalRecording.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FinalRecordingUpdateManyAndReturnArgs>(args: SelectSubset<T, FinalRecordingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FinalRecording.
     * @param {FinalRecordingUpsertArgs} args - Arguments to update or create a FinalRecording.
     * @example
     * // Update or create a FinalRecording
     * const finalRecording = await prisma.finalRecording.upsert({
     *   create: {
     *     // ... data to create a FinalRecording
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FinalRecording we want to update
     *   }
     * })
     */
    upsert<T extends FinalRecordingUpsertArgs>(args: SelectSubset<T, FinalRecordingUpsertArgs<ExtArgs>>): Prisma__FinalRecordingClient<$Result.GetResult<Prisma.$FinalRecordingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FinalRecordings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingCountArgs} args - Arguments to filter FinalRecordings to count.
     * @example
     * // Count the number of FinalRecordings
     * const count = await prisma.finalRecording.count({
     *   where: {
     *     // ... the filter for the FinalRecordings we want to count
     *   }
     * })
    **/
    count<T extends FinalRecordingCountArgs>(
      args?: Subset<T, FinalRecordingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FinalRecordingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FinalRecording.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FinalRecordingAggregateArgs>(args: Subset<T, FinalRecordingAggregateArgs>): Prisma.PrismaPromise<GetFinalRecordingAggregateType<T>>

    /**
     * Group by FinalRecording.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinalRecordingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FinalRecordingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FinalRecordingGroupByArgs['orderBy'] }
        : { orderBy?: FinalRecordingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FinalRecordingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFinalRecordingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FinalRecording model
   */
  readonly fields: FinalRecordingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FinalRecording.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FinalRecordingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    meeting<T extends meetingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, meetingDefaultArgs<ExtArgs>>): Prisma__meetingClient<$Result.GetResult<Prisma.$meetingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FinalRecording model
   */
  interface FinalRecordingFieldRefs {
    readonly id: FieldRef<"FinalRecording", 'String'>
    readonly meetingId: FieldRef<"FinalRecording", 'String'>
    readonly bucketLink: FieldRef<"FinalRecording", 'String'>
    readonly generatedAt: FieldRef<"FinalRecording", 'DateTime'>
    readonly format: FieldRef<"FinalRecording", 'format'>
    readonly quality: FieldRef<"FinalRecording", 'quality'>
  }
    

  // Custom InputTypes
  /**
   * FinalRecording findUnique
   */
  export type FinalRecordingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter, which FinalRecording to fetch.
     */
    where: FinalRecordingWhereUniqueInput
  }

  /**
   * FinalRecording findUniqueOrThrow
   */
  export type FinalRecordingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter, which FinalRecording to fetch.
     */
    where: FinalRecordingWhereUniqueInput
  }

  /**
   * FinalRecording findFirst
   */
  export type FinalRecordingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter, which FinalRecording to fetch.
     */
    where?: FinalRecordingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinalRecordings to fetch.
     */
    orderBy?: FinalRecordingOrderByWithRelationInput | FinalRecordingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinalRecordings.
     */
    cursor?: FinalRecordingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinalRecordings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinalRecordings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinalRecordings.
     */
    distinct?: FinalRecordingScalarFieldEnum | FinalRecordingScalarFieldEnum[]
  }

  /**
   * FinalRecording findFirstOrThrow
   */
  export type FinalRecordingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter, which FinalRecording to fetch.
     */
    where?: FinalRecordingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinalRecordings to fetch.
     */
    orderBy?: FinalRecordingOrderByWithRelationInput | FinalRecordingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinalRecordings.
     */
    cursor?: FinalRecordingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinalRecordings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinalRecordings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinalRecordings.
     */
    distinct?: FinalRecordingScalarFieldEnum | FinalRecordingScalarFieldEnum[]
  }

  /**
   * FinalRecording findMany
   */
  export type FinalRecordingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter, which FinalRecordings to fetch.
     */
    where?: FinalRecordingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinalRecordings to fetch.
     */
    orderBy?: FinalRecordingOrderByWithRelationInput | FinalRecordingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FinalRecordings.
     */
    cursor?: FinalRecordingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinalRecordings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinalRecordings.
     */
    skip?: number
    distinct?: FinalRecordingScalarFieldEnum | FinalRecordingScalarFieldEnum[]
  }

  /**
   * FinalRecording create
   */
  export type FinalRecordingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * The data needed to create a FinalRecording.
     */
    data: XOR<FinalRecordingCreateInput, FinalRecordingUncheckedCreateInput>
  }

  /**
   * FinalRecording createMany
   */
  export type FinalRecordingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FinalRecordings.
     */
    data: FinalRecordingCreateManyInput | FinalRecordingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FinalRecording createManyAndReturn
   */
  export type FinalRecordingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * The data used to create many FinalRecordings.
     */
    data: FinalRecordingCreateManyInput | FinalRecordingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FinalRecording update
   */
  export type FinalRecordingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * The data needed to update a FinalRecording.
     */
    data: XOR<FinalRecordingUpdateInput, FinalRecordingUncheckedUpdateInput>
    /**
     * Choose, which FinalRecording to update.
     */
    where: FinalRecordingWhereUniqueInput
  }

  /**
   * FinalRecording updateMany
   */
  export type FinalRecordingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FinalRecordings.
     */
    data: XOR<FinalRecordingUpdateManyMutationInput, FinalRecordingUncheckedUpdateManyInput>
    /**
     * Filter which FinalRecordings to update
     */
    where?: FinalRecordingWhereInput
    /**
     * Limit how many FinalRecordings to update.
     */
    limit?: number
  }

  /**
   * FinalRecording updateManyAndReturn
   */
  export type FinalRecordingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * The data used to update FinalRecordings.
     */
    data: XOR<FinalRecordingUpdateManyMutationInput, FinalRecordingUncheckedUpdateManyInput>
    /**
     * Filter which FinalRecordings to update
     */
    where?: FinalRecordingWhereInput
    /**
     * Limit how many FinalRecordings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FinalRecording upsert
   */
  export type FinalRecordingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * The filter to search for the FinalRecording to update in case it exists.
     */
    where: FinalRecordingWhereUniqueInput
    /**
     * In case the FinalRecording found by the `where` argument doesn't exist, create a new FinalRecording with this data.
     */
    create: XOR<FinalRecordingCreateInput, FinalRecordingUncheckedCreateInput>
    /**
     * In case the FinalRecording was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FinalRecordingUpdateInput, FinalRecordingUncheckedUpdateInput>
  }

  /**
   * FinalRecording delete
   */
  export type FinalRecordingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
    /**
     * Filter which FinalRecording to delete.
     */
    where: FinalRecordingWhereUniqueInput
  }

  /**
   * FinalRecording deleteMany
   */
  export type FinalRecordingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinalRecordings to delete
     */
    where?: FinalRecordingWhereInput
    /**
     * Limit how many FinalRecordings to delete.
     */
    limit?: number
  }

  /**
   * FinalRecording without action
   */
  export type FinalRecordingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinalRecording
     */
    select?: FinalRecordingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinalRecording
     */
    omit?: FinalRecordingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinalRecordingInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const MeetingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    startTime: 'startTime',
    endTime: 'endTime'
  };

  export type MeetingScalarFieldEnum = (typeof MeetingScalarFieldEnum)[keyof typeof MeetingScalarFieldEnum]


  export const MediaChunksScalarFieldEnum: {
    id: 'id',
    meetingId: 'meetingId',
    bucketLink: 'bucketLink'
  };

  export type MediaChunksScalarFieldEnum = (typeof MediaChunksScalarFieldEnum)[keyof typeof MediaChunksScalarFieldEnum]


  export const FinalRecordingScalarFieldEnum: {
    id: 'id',
    meetingId: 'meetingId',
    bucketLink: 'bucketLink',
    generatedAt: 'generatedAt',
    format: 'format',
    quality: 'quality'
  };

  export type FinalRecordingScalarFieldEnum = (typeof FinalRecordingScalarFieldEnum)[keyof typeof FinalRecordingScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'format'
   */
  export type EnumformatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'format'>
    


  /**
   * Reference to a field of type 'format[]'
   */
  export type ListEnumformatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'format[]'>
    


  /**
   * Reference to a field of type 'quality'
   */
  export type EnumqualityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'quality'>
    


  /**
   * Reference to a field of type 'quality[]'
   */
  export type ListEnumqualityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'quality[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    password?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    meetings?: MeetingListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    meetings?: meetingOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    meetings?: MeetingListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type meetingWhereInput = {
    AND?: meetingWhereInput | meetingWhereInput[]
    OR?: meetingWhereInput[]
    NOT?: meetingWhereInput | meetingWhereInput[]
    id?: StringFilter<"meeting"> | string
    userId?: StringFilter<"meeting"> | string
    title?: StringNullableFilter<"meeting"> | string | null
    startTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
    endTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    rawChunks?: MediaChunksListRelationFilter
    finalRecording?: FinalRecordingListRelationFilter
  }

  export type meetingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrderInput | SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    rawChunks?: mediaChunksOrderByRelationAggregateInput
    finalRecording?: FinalRecordingOrderByRelationAggregateInput
  }

  export type meetingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: meetingWhereInput | meetingWhereInput[]
    OR?: meetingWhereInput[]
    NOT?: meetingWhereInput | meetingWhereInput[]
    userId?: StringFilter<"meeting"> | string
    title?: StringNullableFilter<"meeting"> | string | null
    startTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
    endTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    rawChunks?: MediaChunksListRelationFilter
    finalRecording?: FinalRecordingListRelationFilter
  }, "id">

  export type meetingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrderInput | SortOrder
    startTime?: SortOrderInput | SortOrder
    endTime?: SortOrderInput | SortOrder
    _count?: meetingCountOrderByAggregateInput
    _max?: meetingMaxOrderByAggregateInput
    _min?: meetingMinOrderByAggregateInput
  }

  export type meetingScalarWhereWithAggregatesInput = {
    AND?: meetingScalarWhereWithAggregatesInput | meetingScalarWhereWithAggregatesInput[]
    OR?: meetingScalarWhereWithAggregatesInput[]
    NOT?: meetingScalarWhereWithAggregatesInput | meetingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"meeting"> | string
    userId?: StringWithAggregatesFilter<"meeting"> | string
    title?: StringNullableWithAggregatesFilter<"meeting"> | string | null
    startTime?: DateTimeNullableWithAggregatesFilter<"meeting"> | Date | string | null
    endTime?: DateTimeNullableWithAggregatesFilter<"meeting"> | Date | string | null
  }

  export type mediaChunksWhereInput = {
    AND?: mediaChunksWhereInput | mediaChunksWhereInput[]
    OR?: mediaChunksWhereInput[]
    NOT?: mediaChunksWhereInput | mediaChunksWhereInput[]
    id?: StringFilter<"mediaChunks"> | string
    meetingId?: StringFilter<"mediaChunks"> | string
    bucketLink?: StringFilter<"mediaChunks"> | string
    meeting?: XOR<MeetingScalarRelationFilter, meetingWhereInput>
  }

  export type mediaChunksOrderByWithRelationInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    meeting?: meetingOrderByWithRelationInput
  }

  export type mediaChunksWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: mediaChunksWhereInput | mediaChunksWhereInput[]
    OR?: mediaChunksWhereInput[]
    NOT?: mediaChunksWhereInput | mediaChunksWhereInput[]
    meetingId?: StringFilter<"mediaChunks"> | string
    bucketLink?: StringFilter<"mediaChunks"> | string
    meeting?: XOR<MeetingScalarRelationFilter, meetingWhereInput>
  }, "id">

  export type mediaChunksOrderByWithAggregationInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    _count?: mediaChunksCountOrderByAggregateInput
    _max?: mediaChunksMaxOrderByAggregateInput
    _min?: mediaChunksMinOrderByAggregateInput
  }

  export type mediaChunksScalarWhereWithAggregatesInput = {
    AND?: mediaChunksScalarWhereWithAggregatesInput | mediaChunksScalarWhereWithAggregatesInput[]
    OR?: mediaChunksScalarWhereWithAggregatesInput[]
    NOT?: mediaChunksScalarWhereWithAggregatesInput | mediaChunksScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"mediaChunks"> | string
    meetingId?: StringWithAggregatesFilter<"mediaChunks"> | string
    bucketLink?: StringWithAggregatesFilter<"mediaChunks"> | string
  }

  export type FinalRecordingWhereInput = {
    AND?: FinalRecordingWhereInput | FinalRecordingWhereInput[]
    OR?: FinalRecordingWhereInput[]
    NOT?: FinalRecordingWhereInput | FinalRecordingWhereInput[]
    id?: StringFilter<"FinalRecording"> | string
    meetingId?: StringFilter<"FinalRecording"> | string
    bucketLink?: StringFilter<"FinalRecording"> | string
    generatedAt?: DateTimeFilter<"FinalRecording"> | Date | string
    format?: EnumformatFilter<"FinalRecording"> | $Enums.format
    quality?: EnumqualityFilter<"FinalRecording"> | $Enums.quality
    meeting?: XOR<MeetingScalarRelationFilter, meetingWhereInput>
  }

  export type FinalRecordingOrderByWithRelationInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    generatedAt?: SortOrder
    format?: SortOrder
    quality?: SortOrder
    meeting?: meetingOrderByWithRelationInput
  }

  export type FinalRecordingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FinalRecordingWhereInput | FinalRecordingWhereInput[]
    OR?: FinalRecordingWhereInput[]
    NOT?: FinalRecordingWhereInput | FinalRecordingWhereInput[]
    meetingId?: StringFilter<"FinalRecording"> | string
    bucketLink?: StringFilter<"FinalRecording"> | string
    generatedAt?: DateTimeFilter<"FinalRecording"> | Date | string
    format?: EnumformatFilter<"FinalRecording"> | $Enums.format
    quality?: EnumqualityFilter<"FinalRecording"> | $Enums.quality
    meeting?: XOR<MeetingScalarRelationFilter, meetingWhereInput>
  }, "id">

  export type FinalRecordingOrderByWithAggregationInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    generatedAt?: SortOrder
    format?: SortOrder
    quality?: SortOrder
    _count?: FinalRecordingCountOrderByAggregateInput
    _max?: FinalRecordingMaxOrderByAggregateInput
    _min?: FinalRecordingMinOrderByAggregateInput
  }

  export type FinalRecordingScalarWhereWithAggregatesInput = {
    AND?: FinalRecordingScalarWhereWithAggregatesInput | FinalRecordingScalarWhereWithAggregatesInput[]
    OR?: FinalRecordingScalarWhereWithAggregatesInput[]
    NOT?: FinalRecordingScalarWhereWithAggregatesInput | FinalRecordingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FinalRecording"> | string
    meetingId?: StringWithAggregatesFilter<"FinalRecording"> | string
    bucketLink?: StringWithAggregatesFilter<"FinalRecording"> | string
    generatedAt?: DateTimeWithAggregatesFilter<"FinalRecording"> | Date | string
    format?: EnumformatWithAggregatesFilter<"FinalRecording"> | $Enums.format
    quality?: EnumqualityWithAggregatesFilter<"FinalRecording"> | $Enums.quality
  }

  export type UserCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    meetings?: meetingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    meetings?: meetingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    meetings?: meetingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    meetings?: meetingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name?: string | null
    email?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type meetingCreateInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    user: UserCreateNestedOneWithoutMeetingsInput
    rawChunks?: mediaChunksCreateNestedManyWithoutMeetingInput
    finalRecording?: FinalRecordingCreateNestedManyWithoutMeetingInput
  }

  export type meetingUncheckedCreateInput = {
    id?: string
    userId: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    rawChunks?: mediaChunksUncheckedCreateNestedManyWithoutMeetingInput
    finalRecording?: FinalRecordingUncheckedCreateNestedManyWithoutMeetingInput
  }

  export type meetingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMeetingsNestedInput
    rawChunks?: mediaChunksUpdateManyWithoutMeetingNestedInput
    finalRecording?: FinalRecordingUpdateManyWithoutMeetingNestedInput
  }

  export type meetingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawChunks?: mediaChunksUncheckedUpdateManyWithoutMeetingNestedInput
    finalRecording?: FinalRecordingUncheckedUpdateManyWithoutMeetingNestedInput
  }

  export type meetingCreateManyInput = {
    id?: string
    userId: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
  }

  export type meetingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type meetingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type mediaChunksCreateInput = {
    id?: string
    bucketLink: string
    meeting: meetingCreateNestedOneWithoutRawChunksInput
  }

  export type mediaChunksUncheckedCreateInput = {
    id?: string
    meetingId: string
    bucketLink: string
  }

  export type mediaChunksUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    meeting?: meetingUpdateOneRequiredWithoutRawChunksNestedInput
  }

  export type mediaChunksUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    meetingId?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type mediaChunksCreateManyInput = {
    id?: string
    meetingId: string
    bucketLink: string
  }

  export type mediaChunksUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type mediaChunksUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    meetingId?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type FinalRecordingCreateInput = {
    id?: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
    meeting: meetingCreateNestedOneWithoutFinalRecordingInput
  }

  export type FinalRecordingUncheckedCreateInput = {
    id?: string
    meetingId: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
  }

  export type FinalRecordingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
    meeting?: meetingUpdateOneRequiredWithoutFinalRecordingNestedInput
  }

  export type FinalRecordingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    meetingId?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }

  export type FinalRecordingCreateManyInput = {
    id?: string
    meetingId: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
  }

  export type FinalRecordingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }

  export type FinalRecordingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    meetingId?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MeetingListRelationFilter = {
    every?: meetingWhereInput
    some?: meetingWhereInput
    none?: meetingWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type meetingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type MediaChunksListRelationFilter = {
    every?: mediaChunksWhereInput
    some?: mediaChunksWhereInput
    none?: mediaChunksWhereInput
  }

  export type FinalRecordingListRelationFilter = {
    every?: FinalRecordingWhereInput
    some?: FinalRecordingWhereInput
    none?: FinalRecordingWhereInput
  }

  export type mediaChunksOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FinalRecordingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type meetingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
  }

  export type meetingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
  }

  export type meetingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type MeetingScalarRelationFilter = {
    is?: meetingWhereInput
    isNot?: meetingWhereInput
  }

  export type mediaChunksCountOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
  }

  export type mediaChunksMaxOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
  }

  export type mediaChunksMinOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
  }

  export type EnumformatFilter<$PrismaModel = never> = {
    equals?: $Enums.format | EnumformatFieldRefInput<$PrismaModel>
    in?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    notIn?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    not?: NestedEnumformatFilter<$PrismaModel> | $Enums.format
  }

  export type EnumqualityFilter<$PrismaModel = never> = {
    equals?: $Enums.quality | EnumqualityFieldRefInput<$PrismaModel>
    in?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    notIn?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    not?: NestedEnumqualityFilter<$PrismaModel> | $Enums.quality
  }

  export type FinalRecordingCountOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    generatedAt?: SortOrder
    format?: SortOrder
    quality?: SortOrder
  }

  export type FinalRecordingMaxOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    generatedAt?: SortOrder
    format?: SortOrder
    quality?: SortOrder
  }

  export type FinalRecordingMinOrderByAggregateInput = {
    id?: SortOrder
    meetingId?: SortOrder
    bucketLink?: SortOrder
    generatedAt?: SortOrder
    format?: SortOrder
    quality?: SortOrder
  }

  export type EnumformatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.format | EnumformatFieldRefInput<$PrismaModel>
    in?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    notIn?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    not?: NestedEnumformatWithAggregatesFilter<$PrismaModel> | $Enums.format
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumformatFilter<$PrismaModel>
    _max?: NestedEnumformatFilter<$PrismaModel>
  }

  export type EnumqualityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.quality | EnumqualityFieldRefInput<$PrismaModel>
    in?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    notIn?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    not?: NestedEnumqualityWithAggregatesFilter<$PrismaModel> | $Enums.quality
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumqualityFilter<$PrismaModel>
    _max?: NestedEnumqualityFilter<$PrismaModel>
  }

  export type meetingCreateNestedManyWithoutUserInput = {
    create?: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput> | meetingCreateWithoutUserInput[] | meetingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: meetingCreateOrConnectWithoutUserInput | meetingCreateOrConnectWithoutUserInput[]
    createMany?: meetingCreateManyUserInputEnvelope
    connect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
  }

  export type meetingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput> | meetingCreateWithoutUserInput[] | meetingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: meetingCreateOrConnectWithoutUserInput | meetingCreateOrConnectWithoutUserInput[]
    createMany?: meetingCreateManyUserInputEnvelope
    connect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type meetingUpdateManyWithoutUserNestedInput = {
    create?: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput> | meetingCreateWithoutUserInput[] | meetingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: meetingCreateOrConnectWithoutUserInput | meetingCreateOrConnectWithoutUserInput[]
    upsert?: meetingUpsertWithWhereUniqueWithoutUserInput | meetingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: meetingCreateManyUserInputEnvelope
    set?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    disconnect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    delete?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    connect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    update?: meetingUpdateWithWhereUniqueWithoutUserInput | meetingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: meetingUpdateManyWithWhereWithoutUserInput | meetingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: meetingScalarWhereInput | meetingScalarWhereInput[]
  }

  export type meetingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput> | meetingCreateWithoutUserInput[] | meetingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: meetingCreateOrConnectWithoutUserInput | meetingCreateOrConnectWithoutUserInput[]
    upsert?: meetingUpsertWithWhereUniqueWithoutUserInput | meetingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: meetingCreateManyUserInputEnvelope
    set?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    disconnect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    delete?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    connect?: meetingWhereUniqueInput | meetingWhereUniqueInput[]
    update?: meetingUpdateWithWhereUniqueWithoutUserInput | meetingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: meetingUpdateManyWithWhereWithoutUserInput | meetingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: meetingScalarWhereInput | meetingScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMeetingsInput = {
    create?: XOR<UserCreateWithoutMeetingsInput, UserUncheckedCreateWithoutMeetingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMeetingsInput
    connect?: UserWhereUniqueInput
  }

  export type mediaChunksCreateNestedManyWithoutMeetingInput = {
    create?: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput> | mediaChunksCreateWithoutMeetingInput[] | mediaChunksUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: mediaChunksCreateOrConnectWithoutMeetingInput | mediaChunksCreateOrConnectWithoutMeetingInput[]
    createMany?: mediaChunksCreateManyMeetingInputEnvelope
    connect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
  }

  export type FinalRecordingCreateNestedManyWithoutMeetingInput = {
    create?: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput> | FinalRecordingCreateWithoutMeetingInput[] | FinalRecordingUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: FinalRecordingCreateOrConnectWithoutMeetingInput | FinalRecordingCreateOrConnectWithoutMeetingInput[]
    createMany?: FinalRecordingCreateManyMeetingInputEnvelope
    connect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
  }

  export type mediaChunksUncheckedCreateNestedManyWithoutMeetingInput = {
    create?: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput> | mediaChunksCreateWithoutMeetingInput[] | mediaChunksUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: mediaChunksCreateOrConnectWithoutMeetingInput | mediaChunksCreateOrConnectWithoutMeetingInput[]
    createMany?: mediaChunksCreateManyMeetingInputEnvelope
    connect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
  }

  export type FinalRecordingUncheckedCreateNestedManyWithoutMeetingInput = {
    create?: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput> | FinalRecordingCreateWithoutMeetingInput[] | FinalRecordingUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: FinalRecordingCreateOrConnectWithoutMeetingInput | FinalRecordingCreateOrConnectWithoutMeetingInput[]
    createMany?: FinalRecordingCreateManyMeetingInputEnvelope
    connect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutMeetingsNestedInput = {
    create?: XOR<UserCreateWithoutMeetingsInput, UserUncheckedCreateWithoutMeetingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMeetingsInput
    upsert?: UserUpsertWithoutMeetingsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMeetingsInput, UserUpdateWithoutMeetingsInput>, UserUncheckedUpdateWithoutMeetingsInput>
  }

  export type mediaChunksUpdateManyWithoutMeetingNestedInput = {
    create?: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput> | mediaChunksCreateWithoutMeetingInput[] | mediaChunksUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: mediaChunksCreateOrConnectWithoutMeetingInput | mediaChunksCreateOrConnectWithoutMeetingInput[]
    upsert?: mediaChunksUpsertWithWhereUniqueWithoutMeetingInput | mediaChunksUpsertWithWhereUniqueWithoutMeetingInput[]
    createMany?: mediaChunksCreateManyMeetingInputEnvelope
    set?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    disconnect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    delete?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    connect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    update?: mediaChunksUpdateWithWhereUniqueWithoutMeetingInput | mediaChunksUpdateWithWhereUniqueWithoutMeetingInput[]
    updateMany?: mediaChunksUpdateManyWithWhereWithoutMeetingInput | mediaChunksUpdateManyWithWhereWithoutMeetingInput[]
    deleteMany?: mediaChunksScalarWhereInput | mediaChunksScalarWhereInput[]
  }

  export type FinalRecordingUpdateManyWithoutMeetingNestedInput = {
    create?: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput> | FinalRecordingCreateWithoutMeetingInput[] | FinalRecordingUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: FinalRecordingCreateOrConnectWithoutMeetingInput | FinalRecordingCreateOrConnectWithoutMeetingInput[]
    upsert?: FinalRecordingUpsertWithWhereUniqueWithoutMeetingInput | FinalRecordingUpsertWithWhereUniqueWithoutMeetingInput[]
    createMany?: FinalRecordingCreateManyMeetingInputEnvelope
    set?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    disconnect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    delete?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    connect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    update?: FinalRecordingUpdateWithWhereUniqueWithoutMeetingInput | FinalRecordingUpdateWithWhereUniqueWithoutMeetingInput[]
    updateMany?: FinalRecordingUpdateManyWithWhereWithoutMeetingInput | FinalRecordingUpdateManyWithWhereWithoutMeetingInput[]
    deleteMany?: FinalRecordingScalarWhereInput | FinalRecordingScalarWhereInput[]
  }

  export type mediaChunksUncheckedUpdateManyWithoutMeetingNestedInput = {
    create?: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput> | mediaChunksCreateWithoutMeetingInput[] | mediaChunksUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: mediaChunksCreateOrConnectWithoutMeetingInput | mediaChunksCreateOrConnectWithoutMeetingInput[]
    upsert?: mediaChunksUpsertWithWhereUniqueWithoutMeetingInput | mediaChunksUpsertWithWhereUniqueWithoutMeetingInput[]
    createMany?: mediaChunksCreateManyMeetingInputEnvelope
    set?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    disconnect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    delete?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    connect?: mediaChunksWhereUniqueInput | mediaChunksWhereUniqueInput[]
    update?: mediaChunksUpdateWithWhereUniqueWithoutMeetingInput | mediaChunksUpdateWithWhereUniqueWithoutMeetingInput[]
    updateMany?: mediaChunksUpdateManyWithWhereWithoutMeetingInput | mediaChunksUpdateManyWithWhereWithoutMeetingInput[]
    deleteMany?: mediaChunksScalarWhereInput | mediaChunksScalarWhereInput[]
  }

  export type FinalRecordingUncheckedUpdateManyWithoutMeetingNestedInput = {
    create?: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput> | FinalRecordingCreateWithoutMeetingInput[] | FinalRecordingUncheckedCreateWithoutMeetingInput[]
    connectOrCreate?: FinalRecordingCreateOrConnectWithoutMeetingInput | FinalRecordingCreateOrConnectWithoutMeetingInput[]
    upsert?: FinalRecordingUpsertWithWhereUniqueWithoutMeetingInput | FinalRecordingUpsertWithWhereUniqueWithoutMeetingInput[]
    createMany?: FinalRecordingCreateManyMeetingInputEnvelope
    set?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    disconnect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    delete?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    connect?: FinalRecordingWhereUniqueInput | FinalRecordingWhereUniqueInput[]
    update?: FinalRecordingUpdateWithWhereUniqueWithoutMeetingInput | FinalRecordingUpdateWithWhereUniqueWithoutMeetingInput[]
    updateMany?: FinalRecordingUpdateManyWithWhereWithoutMeetingInput | FinalRecordingUpdateManyWithWhereWithoutMeetingInput[]
    deleteMany?: FinalRecordingScalarWhereInput | FinalRecordingScalarWhereInput[]
  }

  export type meetingCreateNestedOneWithoutRawChunksInput = {
    create?: XOR<meetingCreateWithoutRawChunksInput, meetingUncheckedCreateWithoutRawChunksInput>
    connectOrCreate?: meetingCreateOrConnectWithoutRawChunksInput
    connect?: meetingWhereUniqueInput
  }

  export type meetingUpdateOneRequiredWithoutRawChunksNestedInput = {
    create?: XOR<meetingCreateWithoutRawChunksInput, meetingUncheckedCreateWithoutRawChunksInput>
    connectOrCreate?: meetingCreateOrConnectWithoutRawChunksInput
    upsert?: meetingUpsertWithoutRawChunksInput
    connect?: meetingWhereUniqueInput
    update?: XOR<XOR<meetingUpdateToOneWithWhereWithoutRawChunksInput, meetingUpdateWithoutRawChunksInput>, meetingUncheckedUpdateWithoutRawChunksInput>
  }

  export type meetingCreateNestedOneWithoutFinalRecordingInput = {
    create?: XOR<meetingCreateWithoutFinalRecordingInput, meetingUncheckedCreateWithoutFinalRecordingInput>
    connectOrCreate?: meetingCreateOrConnectWithoutFinalRecordingInput
    connect?: meetingWhereUniqueInput
  }

  export type EnumformatFieldUpdateOperationsInput = {
    set?: $Enums.format
  }

  export type EnumqualityFieldUpdateOperationsInput = {
    set?: $Enums.quality
  }

  export type meetingUpdateOneRequiredWithoutFinalRecordingNestedInput = {
    create?: XOR<meetingCreateWithoutFinalRecordingInput, meetingUncheckedCreateWithoutFinalRecordingInput>
    connectOrCreate?: meetingCreateOrConnectWithoutFinalRecordingInput
    upsert?: meetingUpsertWithoutFinalRecordingInput
    connect?: meetingWhereUniqueInput
    update?: XOR<XOR<meetingUpdateToOneWithWhereWithoutFinalRecordingInput, meetingUpdateWithoutFinalRecordingInput>, meetingUncheckedUpdateWithoutFinalRecordingInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumformatFilter<$PrismaModel = never> = {
    equals?: $Enums.format | EnumformatFieldRefInput<$PrismaModel>
    in?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    notIn?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    not?: NestedEnumformatFilter<$PrismaModel> | $Enums.format
  }

  export type NestedEnumqualityFilter<$PrismaModel = never> = {
    equals?: $Enums.quality | EnumqualityFieldRefInput<$PrismaModel>
    in?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    notIn?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    not?: NestedEnumqualityFilter<$PrismaModel> | $Enums.quality
  }

  export type NestedEnumformatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.format | EnumformatFieldRefInput<$PrismaModel>
    in?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    notIn?: $Enums.format[] | ListEnumformatFieldRefInput<$PrismaModel>
    not?: NestedEnumformatWithAggregatesFilter<$PrismaModel> | $Enums.format
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumformatFilter<$PrismaModel>
    _max?: NestedEnumformatFilter<$PrismaModel>
  }

  export type NestedEnumqualityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.quality | EnumqualityFieldRefInput<$PrismaModel>
    in?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    notIn?: $Enums.quality[] | ListEnumqualityFieldRefInput<$PrismaModel>
    not?: NestedEnumqualityWithAggregatesFilter<$PrismaModel> | $Enums.quality
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumqualityFilter<$PrismaModel>
    _max?: NestedEnumqualityFilter<$PrismaModel>
  }

  export type meetingCreateWithoutUserInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    rawChunks?: mediaChunksCreateNestedManyWithoutMeetingInput
    finalRecording?: FinalRecordingCreateNestedManyWithoutMeetingInput
  }

  export type meetingUncheckedCreateWithoutUserInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    rawChunks?: mediaChunksUncheckedCreateNestedManyWithoutMeetingInput
    finalRecording?: FinalRecordingUncheckedCreateNestedManyWithoutMeetingInput
  }

  export type meetingCreateOrConnectWithoutUserInput = {
    where: meetingWhereUniqueInput
    create: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput>
  }

  export type meetingCreateManyUserInputEnvelope = {
    data: meetingCreateManyUserInput | meetingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type meetingUpsertWithWhereUniqueWithoutUserInput = {
    where: meetingWhereUniqueInput
    update: XOR<meetingUpdateWithoutUserInput, meetingUncheckedUpdateWithoutUserInput>
    create: XOR<meetingCreateWithoutUserInput, meetingUncheckedCreateWithoutUserInput>
  }

  export type meetingUpdateWithWhereUniqueWithoutUserInput = {
    where: meetingWhereUniqueInput
    data: XOR<meetingUpdateWithoutUserInput, meetingUncheckedUpdateWithoutUserInput>
  }

  export type meetingUpdateManyWithWhereWithoutUserInput = {
    where: meetingScalarWhereInput
    data: XOR<meetingUpdateManyMutationInput, meetingUncheckedUpdateManyWithoutUserInput>
  }

  export type meetingScalarWhereInput = {
    AND?: meetingScalarWhereInput | meetingScalarWhereInput[]
    OR?: meetingScalarWhereInput[]
    NOT?: meetingScalarWhereInput | meetingScalarWhereInput[]
    id?: StringFilter<"meeting"> | string
    userId?: StringFilter<"meeting"> | string
    title?: StringNullableFilter<"meeting"> | string | null
    startTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
    endTime?: DateTimeNullableFilter<"meeting"> | Date | string | null
  }

  export type UserCreateWithoutMeetingsInput = {
    id?: string
    name?: string | null
    email?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutMeetingsInput = {
    id?: string
    name?: string | null
    email?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutMeetingsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMeetingsInput, UserUncheckedCreateWithoutMeetingsInput>
  }

  export type mediaChunksCreateWithoutMeetingInput = {
    id?: string
    bucketLink: string
  }

  export type mediaChunksUncheckedCreateWithoutMeetingInput = {
    id?: string
    bucketLink: string
  }

  export type mediaChunksCreateOrConnectWithoutMeetingInput = {
    where: mediaChunksWhereUniqueInput
    create: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput>
  }

  export type mediaChunksCreateManyMeetingInputEnvelope = {
    data: mediaChunksCreateManyMeetingInput | mediaChunksCreateManyMeetingInput[]
    skipDuplicates?: boolean
  }

  export type FinalRecordingCreateWithoutMeetingInput = {
    id?: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
  }

  export type FinalRecordingUncheckedCreateWithoutMeetingInput = {
    id?: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
  }

  export type FinalRecordingCreateOrConnectWithoutMeetingInput = {
    where: FinalRecordingWhereUniqueInput
    create: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput>
  }

  export type FinalRecordingCreateManyMeetingInputEnvelope = {
    data: FinalRecordingCreateManyMeetingInput | FinalRecordingCreateManyMeetingInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutMeetingsInput = {
    update: XOR<UserUpdateWithoutMeetingsInput, UserUncheckedUpdateWithoutMeetingsInput>
    create: XOR<UserCreateWithoutMeetingsInput, UserUncheckedCreateWithoutMeetingsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMeetingsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMeetingsInput, UserUncheckedUpdateWithoutMeetingsInput>
  }

  export type UserUpdateWithoutMeetingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutMeetingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type mediaChunksUpsertWithWhereUniqueWithoutMeetingInput = {
    where: mediaChunksWhereUniqueInput
    update: XOR<mediaChunksUpdateWithoutMeetingInput, mediaChunksUncheckedUpdateWithoutMeetingInput>
    create: XOR<mediaChunksCreateWithoutMeetingInput, mediaChunksUncheckedCreateWithoutMeetingInput>
  }

  export type mediaChunksUpdateWithWhereUniqueWithoutMeetingInput = {
    where: mediaChunksWhereUniqueInput
    data: XOR<mediaChunksUpdateWithoutMeetingInput, mediaChunksUncheckedUpdateWithoutMeetingInput>
  }

  export type mediaChunksUpdateManyWithWhereWithoutMeetingInput = {
    where: mediaChunksScalarWhereInput
    data: XOR<mediaChunksUpdateManyMutationInput, mediaChunksUncheckedUpdateManyWithoutMeetingInput>
  }

  export type mediaChunksScalarWhereInput = {
    AND?: mediaChunksScalarWhereInput | mediaChunksScalarWhereInput[]
    OR?: mediaChunksScalarWhereInput[]
    NOT?: mediaChunksScalarWhereInput | mediaChunksScalarWhereInput[]
    id?: StringFilter<"mediaChunks"> | string
    meetingId?: StringFilter<"mediaChunks"> | string
    bucketLink?: StringFilter<"mediaChunks"> | string
  }

  export type FinalRecordingUpsertWithWhereUniqueWithoutMeetingInput = {
    where: FinalRecordingWhereUniqueInput
    update: XOR<FinalRecordingUpdateWithoutMeetingInput, FinalRecordingUncheckedUpdateWithoutMeetingInput>
    create: XOR<FinalRecordingCreateWithoutMeetingInput, FinalRecordingUncheckedCreateWithoutMeetingInput>
  }

  export type FinalRecordingUpdateWithWhereUniqueWithoutMeetingInput = {
    where: FinalRecordingWhereUniqueInput
    data: XOR<FinalRecordingUpdateWithoutMeetingInput, FinalRecordingUncheckedUpdateWithoutMeetingInput>
  }

  export type FinalRecordingUpdateManyWithWhereWithoutMeetingInput = {
    where: FinalRecordingScalarWhereInput
    data: XOR<FinalRecordingUpdateManyMutationInput, FinalRecordingUncheckedUpdateManyWithoutMeetingInput>
  }

  export type FinalRecordingScalarWhereInput = {
    AND?: FinalRecordingScalarWhereInput | FinalRecordingScalarWhereInput[]
    OR?: FinalRecordingScalarWhereInput[]
    NOT?: FinalRecordingScalarWhereInput | FinalRecordingScalarWhereInput[]
    id?: StringFilter<"FinalRecording"> | string
    meetingId?: StringFilter<"FinalRecording"> | string
    bucketLink?: StringFilter<"FinalRecording"> | string
    generatedAt?: DateTimeFilter<"FinalRecording"> | Date | string
    format?: EnumformatFilter<"FinalRecording"> | $Enums.format
    quality?: EnumqualityFilter<"FinalRecording"> | $Enums.quality
  }

  export type meetingCreateWithoutRawChunksInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    user: UserCreateNestedOneWithoutMeetingsInput
    finalRecording?: FinalRecordingCreateNestedManyWithoutMeetingInput
  }

  export type meetingUncheckedCreateWithoutRawChunksInput = {
    id?: string
    userId: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    finalRecording?: FinalRecordingUncheckedCreateNestedManyWithoutMeetingInput
  }

  export type meetingCreateOrConnectWithoutRawChunksInput = {
    where: meetingWhereUniqueInput
    create: XOR<meetingCreateWithoutRawChunksInput, meetingUncheckedCreateWithoutRawChunksInput>
  }

  export type meetingUpsertWithoutRawChunksInput = {
    update: XOR<meetingUpdateWithoutRawChunksInput, meetingUncheckedUpdateWithoutRawChunksInput>
    create: XOR<meetingCreateWithoutRawChunksInput, meetingUncheckedCreateWithoutRawChunksInput>
    where?: meetingWhereInput
  }

  export type meetingUpdateToOneWithWhereWithoutRawChunksInput = {
    where?: meetingWhereInput
    data: XOR<meetingUpdateWithoutRawChunksInput, meetingUncheckedUpdateWithoutRawChunksInput>
  }

  export type meetingUpdateWithoutRawChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMeetingsNestedInput
    finalRecording?: FinalRecordingUpdateManyWithoutMeetingNestedInput
  }

  export type meetingUncheckedUpdateWithoutRawChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    finalRecording?: FinalRecordingUncheckedUpdateManyWithoutMeetingNestedInput
  }

  export type meetingCreateWithoutFinalRecordingInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    user: UserCreateNestedOneWithoutMeetingsInput
    rawChunks?: mediaChunksCreateNestedManyWithoutMeetingInput
  }

  export type meetingUncheckedCreateWithoutFinalRecordingInput = {
    id?: string
    userId: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
    rawChunks?: mediaChunksUncheckedCreateNestedManyWithoutMeetingInput
  }

  export type meetingCreateOrConnectWithoutFinalRecordingInput = {
    where: meetingWhereUniqueInput
    create: XOR<meetingCreateWithoutFinalRecordingInput, meetingUncheckedCreateWithoutFinalRecordingInput>
  }

  export type meetingUpsertWithoutFinalRecordingInput = {
    update: XOR<meetingUpdateWithoutFinalRecordingInput, meetingUncheckedUpdateWithoutFinalRecordingInput>
    create: XOR<meetingCreateWithoutFinalRecordingInput, meetingUncheckedCreateWithoutFinalRecordingInput>
    where?: meetingWhereInput
  }

  export type meetingUpdateToOneWithWhereWithoutFinalRecordingInput = {
    where?: meetingWhereInput
    data: XOR<meetingUpdateWithoutFinalRecordingInput, meetingUncheckedUpdateWithoutFinalRecordingInput>
  }

  export type meetingUpdateWithoutFinalRecordingInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMeetingsNestedInput
    rawChunks?: mediaChunksUpdateManyWithoutMeetingNestedInput
  }

  export type meetingUncheckedUpdateWithoutFinalRecordingInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawChunks?: mediaChunksUncheckedUpdateManyWithoutMeetingNestedInput
  }

  export type meetingCreateManyUserInput = {
    id?: string
    title?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
  }

  export type meetingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawChunks?: mediaChunksUpdateManyWithoutMeetingNestedInput
    finalRecording?: FinalRecordingUpdateManyWithoutMeetingNestedInput
  }

  export type meetingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rawChunks?: mediaChunksUncheckedUpdateManyWithoutMeetingNestedInput
    finalRecording?: FinalRecordingUncheckedUpdateManyWithoutMeetingNestedInput
  }

  export type meetingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type mediaChunksCreateManyMeetingInput = {
    id?: string
    bucketLink: string
  }

  export type FinalRecordingCreateManyMeetingInput = {
    id?: string
    bucketLink: string
    generatedAt?: Date | string
    format: $Enums.format
    quality: $Enums.quality
  }

  export type mediaChunksUpdateWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type mediaChunksUncheckedUpdateWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type mediaChunksUncheckedUpdateManyWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
  }

  export type FinalRecordingUpdateWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }

  export type FinalRecordingUncheckedUpdateWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }

  export type FinalRecordingUncheckedUpdateManyWithoutMeetingInput = {
    id?: StringFieldUpdateOperationsInput | string
    bucketLink?: StringFieldUpdateOperationsInput | string
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    format?: EnumformatFieldUpdateOperationsInput | $Enums.format
    quality?: EnumqualityFieldUpdateOperationsInput | $Enums.quality
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}