# Releasing new releases



1. Update your `package.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
2. Run `npm run version`
3. Tag it with `1.0.1` and push the tags `git push --tags`

> Work is done, the 3 steps below will be done by Github Action of Release.


**In case the automic release fails:**

Follow the 3 steps below to release manually:

4. Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
5. Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
6. Publish the release.
