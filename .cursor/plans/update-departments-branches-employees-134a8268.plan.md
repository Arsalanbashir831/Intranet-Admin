<!-- 134a8268-b53c-40fa-9d24-98caefe93aa8 10a3f6ee-fbcd-4ec9-895a-ff2b4c49b298 -->
# Comprehensive Codebase Analysis

## Executive Summary

The codebase demonstrates good organization with domain-driven structure, but has opportunities for improvement in code duplication, type safety, and standardization of patterns.

## 1. Architecture & Organization

### Strengths

- **Clear separation of concerns**: Types (`src/types/`), services (`src/services/`), hooks (`src/hooks/`), components (`src/components/`)
- **Domain-driven organization**: Types and services organized by domain (branches, departments, employees, etc.)
- **Reusable utilities**: Centralized utilities in `src/lib/` (error-handler, service-utils, validation, pagination-utils)
- **Consistent API layer**: Standardized `apiCaller` and `api.ts` with interceptors
- **React Query integration**: Consistent use of `@tanstack/react-query` for data fetching

### Areas for Improvement

- **Component organization**: Some components could be better grouped (e.g., modal components scattered)
- **Index files**: Only `src/components/common/index.ts` exists; consider adding index files for cleaner imports
- **Type exports**: Types are well-organized but could benefit from index files for easier imports

## 2. Code Quality & Patterns

### Strengths

- **Reusable hooks**: `useFormSubmission`, `useErrorHandler`, `useDebounce` provide good abstractions
- **Service utilities**: `buildQueryParams`, `numberArrayToStringArray`, `transformFormData` reduce duplication
- **Error handling**: Centralized error extraction in `src/lib/error-handler.ts`
- **Form validation**: Some forms use Zod schemas with react-hook-form

### Issues Found

#### 2.1 Table Component Duplication

**Location**: `src/components/*/.*-table.tsx` (branches-table, roles-table, departments-table, etc.)

**Pattern**: All table components follow nearly identical structure:

- Same state management (searchQuery, debouncedSearchQuery, serverPagination, deletingId, editModalOpen)
- Same debouncing logic (300ms timeout)
- Same search params building
- Same pagination handling
- Same edit/delete handlers

**Recommendation**: Extract to a reusable `useTableState` hook and/or create a generic table wrapper component.

#### 2.2 Query Hook Patterns

**Location**: `src/hooks/queries/*.ts`

**Duplication**:

- `normalizeParams` function duplicated in 4+ files (use-branches, use-roles, use-departments, use-employees)
- Same query options pattern repeated: `staleTime: 60_000, refetchOnWindowFocus: false, placeholderData: keepPreviousData`
- Similar pagination key building logic

**Recommendation**:

- Extract `normalizeParams` to `src/lib/query-utils.ts`
- Create default query options constant
- Consider a factory function for common query patterns

#### 2.3 Service Layer Patterns

**Location**: `src/services/*.ts`

**Duplication**:

- Similar pagination parameter building across services
- Repeated `generatePaginationParams` usage with same conversion logic
- Similar permission field transformation (`numberArrayToStringArray`)

**Status**: Partially addressed with `service-utils.ts`, but some services still have inline logic

#### 2.4 Form Patterns

**Location**: `src/components/*/*-form.tsx` and `src/components/*/*-modal.tsx`

**Inconsistencies**:

- Some forms use `react-hook-form` + Zod (poll-form, login-form)
- Some forms use uncontrolled inputs with refs (org-chart-form)
- Some modals use `useFormSubmission` hook (new-branch-modal, new-department-modal)
- Some modals have inline error handling

**Recommendation**: Standardize on react-hook-form + Zod + useFormSubmission pattern

## 3. Type Safety

### Current State

- **187 instances** of `any` or `unknown` type usage
- **61 linter errors** across 13 files (mostly implicit any types)
- Some type assertions (`as any`, `as unknown`)

### Issues

#### 3.1 Implicit Any Types

**Locations**:

- `src/hooks/queries/use-new-hire.ts`: Parameters in callbacks
- `src/components/*/.*-table.tsx`: Column/row handlers in table definitions
- `src/components/announcements/recent-announcements-table.tsx`: Multiple implicit any

**Fix**: Add explicit types to all callback parameters

#### 3.2 Type Definitions in Services

**Status**: Most types moved to `src/types/`, but some request types still in service files:

- `src/services/employees.ts`: `EmployeeCreateRequest`, `EmployeeUpdateRequest` (should be in `src/types/employees.ts`)

#### 3.3 Generic Record Types

**Usage**: `Record<string, string | number | boolean>` used extensively for query params
**Recommendation**: Create a `QueryParams` type alias for consistency

## 4. Code Duplication

### High-Priority Duplications

#### 4.1 Table State Management

**Files**: branches-table.tsx, roles-table.tsx, departments-table.tsx, polls-table.tsx, etc.
**Duplication**: ~50-80 lines of identical state and effect logic per file
**Impact**: High - affects 8+ table components

#### 4.2 Query Hook Structure

**Files**: use-branches.ts, use-roles.ts, use-departments.ts, use-employees.ts
**Duplication**: normalizeParams function, query key building, pagination handling
**Impact**: Medium - affects 4+ query hooks

#### 4.3 Modal Patterns

**Files**: new-branch-modal.tsx, new-department-modal.tsx, new-role-modal.tsx, edit-*-modal.tsx
**Duplication**: Similar structure, state management, form handling
**Impact**: Medium - could benefit from generic modal wrapper

#### 4.4 Error Handling in Mutations

**Files**: Multiple mutation hooks in query files
**Duplication**: Similar onSuccess/onError patterns, cache invalidation
**Impact**: Low - already partially abstracted

## 5. Performance & Optimization

### Current Practices

- ✅ Debouncing for search (300ms)
- ✅ React Query caching (60s staleTime)
- ✅ `keepPreviousData` for smooth transitions
- ✅ `useMemo` and `useCallback` used appropriately in many places

### Opportunities

- **Query key normalization**: Already implemented but could be more consistent
- **Component memoization**: Some components could benefit from `React.memo`
- **Lazy loading**: Consider code splitting for large components

## 6. Best Practices

### Good Practices

- ✅ Consistent error handling with centralized utilities
- ✅ Type definitions separated from implementation
- ✅ Reusable utility functions
- ✅ Custom hooks for common patterns
- ✅ Consistent naming conventions

### Areas for Improvement

- **Console statements**: 60 `console.log/warn/error` statements found - should be removed or replaced with proper logging
- **ESLint suppressions**: Only 1 `eslint-disable` found (good!)
- **Default exports**: 35 default exports - consider named exports for better tree-shaking
- **Documentation**: Some utility functions have JSDoc, but could be more comprehensive

## 7. Specific Issues

### 7.1 Linter Errors

**61 errors** across 13 files:

- Missing type declarations for `@tanstack/react-query` and `sonner` (likely IDE/tsconfig issue)
- Implicit any types in callbacks
- Tailwind class warnings (minor)

### 7.2 Type Inconsistencies

- `FileUpdateRequest` vs `PatchedKnowledgeFile` type mismatch (recently fixed)
- Some request types still in service files instead of type files

### 7.3 Code Organization

- Modal components scattered across feature folders (could be grouped)
- Some components have inline type definitions that could be extracted

## 8. Recommendations & Action Items

### Priority 1: High Impact, Low Effort

1. **Extract `normalizeParams`** to `src/lib/query-utils.ts`
2. **Create default query options** constant
3. **Move remaining request types** from services to type files
4. **Remove console statements** (or replace with proper logging)

### Priority 2: High Impact, Medium Effort

1. **Create `useTableState` hook** to eliminate table component duplication
2. **Standardize form patterns** (react-hook-form + Zod + useFormSubmission)
3. **Fix implicit any types** in table components and query hooks
4. **Create generic modal wrapper** for create/edit modals

### Priority 3: Medium Impact, Medium Effort

1. **Add index files** for cleaner imports (types, components)
2. **Extract common table column patterns** to reusable components
3. **Create `QueryParams` type alias** for consistency
4. **Add JSDoc comments** to all utility functions

### Priority 4: Low Impact, Low Effort

1. **Replace default exports** with named exports where appropriate
2. **Fix Tailwind class warnings**
3. **Group modal components** in common folder
4. **Add component prop documentation**

## 9. File-Specific Observations

### Well-Structured Files

- `src/lib/service-utils.ts`: Clean, well-documented utilities
- `src/lib/error-handler.ts`: Comprehensive error handling
- `src/lib/pagination-utils.ts`: Good pagination abstractions
- `src/types/*.ts`: Well-organized type definitions
- `src/hooks/use-form-submission.ts`: Good abstraction

### Files Needing Attention

- Table components: High duplication
- Query hooks: normalizeParams duplication
- Service files: Some still have inline types
- Form components: Inconsistent patterns

## 10. Metrics Summary

- **Total Files Analyzed**: ~150+ files
- **Type Files**: 13 (well-organized)
- **Service Files**: 14 (mostly consistent)
- **Component Files**: 100+ (some duplication)
- **Hook Files**: 20+ (good patterns, some duplication)
- **Linter Errors**: 61 (mostly type-related)
- **Console Statements**: 60
- **Any Types**: 187 instances
- **Code Duplication**: High in table components, medium in query hooks

## Next Steps

1. Review this analysis
2. Prioritize action items based on business needs
3. Create implementation plan for selected improvements
4. Execute improvements in phases

### To-dos

- [ ] Update org-chart-form.tsx to check access_level instead of is_manager