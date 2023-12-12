# Checklist for update releases

1. Remove all `TODO:` or `FIXME:` comments
2. Run tests
3. Do manual tests
4. Write changelog
5. Update version in `README`
6. Update `version.json`
7. Change `database_name` in `config.json` to `guardian-v<version>` where `<version>` is the current database version. For example `guardian-v3.0`
8. Create pull request and merge with `main`
9. Check if automated build passes
10. Create release with version tag
11. Check if bot updates correctly
