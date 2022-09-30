### Releasing new releases

- Update your `package.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- `npm run version`
- Tag it and push the tags
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.
