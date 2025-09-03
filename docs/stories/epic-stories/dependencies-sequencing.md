# Dependencies & Sequencing

## Critical Path

1. **Phase 1 must complete before Phase 2** (database foundation required)
2. **Phase 2 must complete before Phase 3** (data sync required for scoring)
3. **Phase 3 must complete before Phase 4** (scores needed for dashboard)
4. **Phases 4 & 5 can partially overlap** (dashboard can show basic scores while forecasting is developed)

## External Dependencies

- QuickBooks developer account and API access
- OpenAI API continued availability (existing dependency)
- Database migration coordination with existing data

## Technical Dependencies

- All new code must be compatible with existing TypeScript/Next.js 14 setup
- UI components must work with existing theme system
- New services must integrate with existing authentication system
