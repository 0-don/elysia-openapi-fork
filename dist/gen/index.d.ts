import type { AdditionalReference } from '../types';
export interface OpenAPIGeneratorOptions {
    /**
     * Path to tsconfig.json
     * @default tsconfig.json
     */
    tsconfigPath?: string;
    /**
     * Name of the Elysia instance
     *
     * If multiple instances are found,
     * instanceName should be provided
     */
    instanceName?: string;
    /**
     * Project root directory
     *
     * @default process.cwd()
     */
    projectRoot?: string;
    /**
     * Override output path
     *
     * Under any circumstance, that Elysia failed to find a correct schema,
     * Put your own schema in this path
     */
    overrideOutputPath?: string | ((tempDir: string) => string);
    /**
     * don't remove temporary files
     * for debugging purpose
     * @default false
     */
    debug?: boolean;
    /**
     * compilerOptions
     *
     * Override tsconfig.json compilerOptions
     */
    compilerOptions?: Record<string, any>;
    /**
     * Temporary root
     *
     * a folder where temporary files are stored
     * @default os.tmpdir()/.ElysiaAutoOpenAPI
     *
     * ! be careful that the folder will be removed after the process ends
     */
    tmpRoot?: string;
    /**
     * disable log
     * @default false
     */
    silent?: boolean;
}
export declare function extractRootObjects(code: string): string[];
/**
 * Extract type alias and interface definitions from a declaration string
 * and return a map of name -> body (e.g. `User` -> `{ id: string; name: string; }`).
 *
 * Captures both `type X = ...` and `interface X { ... }` so identifiers
 * declared as interfaces (common in generated clients) get inlined the
 * same way as type aliases. Without this, interface references reach
 * TypeBox unresolved and emit bare `{ $ref: "X" }` schemas.
 */
export declare function extractTypeAliases(declaration: string): Record<string, string>;
export declare function transformWebApiGlobals(schema: any): any;
/**
 * Replace type references with their inlined definitions so that
 * TypeBox can produce concrete schemas instead of unresolvable $refs
 */
/**
 * @sinclair/typemap emits `{ type: 'Date' }` for TypeScript `Date` types,
 * which is invalid OpenAPI. Rewrite those nodes to the standard
 * `{ type: 'string', format: 'date-time' }` form.
 */
export declare function transformDateTypes(schema: any): any;
export declare function inlineTypeReferences(code: string, aliases: Record<string, string>): string;
/**
 * When a union contains a bare identifier that can't be resolved
 * (not in typeAliases, not a builtin, not a generic param), drop it.
 * This lets TypeBox emit a schema for the remaining members instead
 * of failing on the whole response.
 *
 * Example: `ResponseMapStringStringData | { key: null }` where
 * `ResponseMapStringStringData` wasn't inlined becomes `{ key: null }`.
 */
export declare function stripUnresolvedUnionMembers(code: string, typeAliases: Record<string, string>): string;
/**
 * Rewrite object literals whose only member is an index signature
 * `{ [k: string]: T }` into `Record<string, T>`. TypeBox's syntax
 * parser emits `never` for raw index signatures, which cascades up
 * the tree and causes the whole route to be dropped. Only pure
 * index-only bodies are rewritten; objects with extra properties
 * are left alone.
 */
export declare function rewriteIndexSignatures(code: string): string;
/**
 * Scan a declaration for `import("...").TypeName` references,
 * use TypeScript's module resolution to find the source files,
 * and extract the type aliases from them.
 *
 * This allows TypeBox to produce concrete schemas for cross-module types
 * (e.g. Drizzle ORM types imported from another package).
 */
export declare function resolveImportedTypes(declaration: string, projectRoot: string, tsconfigPath: string, sourceFilePath: string, existingAliases: Record<string, string>, fs: {
    existsSync: (path: string) => boolean;
    readFileSync: (path: string, encoding: BufferEncoding) => string;
}): Record<string, string>;
/**
 * Flatten nested intersections so that each root object represents a single route.
 *
 * Multi-route Elysia plugins produce declarations like:
 *   { api: { v3: { a: {...} } & { b: {...} } } }
 *
 * This distributes the outer structure over the inner intersection:
 *   { api: { v3: { a: {...} } } } & { api: { v3: { b: {...} } } }
 *
 * This way `extractRootObjects` and TypeBox can process each route individually.
 */
export declare function flattenNestedIntersections(declaration: string): string;
export declare function declarationToJSONSchema(declaration: string, typeAliases?: Record<string, string>): AdditionalReference;
/**
 * Extract the Nth (0-indexed) top-level generic parameter from
 * a string that starts with `: Elysia<...>` or `Elysia<...>`.
 *
 * Tracks `<>`, `{}`, `[]`, `()` depth so that commas inside
 * nested generics or object literals are not counted as separators.
 */
export declare function extractGenericParam(instance: string, paramIndex: number): string | undefined;
/**
 * Auto generate OpenAPI schema from Elysia instance
 *
 * It's expected that this command should run in project root
 *
 * @experimental use at your own risk
 */
export declare const fromTypes: (
/**
 * Path to file where Elysia instance is
 *
 * The path must export an Elysia instance
 * or a literal TypeScript declaration
 */
targetFilePath?: string, { tsconfigPath, instanceName, projectRoot, overrideOutputPath, debug, compilerOptions, tmpRoot, silent }?: OpenAPIGeneratorOptions) => () => AdditionalReference | undefined;
