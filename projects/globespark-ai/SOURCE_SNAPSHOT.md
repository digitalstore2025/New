# Source snapshot provenance

The current GitHub mirror was synchronized from AppDeploy application `globespark-ai-v11dlz`, production snapshot `1789506930492`, on 2026-09-16.

This snapshot includes the improved Canvas2D interaction layer: inertial drag, smooth zoom, mobile pinch-to-zoom, animated fly-to, localized hover labels, small-country hit tolerance, ISO-stable selection/highlight, a selected-country marker, and the responsive World Bank quick-data card.

The import intentionally excludes private prospecting workbook contents, secrets, credentials and paid connector outputs.

Production runtime status is `ready`. The current AppDeploy QA snapshot reports 0 frontend errors and 0 network errors. AppDeploy still reports `e2e_tests = null`; therefore AppDeploy itself has not supplied an automated E2E-pass result for this deployment. GitHub provides separate CI/security checks, and a separately labeled production smoke workflow may test the public URL without being treated as branch-preview parity.

Rollback reference: AppDeploy snapshot `1789506930492` remains the current production baseline until a later release is promoted.
